/**
 * @module Models
 */
define( [ 'core/Config', 'core/BaseSound', 'models/Looper', 'core/SPAudioParam' ],
    function ( Config, BaseSound, Looper, SPAudioParam ) {
        "use strict";

        /**
         * A model plays back the source at various speeds based on the movement of the activity parameter.
         *
         *
         * @class Activity
         * @constructor
         * @extends BaseSound
         * @param {String/AudioBuffer/File} source Either a URL or AudioBuffer or File Object of of the audio source.
         * @param {AudioContext} context AudioContext to be used.
         * @param {Function} [onLoadCallback] Callback when the source has finished loading.
         * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
         */
        function Activity( source, context, onLoadCallback, onProgressCallback ) {
            if ( !( this instanceof Activity ) ) {
                throw new TypeError( "Activity constructor cannot be called as a function." );
            }

            BaseSound.call( this, context );
            /*Support upto 8 seperate voices*/
            this.maxSources = Config.MAX_VOICES;
            this.minSources = 1;
            this.modelName = "Activity";

            // Private vars
            var self = this;

            // Private Variables
            var internalLooper_;
            var lastPosition_ = 0;
            var lastUpdateTime_;
            var smoothDeltaTime_;
            var timeoutID;

            // Constants

            var MIN_SENSITIVITY = 0.1;
            var MAX_SENSITIVITY = 100.0;
            var MAX_OVERSHOOT = 1.2;
            var MAX_TIME_OUT = 0.1;
            var MIN_DIFF = 0.001;

            // Private Functions

            function createCallbackWith( onLoadCallback ) {
                return function ( status ) {
                    internalLooper_.playSpeed.setValueAtTime( Config.ZERO, self.audioContext.currentTime );
                    if ( status ) {
                        self.isInitialized = true;
                    }
                    lastPosition_ = 0;
                    lastUpdateTime_ = 0;
                    smoothDeltaTime_ = 0;

                    if ( typeof onLoadCallback === 'function' ) {
                        onLoadCallback( status );
                    }
                };
            }

            function init( source, onLoadCallback, onProgressCallback ) {
                internalLooper_ = new Looper( source, self.audioContext, createCallbackWith( onLoadCallback ), onProgressCallback, null );
            }

            function actionSetter_( aParam, value, audioContext ) {
                if ( self.isInitialized ) {

                    var newPosition = value;
                    var time = audioContext.currentTime;

                    var deltaPos = Math.abs( newPosition - lastPosition_ );
                    var deltaTime = ( time - lastUpdateTime_ );

                    //console.log( deltaTime );

                    if ( deltaTime > 0 ) {

                        // The target level is dependent on the rate of motion and the sensitivity.

                        // The sensitivity slider is mapped logarithmically to a very wide range of sensitivities [0.1 100.0].
                        var logMinSens = Math.log( MIN_SENSITIVITY );
                        var logMaxSens = Math.log( MAX_SENSITIVITY );
                        var sensitivityLg = Math.exp( logMinSens + self.sensitivity.value * ( logMaxSens - logMinSens ) );

                        // Sometimes updates to the position get "bunched up", resulting in misleadingly
                        // small deltaTime values. This bit of code applies a low-pass filter to delta time.
                        // The general idea is that if you move the mouse at constant speed, the position update
                        // should come in at regular time *and* position intervals, and deltaPos/deltaTime should be
                        // fairly stable. In reality, however, deltaPos is pretty stable, but deltaTime is highly
                        // irregular. Applying a low-pass filter to to the time intervals fixes things.
                        if ( smoothDeltaTime_ > MIN_DIFF ) {
                            smoothDeltaTime_ = ( 0.5 * smoothDeltaTime_ + 0.5 * deltaTime );
                        } else {
                            smoothDeltaTime_ = deltaTime;
                        }

                        var maxRate = self.maxSpeed.value;

                        //var sensivityScaling:Number = Math.pow( 10, getParamVal(SENSITIVITY) );
                        var targetPlaySpeed_ = maxRate * sensitivityLg * deltaPos / smoothDeltaTime_;

                        // Target level is always positive (hence abs).  We clamp it at some maximum to avoid generating ridiculously large levels when deltaTime is small (which happens if the mouse events get delayed and clumped up).
                        // The maximum is slightly *higher* than the max rate, i.e. we allow some overshoot in the target value.
                        //This is so that if you're shaking the "Action" slider vigorously, the rate will get pinned at the maximum, and not momentarily drop below the maximum during those very brief instants when the target rate drops well below the max.

                        targetPlaySpeed_ = Math.min( Math.abs( targetPlaySpeed_ ), MAX_OVERSHOOT * maxRate );

                        // console.log( targetPlaySpeed_ );
                        internalLooper_.playSpeed.value = targetPlaySpeed_;

                        // We use a timeout to prevent the target level from staying at a non-zero value
                        // forever when motion stops.  For best response, we adapt the timeout based on
                        // how frequently we've been getting position updates.
                        if ( timeoutID ) {
                            window.clearTimeout( timeoutID );
                        }
                        timeoutID = window.setTimeout( function () {
                            internalLooper_.playSpeed.value = 0;
                        }, 1000 * Math.min( 10 * deltaTime, MAX_TIME_OUT ) );
                    }

                    lastPosition_ = newPosition;
                    lastUpdateTime_ = time;
                }
            }

            function riseTimeSetter_( aParam, value ) {
                if ( self.isInitialized ) {
                    internalLooper_.riseTime.value = value;
                }
            }

            function decayTimeSetter_( aParam, value ) {
                if ( self.isInitialized ) {
                    internalLooper_.decayTime.value = value;
                }
            }

            function startPointSetter_( aParam, value ) {
                if ( self.isInitialized ) {
                    internalLooper_.startPoint.value = value;
                }
            }

            // Public Properties

            /**
             *  Maximum value at which the playback speed of the source will be capped to.
             *
             * @property maxSpeed
             * @type SPAudioParam
             * @default 1
             * @minvalue 0.05
             * @maxvalue 8.0
             */
            this.maxSpeed = SPAudioParam.createPsuedoParam( "maxSpeed", 0.05, 8.0, 1, this.audioContext );

            /**
             * Controls the playback of the source. The more this parameter is moved, the higher the speed of playback.
             *
             * @property action
             * @type SPAudioParam
             * @default 0
             * @minvalue 0.0
             * @maxvalue 1.0
             */
            this.action = new SPAudioParam( "action", 0, 1.0, 0.0, null, null, actionSetter_, this.audioContext );

            /**
             * Maximum value for random pitch shift of the triggered voices in semitones.
             *
             * @property sensitivity
             * @type SPAudioParam
             * @default 0.5
             * @minvalue 0.0
             * @maxvalue 1.0
             */
            this.sensitivity = SPAudioParam.createPsuedoParam( "sensitivity", 0.0, 1.0, 0.5, this.audioContext );

            /**
             * Rate of increase of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
             *
             * @property riseTime
             * @type SPAudioParam
             * @default 1
             * @minvalue 0.05
             * @maxvalue 10.0
             */
            this.riseTime = new SPAudioParam( "riseTime", 0.05, 10.0, 1, null, null, riseTimeSetter_, this.audioContext );

            /**
             *  Rate of decrease of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
             *
             * @property decayTime
             * @type SPAudioParam
             * @default 1
             * @minvalue 0.05
             * @maxvalue 10.0
             */
            this.decayTime = new SPAudioParam( "decayTime", 0.05, 10.0, 1, null, null, decayTimeSetter_, this.audioContext );

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

            // Public Functions

            /**
             * Reinitializes a Activity and sets it's sources.
             *
             * @method setSources
             * @param {Array/AudioBuffer/String/File} source Single or Array of either URLs or AudioBuffers of audio sources.
             * @param {Function} [onLoadCallback] Callback when all source have finished loading.
             * @param {Function} [onProgressCallback] Callback when the audio file is being downloaded.
             */
            this.setSources = function ( source, onLoadCallback, onProgressCallback ) {
                this.isInitialized = false;
                internalLooper_.setSources( source, createCallbackWith( onLoadCallback ), onProgressCallback );
            };

            /**
             * Enable playback.
             *
             * @method play
             * @param {Number} [when] At what time (in seconds) the source be triggered
             *
             */
            this.play = function ( when ) {
                if ( !this.isInitialized ) {
                    console.error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
                    return;
                }
                internalLooper_.play( when );
                BaseSound.prototype.play.call( this, when );
            };

            /**
             * Start playing after specific time and from a specific offset. If offset is not defined,
             * the value of startPoint property is used.
             *
             * @method start
             * @param {Number} when The delay in seconds before playing the model
             * @param {Number} [offset] The starting position of the playhead
             * @param {Number} [duration] Duration of the portion (in seconds) to be played
             * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
             */
            this.start = function ( when, offset, duration, attackDuration ) {
                if ( !this.isInitialized ) {
                    console.error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
                    return;
                }
                internalLooper_.start( when, offset, duration );
                BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
            };

            /**
             * Stops the source and resets play head to 0.
             * @method stop
             * @param {Number} when Time offset to stop
             */
            this.stop = function ( when ) {
                internalLooper_.stop( when );
                BaseSound.prototype.stop.call( this, when );
            };

            /**
             * Pause the currently playing source at the current position.
             *
             * @method pause
             */
            this.pause = function () {
                internalLooper_.pause();
                BaseSound.prototype.pause.call( this );
            };

            /**
             * Linearly ramp down the gain of the audio in time (seconds) to 0.
             *
             * @method release
             * @param {Number} [when] Time (in seconds) at which the Envelope will release.
             * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
             */
            this.release = function ( when, fadeTime ) {
                internalLooper_.release( when, fadeTime );
                BaseSound.prototype.release.call( this, when, fadeTime );
            };

            /**
             * Disconnects the Sound from the AudioNode Chain.
             *
             * @method disconnect
             * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
             **/
            this.disconnect = function ( outputIndex ) {
                internalLooper_.disconnect( outputIndex );
            };

            /**
             * If the parameter `output` is an AudioNode, it connects to the releaseGainNode.
             * If the output is a BaseSound, it will connect BaseSound's releaseGainNode to the output's inputNode.
             *
             * @method connect
             * @param {AudioNode} destination AudioNode to connect to.
             * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
             * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
             */
            this.connect = function ( destination, output, input ) {
                internalLooper_.connect( destination, output, input );
            };

            if ( source ) {
                init( source, onLoadCallback, onProgressCallback );
            }
        }

        Activity.prototype = Object.create( BaseSound.prototype );
        return Activity;

    } );
