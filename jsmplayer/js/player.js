// main file
//"use strict";

var AudioContext = webkitAudioContext || AudioContext;
var context = new AudioContext();

/*
$( "select[name='herolist']" )
    .selectpicker( {
        style: 'btn-primary',
        menuStyle: 'dropdown-inverse'
    } );

// Toggle classes

$( function () {
    var select = $( "#minbeds" );
    var slider = $( "<div id='slider' class='ui-slider'></div>" )
        .insertAfter( select )
        .slider( {
            min: 1,
            max: 6,
            range: "min",
            value: select[ 0 ].selectedIndex + 1,
            slide: function ( event, ui ) {
                select[ 0 ].selectedIndex = ui.value - 1;
            }

        } );
    $( "#minbeds" )
        .change( function () {
            slider.slider( "value", this.selectedIndex + 1 );
        } );
} );
*/
// Test loading of Looper class
require.config( {
    baseUrl: "./"
} );
require( [ "models/Looper" ], function ( Looper ) {

    //var surfURL = "https://dl.dropboxusercontent.com/u/2117088/ocean_edge.mp3";

    var surfURL = "https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3";
    var alienURL = "https://dl.dropboxusercontent.com/u/2117088/spaceship_11.mp3";

    function startLooper() {
        lp.start( 0 );
    }

    var lp = new Looper( alienURL, onLoad, context );
    //console.log( lp );

    function onLoad( status ) {
        console.log( "Looper Loaded :" + status );
    }
    // toggle sound
    $( "#playbtn" )
        .click( function () {
            // toggle play button
            console.log( "play" );
            lp.start(0);
        } );
    $( "#pausebtn" )
        .click( function () {
            console.log( "pause" );
            lp.pause();
        } );
    $()
        .click( function () {

        } );

} );
