/**
Pseudo AudioNode class the encapsulates basic functionality of an Audio Node.

@class BaseSound
@description Base class for all sounds.
@module Core
**/
define( [ 'core/AudioContextMonkeyPatch' ], function () {
    'use strict';

    /*
     * @constructor
     * @param {AudioContext} context
     */
    function BaseSound( context ) {
        /**
        Define one audioContext from Web Audio API's AudioContext class.

        @property audioContext
        @type AudioContext
        @default audioContext
        **/
        if ( typeof context === "undefined" ) {
            console.log( "Making a new AudioContext" );
            this.audioContext = new AudioContext();
        } else {
            this.audioContext = context;
        }
        /**
        Number of inputs

        @property numberOfInputs
        @type Number
        @default 0
        **/
        this.numberOfInputs = 0; // Defaults to 0
        /**
        Number of outputs

        @property numberOfOutputs
        @type Number
        @default 1
        **/
        this.numberOfOutputs = 1; // Defaults to 1
        /**
        Release Gain Node

        @property releaseGainNode
        @type GainNode
        **/
        this.releaseGainNode = this.audioContext.createGain();
        /**
        Fading time in (seconds)

        @property FADE_TIME
        @constant FADE_TIME
        @default 0.5 (seconds)
        **/
        this.FADE_TIME = 0.5;
        /**
        Padding time in (seconds) after FADE_TIME to allow sound to fade out smoothly.

        @property FADE_TIME_PAD
        @constant FADE_TIME_PAD
        @default 1 (seconds)
        **/
        this.FADE_TIME_PAD = 1;
        /**
        Checks if the sound is currently playing.

        @property isPlaying
        @type Boolean
        @default false
        **/
        this.isPlaying = false;
        /**
        The input node that the output node will be connected to. <br />
        Set this value to null if no connection can be made on the input ndoe especially for classes which are the sources. <br />

        @property inputNode
        @type Object
        @default null
        **/
        this.inputNode = null;
    }
    /**
    If the output is an AudioNode, it connects to the releaseGainNode. If the output is a BaseSound, it will connect
    BaseSound's releaseGainNode to the output's releaseGainNode.

    @method connect
    @return null
    @param {Object} output Connects to an AudioNode or BaseSound.
    **/
    BaseSound.prototype.connect = function ( output ) {
        if ( output instanceof BaseSound ) {
            // Check if input is able to be connected
            if ( output.inputNode ) {
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
        } else if ( output instanceof AudioNode ) {
            this.releaseGainNode.connect( output );
        } else { // output is neither a BaseSound or an AudioNode
            throw {
                name: "Incorrect Output Exception",
                message: "Attempts to connect " + ( typeof output ) + " to " + ( typeof this ),
                toString: function () {
                    return this.name + ": " + this.message;
                }
            };
        }
    };
    /**
    The outputIndex parameter is an index describing which output of the releaseGainNode to disconnect.

    @method disconnect
    @return null
    @param {Number} outputIndex Takes in an AudioNode or BaseSound.
    **/
    BaseSound.prototype.disconnect = function ( outputIndex ) {
        this.releaseGainNode.disconnect( outputIndex );
    };
    /**
    Start audio at this current time. Abstract method. Override this method when a buffer is defined.

    @method start
    @return null
    @param {Number} currTime Time in (seconds) that audio will start.
    **/
    BaseSound.prototype.start = function ( currTime ) {
        this.isPlaying = true;
    };
    /**
    Stop audio after startTime. Abstract method. Override this method when a buffer is defined.

    @method stop
    @return null
    @param {Number} startTime Time in (seconds) that audio will stop.
    **/
    BaseSound.prototype.stop = function ( startTime ) {
        // This boolean is not accurate. Need a better way track if the actual audio is still playing.
        this.isPlaying = false;
        if ( typeof startTime === "undefined" ) {
            startTime = 0;
        }
        // cancel all scheduled ramps on this releaseGainNode
        this.releaseGainNode.gain.cancelScheduledValues( this.audioContext.currentTime + startTime );
    };
    /**
    Linearly ramp down the gain of the audio in time (seconds) to 0.

    @method release
    @return null
    @param {Number} fadeTime Amount of time it takes for linear ramp down to happen.
    **/
    BaseSound.prototype.release = function ( fadeTime ) {
        fadeTime = fadeTime || this.FADE_TIME;
        // Clamp the current gain value at this point of time to prevent sudden jumps.
        this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, this.audioContext.currentTime );
        // Now there won't be any glitch and there is a smooth ramp down.
        this.releaseGainNode.gain.linearRampToValueAtTime( 0, this.audioContext.currentTime + fadeTime );
        // Stops the sound after currentTime + fadeTime + FADE_TIME_PAD
        //this.stop( this.audioContext.currentTime + fadeTime + this.FADE_TIME_PAD );
    };
    /**
    Play sound. Abstract method. Override this method when a buffer is defined.

    @method play
    @return null
    **/
    BaseSound.prototype.play = function () {
        this.start( 0 );
    };
    /**
    Pause sound. Abstract method. Override this method when a buffer is defined.

    @method pause
    @return null
    **/
    BaseSound.prototype.pause = function () {};
    // Return constructor function
    return BaseSound;
} );
