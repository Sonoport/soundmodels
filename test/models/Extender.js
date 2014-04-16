"use strict";

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

var extender;

require(["models/Extender"], function (Extender) {

    var url = "https://dl.dropboxusercontent.com/u/77191118/Ocean_Surf.mp3";


    // Single test
    extender = new Extender(url, context, function() {
        var slider = document.getElementById('extender');
        slider.disabled = false;
        extender.play();

        slider.addEventListener('input', function(){
            extender.eventPeriod.value = parseFloat(slider.value);
        });
    });


});
