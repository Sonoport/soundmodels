( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    require( [ 'models/Looper', 'core/SPAudioBuffer', 'effects/panner' ], function ( Looper, SPAudioBuffer, Panner ) {

        var workout = new SPAudioBuffer( window.context, 'https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3' );

        var drums = 'https://dl.dropboxusercontent.com/u/77191118/sounds/drum.mp3';
        // var guitar = 'https://dl.dropboxusercontent.com/u/77191118/sounds/guitar.mp3';
        // var piano = 'https://dl.dropboxusercontent.com/u/77191118/sounds/piano.mp3';

        var panner = new Panner( context );

        var looper = new Looper( context, workout, function ( progressEvent, sound ) {
            console.log( "Loading.. ", sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            console.log( "Loaded..." );
            panner.pan.value = -45;
            panner.pan.setTargetAtTime( 90, context.currentTime + 2, 10 );

            var pannerSlider = document.getElementById( 'panner' );
            pannerSlider.disabled = false;

            pannerSlider.addEventListener( 'input', function () {
                panner.pan.value = parseFloat( pannerSlider.value );
            } );
            looper.play();
        }, function () {
            console.log( "Starting...", context.currentTime );
        }, function () {
            console.log( "Ended...", context.currentTime );
        }, function ( event, track ) {
            console.log( "Track end... ", track );
        } );

        looper.disconnect( 0 );
        looper.connect( panner );
        panner.connect( context.destination );
    } );
} )();
