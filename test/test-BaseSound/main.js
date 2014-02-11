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
		
		// Create a new BaseSound
		var bs = new BaseSound();
		
		bs.play();
		bs.release(4);
		//bs.stop(3);
});