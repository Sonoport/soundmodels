require( [ 'core/DetectLoopMarkers' ], function ( detectLoopMarkers ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    describe( 'DetectLoopMarkers.js', function () {

        function loadAndDecode( URL, ondecode ) {
            var request = new XMLHttpRequest();

            request.open( 'GET', URL, true );
            request.responseType = 'arraybuffer';

            request.onload = function () {
                context.decodeAudioData( request.response, function ( buffer ) {
                    ondecode( buffer );
                } );
            };
            request.send();
        }

        describe( '#detectLoopMarkers( buffer )', function () {

            it( "should throw an error if buffer is null", function () {
                expect( function () {
                    var a = detectLoopMarkers();
                } )
                    .toThrowError();
            } );

            it( "should not throw an error if loading from a buffer programatically created", function () {

                expect( function () {
                    var audio = context.createBuffer( 1, 2048, 44100 );
                    detectLoopMarkers( audio );
                } )
                    .not.toThrowError();

                expect( function () {
                    var audio = context.createBuffer( 2, 1024, 44100 );
                    detectLoopMarkers( audio );
                } )
                    .not.toThrowError();
            } );

            it( "should not have problem loading MP3 files", function () {
                loadAndDecode( 'audio/bullet.mp3', function ( buffer ) {
                    expect( function () {
                        detectLoopMarkers( buffer );
                    } )
                        .not.toThrowError();
                } );
            } );
        } );

        describe( '#marked sound - start', function () {
            it( "should detect start marker if available", function () {
                loadAndDecode( 'audio/sineloopstereomarked.wav', function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.start )
                        .toEqual( 5000 );
                } );
            } );
        } );

        describe( '#unmarked sound - sound', function () {
            it( "should detect start of sound if marker is not available", function () {
                loadAndDecode( 'audio/sineloopstereo.wav', function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.start )
                        .toEqual( 1 );
                } );
                loadAndDecode( 'audio/sineloopmono.wav', function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.start )
                        .toEqual( 1 );
                } );
            } );
        } );

        describe( '#marked sound - end', function () {
            it( "should detect end marker if available", function () {
                loadAndDecode( 'audio/sineloopstereomarked.wav', function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.end )
                        .toEqual( 49000 );
                } );
            } );
        } );

        describe( 'unmarked sound - end', function () {
            it( "should detect start of sound if marker is not available", function () {
                loadAndDecode( 'audio/sineloopstereo.wav', function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.end )
                        .toEqual( 44000 );
                } );

                loadAndDecode( 'audio/sineloopmono.wav', function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.end )
                        .toEqual( 220500 );
                } );
            } );
        } );
    } );
} );
