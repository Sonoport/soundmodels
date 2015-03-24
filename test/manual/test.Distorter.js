( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    require( [ 'models/Looper', 'core/SPAudioBuffer', 'effects/Distorter' ], function ( Looper, SPAudioBuffer, Distorter ) {

        var workout = new SPAudioBuffer( window.context, 'https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3' );

        var drums = 'https://dl.dropboxusercontent.com/u/77191118/sounds/drum.mp3';

        var distort = new Distorter( context );

        var looper = new Looper( context, workout, function ( progressEvent, sound ) {
            console.log( "Loading.. ", sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            console.log( "Loaded..." );
            // distort.decayTime.value = -45;
            // distort.decayTime.setTargetAtTime( 90, context.currentTime + 2, 10 );

            distort.color.value = 100;

            var distortSlider = document.getElementById( 'distort' );
            distortSlider.disabled = false;

            distortSlider.addEventListener( 'input', function () {
                distort.drive.value = parseFloat( distortSlider.value );
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
        looper.connect( distort );
        distort.connect( context.destination );
    } );
} )();
