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
     * @param {AudioContext} context
     */
    function BaseSound( context ) {
        /**
         * Web Audio API's AudioContext. If the context passed to the constructor is an AudioContext, a new one is created here.
         *
         * @property audioContext
         * @type AudioContext
         */
        if ( typeof context === "undefined" ) {
            console.log( "Making a new AudioContext" );
            this.audioContext = new AudioContext();
        } else {
            this.audioContext = context;
        }

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
         * Fading time in (seconds)
         *
         *
         * @property FADE_TIME
         * @default 0.5 (seconds)
         * @final
         */
        this.FADE_TIME = 0.5;

        /**
         * Padding time in (seconds) after FADE_TIME to allow sound to fade out smoothly.
         *
         * @property FADE_TIME_PAD
         * @default 1 (seconds)
         * @final
         */
        this.FADE_TIME_PAD = 1;

        /**
         *  If Sound is currently playing.
         *
         * @property isPlaying
         * @type Boolean
         * @default false
         */
        this.isPlaying = false;

        /**
         * The input node that the output node will be connected to. <br />
         * Set this value to null if no connection can be made on the input node
         *
         * @property inputNode
         * @type Object
         * @default null
         **/
        this.inputNode = null;
    }

    /**
     * If the parameter `output` is an AudioNode, it connects to the releaseGainNode.
     * If the output is a BaseSound, it will connect BaseSound's releaseGainNode to the output's inputNode.
     *
     * @method connect
     * @param {Object} output Connects to an AudioNode or BaseSound.
     */
    BaseSound.prototype.connect = function ( output ) {
        if ( output instanceof AudioNode ) {
            this.releaseGainNode.connect( output );
        } else if ( output.inputNode instanceof AudioNode ) {
            this.releaseGainNode.connect( output.inputNode );
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
     * The outputIndex parameter is an index describing which output of the releaseGainNode to disconnect.
     *
     * @method disconnect
     * @param {Number} outputIndex Index describing which output of the AudioNode to disconnect.
     **/
    BaseSound.prototype.disconnect = function ( outputIndex ) {
        this.releaseGainNode.disconnect( outputIndex );
    };

    /**
     * Start the AudioNode. Abstract method. Override this method when a Node is defined.
     *
     * @method start
     * @param {Number} when At what time (in seconds) the sound should start playing.
     * @param {Number} offset Offset time in the buffer (in seconds) where playback will begin.
     * @param {Number} duration Duration of the portion (in seconds) to be played.
     */
    BaseSound.prototype.start = function ( when, offset, duration ) {
        this.isPlaying = true;
    };

    /**
     * Stop the AudioNode. Abstract method. Override this method when a Node is defined.
     *
     * @method stop
     * @param {Number} when Time (in seconds) the sound should stop playing
     */
    BaseSound.prototype.stop = function ( when ) {
        // This boolean is not accurate. Need a better way track if the actual audio is still playing.
        this.isPlaying = false;
        if ( typeof when === "undefined" ) {
            when = 0;
        }
        // cancel all scheduled ramps on this releaseGainNode
        this.releaseGainNode.gain.cancelScheduledValues( this.audioContext.currentTime + when );
    };

    /**
     * Linearly ramp down the gain of the audio in time (seconds) to 0.
     *
     * @method release
     * @param {Number} fadeTime Amount of time (seconds) it takes for linear ramp down to happen.
     * @param {Number} when Time (in seconds) at which the Envelope will release.
     */
    BaseSound.prototype.release = function ( fadeTime, when ) {
        if ( typeof when === "undefined" ) {
            when = this.audioContext.currentTime;
        }

        fadeTime = fadeTime || this.FADE_TIME;
        // Clamp the current gain value at this point of time to prevent sudden jumps.
        this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, when );

        // Now there won't be any glitch and there is a smooth ramp down.
        this.releaseGainNode.gain.linearRampToValueAtTime( 0, when + fadeTime );

        // Stops the sound after currentTime + fadeTime + FADE_TIME_PAD
        this.stop( when + fadeTime + this.FADE_TIME_PAD );
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
    BaseSound.prototype.pause = function () {};

    // Return constructor function
    return BaseSound;
} );
