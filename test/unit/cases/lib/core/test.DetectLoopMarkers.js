    "use strict";
    var detectLoopMarkers = require( 'core/DetectLoopMarkers' )
    console.log( "Running DetectLoopMarker Test... " );
    if ( !window.context ) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.context = new AudioContext();
    }
    var rampMarkedMp3 = 'audio/ramp_marked.mp3';
    var rampMarkedWav = 'audio/ramp_marked.wav';
    var mp3File = 'audio/bullet.mp3';
    var markedWavFile = 'audio/sineloopstereomarked.wav';
    var markedStereoMp3File = 'audio/sineloopstereomarked.mp3';
    var markedMonoMp3File = 'audio/sineloopmonomarked.mp3';
    var unmarkedMonoWavFile = 'audio/sineloopmono.wav';
    var unmarkedStereoWavFile = 'audio/sineloopstereo.wav';

    describe( 'DetectLoopMarkers.js', function () {

        function loadAndDecode( URL, ondecode ) {
            var request = new XMLHttpRequest();

            request.open( 'GET', URL, true );
            request.responseType = 'arraybuffer';

            request.onload = function () {
                context.decodeAudioData( request.response, function ( buffer ) {
                    //console.log( URL, " : ", buffer.length, buffer.sampleRate );
                    ondecode( buffer );
                } );
            };
            request.send();
        }

        var customMatchers = {
            toBeApproximatelyEqualTo: function () {
                return {
                    compare: function ( actual, expected ) {
                        var result = {};
                        result.pass = Math.abs( Number( actual ) - Number( expected ) ) < 0.03;
                        if ( result.pass ) {
                            result.message = 'Expected ' + actual + ' to be approximately equal to ' + expected;
                        } else {
                            result.message = 'Expected ' + actual + ' to be approximately equal to ' + expected + ', but it is not';
                        }
                        return result;
                    }
                };
            }
        };

        function printNFrom( name, data, start, num ) {
            console.log( "--------------Data for ", name, "from ", start, " ---------------" );
            for ( var i = 0; i < num; ++i ) {
                console.log( start + i, ":", ( data[ start + i ] )
                    .toFixed( 6 ) );
            }
        }

        beforeEach( function () {
            jasmine.addMatchers( customMatchers );
        } );

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

            it( "should not have problem loading MP3 files", function ( done ) {
                loadAndDecode( mp3File, function ( buffer ) {
                    expect( function () {
                            detectLoopMarkers( buffer );
                        } )
                        .not.toThrowError();
                    done();
                } );
            } );
        } );

        describe( '#marked sound - start', function () {
            it( "should detect start marker on a marked ramp file", function ( done ) {
                loadAndDecode( rampMarkedWav, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( rampMarkedWav, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.22049623727798462 );
                    done();
                } );
            } );

            it( "should detect start marker on a marked ramp MP3 file", function ( done ) {
                loadAndDecode( rampMarkedMp3, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( rampMarkedMp3, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.22049623727798462 );
                    done();
                } );
            } );

            it( "should detect start marker if available", function ( done ) {
                loadAndDecode( markedWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( markedWavFile, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0 );
                    done();
                } );
            } );

            it( "should detect start marker if available in a Mono file", function ( done ) {
                loadAndDecode( markedMonoMp3File, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( markedMonoMp3File, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0 );
                    done();
                } );
            } );

            it( "should detect start marker if available in a Stereo file", function ( done ) {
                loadAndDecode( markedStereoMp3File, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( markedStereoMp3File, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.0013794986298307776 );
                    done();
                } );
            } );
        } );

        describe( '#unmarked sound - sound', function () {
            it( "should detect start of sound if marker is not available", function ( done ) {
                loadAndDecode( unmarkedStereoWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( unmarkedStereoWavFile, lCh, markers.start, 10 );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.050048828125 );
                    done();
                } );
            } );

            it( "should detect start of sound if marker is not available", function ( done ) {
                loadAndDecode( unmarkedMonoWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    //printNFrom( unmarkedMonoWavFile, lCh, markers.start, 10 );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.05010986328125 );
                    done();
                } );
            } );
        } );

        describe( '#marked sound - end', function () {
            it( "should detect end marker on a marked ramp file", function ( done ) {
                loadAndDecode( rampMarkedWav, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( rampMarkedWav, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0.22049623727798462 );
                    done();
                } );
            } );

            it( "should detect end marker on a marked ramp MP3 file", function ( done ) {
                loadAndDecode( rampMarkedMp3, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( rampMarkedMp3, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0.22049623727798462 );
                    done();
                } );
            } );

            it( "should detect end marker if available", function ( done ) {
                loadAndDecode( markedWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0 );
                    done();
                } );
            } );

            it( "should detect end marker if available in a Stereo file", function ( done ) {
                loadAndDecode( markedStereoMp3File, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0.0014140927232801914 );
                    done();
                } );
            } );

            it( "should detect end marker if available in a Mono file", function ( done ) {
                loadAndDecode( markedMonoMp3File, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0.0012327437289059162 );
                    done();
                } );
            } );
        } );

        describe( 'unmarked sound - end', function () {
            it( "should detect end of sound in a stereo file if marker is not available", function ( done ) {
                loadAndDecode( unmarkedStereoWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( lCh[ markers.end - 1 ] )
                        .toBeApproximatelyEqualTo( -0.038787841796875 );
                    done();
                } );
            } );

            it( "should detect end of sound in a mono file if marker is not available", function ( done ) {
                loadAndDecode( unmarkedMonoWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( lCh[ markers.end - 1 ] )
                        .toBeApproximatelyEqualTo( -0.050201416015625 );
                    done();
                } );
            } );
        } );
    } );
