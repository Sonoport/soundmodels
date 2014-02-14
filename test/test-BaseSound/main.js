require.config({
	baseUrl: '/',
	paths: {
		baseSndURL: 'test-BaseSound/BaseSound'
	}
});

// Start app logic
require(['baseSndURL','require'],
	function(BaseSound, require) {
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

		
		// Create a new BaseSound
		var bs = new BaseSound();
		bs.FADE_TIME = 3;
		bs.play();
		bs.release();

		var gainNode = bs.audioContext.createGain();
		bs.connect(gainNode);
		gainNode.connect(bs.audioContext.destination);

		function runTimer() {
			console.log("timing "+bs.audioContext.currentTime);
			requestAnimFrame(runTimer);
			console.log(bs.isPlaying);
		}
		//runTimer();
});