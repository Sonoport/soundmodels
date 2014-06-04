/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SPAudioParam', "core/SPAudioBufferSourceNode", 'core/MultiFileLoader' ],
    function ( Config, BaseSound, SPAudioParam, SPAudioBufferSourceNode, multiFileLoader ) {
        "use strict";

        /**
         *
         * A sound model which loads a sound file and allows it to be looped continuously at variable speed.
         * @class Looper
         * @constructor
         * @extends BaseSound
         * @param {Array/String/AudioBuffer/File} sounds Single or Array of either URLs or AudioBuffers or File of sounds.
         * @param {AudioContext} context AudioContext to be used.
         * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
         * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
         * @param {Function} [onEndedCallback] Callback when the Looper has finished playing.
         */
        function Looper( sounds, context, onLoadCallback, onProgressCallback, onEndedCallback ) {
            if ( !( this instanceof Looper ) ) {
                throw new TypeError( "Looper constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );

            this.maxSources = Config.MAX_VOICES;
            this.numberOfInputs = 1;
            this.numberOfOutputs = 1;
            this.modelName = "Looper";

            // Private vars
            var self = this;

            var sources_ = [];
            var multiTrackGainNodes_ = [];
            var lastStopPosition_ = [];
            var rateArray = [];

            var onAllLoadCallback = onLoadCallback;

            var onAllLoad = function ( status, arrayOfBuffers ) {
                arrayOfBuffers.forEach( function ( thisBuffer, trackIndex ) {
                    lastStopPosition_.push( 0 );
                    insertBufferSource( thisBuffer, trackIndex );
                } );

                self.playSpeed = new SPAudioParam( "playSpeed", 0.0, 10, 1, rateArray, null, playSpeedSetter_, self.audioContext );

                self.isInitialized = true;
                if ( typeof onAllLoadCallback === 'function' ) {
                    onAllLoadCallback( status );
                }
            };

            var onSourceEnded = function ( event, trackIndex, source ) {
                self.isPlaying = false;
                var cTime = self.audioContext.currentTime;
                // Create a new source since SourceNodes can't play again.
                source.resetBufferSource( cTime, multiTrackGainNodes_[ trackIndex ] );
                if ( typeof onEndedCallback === 'function' ) {
                    onEndedCallback( self, trackIndex );
                }
            };

            var insertBufferSource = function ( audioBuffer, trackIndex ) {
                var source = new SPAudioBufferSourceNode( self.audioContext );
                source.buffer = audioBuffer;
                source.loopEnd = audioBuffer.duration;
                source.onended = function ( event ) {
                    onSourceEnded( event, trackIndex, source );
                };

                var gainNode;
                if ( multiTrackGainNodes_[ trackIndex ] ) {
                    gainNode = multiTrackGainNodes_[ trackIndex ];
                } else {
                    gainNode = self.audioContext.createGain();
                    multiTrackGainNodes_[ trackIndex ] = gainNode;

                    var multiChannelGainParam = new SPAudioParam( "gain", 0.0, 1, 1, gainNode.gain, null, null, self.audioContext );
                    self.multiTrackGain.push[ trackIndex ] = multiChannelGainParam;
                }

                source.connect( gainNode );
                gainNode.connect( self.releaseGainNode );

                sources_.push( source );
                rateArray.push( source.playbackRate );
            };

            var playSpeedSetter_ = function ( aParam, value, audioContext ) {
                if ( self.isInitialized ) {
                    /* 0.001 - 60dB Drop
                        e(-n) = 0.001; - Decay Rate of setTargetAtTime.
                        n = 6.90776;
                    */
                    var t60multiplier = 6.90776;

                    var currentSpeed = sources_[ 0 ] ? sources_[ 0 ].playbackRate.value : 1;

                    if ( value > currentSpeed ) {
                        sources_.forEach( function ( thisSource ) {
                            thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                            thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.riseTime.value / t60multiplier );
                        } );
                    } else if ( value < currentSpeed ) {
                        sources_.forEach( function ( thisSource ) {
                            thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                            thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.decayTime.value / t60multiplier );
                        } );
                    }
                }
            };

            var startPointSetter_ = function ( aParam, value ) {
                sources_.forEach( function ( thisSource ) {
                    thisSource.loopStart = value * thisSource.buffer.duration;
                } );
            };

            function init( sounds ) {
                var parameterType = Object.prototype.toString.call( sounds );
                rateArray = [];
                sources_.forEach( function ( thisSource ) {
                    thisSource.disconnect();
                } );
                sources_ = [];
                if ( parameterType === "[object Array]" && sounds.length > self.maxSources ) {
                    throw {
                        name: "Unsupported number of sources",
                        message: "This sound only supports a maximum of " + self.maxSources + " sources.",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                } else if ( ( parameterType === "[object AudioBuffer]" ) ) {
                    onAllLoad( true, [ sounds ] );
                } else {
                    multiFileLoader.call( self, sounds, self.audioContext, onAllLoad, onProgressCallback );
                }
            }

            // Public Properties

            /**
             * @property riseTime
             * @type SPAudioParam
             * @default 1.0
             * @minvalue 0.05
             * @maxvalue 10.0
             */
            this.riseTime = SPAudioParam.createPsuedoParam( "riseTime", 0.05, 10.0, 1, this.audioContext );

            /**
             * @property decayTime
             * @type SPAudioParam
             * @default 1.0
             * @minvalue 0.05
             * @maxvalue 10.0
             */
            this.decayTime = SPAudioParam.createPsuedoParam( "decayTime", 0.05, 10.0, 1, this.audioContext );

            /**
             * @property startPoint
             * @type SPAudioParam
             * @default 0.0
             * @minvalue 0.0
             * @maxvalue 0.99
             */
            this.startPoint = new SPAudioParam( "startPoint", 0.0, 0.99, 0.00, null, null, startPointSetter_, this.audioContext );

            /**
             * @property playSpeed
             * @type SPAudioParam
             * @default 1.0
             * @minvalue 0.0
             * @maxvalue 10.0
             */
            this.playSpeed = null;

            /**
             * @property multiTrackGain
             * @type Array of SPAudioParams
             * @default 1.0
             * @minvalue 0.0
             * @maxvalue 1.0
             */
            this.multiTrackGain = [];

            /**
             * @property maxLoops
             * @type SPAudioParam
             * @default -1 (Infinite)
             * @minvalue -1 (Infinite)
             * @maxvalue 1
             */
            this.maxLoops = SPAudioParam.createPsuedoParam( "maxLoops", -1, 1, -1, this.audioContext );

            /**
             * Reinitializes a Looper and sets it's sources.
             *
             * @method setSources
             * @param {Array/AudioBuffer/String/File} sounds Single or Array of either URLs or AudioBuffers of sounds.
             * @param {Function} [onLoadCallback] Callback when all sounds have finished loading.
             */
            this.setSources = function ( sounds, onLoadCallback ) {
                this.isInitialized = false;
                onAllLoadCallback = onLoadCallback;
                init( sounds );
            };

            /**
             * Plays the sound immediately. If the sound is paused, the sound will be played back from the same position as it was paused at.
             *
             * @method play
             *
             */
            this.play = function () {

                if ( !this.isPlaying ) {
                    sources_.forEach( function ( thisSource, index ) {
                        var offset = ( lastStopPosition_ && lastStopPosition_[ index ] ) ? lastStopPosition_[ index ] : self.startPoint.value * thisSource.buffer.duration;
                        thisSource.loop = ( self.maxLoops.value !== 1 );
                        thisSource.start( 0, offset );
                    } );
                }

                BaseSound.prototype.start.call( this, 0 );

            };

            /**
             * Start playing after specific time and from a specific offset. If offset is not defined,
             * the value of startPoint property is used.
             *
             * @method start
             * @param {Number} when The delay in seconds before playing the sound
             * @param {Number} [offset] The starting position of the playhead
             * @param {Number} [duration] Duration of the portion (in seconds) to be played
             * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
             */
            this.start = function ( when, offset, duration, attackDuration ) {
                if ( !this.isPlaying ) {
                    sources_.forEach( function ( thisSource ) {
                        if ( typeof offset == 'undefined' || offset === null ) {
                            offset = self.startPoint.value * thisSource.buffer.duration;
                        }
                        if ( typeof duration == 'undefined' || duration === null ) {
                            duration = thisSource.buffer.duration;
                        }
                        thisSource.loop = ( self.maxLoops.value !== 1 );

                        if ( typeof attackDuration !== 'undefined' ) {
                            //console.log( "Ramping from " + offset + "  in " + attackDuration );
                            var now = self.audioContext.currentTime;
                            self.releaseGainNode.gain.cancelScheduledValues( now );
                            self.releaseGainNode.gain.setValueAtTime( 0, now );
                            self.releaseGainNode.gain.linearRampToValueAtTime( 1, now + attackDuration );
                        } else {
                            self.releaseGainNode.gain.setValueAtTime( 1, self.audioContext.currentTime );
                        }
                        thisSource.start( when, offset, duration );
                    } );
                }

                BaseSound.prototype.start.call( this, when, offset, duration );
            };

            /**
             * Stops the sound and resets play head to 0.
             * @method stop
             * @param {Number} when Time offset to stop
             */
            this.stop = function ( when ) {
                sources_.forEach( function ( thisSource, index ) {
                    if ( self.isPlaying ) {
                        thisSource.stop( when );
                    }
                    lastStopPosition_[ index ] = 0;
                } );

                BaseSound.prototype.stop.call( this, when );
            };

            /**
             * Pause the currently playing sound at the current position.
             *
             * @method pause
             */
            this.pause = function () {
                sources_.forEach( function ( thisSource, index ) {
                    if ( self.isPlaying ) {
                        thisSource.stop( 0 );
                    }
                    lastStopPosition_[ index ] = thisSource.playbackPosition / thisSource.buffer.sampleRate;
                } );

                BaseSound.prototype.stop.call( this, 0 );
            };

            // Initialize the sounds.
            if ( sounds )
                init( sounds );
        }

        Looper.prototype = Object.create( BaseSound.prototype );

        return Looper;
    } );
