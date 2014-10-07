( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    var trigger;

    require( [ "models/MultiTrigger" ], function ( MultiTrigger ) {

        var tap1 = "https://dl.dropboxusercontent.com/u/77191118/sounds/Hit5.mp3";
        var tap2 = "https://dl.dropboxusercontent.com/u/77191118/sounds/Hit6.mp3";
        var tap3 = "https://dl.dropboxusercontent.com/u/77191118/sounds/Hit7.mp3";
        var tap4 = "https://dl.dropboxusercontent.com/u/77191118/sounds/Hit8.mp3";

        // Single test
        trigger = new MultiTrigger( context, [ tap1, tap2, tap3, tap4 ], function ( progressEvent, sound ) {
            console.log( sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            var trigButton = document.getElementById( 'multitrigger' );
            trigButton.disabled = false;

            trigger.pitchRand.value = 10;
            //trigger.eventRand.value = true;

            trigButton.addEventListener( 'click', function () {
                if ( !trigger.isPlaying ) {
                    trigButton.innerHTML = "Pause";
                    trigger.play();
                } else {
                    trigButton.innerHTML = "Play";
                    trigger.pause();
                }
            } );
        }, function () {
            console.log( "Starting...", context.currentTime );
        }, function () {
            console.log( "Ended...", context.currentTime );
        } );

    } );
} )();
