/** 
Oscillator buffer class
**/
define(['core/BaseSound'], function( BaseSound ) {
	'user strict';

	function BSOscillator(context) {

		BaseSound.call(this, context);
		if ( typeof context !== "undefined" ) {
         // Need to check for prefixes for AudioContext
         this.audioContext = context;
         console.log( "current" );
    } 

		console.log("Oscillator");
		this.bufferSource = this.audioContext.createOscillator();
		this.bufferSource.connect(this.releaseGainNode);
		//this.connect(this.audioContext.destination);
		
	}

	BSOscillator.prototype = Object.create(BaseSound.prototype);
	BSOscillator.prototype.constructor = BSOscillator;

	BSOscillator.prototype.start = function start(currTime) {
		BaseSound.prototype.start.call(this, currTime);
		this.bufferSource.start(currTime);
	};

	BSOscillator.prototype.stop = function stop( currTime) {
		BaseSound.prototype.stop.call(this, currTime);
		this.bufferSource.stop(currTime);
	};

	BSOscillator.prototype.release = function release(fadeTime) {
		BaseSound.prototype.release.call(this, fadeTime);
		
    // This stop() function is causgin the linearRampToValueAtTime to stop firing. Could be due to 
    // audioContext.currentTime +fadeTime + this.FADE_TIME_PAD has already passed. Need to find out why.
		//this.stop(this.audioContext.currentTime + fadeTime + this.FADE_TIME_PAD);
	};

	BSOscillator.prototype.meme = function (value) {
		if (value) {
			console.log(value);
		} else {
			throw "no Value defined";
		}
	};

	return BSOscillator;
	
});