var AudioContext = webkitAudioContext;
var context = new AudioContext();
var g = context.createGainNode();
var o = context.createOscillator();

o.connect(g);
g.connect(context.destination);

require(["splib"], function (SPAudioParam) {

	p = new SPAudioParam(null,null,null,null,o.frequency,function (value) {
		return value*2;
	}, null);

	q = new SPAudioParam("test",0,10000,0.1,null,null, context);

});
