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
	};


	return BSOscillator;
	
});