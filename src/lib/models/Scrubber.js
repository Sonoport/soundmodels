/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SPAudioParam', 'core/MultiFileLoader' ],
    function ( Config, BaseSound, SPAudioParam, multiFileLoader ) {
        "use strict";
        /**
         *
         * A sound model which loads a sound file and allows it to be scrubbed using a position parameter
         * @class Scrubber
         * @constructor
         * @extends BaseSound
         * @param {Array/String/AudioBuffer/File} sounds Single or Array of either URLs or AudioBuffers or File of sounds.
         * @param {AudioContext} context AudioContext to be used.
         * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
         */
        function Scrubber( sound, context, onLoadCallback ) {
            if ( !( this instanceof Scrubber ) ) {
                throw new TypeError( "Scrubber constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );

            this.maxSources = 1;
            this.numberOfInputs = 1;
            this.numberOfOutputs = 1;

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
            var SPEED_ALPHA = 0.8;

            var onAllLoad = function ( status, audioBufferArray ) {
                var sourceBuffer_ = audioBufferArray[ 0 ];

                // store audiosource attributes
                numSamples_ = sourceBuffer_.length;
                numChannels_ = sourceBuffer_.numberOfChannels;
                sampleRate_ = sourceBuffer_.sampleRate;

                for ( var cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                    sampleData_.push( sourceBuffer_.getChannelData( cIndex ) );
                }

                console.log( "audio is " + numSamples_ + " by " + numChannels_ );

                scriptNode_ = self.audioContext.createScriptProcessor( 0, 0, numChannels_ );
                scriptNode_.onaudioprocess = scriptNodeCallback;
                scriptNode_.connect( self.releaseGainNode );

                // create buffers
                synthBuf_ = newBuffer( winLen_, numChannels_ );
                srcBuf_ = newBuffer( winLen_, numChannels_ );

                self.isInitialized = true;

                if ( typeof onLoadCallback === 'function' ) {
                    onLoadCallback( status );
                }

            };

            function init( sound ) {
                console.log( "Initalizing..." );
                var parameterType = Object.prototype.toString.call( sound );
                if ( parameterType === '[object Array]' && sound.length > 1 ) {
                    throw {
                        name: "Incorrect Parameter type Exception",
                        message: "Extender only accepts a single sound as argument",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }
                multiFileLoader.call( self, sound, context, onAllLoad );

                winLen_ = Config.WINDOW_LENGTH;
                synthStep_ = winLen_ / 2;
                numReady_ = 0;

                win_ = newBuffer( winLen_, 1 );
                for ( var sIndex = 0; sIndex < winLen_; sIndex++ ) {
                    win_[ sIndex ] = 0.25 * ( 1.0 - Math.cos( 2 * Math.PI * ( sIndex + 0.5 ) / winLen_ ) );
                }

                self.releaseGainNode.connect( self.audioContext.destination );
            }

            function scriptNodeCallback( processingEvent ) {
                if ( !self.isPlaying || !self.isInitialized ) {
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
                        //console.log( numToCopy );

                        for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                            var source = synthBuf_[ cIndex ].subarray( synthStep_ - numReady_, synthStep_ - numReady_ + numToCopy );
                            processingEvent.outputBuffer.getChannelData( cIndex )
                                .set( source, processingEvent.outputBuffer.length - numToGo_ );
                            //processingEvent.outputBuffer.copyToChannel( source, cIndex, numSamples_ - numToGo_ );
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

                        // Find where the maximums in the *previous* source buffer (after
                        // shifting by a half frame).
                        for ( sIndex = 0; sIndex < winLen_ - synthStep_; sIndex++ ) {
                            for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                                srcBuf_[ cIndex ][ sIndex ] = srcBuf_[ cIndex ][ sIndex + synthStep_ ];
                            }
                        }

                        var bufPeakPos_ = 0;
                        var bufPeakVal = 0;
                        for ( sIndex = 0; sIndex < winLen_ - synthStep_; sIndex++ ) {
                            var combinedPeakVal = 0;
                            for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                                combinedPeakVal += srcBuf_[ cIndex ][ sIndex ];
                            }
                            if ( combinedPeakVal > bufPeakVal ) {
                                bufPeakPos_ = sIndex;
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

                        scale_ = SPEED_ALPHA * scale_ + ( 1.0 - SPEED_ALPHA ) * targetScale_;

                        var muteOnReverse = self.muteOnReverse.value;

                        if ( speed < 0 && muteOnReverse ) {
                            scale_ = 0.0;
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
             * @param {Array/AudioBuffer/String/File} sounds Single or Array of either URLs or AudioBuffers of sounds.
             * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
             */
            this.setSources = function ( sounds, onLoadCallback ) {
                this.isInitialized = false;
                init( sounds );
            };

            // Public Parameters

            /**
             * Position of the audio to be played.
             *
             * @property playPosition
             * @type SPAudioParam
             * @default 0
             */
            this.playPosition = SPAudioParam.createPsuedoParam( "playPosition", 0, 1.0, 0, this.audioContext );

            /**
             * Sets if the audio should fade out when playPosition has not changed for a while.
             *
             * @property noMotionFade
             * @type SPAudioParam
             * @default false
             */
            this.noMotionFade = SPAudioParam.createPsuedoParam( "noMotionFade", true, false, true, this.audioContext );

            /**
             * Sets if moving playPosition to backwards should make any sound.
             *
             * @property muteOnReverse
             * @type SPAudioParam
             * @default false
             */
            this.muteOnReverse = SPAudioParam.createPsuedoParam( "muteOnReverse", true, false, true, this.audioContext );

            init( sound );

        }

        Scrubber.prototype = Object.create( BaseSound.prototype );

        return Scrubber;
    } );
