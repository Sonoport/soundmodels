( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    require( [ 'models/Looper', 'core/SPAudioBuffer', 'effects/Fader' ], function ( Looper, SPAudioBuffer, Fader ) {

        var workout = new SPAudioBuffer( window.context, 'https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3' );

        var drums = 'https://dl.dropboxusercontent.com/u/77191118/sounds/drum.mp3';
        // var guitar = 'https://dl.dropboxusercontent.com/u/77191118/sounds/guitar.mp3';
        // var piano = 'https://dl.dropboxusercontent.com/u/77191118/sounds/piano.mp3';

        var fader = new Fader( context );

        var looper = new Looper( context, workout, function ( progressEvent, sound ) {
            console.log( "Loading.. ", sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            console.log( "Loaded..." );
            fader.volumeInDB.value = 0;
            fader.volumeInDB.setValueAtTime( -12, context.currentTime + 1 );
            fader.volume.setTargetAtTime( 0, context.currentTime + 10, 0.5 );

            var faderSlider = document.getElementById( 'fader' );
            faderSlider.disabled = false;

            faderSlider.addEventListener( 'input', function () {
                fader.volume.value = parseFloat( faderSlider.value );
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
        looper.connect( fader );
        fader.connect( context.destination );
    } );
} )();
