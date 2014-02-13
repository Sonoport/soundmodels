/**

Base class for all sounds. 

Pseudo AudioNode class the encapsulates basic functionality of creating a AudioContext and passing in audio file buffer.

@class BaseSound
@constructor
@param {AudioContext} audioContext
**/
define(['utils/AudioContextMonkeyPatch.js'], function() {
    'use strict';

    function BaseSound(audioContext) {
        /**
        Define one audioContext from Web Audio API's AudioContext class.

        @property audioContext
        @type AudioContext
        @default audioContext
        **/
        if (typeof audioContext === "undefined") {
            // Need to check for prefixes for AudioContext
            this.audioContext = new AudioContext();
            console.log("new audioContext");
        } else {
            this.audioContext = audioContext;
            console.log("current ac");
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
        Master Gain Node

        @property gainNode
        @type GainNode
        **/
        this.gainNode = this.audioContext.createGain();
        /**
        Fading time in (seconds)
        @constant FADE_TIME
        @default 0.5 (seconds)
        **/
        this.FADE_TIME = 0.5; // Seconds
        /**
        Checks if the sound is currently playing.

        @property isPlaying
        @type boolean
        @default false
        **/
        this.isPlaying = false;
        /** 
        Temp: Create a sine wave oscillator buffer as a temporary source.
        Will be replaced by FileReader and parse in an AudioBuffer

        @property bufferSource
        @type Object
        **/
        this.bufferSource = this.audioContext.createOscillator();
    }

    /**
    Connects (master) Gain Node to an AudioNode or AudioParam.

	@method connect
	@return null
    @param {Object} input Takes in an AudioNode or AudioParam.
	**/
    BaseSound.prototype.connect = function(input) {
        console.log("connects to gainNode");
        this.gainNode.connect(input);
    };
    /**
    Disconnects (master) Gain Node from an AudioNode or AudioParam.

    @method disconnect
    @return null
    @param {Object} input Takes in an AudioNode or AudioParam.
    **/
    BaseSound.prototype.disconnect = function(input) {
        console.log("disconnect from gainNode");
        this.gainNode.disconnect(input);
    };
    /**
    Start audio at this current time.

    @method start
    @return null
    @param {Number} currTime Time in (seconds) that audio will start.
    **/
    BaseSound.prototype.start = function(currTime) {
        console.log("start the buffer");
        this.bufferSource.start(currTime);
        this.isPlaying = true;
    };
    /**
    Stop audio.

    @method stop
    @return null
    @param {Number} currTime Time in (seconds) that audio will stop.
    **/
    BaseSound.prototype.stop = function(currTime) {
        console.log("stop the buffer");
        this.bufferSource.stop(currTime);
        this.isPlaying = false;
    };
    /**
    Linearly ramp down the gain of the audio in time (seconds) to 0.

    @method release
    @return null
    @param {Number} fadeTime Amount of time it takes for linear ramp down to happen.
    **/
    BaseSound.prototype.release = function(fadeTime) {
        if (typeof fadeTime === "undefined") {
            fadeTime = this.FADE_TIME;
        }
        this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeTime);
        console.log("release: linear ramp down after " + fadeTime + " seconds.");
    };
    /**
    Play sound after connecting the (master) gain node to the destination node.

    @method play
    @return null
    **/
    BaseSound.prototype.play = function() {
        console.log("play sound");
        // Connects source to (master) gain node
        this.bufferSource.connect(this.gainNode);
        // Connects (master) gain node to the destination node
        this.connect(this.audioContext.destination);
        this.start(0);
    };

    // Return constructor function
    return BaseSound;

});
