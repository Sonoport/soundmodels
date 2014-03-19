var AudioContext = webkitAudioContext;
var AudioContext = webkitAudioContext;
var context = new AudioContext();
var g = context.createGainNode();
var o = context.createOscillator();

o.connect(g);
g.connect(context.destination);

require(["core/SPAudioParam"], function (SPAudioParam) {

    console.log(SPAudioParam);

    mapping = function (value){
        return value;
    }
    setter = function (aParam, value, audioContext){
        aParam.linearRampToValueAtTime(value, audioContext.currentTime + 3);
    }

    p = new SPAudioParam(null,null,null,null,o.frequency, mapping, null, context);

    o.start(0);

    //q = new SPAudioParam("test",0,10000,0.1,null,null, context);

});
