"use strict";

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

var trigger;

require(["models/Trigger"], function (Trigger) {

    var tap1 = "https://dl.dropboxusercontent.com/u/77191118/sounds/Hit5.mp3";
    var tap2 = "https://dl.dropboxusercontent.com/u/77191118/sounds/Hit6.mp3";
    var tap3 = "https://dl.dropboxusercontent.com/u/77191118/sounds/Hit7.mp3";
    var tap4 = "https://dl.dropboxusercontent.com/u/77191118/sounds/Hit8.mp3";


    // Single test
    trigger = new Trigger([tap1, tap2, tap3, tap4], function() {
        var trigButton = document.getElementById('trigger');
        trigButton.disabled = false;

        trigger.pitchRand.value = 10;
        trigger.eventRand.value = true;

        trigButton.addEventListener('click', function(){
            trigger.play();
        });
    }, null, context);


});
