"use strict";
var SPAudioBuffer = require( 'core/SPAudioBuffer' );
console.log( "Running SPAudioBuffer Test... " );
if ( !window.context ) {
    window.context = new AudioContext();
}

describe( 'SPAudioBuffer.js', function () {

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

    describe( '#new ', function () {
        it( "should be able to create a new SPAudioBuffer", function () {
            var buffer;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBeDefined();
        } );

        it( "should be able to create a new SPAudioBuffer", function () {
            var buffer;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, new File( [ "" ], "filename" ), 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBeDefined();
        } );

        it( "should be able to create a new SPAudioBuffer", function () {
            var buffer;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, window.context.createBuffer( 1, length, window.context.sampleRate ), startPoint, endPoint );
                } )
                .not.toThrowError();

            expect( buffer.buffer )
                .toBeDefined();
        } );

        it( "should be able to create a new SPAudioBuffer", function () {
            var buffer;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBeDefined();
            expect( buffer.buffer )
                .toBeDefined();
        } );
    } );

    describe( 'numberOfChannels property ', function () {
        it( "should return 0 if no buffer is set", function () {
            var buffer;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sampleRate )
                .toBe( 0 );
        } );

        it( "should store and return the numberOfChannels property based on the buffer", function () {
            var buffer;
            var numCh = 2;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", startPoint, endPoint, window.context.createBuffer( numCh, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            expect( buffer.numberOfChannels )
                .toBe( numCh );
        } );

    } );

    describe( 'sampleRate property ', function () {
        it( "should return 0 if no buffer is set", function () {
            var buffer;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sampleRate )
                .toBe( 0 );
        } );

        it( "should store and return the sampleRate property based on the buffer", function () {
            var buffer;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            expect( buffer.sampleRate )
                .toBe( window.context.sampleRate );
        } );

    } );

    describe( 'source url property', function () {
        it( "should store and return a string sourceURL property", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav";
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBe( sourceURL );
        } );

        it( "should store and return a buffer sourceURL property", function () {
            var buffer;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            var sourceURL = window.context.createBuffer( 1, length, window.context.sampleRate );
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, startPoint, endPoint );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBeNull();
        } );

        it( "should store and return a file sourceURL property", function () {
            var buffer;
            var sourceURL = new File( [ "" ], "filename" );
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBe( sourceURL );
        } );
    } );

    describe( 'startPoint property', function () {
        it( "should allow setting of startPoint", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav";
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            var newStart = Math.random();
            expect( function () {
                    buffer.startPoint = newStart
                } )
                .not.toThrowError();
            expect( buffer.startPoint ).toBe( newStart );
        } );

    } );

    describe( 'endPoint property', function () {
        it( "should allow setting of endPoint", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav";
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            var newEnd = Math.random();
            expect( function () {
                    buffer.endPoint = newEnd
                } )
                .not.toThrowError();
            expect( buffer.endPoint ).toBe( newEnd );
        } );
    } );

    describe( 'buffer property', function () {
        it( "should allow setting of buffer property", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav";
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL );
                } )
                .not.toThrowError();

            var newBuffer = window.context.createBuffer( 1, 44100, window.context.sampleRate )
            expect( function () {
                    buffer.buffer = newBuffer
                } )
                .not.toThrowError();
            expect( buffer.buffer ).toBeInstanceOf( AudioBuffer );
        } );

        it( "should clip to start and end points", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav"
            var samplingRate = window.context.sampleRate;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL );
                } )
                .not.toThrowError();

            var newBuffer = window.context.createBuffer( 1, samplingRate + 1, samplingRate )
            var startPoint = Math.random();
            //startPoint = 0.6139716017059982;
            var endPoint = Math.min( startPoint + Math.random(), 1 );
            //endPoint = 0.9019752161111683;
            console.log( 'clip', startPoint, endPoint );
            var length = Math.ceil( ( endPoint - startPoint ) * samplingRate ) + 1;
            expect( function () {
                    buffer.buffer = newBuffer
                    buffer.startPoint = startPoint;
                    buffer.endPoint = endPoint;
                } )
                .not.toThrowError();
            expect( buffer.buffer ).toBeInstanceOf( AudioBuffer );
            expect( buffer.buffer.length ).toBe( Math.ceil( length ) )
        } );
    } );
} );
