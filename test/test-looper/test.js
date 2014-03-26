"use strict";

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

var looper;

require(["core/SoundQueue", "models/Looper"], function (SoundQueue, Looper) {

    //console.log(Looper);

    //var url = "https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Marked.mp3";
    // var url = "https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Original.wav";
    // var url = "https://dl.dropboxusercontent.com/u/77191118/DeepIntoIt.wav";

    var drums = "https://dl.dropboxusercontent.com/u/77191118/sounds/drum.mp3";
    var guitar = "https://dl.dropboxusercontent.com/u/77191118/sounds/guitar.mp3";
    var piano = "https://dl.dropboxusercontent.com/u/77191118/sounds/piano.mp3";

    // populate a valid URL of mp3 file


    // Multi Track Test
    // looper = new Looper([drums, guitar, piano], function (status) {
    //     console.log("Looper Loaded :" + status);
    //     looper.start(0);
    // }, context);


    //Mixed input test
    // var lp = new FileLoader(drums,context, function( status ){
    //     console.log("File Loader Loaded :" + status);
    //     looper = new Looper([lp.getBuffer(), guitar, piano], function (status) {
    //         console.log("Looper Loaded :" + status);
    //         //looper.startPoint.value = 0.9;
    //         looper.start(0);
    //     }, context);
    // });

    var s = new SoundQueue(context);







     /*
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var audioContext = new AudioContext();


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
