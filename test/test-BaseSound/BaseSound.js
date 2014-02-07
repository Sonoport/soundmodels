/**

Base class for all sounds.

@class BaseSound
@constructor
**/
define(['utils/webkitAudioContextMonkeyPatch.js'], function() {
    'use strict';

    function BaseSound(audiocontext) {

        var initializeAudioContext = function() {
            console.log("create audiocontext");
        };

        if (typeof audiocontext === "undefined") {
            initializeAudioContext();
        } else {
            this.audiocontext = audiocontext;
        }


        /**
		@property gain
		@type number
		**/
        this.numberOfInputs = 0;
        this.numberOfOutputs = 0;

    }

    /**
	Returns 

	@method connect
	@return null
	**/
    BaseSound.prototype.connect = function() {

    };

    BaseSound.prototype.disconnect = function() {

    };

    BaseSound.prototype.start = function() {

    };

    BaseSound.prototype.stop = function() {

    };

    BaseSound.prototype.release = function() {

    };

    // Return constructor function
    return BaseSound;

});
