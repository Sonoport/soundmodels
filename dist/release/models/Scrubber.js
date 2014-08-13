/*javascript-sound-models - v1.1.2-0 - Wed Aug 13 2014 12:18:08 GMT+0800 (SGT) */ 
console.log("   ____                           __ \n" + "  / _____  ___ ___  ___ ___  ____/ /_\n" + " _\\ \\/ _ \\/ _ / _ \\/ _ / _ \\/ __/ __/\n" + "/___/\\___/_//_\\___/ .__\\___/_/  \\__/ \n" + "                 /_/                 \n" + "Hello Developer!\n" + "Thanks for using Sonoport Dynamic Sound Library v1.1.2-0.");
/**
 * A structure for static configuration options.
 *
 * @module Core
 * @class Config
 */
define( 'core/Config',[],
    function () {
        

        function Config() {}

        /**
         * Define if Errors are logged using errorception.
         *
         * @final
         * @static
         * @property LOG_ERRORS
         * @default true
         *
         */
        Config.LOG_ERRORS = true;

        /**
         * Very small number considered non-zero by WebAudio.
         *
         * @final
         * @static
         * @property ZERO
         * @default 1e-37
         *
         */
        Config.ZERO = parseFloat( "1e-37" );

        /**
         * Maximum number of voices supported
         *
         * @final
         * @static
         * @property MAX_VOICES
         * @default 8
         *
         */
        Config.MAX_VOICES = 8;

        /**
         * Default nominal refresh rate (Hz) for SoundQueue.
         *
         * @final
         * @static
         * @property NOMINAL_REFRESH_RATE
         * @default 60
         *
         */
        Config.NOMINAL_REFRESH_RATE = 60;

        /**
         * Default window length for window and add functionality
         *
         * @final
         * @static
         * @property NOMINAL_REFRESH_RATE
         * @default 512
         *
         */
        Config.WINDOW_LENGTH = 512;

        /**
         * Default Chunk Length for ScriptNodes.
         *
         * @final
         * @static
         * @property CHUNK_LENGTH
         * @default 256
         *
         */
        Config.CHUNK_LENGTH = 256;

        return Config;
    } );

/**
 * @module Core
 *
 * @class WebAudioDispatch
 * @static
 */
define( 'core/WebAudioDispatch',[],
    function () {
        
        /**
         * Helper class to dispatch manual syncronized calls to for WebAudioAPI. This is to be used for API calls which can't don't take in a time argument and hence are inherently Syncronized.
         *
         *
         * @method WebAudioDispatch
         * @param {Function} Function to be called at a specific time in the future.
         * @param {Number} TimeStamp at which the above function is to be called.
         * @param {String} audioContext AudioContext to be used for timing.
         */

        function WebAudioDispatch( functionCall, time, audioContext ) {
            if ( !audioContext ) {
                console.warn( "No AudioContext provided" );
                return;
            }
            var currentTime = audioContext.currentTime;
            // Dispatch anything that's scheduled for anything before current time, current time and the next 5 msecs
            if ( currentTime >= time || time - currentTime < 0.005 ) {
                //console.log( "Dispatching now" );
                functionCall();
            } else {
                //console.log( "Dispatching in ", ( time - currentTime ) * 1000 );
                window.setTimeout( function () {
                    //console.log( "Diff at dispatch ", ( time - audioContext.currentTime ) * 1000 );
                    functionCall();
                }, ( time - currentTime ) * 1000 );
            }
        }

        return WebAudioDispatch;
    }
);

/**
 *
 *
 * @module Core
 *
 */
define(
    'core/AudioContextMonkeyPatch',[],function () {
        

        /*
         *  MonkeyPatch for AudioContext. Normalizes AudioContext across browsers and implementations.
         *
         * @class AudioContextMonkeyPatch
         */

        function fixSetTarget( param ) {
            if ( !param ) { // if NYI, just return
                return;
            }
            if ( !param.setTargetAtTime ) {
                param.setTargetAtTime = param.setTargetValueAtTime;
            }
        }
        if ( window.hasOwnProperty( 'webkitAudioContext' ) && !window.hasOwnProperty( 'AudioContext' ) ) {
            window.AudioContext = webkitAudioContext;
            if ( !AudioContext.prototype.hasOwnProperty( 'createGain' ) ) {
                AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
            }
            if ( !AudioContext.prototype.hasOwnProperty( 'createDelay' ) ) {
                AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
            }
            if ( !AudioContext.prototype.hasOwnProperty( 'createScriptProcessor' ) ) {
                AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
            }
            AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
            AudioContext.prototype.createGain = function () {
                var node = this.internal_createGain();
                fixSetTarget( node.gain );
                return node;
            };
            AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
            AudioContext.prototype.createDelay = function ( maxDelayTime ) {
                var node = maxDelayTime ? this.internal_createDelay( maxDelayTime ) : this.internal_createDelay();
                fixSetTarget( node.delayTime );
                return node;
            };
            AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
            AudioContext.prototype.createBufferSource = function () {
                var node = this.internal_createBufferSource();
                if ( !node.start ) {
                    node.start = function ( when, offset, duration ) {
                        if ( offset || duration ) {
                            this.noteGrainOn( when, offset, duration );
                        } else {
                            this.noteOn( when );
                        }
                    };
                }
                if ( !node.stop ) {
                    node.stop = node.noteOff;
                }
                fixSetTarget( node.playbackRate );
                return node;
            };
            AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
            AudioContext.prototype.createDynamicsCompressor = function () {
                var node = this.internal_createDynamicsCompressor();
                fixSetTarget( node.threshold );
                fixSetTarget( node.knee );
                fixSetTarget( node.ratio );
                fixSetTarget( node.reduction );
                fixSetTarget( node.attack );
                fixSetTarget( node.release );
                return node;
            };
            AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
            AudioContext.prototype.createBiquadFilter = function () {
                var node = this.internal_createBiquadFilter();
                fixSetTarget( node.frequency );
                fixSetTarget( node.detune );
                fixSetTarget( node.Q );
                fixSetTarget( node.gain );
                return node;
            };
            if ( AudioContext.prototype.hasOwnProperty( 'createOscillator' ) ) {
                AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
                AudioContext.prototype.createOscillator = function () {
                    var node = this.internal_createOscillator();
                    if ( !node.start ) {
                        node.start = node.noteOn;
                    }
                    if ( !node.stop ) {
                        node.stop = node.noteOff;
                    }
                    fixSetTarget( node.frequency );
                    fixSetTarget( node.detune );
                    return node;
                };
            }
        }
    } );

/**
 * @module Core
 */
define( 'core/BaseSound',[ 'core/WebAudioDispatch', 'core/AudioContextMonkeyPatch' ], function ( webAudioDispatch ) {
    

    /**
     * Pseudo AudioNode class the encapsulates basic functionality of an Audio Node. To be extended by all other Sound Models
     *
     * @class BaseSound
     * @constructor
     * @requires AudioContextMonkeyPatch
     * @param {AudioContext} [context] AudioContext in which this Sound is defined.
     */
    function BaseSound( context ) {
        /**
         * Web Audio API's AudioContext. If the context passed to the constructor is an AudioContext, a new one is created here.
         *
         * @property audioContext
         * @type AudioContext
         */
        if ( context === undefined || context === null ) {
            console.log( "Making a new AudioContext" );
            this.audioContext = new AudioContext();
        } else {
            this.audioContext = context;
        }

        bootAudioContext( this.audioContext );

        /**
         * Number of inputs
         *
         * @property numberOfInputs
         * @type Number
         * @default 0
         */
        this.numberOfInputs = 0;

        /**
         * Number of outputs
         *
         * @property numberOfOutputs
         * @type Number
         * @default 0
         */
        Object.defineProperty( this, 'numberOfOutputs', {
            enumerable: true,
            configurable: false,
            get: function () {
                return this.releaseGainNode.numberOfOutputs;
            }
        } );

        /**
         *Maximum number of sources that can be given to this Sound
         *
         * @property maxSources
         * @type Number
         * @default 0
         */
        var maxSources_ = 0;
        Object.defineProperty( this, 'maxSources', {
            enumerable: true,
            configurable: false,
            set: function ( max ) {
                if ( max < 0 ) {
                    max = 0;
                }
                maxSources_ = Math.round( max );
            },
            get: function () {
                return maxSources_;
            }
        } );

        /**
         *Minimum number of sources that can be given to this Sound
         *
         * @property minSources
         * @type Number
         * @default 0
         */
        var minSources_ = 0;
        Object.defineProperty( this, 'minSources', {
            enumerable: true,
            configurable: false,
            set: function ( max ) {
                if ( max < 0 ) {
                    max = 0;
                }
                minSources_ = Math.round( max );
            },
            get: function () {
                return minSources_;
            }
        } );

        /**
         * Release Gain Node
         *
         * @property releaseGainNode
         * @type GainNode
         * @default Internal GainNode
         * @final
         */
        this.releaseGainNode = this.audioContext.createGain();

        /**
         *  If Sound is currently playing.
         *
         * @property isPlaying
         * @type Boolean
         * @default false
         */
        this.isPlaying = false;

        /**
         *  If Sound is currently initialized.
         *
         * @property isInitialized
         * @type Boolean
         * @default false
         */
        this.isInitialized = false;

        /**
         * The input node that the output node will be connected to. <br />
         * Set this value to null if no connection can be made on the input node
         *
         * @property inputNode
         * @type Object
         * @default null
         **/
        this.inputNode = null;

        /**
         * String name of the model.
         *
         * @property modelName
         * @type String
         * @default "Model"
         **/
        this.modelName = "Model";

        /**
         * Callback for handling progress events thrown during loading of audio files.
         *
         * @property onLoadProgress
         * @type Function
         * @default null
         */
        this.onLoadProgress = null;

        /**
         * Callback for when loading of audio files is done and the the model is initalized.
         *
         * @property onLoadComplete
         * @type Function
         * @default null
         */
        this.onLoadComplete = null;

        /**
         * Callback for when the audio is about to start playing.
         *
         * @property onAudioStart
         * @type Function
         * @default null
         */
        this.onAudioStart = null;

        /**
         * Callback for the audio is about to stop playing.
         *
         * @property onAudioEnd
         * @type Function
         * @default null
         */
        this.onAudioEnd = null;

        this.releaseGainNode.connect( this.audioContext.destination );

        function bootAudioContext( context ) {

            var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );

            function createDummyOsc() {
                //console.log( "Booting ", context );
                bootOsc.start( 0 );
                bootOsc.stop( context.currentTime + 0.0001 );
                window.liveAudioContexts.push( context );
                window.removeEventListener( 'touchstart', createDummyOsc );
            }

            if ( iOS ) {
                if ( !window.liveAudioContexts ) {
                    window.liveAudioContexts = [];
                }
                if ( window.liveAudioContexts.indexOf( context ) < 0 ) {
                    var bootOsc = context.createOscillator();
                    var bootGain = context.createGain();
                    bootGain.gain.value = 0;
                    bootOsc.connect( bootGain );
                    bootGain.connect( context.destination );
                    window.addEventListener( 'touchstart', createDummyOsc );
                }
            }
        }
    }

    /**
     * Registers a Parameter to the model. This ensures that the Parameter is unwritable and allows
     * to lock in the configurability of the object.
     *
     * @param  {SPAudioParam} audioParam
     */
    BaseSound.prototype.registerParameter = function ( audioParam, configurable ) {

        if ( configurable === undefined || configurable === null ) {
            configurable = false;
        }

        Object.defineProperty( this, audioParam.name, {
            enumerable: true,
            configurable: configurable,
            value: audioParam
        } );
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
    BaseSound.prototype.connect = function ( destination, output, input ) {
        if ( destination instanceof AudioNode ) {
            this.releaseGainNode.connect( destination, output, input );
        } else if ( destination.inputNode instanceof AudioNode ) {
            this.releaseGainNode.connect( destination.inputNode, output, input );
        } else {
            console.error( "No Input Connection - Attempts to connect " + ( typeof output ) + " to " + ( typeof this ) );
        }
    };

    /**
     * Disconnects the Sound from the AudioNode Chain.
     *
     * @method disconnect
     * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
     **/
    BaseSound.prototype.disconnect = function ( outputIndex ) {
        this.releaseGainNode.disconnect( outputIndex );
    };

    /**
     * Start the AudioNode. Abstract method. Override this method when a Node is defined.
     *
     * @method start
     * @param {Number} when Time (in seconds) when the sound should start playing.
     * @param {Number} [offset] The starting position of the playhead
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     */
    BaseSound.prototype.start = function ( when, offset, duration, attackDuration ) {
        if ( typeof when === "undefined" || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        this.releaseGainNode.gain.cancelScheduledValues( when );
        if ( typeof attackDuration !== 'undefined' ) {
            //console.log( "Ramping from " + offset + "  in " + attackDuration );
            this.releaseGainNode.gain.setValueAtTime( 0, when );
            this.releaseGainNode.gain.linearRampToValueAtTime( 1, when + attackDuration );
        } else {
            this.releaseGainNode.gain.setValueAtTime( 1, when );
        }

        var self = this;
        webAudioDispatch( function () {
            self.isPlaying = true;
        }, when, this.audioContext );
    };

    /**
     * Stop the AudioNode. Abstract method. Override this method when a Node is defined.
     *
     * @method stop
     * @param {Number} [when] Time (in seconds) the sound should stop playing
     */
    BaseSound.prototype.stop = function ( when ) {
        if ( typeof when === "undefined" || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        var self = this;
        webAudioDispatch( function () {
            self.isPlaying = false;
        }, when, this.audioContext );

        // cancel all scheduled ramps on this releaseGainNode
        this.releaseGainNode.gain.cancelScheduledValues( when );
    };

    /**
     * Linearly ramp down the gain of the audio in time (seconds) to 0.
     *
     * @method release
     * @param {Number} [when] Time (in seconds) at which the Envelope will release.
     * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
     * @param {Boolean} [stopOnRelease] Boolean to define if release stops (resets) the playback or just pauses it.
     */
    BaseSound.prototype.release = function ( when, fadeTime, stopOnRelease ) {

        if ( this.isPlaying ) {
            var FADE_TIME = 0.5;
            var FADE_TIME_PAD = 1 / this.audioContext.sampleRate;

            if ( typeof when === "undefined" || when < this.audioContext.currentTime ) {
                when = this.audioContext.currentTime;
            }

            fadeTime = fadeTime || FADE_TIME;
            // Clamp the current gain value at this point of time to prevent sudden jumps.
            this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, when );

            // Now there won't be any glitch and there is a smooth ramp down.
            this.releaseGainNode.gain.linearRampToValueAtTime( 0, when + fadeTime );

            // Pause the sound after currentTime + fadeTime + FADE_TIME_PAD
            if ( stopOnRelease ) {
                this.stop( when + FADE_TIME + FADE_TIME_PAD );
            } else {
                var self = this;
                webAudioDispatch( function () {
                    self.pause();
                }, when + fadeTime, this.audioContext );
            }
        }
    };

    /**
     * Reinitializes the model and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers or File Objects of the audio sources.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    BaseSound.prototype.setSources = function ( sources, onLoadProgress, onLoadComplete ) {
        this.isInitialized = false;

        if ( typeof onLoadProgress === 'function' ) {
            this.onLoadProgress = onLoadProgress;
        }

        if ( typeof onLoadComplete === 'function' ) {
            this.onLoadComplete = onLoadComplete;
        }
    };

    /**
     * Play sound. Abstract method. Override this method when a Node is defined.
     *
     * @method play
     */
    BaseSound.prototype.play = function () {
        this.start( 0 );
    };

    /**
     * Pause sound. Abstract method. Override this method when a Node is defined.
     *
     * @method pause
     */
    BaseSound.prototype.pause = function () {
        this.isPlaying = false;
    };

    /**
     * List all SPAudioParams this Sound exposes
     *
     * @method listParams
     * @param {Array} [paramArray] Array of all the SPAudioParams this Sound exposes.
     */
    BaseSound.prototype.listParams = function () {
        var paramList = [];

        for ( var paramName in this ) {
            if ( this.hasOwnProperty( paramName ) ) {
                var param = this[ paramName ];
                // Get properties that are of SPAudioParam
                if ( param && param.hasOwnProperty( "value" ) && param.hasOwnProperty( "minValue" ) && param.hasOwnProperty( "maxValue" ) ) {
                    paramList.push( param );
                }
            }
        }
        return paramList;
    };

    // Return constructor function
    return BaseSound;
} );

/*
 ** @module Core
 */
define(
    'core/SPAudioParam',[ 'core/WebAudioDispatch' ],
    function ( webAudioDispatch ) {
        
        /**
         * Mock AudioParam used to create Parameters for Sonoport Sound Models. The SPAudioParam supports either a AudioParam backed parameter, or a completely Javascript mocked up Parameter, which supports a rough version of parameter automation.
         *
         *
         * @class SPAudioParam
         * @constructor
         * @param {String} [name] The name of the parameter.
         * @param {Number} [minValue] The minimum value of the parameter.
         * @param {Number} [maxValue] The maximum value of the parameter.
         * @param {Number} [defaultValue] The default and starting value of the parameter.
         * @param {AudioParam/Array} [aParams] A WebAudio parameter which will be set/get when this parameter is changed.
         * @param {Function} [mappingFunction] A mapping function to map values between the mapped SPAudioParam and the underlying WebAudio AudioParam.
         * @param {Function} [setter] A setter function which can be used to set the underlying audioParam. If this function is undefined, then the parameter is set directly.
         * @param {AudioContext} [audioContext] A WebAudio AudioContext for timing.
         */
        function SPAudioParam( name, minValue, maxValue, defaultValue, aParams, mappingFunction, setter, audioContext ) {
            // Min diff between set and actual
            // values to stop updates.
            var MIN_DIFF = 0.0001;
            var UPDATE_INTERVAL_MS = 500;
            var intervalID_;

            var value_ = 0;

            /**
             * Initial value for the value attribute.
             *
             * @property defaultValue
             * @type Number/Boolean
             * @default 0
             */
            this.defaultValue = null;

            /**
             *  Maximum value which the value attribute can be set to.
             *
             *
             * @property maxValue
             * @type Number/Boolean
             * @default 0
             */
            this.maxValue = 0;

            /**
             * Minimum value which the value attribute can be set to.
             *
             * @property minValue
             * @type Number/Boolean
             * @default 0
             */

            this.minValue = 0;

            /**
             * Name of the Parameter.
             *
             * @property name
             * @type String
             * @default ""
             */

            this.name = "";

            /**
             * The parameter's value. This attribute is initialized to the defaultValue. If value is set during a time when there are any automation events scheduled then it will be ignored and no exception will be thrown.
             *
             *
             * @property value
             * @type Number/Boolean
             * @default 0
             */
            Object.defineProperty( this, 'value', {
                enumerable: true,
                configurable: false,
                set: function ( value ) {
                    // Sanitize the value with min/max
                    // bounds first.
                    if ( typeof value !== typeof defaultValue ) {
                        console.error( "Attempt to set a " + ( typeof defaultValue ) + " parameter to a " + ( typeof value ) + " value" );
                        return;
                    }
                    // Sanitize the value with min/max
                    // bounds first.
                    if ( typeof value === "number" ) {
                        if ( value > maxValue ) {
                            console.warn( this.name + ' clamping to max' );
                            value = maxValue;
                        } else if ( value < minValue ) {
                            console.warn( this.name + ' clamping to min' );
                            value = minValue;
                        }
                    }

                    // Map the value first
                    if ( typeof mappingFunction === 'function' ) {
                        // Map if mappingFunction is defined
                        value = mappingFunction( value );
                    }

                    // If setter exists, use that
                    if ( typeof setter === 'function' && audioContext ) {
                        setter( aParams, value, audioContext );
                    } else if ( aParams ) {
                        // else if param is defined, set directly
                        if ( aParams instanceof AudioParam ) {
                            aParams.value = value;
                        } else if ( aParams instanceof Array ) {
                            aParams.forEach( function ( thisParam ) {
                                thisParam.value = value;
                            } );
                        }
                    } else {
                        // Else if Psuedo param
                        window.clearInterval( intervalID_ );
                    }

                    // Set the value_ anyway.
                    value_ = value;
                },
                get: function () {
                    if ( aParams ) {
                        if ( aParams instanceof AudioParam ) {
                            return aParams.value;
                        } else if ( aParams instanceof Array ) {
                            // use a nominal Parameter to populate
                            return aParams[ 0 ].value;
                        }
                    }
                    return value_;
                }
            } );
            if ( aParams && ( aParams instanceof AudioParam || aParams instanceof Array ) ) {
                // Use a nominal Parameter to populate the values.
                var aParam = aParams[ 0 ] || aParams;
                this.defaultValue = aParam.defaultValue;
                this.minValue = aParam.minValue;
                this.maxValue = aParam.maxValue;
                this.value = aParam.defaultValue;
                this.name = aParam.name;
            }

            if ( name ) {
                this.name = name;
            }

            if ( typeof defaultValue !== 'undefined' ) {
                this.defaultValue = defaultValue;
                this.value = defaultValue;
            }

            if ( typeof minValue !== 'undefined' ) {
                this.minValue = minValue;
            }

            if ( typeof maxValue !== 'undefined' ) {
                this.maxValue = maxValue;
            }

            /**
             * Schedules a parameter value change at the given time.
             *
             * @method setValueAtTime
             * @param {Number} value The value parameter is the value the parameter will change to at the given time.
             * @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
             */
            this.setValueAtTime = function ( value, startTime ) {
                //console.log( "setting value " + value + " at time " + startTime + " for " + aParams );

                if ( typeof mappingFunction === 'function' ) {
                    value = mappingFunction( value );
                }
                if ( aParams ) {
                    if ( aParams instanceof AudioParam ) {
                        aParams.setValueAtTime( value, startTime );
                    } else if ( aParams instanceof Array ) {
                        aParams.forEach( function ( thisParam ) {
                            thisParam.setValueAtTime( value, startTime );
                        } );
                    }
                } else {
                    // Horrible hack for the case we don't have access to
                    // a real AudioParam.
                    var self = this;
                    webAudioDispatch( function () {
                        self.value = value;
                    }, startTime, audioContext );
                }
            };

            /**
             * Start exponentially approaching the target value at the given time with a rate having the given time constant.
             *
             * During the time interval: T0 <= t < T1, where T0 is the startTime parameter and T1 represents the time of the event following this event (or infinity if there are no following events):
             *     v(t) = V1 + (V0 - V1) * exp(-(t - T0) / timeConstant)
             *
             * @method setTargetAtTime
             * @param {Number} target The target parameter is the value the parameter will start changing to at the given time.
             * @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
             * @param {Number} timeConstant The timeConstant parameter is the time-constant value of first-order filter (exponential) approach to the target value. The larger this value is, the slower the transition will be.
             */
            this.setTargetAtTime = function ( target, startTime, timeConstant ) {
                if ( typeof mappingFunction === 'function' ) {
                    target = mappingFunction( target );
                }
                if ( aParams ) {
                    if ( aParams instanceof AudioParam ) {
                        aParams.setTargetAtTime( target, startTime, timeConstant );
                    } else if ( aParams instanceof Array ) {
                        aParams.forEach( function ( thisParam ) {
                            thisParam.setTargetAtTime( target, startTime, timeConstant );
                        } );
                    }
                } else {
                    // Horrible hack for the case we don't have access to
                    // a real AudioParam.
                    var self = this;
                    var initValue_ = self.value;
                    var initTime_ = audioContext.currentTime;
                    intervalID_ = window.setInterval( function () {
                        if ( audioContext.currentTime >= startTime ) {
                            self.value = target + ( initValue_ - target ) * Math.exp( -( audioContext.currentTime - initTime_ ) / timeConstant );
                            if ( Math.abs( self.value - target ) < MIN_DIFF ) {
                                window.clearInterval( intervalID_ );
                            }
                        }
                    }, UPDATE_INTERVAL_MS );
                }
            };
            /**
             * Sets an array of arbitrary parameter values starting at the given time for the given duration. The number of values will be scaled to fit into the desired duration.

             * During the time interval: startTime <= t < startTime + duration, values will be calculated:
             *
             *   v(t) = values[N * (t - startTime) / duration], where N is the length of the values array.
             *
             * @method setValueCurveAtTime
             * @param {Float32Array} values The values parameter is a Float32Array representing a parameter value curve. These values will apply starting at the given time and lasting for the given duration.
             * @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
             * @param {Number} duration The duration parameter is the amount of time in seconds (after the startTime parameter) where values will be calculated according to the values parameter.
             */
            this.setValueCurveAtTime = function ( values, startTime, duration ) {
                if ( typeof mappingFunction === 'function' ) {
                    for ( var index = 0; index < values.length; index++ ) {
                        values[ index ] = mappingFunction( values[ index ] );
                    }
                }
                if ( aParams ) {
                    if ( aParams instanceof AudioParam ) {
                        aParams.setValueCurveAtTime( values, startTime, duration );
                    } else if ( aParams instanceof Array ) {
                        aParams.forEach( function ( thisParam ) {
                            thisParam.setValueCurveAtTime( values, startTime, duration );
                        } );
                    }
                } else {
                    var self = this;
                    var initTime_ = audioContext.currentTime;
                    intervalID_ = window.setInterval( function () {
                        if ( audioContext.currentTime >= startTime ) {
                            var index = Math.floor( values.length * ( audioContext.currentTime - initTime_ ) / duration );
                            if ( index < values.length ) {
                                self.value = values[ index ];
                            } else {
                                window.clearInterval( intervalID_ );
                            }
                        }
                    }, UPDATE_INTERVAL_MS );
                }
            };

            /**
             * Schedules an exponential continuous change in parameter value from the previous scheduled parameter value to the given value.
             *
             * v(t) = V0 * (V1 / V0) ^ ((t - T0) / (T1 - T0))
             *
             * @method exponentialRampToValueAtTime
             * @param {Number} value The value parameter is the value the parameter will exponentially ramp to at the given time.
             * @param {Number} endTime The endTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
             */
            this.exponentialRampToValueAtTime = function ( value, endTime ) {
                if ( typeof mappingFunction === 'function' ) {
                    value = mappingFunction( value );
                }
                if ( aParams ) {
                    if ( aParams instanceof AudioParam ) {
                        aParams.exponentialRampToValueAtTime( value, endTime );
                    } else if ( aParams instanceof Array ) {
                        aParams.forEach( function ( thisParam ) {
                            thisParam.exponentialRampToValueAtTime( value, endTime );
                        } );
                    }
                } else {
                    var self = this;
                    var initValue_ = self.value;
                    var initTime_ = audioContext.currentTime;
                    if ( initValue_ === 0 ) {
                        initValue_ = 0.001;
                    }
                    intervalID_ = window.setInterval( function () {
                        var timeRatio = ( audioContext.currentTime - initTime_ ) / ( endTime - initTime_ );
                        self.value = initValue_ * Math.pow( value / initValue_, timeRatio );
                        if ( audioContext.currentTime >= endTime ) {
                            window.clearInterval( intervalID_ );
                        }
                    }, UPDATE_INTERVAL_MS );
                }
            };

            /**
             *Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.
             *
             * @method linearRampToValueAtTime
             * @param {Float32Array} value The value parameter is the value the parameter will exponentially ramp to at the given time.
             * @param {Number} endTime The endTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
             */
            this.linearRampToValueAtTime = function ( value, endTime ) {
                if ( typeof mappingFunction === 'function' ) {
                    value = mappingFunction( value );
                }
                if ( aParams ) {
                    if ( aParams instanceof AudioParam ) {
                        aParams.linearRampToValueAtTime( value, endTime );
                    } else if ( aParams instanceof Array ) {
                        aParams.forEach( function ( thisParam ) {
                            thisParam.linearRampToValueAtTime( value, endTime );
                        } );
                    }
                } else {
                    var self = this;
                    var initValue_ = self.value;
                    var initTime_ = audioContext.currentTime;
                    intervalID_ = window.setInterval( function () {
                        var timeRatio = ( audioContext.currentTime - initTime_ ) / ( endTime - initTime_ );
                        self.value = initValue_ + ( ( value - initValue_ ) * timeRatio );
                        if ( audioContext.currentTime >= endTime ) {
                            window.clearInterval( intervalID_ );
                        }
                    }, UPDATE_INTERVAL_MS );
                }
            };

            /**
             * Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.
             *
             * @method cancelScheduledValues
             * @param {Number} startTime The startTime parameter is the starting time at and after which any previously scheduled parameter changes will be cancelled.
             */
            this.cancelScheduledValues = function ( startTime ) {
                if ( aParams ) {
                    if ( aParams instanceof AudioParam ) {
                        aParams.cancelScheduledValues( startTime );
                    } else if ( aParams instanceof Array ) {
                        aParams.forEach( function ( thisParam ) {
                            thisParam.cancelScheduledValues( startTime );
                        } );
                    }
                } else {
                    window.clearInterval( intervalID_ );
                }
            };
        }

        /**
         * Static helper method to create Psuedo parameters which are not connected to
        any WebAudio AudioParams.
         *
         * @method createPsuedoParam
         * @static
         * @return  SPAudioParam
         * @param {String} name The name of the parameter..
         * @param {Number} minValue The minimum value of the parameter.
         * @param {Number} maxValue The maximum value of the parameter.
         * @param {Number} defaultValue The default and starting value of the parameter.
         * @param {AudioContext} audioContext An audiocontext in which this model exists.
         */
        SPAudioParam.createPsuedoParam = function ( name, minValue, maxValue, defaultValue, audioContext ) {
            return new SPAudioParam( name, minValue, maxValue, defaultValue, null, null, null, audioContext );
        };

        return SPAudioParam;
    } );

/**
 * @module Core
 */
define( 'core/DetectLoopMarkers',[],function () {
    

    /**
     * @class DetectLoopMarkers
     * @static
     */

    /**
    /**
     *Detector for Loop Marker or Silence. This method helps to detect and trim given AudioBuffer based on Sonoport Loop Markers or based on silence detection.
     *
     *
     * @class DetectLoopMarkers
     * @param {AudioBuffer} buffer A buffer to be trimmed to Loop Markers or Silence.
     * @return {Object} An object with `start` and `end` properties containing the index of the detected start and end points.
     */
    function DetectLoopMarkers( buffer ) {

        var nLoopStart_ = 0;
        var nLoopEnd_ = 0;
        var nMarked_ = true;

        /*
         * Length of PRE and POSTFIX Silence used in Loop Marking
         */
        var PREPOSTFIX_LEN = 5000;

        /*
         * Length of PRE and POSTFIX Silence used in Loop Marking
         */
        var DEFAULT_SAMPLING_RATE = 44100;

        /*
         * Threshold for Spike Detection in Loop Marking
         */
        var SPIKE_THRESH = 0.5;

        /*
         * Index bounds for searching for Loop Markers and Silence.
         */
        var MAX_MP3_SILENCE = 20000;

        /*
         * Threshold for Silence Detection
         */
        var SILENCE_THRESH = 0.01;

        /*
         * Length for which the channel has to be empty
         */
        var EMPTY_CHECK_LENGTH = 1024;

        /*
         * Length samples to ignore after the spike
         */
        var IGNORE_LENGTH = 16;

        /*
         * Array of all Channel Data
         */
        var channels_ = [];

        /*
         * Number of samples in the buffer
         */
        var numSamples_ = 0;

        /**
         * A helper method to help find the silence in across multiple channels
         *
         * @private
         * @method silenceCheckGenerator_
         * @param {Number} testIndex The index of the sample which is being checked.
         * @return {Function} A function which can check if the specific sample is beyond the silence threshold
         */
        var isChannelEmptyAfter = function ( channel, position ) {
            //console.log( "checking at " + position );
            var sum = 0;
            for ( var sIndex = position + IGNORE_LENGTH; sIndex < position + IGNORE_LENGTH + EMPTY_CHECK_LENGTH; ++sIndex ) {
                sum += Math.abs( channel[ sIndex ] );
            }

            return ( sum / EMPTY_CHECK_LENGTH ) < SILENCE_THRESH;
        };

        /**
         * A helper method to help find the spikes in across multiple channels
         *
         * @private
         * @method silenceCheckGenerator_
         * @param {Number} testIndex The index of the sample which is being checked.
         * @return {Function} A function which can check if the specific sample is beyond the spike threshold
         */
        var thresholdCheckGenerator_ = function ( testIndex ) {
            return function ( prev, thisChannel, index ) {
                var isSpike;
                if ( index % 2 === 0 ) {
                    isSpike = thisChannel[ testIndex ] > SPIKE_THRESH;
                } else {
                    isSpike = thisChannel[ testIndex ] < -SPIKE_THRESH;
                }
                return prev && isSpike;
            };
        };

        /**
         * A helper method to help find the markers in an Array of Float32Arrays made from an AudioBuffer.
         *
         * @private
         * @method findSilence_
         * @param {Array} channels An array of buffer data in Float32Arrays within which markers needs to be detected.
         * @return {Boolean} If Loop Markers were found.
         */
        var findMarkers_ = function ( channels ) {
            var startSpikePos = null;
            var endSpikePos = null;

            nLoopStart_ = 0;
            nLoopEnd_ = numSamples_;

            // Find marker near start of file
            var pos = 0;

            while ( startSpikePos === null && pos < numSamples_ && pos < MAX_MP3_SILENCE ) {
                if ( channels.reduce( thresholdCheckGenerator_( pos ), true ) &&
                    ( channels.length !== 1 || isChannelEmptyAfter( channels[ 0 ], pos ) ) ) {
                    // Only check for emptiness at the start to ensure that it's indeed marked
                    startSpikePos = pos;
                    break;
                } else {
                    pos++;
                }
            }

            // Find marker near end of file
            pos = numSamples_;

            while ( endSpikePos === null && pos > 0 && numSamples_ - pos < MAX_MP3_SILENCE ) {
                if ( channels.reduce( thresholdCheckGenerator_( pos ), true ) ) {
                    endSpikePos = pos;
                    break;
                } else {
                    pos--;
                }
            }
            // If both markers found
            var correctedPostfixLen = Math.round( ( PREPOSTFIX_LEN / 2 ) * buffer.sampleRate / DEFAULT_SAMPLING_RATE );
            if ( startSpikePos !== null && endSpikePos !== null && endSpikePos > startSpikePos + correctedPostfixLen ) {
                // Compute loop start and length
                nLoopStart_ = startSpikePos + correctedPostfixLen;
                nLoopEnd_ = endSpikePos - correctedPostfixLen;
                //console.log( "Found loop between " + nLoopStart_ + " - " + nLoopEnd_ );
                //console.log( "Spikes at  " + startSpikePos + " - " + endSpikePos );
                return true;
            } else {
                // Spikes not found!
                //console.log( "No loop found" );
                return false;
            }
        };

        /**
         * A helper method to help find the silence in across multiple channels
         *
         * @private
         * @method silenceCheckGenerator_
         * @param {Number} testIndex The index of the sample which is being checked.
         * @return {Function} A function which can check if the specific sample is beyond the silence threshold
         */
        var silenceCheckGenerator_ = function ( testIndex ) {
            return function ( prev, thisChannel ) {
                return prev && ( Math.abs( thisChannel[ testIndex ] ) < SILENCE_THRESH );
            };
        };

        /**
         * A helper method to help find the silence in an AudioBuffer. Used of Loop Markers are not
         * found in the AudioBuffer. Updates nLoopStart_ and nLoopEnd_ directly.
         *
         * @private
         * @method findSilence_
         * @param {Array} channels channel An array of buffer data in Float32Arrays within which silence needs to be detected.
         */
        var findSilence_ = function ( channels ) {

            var allChannelsSilent = true;

            nLoopStart_ = 0;
            while ( nLoopStart_ < MAX_MP3_SILENCE && nLoopStart_ < numSamples_ ) {

                allChannelsSilent = channels.reduce( silenceCheckGenerator_( nLoopStart_ ), true );

                if ( allChannelsSilent ) {
                    nLoopStart_++;
                } else {
                    break;
                }
            }

            nLoopEnd_ = numSamples_;
            while ( numSamples_ - nLoopEnd_ < MAX_MP3_SILENCE &&
                nLoopEnd_ > 0 ) {

                allChannelsSilent = channels.reduce( silenceCheckGenerator_( nLoopEnd_ ), true );

                if ( allChannelsSilent ) {
                    nLoopEnd_--;
                } else {
                    break;
                }
            }

            if ( nLoopEnd_ < nLoopStart_ ) {
                nLoopStart_ = 0;
            }
        };

        numSamples_ = buffer.length;
        for ( var index = 0; index < buffer.numberOfChannels; index++ ) {
            channels_.push( new Float32Array( buffer.getChannelData( index ) ) );
        }

        if ( ( !findMarkers_( channels_ ) ) ) {
            findSilence_( channels_ );
            nMarked_ = false;
        }

        // return the markers which were found
        return {
            marked: nMarked_,
            start: nLoopStart_,
            end: nLoopEnd_
        };
    }

    return DetectLoopMarkers;
} );

/**
 * @module Core
 */
define( 'core/FileLoader',[ 'core/DetectLoopMarkers' ],
    function ( detectLoopMarkers ) {
        

        /**
         * Load a single file from a URL or a File object.
         *
         * @class FileLoader
         * @constructor
         * @param {String/File} URL URL of the file to be Loaded
         * @param {String} context AudioContext to be used in decoding the file
         * @param {Function} [onloadCallback] Callback function to be called when the file loading is
         * @param {Function} [onProgressCallback] Callback function to access the progress of the file loading.
         */
        function FileLoader( URL, context, onloadCallback, onProgressCallback ) {
            if ( !( this instanceof FileLoader ) ) {
                throw new TypeError( "FileLoader constructor cannot be called as a function." );
            }
            var rawBuffer_;
            var loopStart_ = 0;
            var loopEnd_ = 0;

            var isSoundLoaded_ = false;

            // Private functions

            /**
             * Check if a value is an integer.
             * @method isInt_
             * @private
             * @param {Object} value
             * @return {Boolean} Result of test.
             */
            var isInt_ = function ( value ) {
                var er = /^[0-9]+$/;
                if ( er.test( value ) ) {
                    return true;
                }
                return false;
            };

            /**
             * Get a buffer based on the start and end markers.
             * @private
             * @method sliceBuffer
             * @param {Number} start The start of the buffer to load.
             * @param {Number} end The end of the buffer to load.
             * @return {AudioBuffer} The requested sliced buffer.
             */
            var sliceBuffer_ = function ( start, end ) {

                // Set end if it is missing
                if ( typeof end == "undefined" ) {
                    end = rawBuffer_.length;
                }
                // Verify parameters
                if ( !isInt_( start ) ) {
                    start = Number.isNan( start ) ? 0 : Math.round( Number( start ) );
                    console.warn( "Incorrect parameter Type - FileLoader getBuffer start parameter is not an integer. Coercing it to an Integer - start" );
                } else if ( !isInt_( end ) ) {
                    console.warn( "Incorrect parameter Type - FileLoader getBuffer end parameter is not an integer" );
                    end = Number.isNan( end ) ? 0 : Math.round( Number( end ) );
                }
                // Check if start is smaller than end
                if ( start > end ) {
                    console.error( "Incorrect parameter Type - FileLoader getBuffer start parameter " + start + " should be smaller than end parameter " + end + " . Setting them to the same value " + start );
                    end = start;
                }
                // Check if start is within the buffer size
                if ( start > loopEnd_ || start < loopStart_ ) {
                    console.error( "Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-" + rawBuffer_.length + " . Setting start to " + loopStart_ );
                    start = loopStart_;
                }

                // Check if end is within the buffer size
                if ( end > loopEnd_ || end < loopStart_ ) {
                    console.error( "Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-" + rawBuffer_.length + " . Setting start to " + loopEnd_ );
                    end = loopEnd_;
                }

                var length = end - start;

                if ( !rawBuffer_ ) {
                    console.error( "No Buffer Found - Buffer loading has not completed or has failed." );
                    return null;
                }

                // Create the new buffer
                var newBuffer = context.createBuffer( rawBuffer_.numberOfChannels, length, rawBuffer_.sampleRate );

                // Start trimming
                for ( var i = 0; i < rawBuffer_.numberOfChannels; i++ ) {
                    var aData = new Float32Array( rawBuffer_.getChannelData( i ) );
                    newBuffer.getChannelData( i )
                        .set( aData.subarray( start, end ) );
                }

                return newBuffer;
            };

            function init() {
                var parameterType = Object.prototype.toString.call( URL );
                var fileExtension = /[^.]+$/.exec( URL );
                if ( parameterType === '[object String]' ) {
                    var request = new XMLHttpRequest();
                    request.open( 'GET', URL, true );
                    request.responseType = 'arraybuffer';
                    request.addEventListener( "progress", onProgressCallback, false );
                    request.onload = function () {
                        decodeAudio( request.response, fileExtension );
                    };
                    request.send();
                } else if ( parameterType === '[object File]' || parameterType === '[object Blob]' ) {
                    var reader = new FileReader();
                    reader.addEventListener( "progress", onProgressCallback, false );
                    reader.onload = function () {
                        decodeAudio( reader.result, fileExtension );
                    };
                    reader.readAsArrayBuffer( URL );
                }

            }

            function decodeAudio( result, fileExt ) {
                context.decodeAudioData( result, function ( buffer ) {
                    isSoundLoaded_ = true;
                    rawBuffer_ = buffer;
                    // Do trimming if it is not a wave file
                    loopStart_ = 0;
                    loopEnd_ = rawBuffer_.length;
                    if ( fileExt[ 0 ] !== "wav" ) {
                        // Trim Buffer based on Markers
                        var markers = detectLoopMarkers( rawBuffer_ );
                        if ( markers ) {
                            loopStart_ = markers.start;
                            loopEnd_ = markers.end;
                        }
                    }
                    if ( onloadCallback && typeof onloadCallback === "function" ) {
                        onloadCallback( true );
                    }
                }, function () {
                    console.warn( "Error Decoding " + URL );
                    if ( onloadCallback && typeof onloadCallback === "function" ) {
                        onloadCallback( false );
                    }
                } );
            }

            // Public functions
            /**
             * Get the current buffer.
             * @method getBuffer
             * @param {Number} start The start index
             * @param {Number} end The end index
             * @return {AudioBuffer} The AudioBuffer that was marked then trimmed if it is not a wav file.
             */
            this.getBuffer = function ( start, end ) {
                // Set start if it is missing
                if ( typeof start == "undefined" ) {
                    start = 0;
                }
                // Set end if it is missing
                if ( typeof end == "undefined" ) {
                    end = loopEnd_ - loopStart_;
                }

                return sliceBuffer_( loopStart_ + start, loopStart_ + end );
            };

            /**
             * Get the original buffer.
             * @method getRawBuffer
             * @return {AudioBuffer} The original AudioBuffer.
             */
            this.getRawBuffer = function () {
                if ( !isSoundLoaded_ ) {
                    console.error( "No Buffer Found - Buffer loading has not completed or has failed." );
                    return null;
                }
                return rawBuffer_;
            };

            /**
             * Check if sound is already loaded.
             * @method isLoaded
             * @return {Boolean} True if file is loaded. Flase if file is not yeat loaded.
             */
            this.isLoaded = function () {
                return isSoundLoaded_;
            };

            // Make a request
            init();
        }

        return FileLoader;
    } );

/**
 * @module Core
 *
 * @class MuliFileLoader
 * @static
 */
define( 'core/MultiFileLoader',[ 'core/FileLoader' ],
    function ( FileLoader ) {
        

        /**
         * Helper class to loader multiple sounds from URL String, File or AudioBuffer Objects.
         *
         *
         * @method MuliFileLoader
         * @param {Array/String/File} sounds Array of or Individual String, AudioBuffer or File Objects which define the sounds to be loaded
         * @param {String} audioContext AudioContext to be used in decoding the file
         * @param {String} [onLoadProgress] Callback function to access the progress of the file loading.
         * @param {String} [onLoadComplete] Callback function to be called when all sounds are loaded
         */
        function MultiFileLoader( sounds, audioContext, onLoadProgress, onLoadComplete ) {

            //Private variables
            var self = this;
            this.audioContext = audioContext;
            var sourcesToLoad_ = 0;
            var loadedAudioBuffers_ = [];

            //Private functions
            function init() {
                var parameterType = Object.prototype.toString.call( sounds );

                if ( parameterType === '[object Array]' ) {
                    if ( sounds.length >= self.minSources && sounds.length <= self.maxSources ) {
                        sourcesToLoad_ = sounds.length;
                        loadedAudioBuffers_ = new Array( sourcesToLoad_ );
                        sounds.forEach( function ( thisSound, index ) {
                            loadSingleSound( thisSound, onSingleLoadAt( index ) );
                        } );
                    } else {
                        console.error( "Unsupported number of Sources. " + self.modelName + " only supports a minimum of " + self.minSources + " and a maximum of " + self.maxSources + " sources. Trying to load " + sounds.length + "." );
                        onLoadComplete( false, loadedAudioBuffers_ );
                    }
                } else if ( sounds ) {
                    sourcesToLoad_ = 1;
                    loadedAudioBuffers_ = new Array( sourcesToLoad_ );
                    loadSingleSound( sounds, onSingleLoadAt( 0 ) );
                } else {
                    console.log( "Setting empty source. No sound may be heard" );
                    onLoadComplete( false, loadedAudioBuffers_ );
                }
            }

            function loadSingleSound( sound, onSingleLoad ) {
                var parameterType = Object.prototype.toString.call( sound );
                if ( parameterType === "[object String]" || parameterType === "[object File]" ) {
                    var fileLoader = new FileLoader( sound, self.audioContext, function ( status ) {
                        if ( status ) {
                            onSingleLoad( status, fileLoader.getBuffer() );
                        } else {
                            onSingleLoad( status );
                        }
                    }, function ( progressEvent ) {
                        if ( onLoadProgress && typeof onLoadProgress === "function" ) {
                            onLoadProgress( progressEvent, sound );
                        }
                    } );
                } else if ( parameterType === "[object AudioBuffer]" ) {
                    onSingleLoad( true, sound );
                } else {
                    console.error( "Incorrect Parameter Type - Source is not a URL, File or AudioBuffer" );
                    onSingleLoad( false, {} );
                }
            }

            function onSingleLoadAt( index ) {
                return function ( status, audioBuffer ) {
                    if ( status ) {
                        loadedAudioBuffers_[ index ] = audioBuffer;
                    }
                    sourcesToLoad_--;
                    if ( sourcesToLoad_ === 0 ) {
                        var allStatus = true;
                        for ( var bIndex = 0; bIndex < loadedAudioBuffers_.length; ++bIndex ) {
                            if ( !loadedAudioBuffers_[ bIndex ] ) {
                                allStatus = false;
                                break;
                            }
                        }
                        onLoadComplete( allStatus, loadedAudioBuffers_ );
                    }
                };
            }
            init();
        }

        return MultiFileLoader;
    } );

/**
 * @module Models
 */
define( 'models/Scrubber',[ 'core/Config', 'core/BaseSound', 'core/SPAudioParam', 'core/MultiFileLoader' ],
    function ( Config, BaseSound, SPAudioParam, multiFileLoader ) {
        
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
        function Scrubber( context, source, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd ) {
            if ( !( this instanceof Scrubber ) ) {
                throw new TypeError( "Scrubber constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );
            this.maxSources = 1;
            this.minSources = 1;
            this.modelName = "Scrubber";

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
            var SPEED_THRESH = 0.05;
            var SPEED_ALPHA = 0.8;
            var AUDIOEVENT_TRESHOLD = 0.0001;

            var audioPlaying = false;

            var zeroArray;

            var onLoadAll = function ( status, audioBufferArray ) {
                var sourceBuffer_ = audioBufferArray[ 0 ];

                // store audiosource attributes
                numSamples_ = sourceBuffer_.length;
                numChannels_ = sourceBuffer_.numberOfChannels;
                sampleRate_ = sourceBuffer_.sampleRate;

                for ( var cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                    sampleData_.push( sourceBuffer_.getChannelData( cIndex ) );
                }

                scriptNode_ = self.audioContext.createScriptProcessor( Config.CHUNK_LENGTH, 0, numChannels_ );
                scriptNode_.onaudioprocess = scriptNodeCallback;
                scriptNode_.connect( self.releaseGainNode );

                // create buffers
                synthBuf_ = newBuffer( winLen_, numChannels_ );
                srcBuf_ = newBuffer( winLen_, numChannels_ );

                if ( status ) {
                    self.isInitialized = true;
                }
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status );
                }
            };

            function init( source ) {
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

                        for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                            var source = synthBuf_[ cIndex ].subarray( synthStep_ - numReady_, synthStep_ - numReady_ + numToCopy );
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

                        if ( audioPlaying && ( ( muteOnReverse && scale_ < AUDIOEVENT_TRESHOLD ) || Math.abs( scale_ ) < AUDIOEVENT_TRESHOLD ) ) {
                            audioPlaying = false;
                            self.onAudioEnd();
                        }

                        if ( scale_ > AUDIOEVENT_TRESHOLD && !audioPlaying ) {
                            audioPlaying = true;
                            self.onAudioStart();
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
            this.registerParameter( SPAudioParam.createPsuedoParam( "playPosition", 0, 1.0, 0, this.audioContext ) );

            /**
             * Sets if the audio should fade out when playPosition has not changed for a while.
             *
             * @property noMotionFade
             * @type SPAudioParam
             * @default false
             * @minvalue true
             * @maxvalue false
             */
            this.registerParameter( SPAudioParam.createPsuedoParam( "noMotionFade", true, false, true, this.audioContext ) );

            /**
             * Sets if moving playPosition to backwards should mute the model.
             *
             * @property muteOnReverse
             * @type SPAudioParam
             * @default false
             * @minvalue true
             * @maxvalue false
             */
            this.registerParameter( SPAudioParam.createPsuedoParam( "muteOnReverse", true, false, true, this.audioContext ) );

            // Initialize the sources.
            window.setTimeout( function () {
                init( source );
            }, 0 );

        }

        Scrubber.prototype = Object.create( BaseSound.prototype );

        return Scrubber;
    } );

