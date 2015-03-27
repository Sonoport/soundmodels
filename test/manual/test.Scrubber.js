( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    var scrubber;

    require( [ 'models/Scrubber' ], function ( Scrubber ) {

        //console.log(Looper);

        //var url = 'https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Marked.mp3';
        // var url = 'https://dl.dropboxusercontent.com/u/77191118/Sin440Hz1s-Original.wav';
        // var url = 'https://dl.dropboxusercontent.com/u/77191118/DeepIntoIt.wav';

        var url = 'https://dl.dropboxusercontent.com/u/957/audio/RebBull_WebGame_Normal.wav';
        // Single test
        scrubber = new Scrubber( context, url, function ( progressEvent, sound ) {
            console.log( sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            var slider = document.getElementById( 'scrubber' );
            slider.disabled = false;

            slider.addEventListener( 'input', function () {
                if ( !scrubber.isPlaying ) {
                    scrubber.play();
                }
                scrubber.playPosition.value = parseFloat( slider.value );
            } );
        }, function () {
            console.log( "Starting...", context.currentTime );
        }, function () {
            console.log( "Ended...", context.currentTime );
        } );

    } );
} )();
