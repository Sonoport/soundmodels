/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SPAudioParam', "core/SPAudioBufferSourceNode", 'core/MultiFileLoader', 'core/WebAudioDispatch' ],
    function ( Config, BaseSound, SPAudioParam, SPAudioBufferSourceNode, multiFileLoader, webAudioDispatch ) {
        "use strict";

        /**
         *
         * A model which loads one or more sources and allows them to be looped continuously at variable speed.
         * @class Looper
         * @constructor
         * @extends BaseSound
         * @param {AudioContext} [context] AudioContext to be used.
         * @param {Array/String/AudioBuffer/File} [sources] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
         * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
         * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
         * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
         * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
         * @param {Function} [onTrackEnd] Callback when an individual track has finished playing.
         */
        function Looper( context, sources, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd, onTrackEnd ) {
            if ( !( this instanceof Looper ) ) {
                throw new TypeError( "Looper constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );
            this.maxSources = Config.MAX_VOICES;
            this.minSources = 1;
            this.modelName = "Looper";

            this.onLoadProgress = onLoadProgress;
            this.onLoadComplete = onLoadComplete;
            this.onAudioStart = onAudioStart;
            this.onAudioEnd = onAudioEnd;

            // Private vars
            var self = this;

            var sourceBufferNodes_ = [];
            var multiTrackGainNodes_ = [];
            var lastStopPosition_ = [];
            var rateArray = [];

            var onLoadAll = function ( status, arrayOfBuffers ) {
                self.multiTrackGain.length = arrayOfBuffers.length;
                arrayOfBuffers.forEach( function ( thisBuffer, trackIndex ) {
                    lastStopPosition_.push( 0 );
                    insertBufferSource( thisBuffer, trackIndex );
                } );

                if ( rateArray && rateArray.length > 0 ) {
                    self.registerParameter( new SPAudioParam( "playSpeed", 0.0, 10, 1, rateArray, null, playSpeedSetter_, self.audioContext ), true );
                }

                if ( status ) {
                    self.isInitialized = true;
                }

                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status );
                }
            };

            var onSourceEnd = function ( event, trackIndex, source ) {
                var cTime = self.audioContext.currentTime;
                // Create a new source since SourceNodes can't play again.
                source.resetBufferSource( cTime, multiTrackGainNodes_[ trackIndex ] );

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

            var insertBufferSource = function ( audioBuffer, trackIndex ) {
                var source = new SPAudioBufferSourceNode( self.audioContext );
                source.buffer = audioBuffer;
                source.loopEnd = audioBuffer.duration;
                source.onended = function ( event ) {
                    onSourceEnd( event, trackIndex, source );
                };

                var gainNode;
                if ( multiTrackGainNodes_[ trackIndex ] ) {
                    gainNode = multiTrackGainNodes_[ trackIndex ];
                } else {
                    gainNode = self.audioContext.createGain();
                    multiTrackGainNodes_[ trackIndex ] = gainNode;

                    var multiChannelGainParam = new SPAudioParam( "gain", 0.0, 1, 1, gainNode.gain, null, null, self.audioContext );
                    self.multiTrackGain.splice( trackIndex, 1, multiChannelGainParam );
                }

                source.connect( gainNode );
                gainNode.connect( self.releaseGainNode );

                sourceBufferNodes_.push( source );
                rateArray.push( source.playbackRate );
            };

            var playSpeedSetter_ = function ( aParam, value, audioContext ) {
                if ( self.isInitialized ) {
                    /* 0.001 - 60dB Drop
                        e(-n) = 0.001; - Decay Rate of setTargetAtTime.
                        n = 6.90776;
                        */
                    var t60multiplier = 6.90776;

                    var currentSpeed = sourceBufferNodes_[ 0 ] ? sourceBufferNodes_[ 0 ].playbackRate.value : 1;

                    if ( value > currentSpeed ) {
                        sourceBufferNodes_.forEach( function ( thisSource ) {
                            thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                            thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.riseTime.value / t60multiplier );
                        } );
                    } else if ( value < currentSpeed ) {
                        sourceBufferNodes_.forEach( function ( thisSource ) {
                            thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                            thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.decayTime.value / t60multiplier );
                        } );
                    }
                }
            };

            var startPointSetter_ = function ( aParam, value ) {
                sourceBufferNodes_.forEach( function ( thisSource ) {
                    thisSource.loopStart = value * thisSource.buffer.duration;
                } );
            };

            function init( sources ) {
                rateArray = [];
                sourceBufferNodes_.forEach( function ( thisSource ) {
                    thisSource.disconnect();
                } );
                sourceBufferNodes_ = [];
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
            this.registerParameter( new SPAudioParam( "playSpeed", 0.0, 10, 1, null, null, playSpeedSetter_, self.audioContext ), true );

            /**
             * Rate of increase of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
             *
             * @property riseTime
             * @type SPAudioParam
             * @default 0.05
             * @minvalue 0.05
             * @maxvalue 10.0
             */

            this.registerParameter( SPAudioParam.createPsuedoParam( "riseTime", 0.05, 10.0, 0.05, this.audioContext ) );

            /**
             * Rate of decrease of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
             *
             * @property decayTime
             * @type SPAudioParam
             * @default 0.05
             * @minvalue 0.05
             * @maxvalue 10.0
             */
            this.registerParameter( SPAudioParam.createPsuedoParam( "decayTime", 0.05, 10.0, 0.05, this.audioContext ) );

            /**
             * Start point (as a factor of the length of the entire track) where the Looping should start from.
             *
             * @property startPoint
             * @type SPAudioParam
             * @default 0.0
             * @minvalue 0.0
             * @maxvalue 0.99
             */
            this.registerParameter( new SPAudioParam( "startPoint", 0.0, 0.99, 0.00, null, null, startPointSetter_, this.audioContext ) );

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
            Object.defineProperty( this, "multiTrackGain", {
                enumerable: true,
                configurable: false,
                value: []
            } );

            /**
             * The maximum number time the source will be looped before stopping. Currently only supports -1 (loop indefinitely), and 1 (only play the track once, ie. no looping).
             *
             * @property maxLoops
             * @type SPAudioParam
             * @default -1 (Infinite)
             * @minvalue -1 (Infinite)
             * @maxvalue 1
             */
            this.registerParameter( SPAudioParam.createPsuedoParam( "maxLoops", -1, 1, -1, this.audioContext ) );

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
                    sourceBufferNodes_.forEach( function ( thisSource, index ) {
                        var offset = ( lastStopPosition_ && lastStopPosition_[ index ] ) ? lastStopPosition_[ index ] : self.startPoint.value * thisSource.buffer.duration;
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
             * Start playing after specific time and from a specific offset. If offset is not defined,
             * the value of startPoint property is used.
             *
             * @method start
             * @param {Number} when Time (in seconds) when the sound should start playing.
             * @param {Number} [offset] The starting position of the playhead in seconds
             * @param {Number} [duration] Duration of the portion (in seconds) to be played
             * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
             */
            this.start = function ( when, offset, duration, attackDuration ) {
                if ( !this.isInitialized ) {
                    console.error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
                    return;
                }

                if ( !this.isPlaying ) {
                    sourceBufferNodes_.forEach( function ( thisSource ) {
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
                    sourceBufferNodes_.forEach( function ( thisSource, index ) {
                        thisSource.stop( when );
                        lastStopPosition_[ index ] = 0;
                    } );

                    BaseSound.prototype.stop.call( this, when );
                    webAudioDispatch( function () {
                        if ( typeof self.onAudioEnd === 'function' ) {
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

                    sourceBufferNodes_.forEach( function ( thisSource, index ) {
                        thisSource.stop( 0 );
                        lastStopPosition_[ index ] = thisSource.playbackPosition / thisSource.buffer.sampleRate;
                    } );

                    BaseSound.prototype.stop.call( this, 0 );
                    webAudioDispatch( function () {
                        if ( typeof self.onAudioEnd === 'function' ) {
                            self.onAudioEnd();
                        }
                    }, 0, this.audioContext );
                }
            };

            // Initialize the sources.
            window.setTimeout( function () {
                init( sources );
            }, 0 );
        }

        Looper.prototype = Object.create( BaseSound.prototype );

        return Looper;
    } );
