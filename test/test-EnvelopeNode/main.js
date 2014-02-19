require.config({
	baseUrl: '/'
});

// Start app logic
require(['core/BaseSound','core/Envelope','require'],
	function(BaseSound, Envelope, require) {
		console.log("main app loaded.");

		// shim layer with setTimeout fallback
		window.requestAnimFrame = (function(){
 			return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
		})();

		// Create an envelope.
		var envTest = new Envelope();
		//envTest.play();
		//envTest.release();

		function runTimer() {
			console.log("timing "+bs.audioContext.currentTime);
			requestAnimFrame(runTimer);
		}
		//runTimer();
});