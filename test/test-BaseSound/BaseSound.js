/**

Base class for all sounds. 

Pseudo AudioNode class the encapsulates basic functionality of creating a AudioContext and passing in audio file buffer.

@class BaseSound
@constructor
**/
define(['utils/AudioContextMonkeyPatch.js'], function() {
    'use strict';

    function BaseSound(audiocontext) {
        // Define one AudioContext
        if (typeof audiocontext === "undefined") {
            // Need to check for prefixes for AudioContext
            this.audiocontext = new AudioContext();
            console.log("new audiocontext");
        } else {
            this.audiocontext = audiocontext;
            console.log("current ac");
        }

        this.numberOfInputs = 1; // Defaults to 1
        this.numberOfOutputs = 1; // Defaults to 1
        /**
        @property gainNode
        @type number
        **/
        this.gainNode = this.audiocontext.createGain();
        this.releaseNode = {};

        /** 
        Temp: Create a sine wave oscillator buffer as a temporary source.
        Will be replaced by FileReader to parse in the 
        **/
        this.bufferSource = this.audiocontext.createOscillator();
        // Connects this to the destination node
        this.bufferSource.connect(this.audiocontext.destination);
    }

    /**
    Connects (master) Gain Node.

	@method connect
	@return null
	**/
    BaseSound.prototype.connect = function(input) {
        console.log("connects gainNode");
        this.gainNode.connect(input);
    };
    /**
    Disconnects (master) Gain Node.

    @method disconnect
    @return null
    **/
    BaseSound.prototype.disconnect = function(input) {
        this.gainNode.disconnect(input);
    };
    /**
    Start audio

    @method start
    @return null
    **/
    BaseSound.prototype.start = function(value) {
        console.log("start playing");
        this.bufferSource.start(value);
    };
    /**
    Stop audio

    @method stop
    @return null
    **/
    BaseSound.prototype.stop = function(value) {
        this.bufferSource.stop(value);
    };
    /**
    Linearly release the gain of the audio in time(s).

    @method release
    @return null
    **/
    BaseSound.prototype.release = function(time) {
        //this.gainNode;
    };

    // Return constructor function
    return BaseSound;

});
