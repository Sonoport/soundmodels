/** 
Oscillator buffer class
**/
define(['core/BaseSound'], function( BaseSound ) {
	'user strict';
	function BSOscillator() {

		BaseSound.call(this);

		console.log("Oscillator");
		this.bufferSource = this.audioContext.createOscillator();
		this.bufferSource.connect(this.releaseGainNode);
		this.connect(this.audioContext.destination);

	}

	BSOscillator.prototype = Object.create(BaseSound.prototype);
	BSOscillator.prototype.constructor = BSOscillator;

	BSOscillator.prototype.start = function start() {
		BaseSound.prototype.start.call(this, arguments);
		this.bufferSource.start(0);
	};

	BSOscillator.prototype.stop = function stop() {
		BaseSound.prototype.stop.call(this, arguments);
		this.bufferSource.stop(0);
	};

	return BSOscillator;
	
});