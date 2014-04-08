// main file
//'use strict';

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

    var surfURL = "https://dl.dropboxusercontent.com/u/2117088/ocean_edge.mp3";
    var runURL = "https://dl.dropboxusercontent.com/u/2117088/WorkoutTrack.mp3";
    var alienURL = "https://dl.dropboxusercontent.com/u/2117088/spaceship_11.mp3";

    // Looper
    var lp = new Looper( surfURL, onLoad, null, context );

    function onLoad( status ) {
        console.log( "Looper Loaded :" + status );
    }
    // toggle sound
    $( "#playbtn" )
        .click( function () {
            // toggle play button
            console.log( "play" );
            lp.play();
            //testLocal();
        } );
    $( "#pausebtn" )
        .click( function () {
            console.log( "pause" );
            lp.pause();
        } );
    $( "#stopbtn" )
        .click( function () {
            console.log( "stop" );
            lp.stop( 0 );
        } );

    // Load local sources
    var localSources = [];

    var source = null;
    var audioBuffer = null;

    function testLocal() {
        source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = false;
        source.connect( context.destination );
        source.start( 0 );
    }

    function handleFileSelect( evt ) {
        // FileList object
        var files = evt.target.files;

        // files is a FileList of File objects. List some properties.
        var output = [];
        for ( var i = 0; i < files.length; i++ ) {
            var f = files[ i ];
            localSources.push( f );
        }

        lp.setSources( localSources, onLoad, null, context );

    }

    $( "#filebtn" )
        .on( 'change', handleFileSelect );

    // Set Looper url sources
    $( "#updateSource" )
        .on( "click", function () {
            // Get urls
            var sourceurls = $( "#fileUrls" )
                .val();
            console.log( sourceurls );
            var sources = sourceurls.split( "," );
            console.log( sources );

            lp.setSources( sources, onLoad );
            //lp = new Looper( sources, onLoad, context );
        } );

} );
