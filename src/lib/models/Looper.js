/**
 * @module Models
 */

"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SPAudioParam = require( '../core/SPAudioParam' );
var SPAudioBufferSourceNode = require( '../core/SPAudioBufferSourceNode' );
var multiFileLoader = require( '../core/MultiFileLoader' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 *
 * A model which loads one or more sources and allows them to be looped continuously at variable speed.
 * @class Looper
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/SPAudioBuffer/File} [sources] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 * @param {Function} [onTrackEnd] Callback when an individual track has finished playing.
 */
function Looper( options ) {
    if ( !( this instanceof Looper ) ) {
        return new Looper( options );
    }
    var legacyArgumentsMode = arguments.length > 1 || ( options || {} ).currentTime; // Test to guess whether user is using old-style multiple argument constructor instead.
    var context = legacyArgumentsMode ? arguments[ 0 ] : options.context;
    var sources = legacyArgumentsMode ? arguments[ 1 ] : options.sources;
    var onLoadProgress = legacyArgumentsMode ? arguments[ 2 ] : options.onLoadProgress;
    var onLoadComplete = legacyArgumentsMode ? arguments[ 3 ] : options.onLoadComplete;
    var onAudioStart = legacyArgumentsMode ? arguments[ 4 ] : options.onAudioStart;
    var onAudioEnd = legacyArgumentsMode ? arguments[ 5 ] : options.onAudioEnd;
    var onTrackEnd = legacyArgumentsMode ? arguments[ 6 ] : options.onTrackEnd;

    // Call superclass constructor
    BaseSound.call( this, context );
    this.maxSources = Config.MAX_VOICES;
    this.minSources = 1;
    this.modelName = 'Looper';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;
    this.onAudioStart = onAudioStart;
    this.onAudioEnd = onAudioEnd;

    // Private vars
    var self = this;

    var sourceBufferNodes_ = [];
    var rateArray_ = [];

    var onLoadAll = function ( status, arrayOfBuffers ) {
        self.multiTrackGain.length = arrayOfBuffers.length;
        arrayOfBuffers.forEach( function ( thisBuffer, trackIndex ) {
            insertBufferSource( thisBuffer, trackIndex, arrayOfBuffers.length );
        } );

        if ( rateArray_ && rateArray_.length > 0 ) {
            self.registerParameter( new SPAudioParam( self, 'playSpeed', 0.0, 10, 1, rateArray_, null, playSpeedSetter_ ), true );
        }

        if ( status ) {
            self.isInitialized = true;
        }

        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, arrayOfBuffers );
                }
            }, 0 );
        }
    };

    var insertBufferSource = function ( audioBuffer, trackIndex, totalTracks ) {
        var source;
        if ( !( sourceBufferNodes_[ trackIndex ] instanceof SPAudioBufferSourceNode ) ) {
            source = new SPAudioBufferSourceNode( self.audioContext );
        } else {
            source = sourceBufferNodes_[ trackIndex ];
        }

        source.buffer = audioBuffer;
        source.loopEnd = audioBuffer.duration;
        source.lastStopPosition_ = 0;
        source.onended = function ( event ) {
            onSourceEnd( event, trackIndex, source );
        };

        if ( totalTracks > 1 ) {
            var multiChannelGainParam = new SPAudioParam( self, 'track-' + trackIndex + '-gain', 0.0, 1, 1, source.gain, null, null );
            self.multiTrackGain.splice( trackIndex, 1, multiChannelGainParam );
        }

        source.connect( self.releaseGainNode );

        sourceBufferNodes_.splice( trackIndex, 1, source );
        rateArray_.push( source.playbackRate );
    };

    var onSourceEnd = function ( event, trackIndex, source ) {
        var cTime = self.audioContext.currentTime;
        // Create a new source since SourceNodes can't play again.
        source.resetBufferSource( cTime, self.releaseGainNode );

        if ( self.multiTrackGain.length > 1 ) {
            var multiChannelGainParam = new SPAudioParam( self, 'track-' + trackIndex + '-gain' + trackIndex, 0.0, 1, 1, source.gain, null, null );
            self.multiTrackGain.splice( trackIndex, 1, multiChannelGainParam );
        }

        if ( typeof self.onTrackEnd === 'function' ) {
            onTrackEnd( self, trackIndex );
        }

        var allSourcesEnded = sourceBufferNodes_.reduce( function ( prevState, thisSource ) {
            return prevState && ( thisSource.playbackState === thisSource.FINISHED_STATE ||
                thisSource.playbackState === thisSource.UNSCHEDULED_STATE );
        }, true );

        if ( allSourcesEnded && self.isPlaying ) {
            self.isPlaying = false;
            if ( typeof self.onAudioEnd === 'function' ) {
                self.onAudioEnd();
            }
        }
    };

    var playSpeedSetter_ = function ( aParam, value, audioContext ) {
        if ( self.isInitialized ) {
            /* 0.001 - 60dB Drop
                e(-n) = 0.001; - Decay Rate of setTargetAtTime.
                n = 6.90776;
                */
            var t60multiplier = 6.90776;

            var currentSpeed = sourceBufferNodes_[ 0 ] ? sourceBufferNodes_[ 0 ].playbackRate.value : 1;

            if ( self.isPlaying ) {
                log.debug( "easingIn/Out" );
                // easeIn/Out
                if ( value > currentSpeed ) {
                    sourceBufferNodes_.forEach( function ( thisSource ) {
                        thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                        thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.easeIn.value / t60multiplier );
                    } );
                } else if ( value < currentSpeed ) {
                    sourceBufferNodes_.forEach( function ( thisSource ) {
                        thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                        thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.easeOut.value / t60multiplier );
                    } );
                }
            } else {
                log.debug( "changing directly" );
                sourceBufferNodes_.forEach( function ( thisSource ) {
                    thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                    thisSource.playbackRate.setValueAtTime( value, audioContext.currentTime );
                } );
            }
        }
    };

    function init( sources ) {
        rateArray_ = [];
        sourceBufferNodes_.forEach( function ( thisSource ) {
            thisSource.disconnect();
        } );
        self.multiTrackGain.length = 0;
        multiFileLoader.call( self, sources, self.audioContext, self.onLoadProgress, onLoadAll );
    }

    // Public Properties

    /**
     * Event Handler or Callback for ending of a individual track.
     *
     * @property onTrackEnd
     * @type Function
     * @default null
     */
    this.onTrackEnd = onTrackEnd;

    /**
     * Speed of playback of the source. Affects both pitch and tempo.
     *
     * @property playSpeed
     * @type SPAudioParam
     * @default 1.0
     * @minvalue 0.0
     * @maxvalue 10.0
     */
    this.registerParameter( new SPAudioParam( this, 'playSpeed', 0.0, 10, 1.005, null, null, playSpeedSetter_ ), true );

    /**
     * Rate of increase of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
     *
     * @property easeIn
     * @type SPAudioParam
     * @default 0.05
     * @minvalue 0.05
     * @maxvalue 10.0
     */

    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'easeIn', 0.05, 10.0, 0.05 ) );

    /**
     * Rate of decrease of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
     *
     * @property easeOut
     * @type SPAudioParam
     * @default 0.05
     * @minvalue 0.05
     * @maxvalue 10.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'easeOut', 0.05, 10.0, 0.05 ) );

    /**
     * The volume (loudness) for each individual track if multiple sources are used. Works even if a single source is used.
     *
     *
     * @property multiTrackGain
     * @type Array of SPAudioParams
     * @default 1.0
     * @minvalue 0.0
     * @maxvalue 1.0
     */
    var multiTrackGainArray = [];
    multiTrackGainArray.name = 'multiTrackGain';
    this.registerParameter( multiTrackGainArray, false );

    /**
     * The maximum number time the source will be looped before stopping. Currently only supports -1 (loop indefinitely), and 1 (only play the track once, ie. no looping).
     *
     * @property maxLoops
     * @type SPAudioParam
     * @default -1 (Infinite)
     * @minvalue -1 (Infinite)
     * @maxvalue 1
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'maxLoops', -1, 1, -1 ) );

    /**
     * Reinitializes a Looper and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers of sources.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( sources, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, sources, onLoadProgress, onLoadComplete );
        init( sources );
    };

    /**
     * Plays the model immediately. If the model is paused, the model will be played back from the same position as it was paused at.
     *
     * @method play
     *
     */
    this.play = function () {

        if ( !this.isInitialized ) {
            throw new Error( this.modelName, "hasn't finished Initializing yet. Please wait before calling start/play" );
        }

        var now = this.audioContext.currentTime;

        if ( !this.isPlaying ) {
            sourceBufferNodes_.forEach( function ( thisSource ) {
                var offset = thisSource.lastStopPosition_ || thisSource.loopStart;
                thisSource.loop = ( self.maxLoops.value !== 1 );
                thisSource.start( now, offset );
            } );
            BaseSound.prototype.start.call( this, now );
            webAudioDispatch( function () {
                if ( typeof self.onAudioStart === 'function' ) {
                    self.onAudioStart();
                }
            }, now, this.audioContext );
        }
    };

    /**
     * Start playing after specific time and from a specific offset.
     *
     * @method start
     * @param {Number} when Time (in seconds) when the sound should start playing.
     * @param {Number} [offset] The starting position of the playhead in seconds
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     */
    this.start = function ( when, offset, duration, attackDuration ) {
        if ( !this.isInitialized ) {
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }

        if ( !this.isPlaying ) {
            sourceBufferNodes_.forEach( function ( thisSource ) {

                offset = thisSource.loopStart + parseFloat( offset ) || 0;
                thisSource.loop = ( self.maxLoops.value !== 1 );
                thisSource.start( when, offset, duration );
            } );

            BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
            webAudioDispatch( function () {
                if ( typeof self.onAudioStart === 'function' ) {
                    self.onAudioStart();
                }
            }, when, this.audioContext );
        }
    };

    /**
     * Stops the model and resets play head to 0.
     * @method stop
     * @param {Number} when Time offset to stop
     */
    this.stop = function ( when ) {
        if ( self.isPlaying ) {
            sourceBufferNodes_.forEach( function ( thisSource ) {
                thisSource.stop( when );
                thisSource.lastStopPosition_ = 0;
            } );

            BaseSound.prototype.stop.call( this, when );
            webAudioDispatch( function () {
                if ( typeof self.onAudioEnd === 'function' && self.isPlaying === false ) {
                    self.onAudioEnd();
                }
            }, when, this.audioContext );
        }
    };

    /**
     * Pause the currently playing model at the current position.
     *
     * @method pause
     */
    this.pause = function () {
        if ( self.isPlaying ) {

            sourceBufferNodes_.forEach( function ( thisSource ) {
                thisSource.stop( 0 );
                thisSource.lastStopPosition_ = thisSource.playbackPosition / thisSource.buffer.sampleRate;
            } );

            BaseSound.prototype.stop.call( this, 0 );
            webAudioDispatch( function () {
                if ( typeof self.onAudioEnd === 'function' ) {
                    self.onAudioEnd();
                }
            }, 0, this.audioContext );
        }
    };

    /**
     * Linearly ramp down the gain of the audio in time (seconds) to 0.
     *
     * @method release
     * @param {Number} [when] Time (in seconds) at which the Envelope will release.
     * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
     * @param {Boolean} [resetOnRelease] Boolean to define if release resets (stops) the playback or just pauses it.
     */
    this.release = function ( when, fadeTime, resetOnRelease ) {
        if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        var FADE_TIME = 0.5;
        fadeTime = fadeTime || FADE_TIME;

        BaseSound.prototype.release.call( this, when, fadeTime, resetOnRelease );
        // Pause the sound after currentTime + fadeTime + FADE_TIME_PAD

        if ( resetOnRelease ) {
            // Create new releaseGain Node
            this.releaseGainNode = this.audioContext.createGain();
            this.destinations.forEach( function ( dest ) {
                self.releaseGainNode.connect( dest.destination, dest.output, dest.input );
            } );

            // Disconnect and rewire each source
            sourceBufferNodes_.forEach( function ( thisSource, trackIndex ) {
                thisSource.stop( when + fadeTime );
                thisSource.lastStopPosition_ = 0;

                thisSource.resetBufferSource( when, self.releaseGainNode );
                var multiChannelGainParam = new SPAudioParam( self, 'gain-' + trackIndex, 0.0, 1, 1, thisSource.gain, null, null );
                self.multiTrackGain.splice( trackIndex, 1, multiChannelGainParam );
            } );

            // Set playing to false and end audio after given time.
            this.isPlaying = false;
            webAudioDispatch( function () {
                if ( typeof self.onAudioEnd === 'function' && self.isPlaying === false ) {
                    self.onAudioEnd();
                }
            }, when + fadeTime, this.audioContext );
        }
    };

    // Initialize the sources.
    init( sources );
}

Looper.prototype = Object.create( BaseSound.prototype );

module.exports = Looper;
