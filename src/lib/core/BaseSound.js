/**
/**
 * @module Core
 */
define( [ 'core/AudioContextMonkeyPatch' ], function () {
    'use strict';

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

        /**
         * Number of inputs
         *
         * @property numberOfInputs
         * @type Number
         * @default 1
         */
        this.numberOfInputs = 0;

        /**
         * Number of outputs
         *
         * @property numberOfOutputs
         * @type Number
         * @default 1
         */
        this.numberOfOutputs = 0;

        /**
         *Number of sources that can be given to this Sound
         *
         * @property numberOfInputs
         * @type Number
         * @default 0
         */
        this.maxSources = 0;

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

        this.releaseGainNode.connect( this.audioContext.destination );
    }

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
            throw {
                name: "No Input Connection Exception",
                message: "Attempts to connect " + ( typeof output ) + " to " + ( typeof this ),
                toString: function () {
                    return this.name + ": " + this.message;
                }
            };
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
     * @param {Number} [when] At what time (in seconds) the sound should start playing.
     * @param {Number} [offset] Offset time in the buffer (in seconds) where playback will begin.
     * @param {Number} [duration] Duration of the portion (in seconds) to be played.
     */
    BaseSound.prototype.start = function ( when, offset, duration ) {
        this.isPlaying = true;
    };

    /**
     * Stop the AudioNode. Abstract method. Override this method when a Node is defined.
     *
     * @method stop
     * @param {Number} [when] Time (in seconds) the sound should stop playing
     */
    BaseSound.prototype.stop = function ( when ) {
        // This boolean is not accurate. Need a better way track if the actual audio is still playing.
        this.isPlaying = false;
        if ( typeof when === "undefined" ) {
            when = 0;
        }
        // cancel all scheduled ramps on this releaseGainNode
        this.releaseGainNode.gain.cancelScheduledValues( when );
    };

    /**
     * Linearly ramp down the gain of the audio in time (seconds) to 0.
     *
     * @method release
     * @param {Number} [when] Time (in seconds) at which the Envelope will release.
     * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
     */
    BaseSound.prototype.release = function ( when, fadeTime ) {

        if ( this.isPlaying ) {
            var FADE_TIME = 0.5;
            var FADE_TIME_PAD = 1 / this.audioContext.sampleRate;

            if ( typeof when === "undefined" ) {
                when = this.audioContext.currentTime;
            }

            fadeTime = fadeTime || FADE_TIME;
            // Clamp the current gain value at this point of time to prevent sudden jumps.
            this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, when );

            // Now there won't be any glitch and there is a smooth ramp down.
            this.releaseGainNode.gain.linearRampToValueAtTime( 0, when + fadeTime );

            // Stops the sound after currentTime + fadeTime + FADE_TIME_PAD
            this.stop( when + fadeTime + FADE_TIME_PAD );
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
            var param = this[ paramName ];
            // Get properties that are of SPAudioParam
            if ( param && param.hasOwnProperty( "value" ) && param.hasOwnProperty( "minValue" ) && param.hasOwnProperty( "maxValue" ) ) {
                paramList.push( param );
            }
        }
        return paramList;
    };

    // Return constructor function
    return BaseSound;
} );
