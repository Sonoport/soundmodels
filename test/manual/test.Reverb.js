( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    require( [ 'models/Looper', 'core/SPAudioBuffer', 'effects/Reverb' ], function ( Looper, SPAudioBuffer, Reverb ) {

        var workout = new SPAudioBuffer( window.context, 'https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3' );

        var drums = 'https://dl.dropboxusercontent.com/u/77191118/sounds/drum.mp3';

        var reverb = new Reverb( context );

        var looper = new Looper( context, workout, function ( progressEvent, sound ) {
            console.log( "Loading.. ", sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            console.log( "Loaded..." );
            // reverb.decayTime.value = -45;
            // reverb.decayTime.setTargetAtTime( 90, context.currentTime + 2, 10 );

            var reverbSlider = document.getElementById( 'reverb' );
            reverbSlider.disabled = false;

            reverbSlider.addEventListener( 'input', function () {
                reverb.decayTime.value = parseFloat( reverbSlider.value );
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
        looper.connect( reverb );
        reverb.connect( context.destination );
    } );
} )();
