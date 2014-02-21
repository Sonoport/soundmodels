/**

Base class for all sounds.

Pseudo AudioNode class the encapsulates basic functionality of creating a AudioContext and passing in audio file buffer.

@class BaseSound
@constructor
@param {AudioContext} audioContext
**/
define( [ 'core/AudioContextMonkeyPatch' ], function () {
    'use strict';

    function BaseSound( context ) {
        /**
        Define one audioContext from Web Audio API's AudioContext class.

        @property audioContext
        @type AudioContext
        @default audioContext
        **/
        if ( typeof context === "undefined" ) {
            this.audioContext = new AudioContext();
            console.log( "new audioContext" );
        } else {
            this.audioContext = context;
            console.log( "current ac" );
        }
        /**
        Number of inputs

        @property numberOfInputs
        @type Number
        @default 1
        **/
        this.numberOfInputs = 1; // Defaults to 1
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
        @type boolean
        @default false
        **/
        this.isPlaying = false;
        /**
        Removed bufferSource property from BaseSound
        **/
    }

    /**
    Connects release Gain Node to an AudioNode or AudioParam.

	@method connect
	@return null
    @param {Object} output Connects to an AudioNode or AudioParam.
	**/
    BaseSound.prototype.connect = function ( output ) {
        console.log( "connects to release Gain Node" );
        this.releaseGainNode.connect( output );
    };
    /**
    Disconnects release Gain Node from an AudioNode or AudioParam.

    @method disconnect
    @return null
    @param {Object} output Takes in an AudioNode or AudioParam.
    **/
    BaseSound.prototype.disconnect = function ( output ) {
        console.log( "disconnect from Gain Node" );
        this.releaseGainNode.disconnect( output );
    };
    /**
    Start audio at this current time. Abstract method. Override this method when a buffer is defined. 

    @method start
    @return null
    @param {Number} currTime Time in (seconds) that audio will start.
    **/
    BaseSound.prototype.start = function ( currTime ) {
        this.isPlaying = true;
        console.log( "start the buffer " + this.isPlaying );
    };
    /**
    Stop audio at this current time. Abstract method. Override this method when a buffer is defined. 

    @method stop
    @return null
    @param {Number} currTime Time in (seconds) that audio will stop.
    **/
    BaseSound.prototype.stop = function ( currTime ) {
        // This boolean is not accurate. Need a better way track if the actual audio is still playing.
        this.isPlaying = false;
        console.log( "stop the buffer " + this.isPlaying );
    };
    /**
    Linearly ramp down the gain of the audio in time (seconds) to 0.

    @method release
    @return null
    @param {Number} fadeTime Amount of time it takes for linear ramp down to happen.
    **/
    BaseSound.prototype.release = function ( fadeTime ) {
        if ( typeof fadeTime === "undefined" ) {
            fadeTime = this.FADE_TIME;
        }
        this.releaseGainNode.gain.linearRampToValueAtTime( 0, this.audioContext.currentTime + fadeTime );
        console.log( "release: linear ramp down after " + fadeTime + " seconds." );
        // Stops the sound after currentTime + fadeTime + FADE_TIME_PAD
        this.stop( this.audioContext.currentTime + fadeTime + this.FADE_TIME_PAD );
    };
    /**
    Play sound. Abstract method. Override this method when a buffer is defined. 

    @method play
    @return null
    **/
    BaseSound.prototype.play = function () {
        console.log( "play sound" );
    };
    /**
    Pause sound. Abstract method. Override this method when a buffer is defined. 

    @method pause
    @return null
    **/
    BaseSound.prototype.pause = function () {
        console.log( "pause sound" );
    };
    // Return constructor function
    return BaseSound;

} );
