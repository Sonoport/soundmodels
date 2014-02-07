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

		var bs = new BaseSound();

	});