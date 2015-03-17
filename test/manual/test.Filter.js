( function () {
    "use strict";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    require( [ 'models/Looper', 'core/SPAudioBuffer', 'effects/Filter' ], function ( Looper, SPAudioBuffer, Filter ) {

        var workout = new SPAudioBuffer( window.context, 'https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3' );

        // var drums = 'https://dl.dropboxusercontent.com/u/77191118/sounds/drum.mp3';
        // var guitar = 'https://dl.dropboxusercontent.com/u/77191118/sounds/guitar.mp3';
        // var piano = 'https://dl.dropboxusercontent.com/u/77191118/sounds/piano.mp3';

        var filter = new Filter( context );

        var looper = new Looper( context, workout, function ( progressEvent, sound ) {
            console.log( "Loading.. ", sound, ( progressEvent.loaded / progressEvent.total ) );
        }, function () {
            console.log( "Loaded..." );
            filter.type.value = "lowpass";
            filter.frequency.setTargetAtTime( 90, context.currentTime + 2, 10 );

            var filterSlider = document.getElementById( 'filter' );
            filterSlider.disabled = false;

            filterSlider.addEventListener( 'input', function () {
                filter.frequency.value = parseFloat( filterSlider.value );
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
        looper.connect( filter );
        filter.connect( context.destination );
    } );
} )();
