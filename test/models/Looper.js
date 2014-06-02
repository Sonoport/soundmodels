"use strict";

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

var looper;

require(["core/Envelope", "models/Looper"], function (Envelope, Looper) {

    var workout = "https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3";

    // var drums = "https://dl.dropboxusercontent.com/u/77191118/sounds/drum.mp3";
    // var guitar = "https://dl.dropboxusercontent.com/u/77191118/sounds/guitar.mp3";
    // var piano = "https://dl.dropboxusercontent.com/u/77191118/sounds/piano.mp3";

    looper = new Looper(workout, context, function(){
        //looper.playSpeed.setValueAtTime(0.00000000001,context.currentTime);
        looper.start(0);
    },function (progressEvent, sound){
        console.log(sound, (progressEvent.loaded/progressEvent.total));
    });

});
