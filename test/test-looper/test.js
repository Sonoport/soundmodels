"use strict";

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

var looper;

require(["core/FileLoader", "models/Looper"], function (FileLoader, Looper) {

    //console.log(Looper);

    //var url = "https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Marked.mp3";
    // var url = "https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Original.wav";
    var url = "https://dl.dropboxusercontent.com/u/77191118/DeepIntoIt.wav";

    // populate a valid URL of mp3 file
    var validURL = url;


    looper = new Looper(url, function (status) {
        console.log("Looper Loaded :" + status);
        looper.start(0);
    }, context);


    /*var lp = new FileLoader(validURL,context, function( status ){
        console.log("File Loader Loaded :" + status);
        looper = new Looper(lp.getRawBuffer(), function (status) {
            console.log("Looper Loaded :" + status);
            looper.start();
        });
});*/





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
