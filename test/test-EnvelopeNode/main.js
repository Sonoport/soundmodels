require.config({
	baseUrl: '/'
});

// Start app logic
require(['core/BaseSound','core/Envelope', 'test-EnvelopeNode/BSOscillator','require'],
	function(BaseSound, Envelope, BSOscillator, require) {
		console.log("main app loaded.");

		// =============== Animation related ==================
		// cancel animation frame
		window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
	} )();
		// shim layer with setTimeout fallback
		// Start animation frame
	  window.requestAnimFrame = (function(){
 			return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
		})();

		var reqID;
		
		
		// =============== Sound related ==================
		// Global AudioContext
		//var ac = new AudioContext();

		// Create a Oscillator source
		var bsosc = new BSOscillator();
		//bsosc.connect(bsosc.audioContext.destination);
		bsosc.start();

		// Create an envelope.
		//**************** ISSUE ALERT *******************
		// Currently, the second variable needs to pass in the previous created AudioContext in order to use the same context being defined
		// Need to resolve this issue.
		var envTest = new Envelope(bsosc.audioContext);
		// Pass in ADSR envelope
		envTest.initADSR(false);
		
		envTest.initADSR(false, 0.1, 0.1, 0.1, 0.1, 0.5);
		
		// Connects oscillator source's gain node to an envelope's gain node
		bsosc.connect(envTest.releaseGainNode);
		envTest.connect(bsosc.audioContext.destination);
		
		//bsosc.release();
		//envTest.release(3);

		// =============== Animation related ==================
		// Using this to print values in order not to exceed browser's console stack.
		function startAni() {
			reqID = requestAnimFrame(startAni);
			console.log(envTest.releaseGainNode.gain.value);
		}
		// Start animation loop
		startAni();

		function stopAni() {
			if (reqID) {
				cancelRequestAnimFrame(reqID);
			}
			reqID = 0;
		}

		// cancel animation loop in some (2) seconds
		setTimeout(function() {
			cancelRequestAnimFrame(reqID);	
			// Ramp down the sound after 2 seconds
			envTest.release();
		}, 2*1000);
		
});