"use strict";

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

var activity;

require(["models/Activity"], function (Activity) {

    var url = "https://dl.dropboxusercontent.com/u/77191118/DeepIntoIt.wav";
    // Single test
    activity = new Activity(url, function() {
        var slider = document.getElementById('activity');
        activity.play();

        slider.addEventListener('input', function(){
            activity.action.value = parseFloat(slider.value);
        });
    }, context);


});
