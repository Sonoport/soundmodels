require( [ 'core/DetectLoopMarkers' ], function ( detectLoopMarkers ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var mp3File = "audio/bullet.mp3";
    var markedWavFile = "audio/sineloopstereomarked.wav";
    var markedStereoMp3File = "audio/sineloopstereomarked.mp3";
    var markedMonoMp3File = "audio/sineloopmonomarked.mp3";
    var unmarkedMonoWavFile = "audio/sineloopmono.wav";
    var unmarkedStereoWavFile = "audio/sineloopstereo.wav";

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
                loadAndDecode( mp3File, function ( buffer ) {
                    expect( function () {
                        detectLoopMarkers( buffer );
                    } )
                        .not.toThrowError();
                } );
            } );
        } );

        describe( '#marked sound - start', function () {
            it( "should detect start marker if available", function ( done ) {
                loadAndDecode( markedWavFile, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( markers.start )
                        .toEqual( 5000 );
                    done();
                } );
            } );

            it( "should detect start marker if available in a Mono file", function ( done ) {
                loadAndDecode( markedMonoMp3File, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( markers.start )
                        .toEqual( 5000 );
                    done();
                } );
            } );

            it( "should detect start marker if available in a Stereo file", function ( done ) {
                loadAndDecode( markedStereoMp3File, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( markers.start )
                        .toEqual( 5000 );
                    done();
                } );
            } );
        } );

        describe( '#unmarked sound - sound', function () {
            it( "should detect start of sound if marker is not available", function ( done ) {
                loadAndDecode( unmarkedStereoWavFile, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( markers.start )
                        .toEqual( 1 );
                    done();
                } );
            } );
            it( "should detect start of sound if marker is not available", function ( done ) {
                loadAndDecode( unmarkedMonoWavFile, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( markers.start )
                        .toEqual( 1 );
                    done();
                } );
            } );
        } );

        describe( '#marked sound - end', function () {
            it( "should detect end marker if available", function ( done ) {
                loadAndDecode( markedWavFile, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( markers.end )
                        .toEqual( 49000 );
                    done();
                } );
            } );

            it( "should detect end marker if available in a Stereo file", function ( done ) {
                loadAndDecode( markedStereoMp3File, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( markers.end )
                        .toEqual( 49000 );
                    done();
                } );
            } );

            it( "should detect end marker if available in a Mono file", function ( done ) {
                loadAndDecode( markedMonoMp3File, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( markers.end )
                        .toEqual( 49000 );
                    done();
                } );
            } );
        } );

        describe( 'unmarked sound - end', function () {
            it( "should detect start of sound if marker is not available", function ( done ) {
                loadAndDecode( unmarkedStereoWavFile, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( markers.end )
                        .toEqual( 44000 );
                    done();
                } );
            } );

            it( "should detect start of sound if marker is not available", function ( done ) {
                loadAndDecode( unmarkedMonoWavFile, function ( buffer ) {
                    markers = detectLoopMarkers( buffer );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( markers.end )
                        .toEqual( 220500 );
                    done();
                } );
            } );
        } );
    } );
} );
