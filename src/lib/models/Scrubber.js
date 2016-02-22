/**
 * @module Models
 */

"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SPAudioParam = require( '../core/SPAudioParam' );
var multiFileLoader = require( '../core/MultiFileLoader' );
var log = require( 'loglevel' );

/**
 *
 * A model which loads a source and allows it to be scrubbed using a position parameter.
 *
 * @class Scrubber
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [source] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when the source has finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function Scrubber( options ) {
    if ( !( this instanceof Scrubber ) ) {
        return new Scrubber( options );
    }
    var legacyArgumentsMode = arguments.length > 1 || ( options || {} ).currentTime; // Test to guess whether user is using old-style multiple argument constructor instead.
    var context = legacyArgumentsMode ? arguments[ 0 ] : options.context;
    var source = legacyArgumentsMode ? arguments[ 1 ] : options.source;
    var onLoadProgress = legacyArgumentsMode ? arguments[ 2 ] : options.onLoadProgress;
    var onLoadComplete = legacyArgumentsMode ? arguments[ 3 ] : options.onLoadComplete;
    var onAudioStart = legacyArgumentsMode ? arguments[ 4 ] : options.onAudioStart;
    var onAudioEnd = legacyArgumentsMode ? arguments[ 5 ] : options.onAudioEnd;

    // Call superclass constructor
    BaseSound.call( this, context );
    this.maxSources = 1;
    this.minSources = 1;
    this.modelName = 'Scrubber';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;
    this.onAudioStart = onAudioStart;
    this.onAudioEnd = onAudioEnd;

    // Private Variables
    var self = this;

    var winLen_;

    var sampleData_ = [];
    var synthStep_;
    var synthBuf_;
    var srcBuf_;
    var win_;

    var numReady_ = 0;

    var numSamples_;
    var numChannels_;
    var sampleRate_;

    var lastTargetPos_ = 0;
    var smoothPos_ = 0;

    var scale_ = 0;

    var scriptNode_;
    // Constants
    var MAX_JUMP_SECS = 1.0;
    var ALPHA = 0.95;
    var SPEED_THRESH = 0.1;
    var SPEED_ALPHA = 0.93;
    var AUDIOEVENT_TRESHOLD = 0.0001;

    var audioPlaying = false;

    var zeroArray;

    var onLoadAll = function ( status, audioBufferArray ) {
        if ( status ) {
            var sourceBuffer_ = audioBufferArray[ 0 ];

            // store audiosource attributes
            numSamples_ = sourceBuffer_.length;
            numChannels_ = sourceBuffer_.numberOfChannels;
            sampleRate_ = sourceBuffer_.sampleRate;

            sampleData_ = [];
            for ( var cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                sampleData_.push( sourceBuffer_.getChannelData( cIndex ) );
            }

            scriptNode_ = self.audioContext.createScriptProcessor( Config.CHUNK_LENGTH, 0, numChannels_ );
            scriptNode_.onaudioprocess = scriptNodeCallback;
            scriptNode_.connect( self.releaseGainNode );

            // create buffers
            synthBuf_ = newBuffer( winLen_, numChannels_ );
            srcBuf_ = newBuffer( winLen_, numChannels_ );

            smoothPos_ = self.playPosition.value;
            self.isInitialized = true;
        }

        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, audioBufferArray );
                }
            }, 0 );
        }
    };

    function init( source ) {
        if ( scriptNode_ ) {
            scriptNode_.disconnect();
            scriptNode_ = null;
        }

        multiFileLoader.call( self, source, self.audioContext, self.onLoadProgress, onLoadAll );

        winLen_ = Config.WINDOW_LENGTH;
        synthStep_ = winLen_ / 2;
        numReady_ = 0;

        win_ = newBuffer( winLen_, 1 );
        for ( var sIndex = 0; sIndex < winLen_; sIndex++ ) {
            win_[ sIndex ] = 0.25 * ( 1.0 - Math.cos( 2 * Math.PI * ( sIndex + 0.5 ) / winLen_ ) );
        }

        zeroArray = new Float32Array( Config.CHUNK_LENGTH );
    }

    function scriptNodeCallback( processingEvent ) {
        if ( !self.isPlaying || !self.isInitialized ) {
            for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                processingEvent.outputBuffer.getChannelData( cIndex )
                    .set( zeroArray );
            }
            scale_ = 0;
            targetScale_ = 0;
            if ( audioPlaying ) {
                if ( typeof self.onAudioEnd === 'function' ) {
                    self.onAudioEnd();
                }
                audioPlaying = false;
            }
            return;
        }

        var sIndex;
        var cIndex;

        var numToGo_ = processingEvent.outputBuffer.length;

        // While we still haven't sent enough samples to the output
        while ( numToGo_ > 0 ) {
            // The challenge: because of the K-rate update, numSamples will *not* be a multiple of the
            // step size.  So... we need some way to generate in steps, but if necessary output only
            // partial steps, the remainders of which need to be saved for the next call.  Ouch!
            // Send whatever previously generated left-over samples we might have

            if ( numReady_ > 0 && numToGo_ > 0 ) {
                var numToCopy = Math.min( numToGo_, numReady_ );
                var startPos = synthStep_ - numReady_;
                for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                    var source = synthBuf_[ cIndex ].subarray( startPos, startPos + numToCopy );
                    processingEvent.outputBuffer.getChannelData( cIndex )
                        .set( source, processingEvent.outputBuffer.length - numToGo_ );
                }

                numToGo_ -= numToCopy;
                numReady_ -= numToCopy;
            }

            // If we still need more
            if ( numToGo_ > 0 ) {
                // Get the current target position
                var targetPos = self.playPosition.value;

                var speed;

                // If the position has jumped very suddenly by a lot
                if ( Math.abs( lastTargetPos_ - targetPos ) * numSamples_ > MAX_JUMP_SECS * sampleRate_ ) {
                    // Go directly to the new position
                    smoothPos_ = targetPos;
                    speed = 0.0;
                } else {
                    // Otherwise, ease towards it
                    var newSmoothPos = ALPHA * smoothPos_ + ( 1.0 - ALPHA ) * targetPos;
                    speed = ( newSmoothPos - smoothPos_ ) * numSamples_ / synthStep_;
                    smoothPos_ = newSmoothPos;
                }
                lastTargetPos_ = targetPos;

                // Shift the oldest samples out of the synthesis buffer
                for ( sIndex = 0; sIndex < winLen_ - synthStep_; sIndex++ ) {
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        synthBuf_[ cIndex ][ sIndex ] = synthBuf_[ cIndex ][ sIndex + synthStep_ ];
                    }
                }

                for ( sIndex = winLen_ - synthStep_; sIndex < winLen_; sIndex++ ) {
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        synthBuf_[ cIndex ][ sIndex ] = 0.0;
                    }
                }

                var bufPeakPos_ = 0;
                var bufPeakVal = 0;
                for ( sIndex = synthStep_; sIndex < winLen_; sIndex++ ) {
                    var combinedPeakVal = 0;
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        combinedPeakVal += srcBuf_[ cIndex ][ sIndex ];
                    }
                    if ( combinedPeakVal > bufPeakVal ) {
                        bufPeakPos_ = sIndex - synthStep_;
                        bufPeakVal = combinedPeakVal;
                    }
                }

                var intPos = parseInt( smoothPos_ * ( numSamples_ - winLen_ ) );

                // If we're still moving (or haven't been motionless for long)
                // Find a peak in the source near the current position
                var srcPeakPos = 0;
                var srcPeakVal = 0.0;
                for ( sIndex = 0; sIndex < winLen_; sIndex++ ) {
                    var val = 0;
                    var currentPos = ( intPos + sIndex ) % numSamples_;
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        val += sampleData_[ cIndex ][ currentPos ];
                    }
                    if ( val > srcPeakVal ) {
                        srcPeakVal = val;
                        srcPeakPos = sIndex;
                    }
                }

                // Compute offset into src such that peak will align well
                // with peak in most recent output
                var shift = srcPeakPos - bufPeakPos_;

                // Grab a window's worth of source audio
                intPos += shift;
                for ( sIndex = 0; sIndex < winLen_; sIndex++ ) {
                    var copyPos = ( intPos + sIndex ) % numSamples_;
                    if ( copyPos < 0 ) {
                        copyPos = 0;
                    } // << Hack for a rare boundary case
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        srcBuf_[ cIndex ][ sIndex ] = sampleData_[ cIndex ][ copyPos ];
                    }
                }

                // Drop the volume if the rate gets really low

                var noMotionFade = self.noMotionFade.value;
                var targetScale_ = 1.0;
                if ( noMotionFade && Math.abs( speed ) < SPEED_THRESH ) {
                    targetScale_ = 0.0;
                }

                scale_ = ( SPEED_ALPHA * scale_ ) + ( ( 1.0 - SPEED_ALPHA ) * targetScale_ );

                var muteOnReverse = self.muteOnReverse.value;

                if ( speed < 0 && muteOnReverse ) {
                    scale_ = 0.0;
                }

                if ( audioPlaying && ( ( muteOnReverse && scale_ < AUDIOEVENT_TRESHOLD ) || Math.abs( scale_ ) < AUDIOEVENT_TRESHOLD ) ) {
                    log.debug( "stopping..." );
                    audioPlaying = false;
                    if ( typeof self.onAudioEnd === 'function' ) {
                        self.onAudioEnd();
                    }

                }

                if ( scale_ > AUDIOEVENT_TRESHOLD && !audioPlaying ) {
                    log.debug( "playing..." );
                    audioPlaying = true;
                    if ( typeof self.onAudioStart === 'function' ) {
                        self.onAudioStart();
                    }
                }

                // Add the new frame into the output summing buffer
                for ( sIndex = 0; sIndex < winLen_; sIndex++ ) {
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        synthBuf_[ cIndex ][ sIndex ] += scale_ * win_[ sIndex ] * srcBuf_[ cIndex ][ sIndex ];
                    }
                }

                numReady_ = synthStep_;
            }
        }
    }

    function newBuffer( length, channels ) {
        var buf = [];
        if ( channels === undefined || channels === null ) {
            channels = 1;
        }
        for ( var cIndex = 0; cIndex < channels; cIndex++ ) {
            buf.push( new Float32Array( length ) );
        }

        return buf;
    }

    /**
     * Reinitializes a Scrubber and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} source URL or AudioBuffer or File Object of the audio source.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( source, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, source, onLoadProgress, onLoadComplete );
        init( source );
    };

    // Public Parameters

    /**
     * Position of the audio to be played.
     *
     * @property playPosition
     * @type SPAudioParam
     * @default 0.0
     * @minvalue 0.0
     * @maxvalue 1.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'playPosition', 0, 1.0, 0 ) );

    /**
     * Sets if the audio should fade out when playPosition has not changed for a while.
     *
     * @property noMotionFade
     * @type SPAudioParam
     * @default false
     * @minvalue true
     * @maxvalue false
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'noMotionFade', true, false, true ) );

    /**
     * Sets if moving playPosition to backwards should mute the model.
     *
     * @property muteOnReverse
     * @type SPAudioParam
     * @default false
     * @minvalue true
     * @maxvalue false
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'muteOnReverse', true, false, true ) );

    // Initialize the sources.
    init( source );

}

Scrubber.prototype = Object.create( BaseSound.prototype );

module.exports = Scrubber;
