/**

Base class for all sounds. 

Pseudo AudioNode class the encapsulates basic functionality of creating a AudioContext and passing in audio file buffer.

@class BaseSound
@constructor
**/
define(['utils/AudioContextMonkeyPatch.js'], function() {
    'use strict';

    function BaseSound(audioContext) {
        /**
        Define one AudioContext 
        There should only be one AudioContext. 

        @property audioContext
        @type AudioContext
        @default "audioContext"
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
        @default "1"
        **/
        this.numberOfInputs = 1; // Defaults to 1
        /**
        Number of outputs

        @property numberOfOutputs
        @type Number
        **/
        this.numberOfOutputs = 1; // Defaults to 1
        /**
        Master Gain Node

        @property gainNode
        @type Object
        **/
        this.gainNode = this.audioContext.createGain();
        /**
        Fading time in (seconds)
        @constant FADE_TIME
        @default 2 (seconds)
        **/
        this.FADE_TIME = 2; // Seconds
        this.isPlaying = false;
        /** 
        Temp: Create a sine wave oscillator buffer as a temporary source.
        Will be replaced by FileReader to parse in as source
        **/
        this.bufferSource = this.audioContext.createOscillator();
    }

    /**
    Connects (master) Gain Node.

	@method connect
	@return null
	**/
    BaseSound.prototype.connect = function(input) {
        console.log("connects to gainNode");
        this.gainNode.connect(input);
    };
    /**
    Disconnects (master) Gain Node.

    @method disconnect
    @return null
    **/
    BaseSound.prototype.disconnect = function(input) {
        console.log("disconnect from gainNode");
        this.gainNode.disconnect(input);
    };
    /**
    Start audio

    @method start
    @return null
    **/
    BaseSound.prototype.start = function(currTime) {
        console.log("start the buffer");
        this.bufferSource.start(currTime);
        this.isPlaying = true;
    };
    /**
    Stop audio

    @method stop
    @return null
    **/
    BaseSound.prototype.stop = function(value) {
        console.log("stop the buffer");
        this.bufferSource.stop(value);
        this.isPlaying = false;
    };
    /**
    Linearly release the gain of the audio in time (seconds).

    @method release
    @return null
    **/
    BaseSound.prototype.release = function(fadeTime) {
        if (fadeTime === undefined) {
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
