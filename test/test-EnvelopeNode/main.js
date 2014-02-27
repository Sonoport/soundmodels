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
		bsosc.bufferSource.frequency.value = 300;
		bsosc.start(0);

		var o = new BSOscillator(bsosc.audioContext);
		// Error
		//var boo = "meme";
		//bsosc.connect(boo);

		// Wavy Jones audio visualizer
		var visualizer = new WavyJones(bsosc.audioContext, 'oscilloscope');
		visualizer.lineColor = '#000000';
		visualizer.lineThickness = 2;
		// Create an envelope.
		//**************** ISSUE ALERT *******************
		// Currently, the second variable needs to pass in the previous created AudioContext in order to use the same context being defined
		// Need to resolve this issue.
		var envTest = new Envelope(bsosc.audioContext);
		// Pass in ADSR envelope
		// Default 
		//envTest.initADSR();
		
		// Longer envelope duration without sustain
		envTest.initADSR({attackDur: 0.1, decayDur: 0.1, sustainDur: 0.1, releaseDur: 0.1});

		var env2 = new Envelope(bsosc.audioContext);
		env2.initADSR({useSustain: true});
		// Connect oscillator to envelope node
		bsosc.connect(envTest);
		bsosc.connect(env2);
		// Error :
		//envTest.connect(o);
		
		// Connect to visualizer
		env2.connect(visualizer);
		envTest.connect(visualizer);

		// Output to destination
		visualizer.connect(bsosc.audioContext.destination);

		// =============== Animation related ==================
		// Using this to print values in order not to exceed browser's console stack.
		function startAni() {
			reqID = requestAnimFrame(startAni);
			console.log(envTest.releaseGainNode.gain.value, env2.releaseGainNode.gain.value);
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
		/*setTimeout(function() {
			cancelRequestAnimFrame(reqID);	
			// Ramp down the sound after 2 seconds
			envTest.release();
		}, 2*1000);*/
		
		// ==================== DOM ========================
		var envElement = document.getElementById('envBtn');
		envElement.onclick = fireEnv;
		function fireEnv() {
			envTest.reinit();
			envTest.initADSR({attackDur: 0.1, decayDur: 0.1, sustainDur: 0.1, releaseDur: 0.1});
			env2.reinit();
			env2.initADSR({attackDur: 0.1, decayDur: 0.1, sustainDur: 0.1, releaseDur: 0.1});
		}
		var logEle = document.getElementById('stopPrintBtn');
		logEle.onclick = stopPrint;
		function stopPrint() {
			stopAni();
		}
		var releaseElem = document.getElementById('releaseBtn');
		releaseElem.onclick = releaseStop;
		function releaseStop() {
			envTest.release();
			env2.release();
		}

});