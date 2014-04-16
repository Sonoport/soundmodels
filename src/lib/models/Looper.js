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
         * @param {Function} [onEndedCallback] Callback when the Looper has finished playing.
         */
        function Looper( sounds, context, onLoadCallback, onEndedCallback ) {
            if ( !( this instanceof Looper ) ) {
                throw new TypeError( "Looper constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );

            this.maxSources = Config.MAX_VOICES;
            this.numberOfInputs = 1;
            this.numberOfOutputs = 1;

            // Private vars
            var self = this;

            var sources_ = [];
            var multiTrackGainNodes_ = [];
            var lastStopPosition_ = [];
            var rateArray = [];

            var onAllLoad = function ( status, arrayOfBuffers ) {
                arrayOfBuffers.forEach( function ( thisBuffer, trackIndex ) {
                    lastStopPosition_.push( 0 );
                    insertBufferSource( thisBuffer, trackIndex );
                } );

                self.playSpeed = new SPAudioParam( "playSpeed", 0.0, 10, 1, rateArray, null, playSpeedSetter_, self.audioContext );

                self.isInitialized = true;
                if ( typeof onLoadCallback === 'function' ) {
                    onLoadCallback( status );
                }
            };

            var onSourceEnded = function ( event, trackIndex ) {
                self.isPlaying = false;
                if ( typeof onEndedCallback === 'function' ) {
                    onEndedCallback( self, trackIndex );
                }
            };

            var insertBufferSource = function ( audioBuffer, trackIndex ) {
                var source = new SPAudioBufferSourceNode( self.audioContext );
                var gainNode = self.audioContext.createGain();

                source.buffer = audioBuffer;
                source.loopEnd = audioBuffer.duration;
                source.onended = function ( event ) {
                    onSourceEnded( event, trackIndex );
                };

                source.connect( gainNode );
                gainNode.connect( self.releaseGainNode );

                var multiChannelGainParam = new SPAudioParam( "gainNode", 0.0, 1, 1, gainNode.gain, null, null, self.audioContext );

                sources_.push( source );
                multiTrackGainNodes_.push( gainNode );
                self.multiTrackGain.push( multiChannelGainParam );
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
                if ( parameterType === "[object Array]" && sounds.length > self.maxSources ) {
                    throw {
                        name: "Unsupported number of sources",
                        message: "This sound only supports a maximum of " + self.maxSources + " sources.",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                } else {
                    rateArray = [];
                    sources_ = [];
                    multiTrackGainNodes_ = [];
                    self.multiTrackGain = [];
                    multiFileLoader.call( self, sounds, context, onAllLoad );
                }

                self.releaseGainNode.connect( self.audioContext.destination );
            }

            // Public Properties

            /**
             * @property riseTime
             * @type SPAudioParam
             * @default 1
             * @minvalue 0.05
             * @maxvalue 10
             */
            this.riseTime = SPAudioParam.createPsuedoParam( "riseTime", 0.05, 10.0, 1, this.audioContext );

            /**
             * @property decayTime
             * @type SPAudioParam
             * @default 1
             * @minvalue 0.05
             * @maxvalue 10
             */
            this.decayTime = SPAudioParam.createPsuedoParam( "decayTime", 0.05, 10.0, 1, this.audioContext );

            /**
             * @property startPoint
             * @type SPAudioParam
             * @default 0
             * @minvalue 0
             * @maxvalue 0.99
             */
            this.startPoint = new SPAudioParam( "startPoint", 0.0, 0.99, 0.00, null, null, startPointSetter_, this.audioContext );

            /**
             * @property playSpeed
             * @type SPAudioParam
             * @default 1
             * @minvalue 0
             * @maxvalue 10
             */
            this.playSpeed = null;

            /**
             * @property multiTrackGain
             * @type Array of SPAudioParams
             * @default 1
             * @minvalue 0
             * @maxvalue 1
             */
            this.multiTrackGain = [];

            /**
             * @property maxLoops
             * @type SPAudioParam
             * @default -1 (Infinite)
             * @minvalue -1
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
                        if ( typeof offset == 'undefined' ) {
                            offset = self.startPoint.value * thisSource.buffer.duration;
                        }
                        thisSource.loop = ( self.maxLoops.value !== 1 );
                        if ( typeof attackDuration !== 'undefined' ) {
                            var now = this.audioContext.currentTime;
                            this.releaseGainNode.cancelScheduledValues();
                            this.releaseGainNode.gain.setValueAtTime( 0, now );
                            this.releaseGainNode.gain.linearRampToValueAtTime( 1, now + attackDuration );
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

                if ( this.isPlaying ) {
                    sources_ = sources_.map( function ( thisSource, index ) {
                        thisSource.stop( when );
                        lastStopPosition_[ index ] = 0;

                        // Create a new source since SourceNodes can't play again.
                        var newSource = new SPAudioBufferSourceNode( self.audioContext );
                        newSource.buffer = thisSource.buffer;
                        newSource.loopStart = newSource.buffer.duration * self.startPoint.value;
                        newSource.loopEnd = newSource.buffer.duration;
                        newSource.connect( multiTrackGainNodes_[ index ] );
                        newSource.onended = function ( event ) {
                            onSourceEnded( event, index );
                        };

                        return newSource;
                    } );
                }

                BaseSound.prototype.stop.call( this, when );
            };

            /**
             * Pause the currently playing sound at the current position.
             *
             * @method pause
             */
            this.pause = function () {
                if ( this.isPlaying ) {
                    sources_ = sources_.map( function ( thisSource, index ) {
                        thisSource.stop( 0 );
                        lastStopPosition_[ index ] = thisSource.playbackPosition / thisSource.buffer.sampleRate;
                        //console.log( index + " stopped at " + lastStopPosition_[ index ] );

                        thisSource.disconnect();

                        // Create a new source since SourceNodes can't play again.
                        var newSource = new SPAudioBufferSourceNode( self.audioContext );
                        newSource.buffer = thisSource.buffer;
                        newSource.loopStart = newSource.buffer.duration * self.startPoint.value;
                        newSource.loopEnd = newSource.buffer.duration;
                        newSource.connect( multiTrackGainNodes_[ index ] );
                        newSource.onended = function ( event ) {
                            onSourceEnded( event, index );
                        };

                        return newSource;
                    } );
                }

                BaseSound.prototype.stop.call( this, 0 );
            };

            // Initialize the sounds.
            init( sounds );
        }

        Looper.prototype = Object.create( BaseSound.prototype );

        return Looper;
    } );
