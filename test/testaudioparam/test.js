audioContext = webkitAudioContext;
context = new audioContext();
g = context.createGainNode();
o = context.createOscillator();

o.connect(g);
g.connect(context.destination);
p = new SPAudioParam(null,null,null,null,o.frequency,function (value) {
	return value*2;
});

