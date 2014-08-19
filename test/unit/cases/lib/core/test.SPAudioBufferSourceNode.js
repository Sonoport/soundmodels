require( [ 'core/SPAudioBufferSourceNode', 'core/SPPlaybackRateParam' ], function ( SPAudioBufferSourceNode, SPPlaybackRateParam ) {
    "use strict";
    console.log( "Running SPAudioBufferSourceNode Test... " );
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    describe( 'SPAudioBufferSourceNode.js', function () {

        var toneBuffer = createToneBuffer( 11025 );

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

        function createToneBuffer( length ) {
            var array = new Float32Array( length );
            var audioBuf = context.createBuffer( 1, length, 44100 );

            for ( var index = 0; index < length; index++ ) {
                array[ index ] = Math.sin( 440 * 2 * Math.PI * index / context.sampleRate );
            }

            audioBuf.getChannelData( 0 )
                .set( array );
            return audioBuf;
        }

        describe( '#new ', function () {
            it( "should be able to create a new SPAudioBufferSourceNode", function () {
                expect( function () {
                    var sourceNode = new SPAudioBufferSourceNode( context );
                } )
                    .not.toThrowError();
            } );
        } );

        describe( '#playbackRate ', function () {
            it( "should be have a parameter called playbackRate", function () {
                var sourceNode = new SPAudioBufferSourceNode( context );
                expect( sourceNode.playbackRate )
                    .toBeDefined();
                expect( sourceNode.playbackRate )
                    .toBeInstanceOf( SPPlaybackRateParam );
            } );
        } );

        describe( '#playbackPosition ', function () {
            it( "should be have a parameter called playbackPosition", function () {
                var sourceNode = new SPAudioBufferSourceNode( context );
                expect( sourceNode.playbackPosition )
                    .toBeDefined();
            } );
        } );

        describe( '#playbackPosition ', function () {
            it( "playbackPosition should change when a Source is played", function ( done ) {
                var sourceNode = new SPAudioBufferSourceNode( context );
                expect( sourceNode.playbackPosition )
                    .toBeDefined();
                sourceNode.connect( context.destination );
                sourceNode.buffer = toneBuffer;
                sourceNode.loop = true;
                expect( sourceNode.playbackPosition )
                    .toBe( 0 );
                sourceNode.start( 0 );
                setTimeout( function () {
                    sourceNode.stop( 0 );
                    expect( sourceNode.playbackPosition )
                        .not.toBe( 0 );
                    done();
                }, 500 );
            } );
        } );

        describe( '#connect / #disconnect should', function () {
            it( "should be able to connect to and disconnect from destination", function () {
                var sourceNode = new SPAudioBufferSourceNode( context );
                expect( function () {
                    sourceNode.connect( context.destination );
                } )
                    .not.toThrowError();
                expect( function () {
                    sourceNode.disconnect();
                } )
                    .not.toThrowError();
            } );
        } );

        describe( '#start/#stop', function () {
            it( "should be able to start/stop sounds without errors", function ( done ) {
                var sourceNode = new SPAudioBufferSourceNode( context );
                sourceNode.connect( context.destination );
                sourceNode.buffer = toneBuffer;
                sourceNode.loop = true;
                expect( function () {
                    sourceNode.start( 0 );
                    setTimeout( function () {
                        sourceNode.stop( 0 );
                        done();
                    }, 500 );
                } )
                    .not.toThrowError();
            } );
        } );

        describe( '#reset ', function () {
            it( "should be reset it's buffer when resetBufferSource is called", function ( done ) {
                var sourceNode = new SPAudioBufferSourceNode( context );
                sourceNode.connect( context.destination );
                sourceNode.buffer = toneBuffer;
                expect( function () {
                    sourceNode.start( context.currentTime );
                    sourceNode.stop( context.currentTime + 1 );
                    sourceNode.resetBufferSource( 0, context.destination );
                    sourceNode.start( context.currentTime + 1.5 );
                    sourceNode.stop( context.currentTime + 2 );
                } )
                    .not.toThrowError();
                done();
            } );
        } );
    } );
} );
