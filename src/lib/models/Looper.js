/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SPAudioParam', "core/SPAudioBufferSourceNode", 'core/MultiFileLoader' ],
    function ( Config, BaseSound, SPAudioParam, SPAudioBufferSourceNode, multiFileLoader ) {
        "use strict";

        /**
         *
         * A model which loads one or more sources and allows them to be looped continuously at variable speed.
         * @class Looper
         * @constructor
         * @extends BaseSound
         * @param {Array/String/AudioBuffer/File} sources Single or Array of either URLs or AudioBuffers or File Object of the audio source.
         * @param {AudioContext} context AudioContext to be used.
         * @param {Function} [onLoadCallback] Callback when all sources have finished loading.
         * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
         * @param {Function} [onEndedCallback] Callback when the Looper has finished playing.
         */
        function Looper( sources, context, onLoadCallback, onProgressCallback, onEndedCallback ) {
            if ( !( this instanceof Looper ) ) {
                throw new TypeError( "Looper constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );
            this.maxSources = Config.MAX_VOICES;
            this.minSources = 1;
            this.modelName = "Looper";

            // Private vars
            var self = this;

            var sources_ = [];
            var multiTrackGainNodes_ = [];
            var lastStopPosition_ = [];
            var rateArray = [];

            var createCallbackWith = function ( onLoadCallback ) {
                return function ( status, arrayOfBuffers ) {
                    arrayOfBuffers.forEach( function ( thisBuffer, trackIndex ) {
                        lastStopPosition_.push( 0 );
                        insertBufferSource( thisBuffer, trackIndex );
                    } );

                    self.playSpeed = new SPAudioParam( "playSpeed", 0.0, 10, 1, rateArray, null, playSpeedSetter_, self.audioContext );

                    if ( status ) {
                        self.isInitialized = true;
                    }
                    if ( typeof onLoadCallback === 'function' ) {
                        onLoadCallback( status );
                    }
                };
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

            function init( sources, onLoadCallback, onProgressCallback ) {
                rateArray = [];
                sources_.forEach( function ( thisSource ) {
                    thisSource.disconnect();
                } );
                sources_ = [];
                multiFileLoader.call( self, sources, self.audioContext, createCallbackWith( onLoadCallback ), onProgressCallback );
            }

            // Public Properties

            /**
             * Speed of playback of the source. Affects both pitch and tempo.
             *
             * @property playSpeed
             * @type SPAudioParam
             * @default 1.0
             * @minvalue 0.0
             * @maxvalue 10.0
             */
            this.playSpeed = null;

            /**
             * Rate of increase of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
             *
             * @property riseTime
             * @type SPAudioParam
             * @default 0.05
             * @minvalue 0.05
             * @maxvalue 10.0
             */
            this.riseTime = SPAudioParam.createPsuedoParam( "riseTime", 0.05, 10.0, 0.05, this.audioContext );

            /**
             * Rate of decrease of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
             *
             * @property decayTime
             * @type SPAudioParam
             * @default 0.05
             * @minvalue 0.05
             * @maxvalue 10.0
             */
            this.decayTime = SPAudioParam.createPsuedoParam( "decayTime", 0.05, 10.0, 0.05, this.audioContext );

            /**
             * Start point (as a factor of the length of the entire track) where the Looping should start from.
             *
             * @property startPoint
             * @type SPAudioParam
             * @default 0.0
             * @minvalue 0.0
             * @maxvalue 0.99
             */
            this.startPoint = new SPAudioParam( "startPoint", 0.0, 0.99, 0.00, null, null, startPointSetter_, this.audioContext );

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
            this.multiTrackGain = [];

            /**
             * The maximum number time the source will be looped before stopping. Currently only supports -1 (loop indefinitely), and 1 (only play the track once, ie. no looping).
             *
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
             * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers of sources.
             * @param {Function} [onLoadCallback] Callback when all sources have finished loading.
             * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
             */
            this.setSources = function ( sources, onLoadCallback, onProgressCallback ) {
                this.isInitialized = false;
                init( sources, onLoadCallback, onProgressCallback );
            };

            /**
             * Plays the model immediately. If the model is paused, the model will be played back from the same position as it was paused at.
             *
             * @method play
             *
             */
            this.play = function () {

                if ( !this.isInitialized ) {
                    throw new Error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
                }

                var now = this.audioContext.currentTime;

                if ( !this.isPlaying ) {
                    sources_.forEach( function ( thisSource, index ) {
                        var offset = ( lastStopPosition_ && lastStopPosition_[ index ] ) ? lastStopPosition_[ index ] : self.startPoint.value * thisSource.buffer.duration;
                        thisSource.loop = ( self.maxLoops.value !== 1 );
                        thisSource.start( now, offset );
                    } );
                    BaseSound.prototype.start.call( this, now );
                }
            };

            /**
             * Start playing after specific time and from a specific offset. If offset is not defined,
             * the value of startPoint property is used.
             *
             * @method start
             * @param {Number} when The delay in seconds before playing the model
             * @param {Number} [offset] The starting position of the playhead in seconds
             * @param {Number} [duration] Duration of the portion (in seconds) to be played
             * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
             */
            this.start = function ( when, offset, duration, attackDuration ) {
                if ( !this.isInitialized ) {
                    throw new Error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
                }

                if ( !this.isPlaying ) {
                    sources_.forEach( function ( thisSource ) {
                        if ( typeof offset == 'undefined' || offset === null ) {
                            offset = self.startPoint.value * thisSource.buffer.duration;
                        }
                        if ( typeof duration == 'undefined' || duration === null ) {
                            duration = thisSource.buffer.duration;
                        }
                        thisSource.loop = ( self.maxLoops.value !== 1 );
                        thisSource.start( when, offset, duration );
                    } );
                    BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
                }
            };

            /**
             * Stops the model and resets play head to 0.
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
             * Pause the currently playing model at the current position.
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

            // Initialize the sources.
            if ( sources )
                init( sources, onLoadCallback, onProgressCallback );
        }

        Looper.prototype = Object.create( BaseSound.prototype );

        return Looper;
    } );
