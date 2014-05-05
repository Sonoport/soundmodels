"use strict";

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

var looper;

require(["core/Envelope", "models/Looper"], function (Envelope, Looper) {

    //console.log(Looper);

    var url = "https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Marked.mp3";
    // var url = "https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Original.wav";
    // var url = "https://dl.dropboxusercontent.com/u/77191118/DeepIntoIt.wav";

    // var drums = "https://dl.dropboxusercontent.com/u/77191118/sounds/drum.mp3";
    // var guitar = "https://dl.dropboxusercontent.com/u/77191118/sounds/guitar.mp3";
    // var piano = "https://dl.dropboxusercontent.com/u/77191118/sounds/piano.mp3";

    // var validURL = drums;
    // var validURL1 =  guitar;
    // var validURL2 =  drums;
    // var validURL3 =  piano;

    // populate a valid URL of mp3 file

    var e = new Envelope(context);
    e.initADSR({attackDur : 1, releaseDur: 1});

    function onLoad (status) {
        console.log("Looper Loaded :" + status);
    }

    // Multi Track Test
    // looper = new Looper([drums, guitar, piano], function (status) {
    //     console.log("Looper Loaded :" + status);
    //     looper.start(0);
    // }, context);

    // var lp = new Looper(validURL, onLoad, context);
    // lp = new Looper([validURL, validURL], onLoad, context);


    // Mixed input test



    // var fl = new FileLoader(drums,context, function( status ){
    //     console.log("File Loader Loaded :" + status);
    //     var lp = new Looper([validURL, fl.getBuffer()], function () {
    //        lp.start(0);
    //    },context);
    // });

    // var lp = new Looper(validURL, function(){
    //     lp.playSpeed.value = 2.0;
    //     lp.riseTime.value = 2.0;
    //     lp.startPoint.value = 0.2;
    //     lp.start(0);
    //     lp.playSpeed.linearRampToValueAtTime(1, context.currentTime + 2 );
    //     lp.decayTime.setTargetAtTime(5, context.currentTime + 3, 2.0 );
    //     lp.playSpeed.setValueAtTime(0.1, context.currentTime + 8);
    //     lp.stop(context.currentTime + 15);
    // }, context);


    looper = new Looper('https://dl.dropboxusercontent.com/u/77191118/sine_marked.mp3', context, function(){
        //looper.maxLoops.value = 1;
        looper.start(0);
        // e.start(0, null, null, 0.5);
        // looper.multiTrackGain[0].linearRampToValueAtTime(0.5, context.currentTime + 2 );
        // looper.playSpeed.linearRampToValueAtTime(5, context.currentTime + 1 );
    });

    // looper.disconnect();
    // looper.connect(e);
    // e.connect(context.destination);

     /*
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var context = new AudioContext();


        // populate a valid URL of mp3 file
        var validURL = "";

        // populate valid URLs of syncronized mp3 files.
        var validURL1 = "";
        var validURL2 = "";
        var validURL3 = "";

        // populate a valid buffer
        var validAudioBuffer;


        lp = new Looper(validURL, onLoad);
        lp = new Looper(validAudioBuffer, onLoad);
        lp = new Looper([validURL, validURL], onLoad);
        lp = new Looper([validURL, validAudioBuffer], onLoad);
        */
    });
