audioContext = webkitAudioContext;
context = new audioContext();
g = context.createGainNode();
o = context.createOscillator();

o.connect(g);
g.connect(context.destination);

require(["../../src/lib/core/SPAudioParam"], function () {

	p = new SPAudioParam(null,null,null,null,o.frequency,function (value) {
		return value*2;
	}, null);

	q = new SPAudioParam("test",0,1,0.1,null,null, context);

});
