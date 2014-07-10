require( [ 'core/MultiFileLoader' ], function ( multiFileLoader ) {
    "use strict";
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var validSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav' ];
    var invalidSounds = [ 'doesnotexist.wav', 'fakefile.mp3' ];
    describe( 'MultiFileLoader.js', function () {

        var customMatchers = {
            toBeInstanceOf: function () {
                return {
                    compare: function ( actual, expected ) {
                        var result = {};
                        result.pass = actual instanceof expected;
                        if ( result.pass ) {
                            result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                        } else {
                            result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                        }
                        return result;
                    }
                };
            }
        };

        beforeEach( function () {
            jasmine.addMatchers( customMatchers );
        } );

        describe( '# multiFileLoader( sounds, audioContext, onAllLoad, onProgressCallback ) ', function () {
            it( "should return status true and an array of buffers on callback if urls supplied is valid", function ( done ) {
                multiFileLoader.call( {
                    maxSources: 8,
                    minSources: 1
                }, validSounds, context, function ( status, buffers ) {
                    expect( status )
                        .toBe( true );
                    expect( buffers.length )
                        .toBeDefined();
                    expect( buffers.length )
                        .toBeGreaterThan( 0 );
                    buffers.forEach( function ( thisBuffer ) {
                        expect( thisBuffer )
                            .toBeInstanceOf( AudioBuffer );
                    } );
                    expect( buffers[ 0 ].numberOfChannels )
                        .toBe( 2 );
                    expect( buffers[ 1 ].numberOfChannels )
                        .toBe( 2 );
                    expect( buffers[ 2 ].numberOfChannels )
                        .toBe( 1 );
                    done();
                } );
            } );

            it( "should return status false and array of undefined on callback if urls supplied is invalid", function ( done ) {
                multiFileLoader.call( {
                    maxSources: 8
                }, invalidSounds, context, function ( status, buffers ) {
                    expect( status )
                        .toBe( false );
                    expect( buffers.length )
                        .toBeDefined();
                    expect( buffers.length )
                        .toBe( invalidSounds.length );
                    done();
                } );
            } );
        } );
    } );
} );
