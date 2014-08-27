require( [ 'core/BaseSound' ], function ( BaseSound ) {
    "use strict";
    console.log( "Running BaseSound Test... " );
    if ( !window.context ) {
        window.context = new AudioContext();
    }

    describe( 'BaseSound.js', function () {
        var baseSound;

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

        beforeEach( function ( done ) {
            jasmine.addMatchers( customMatchers );
            baseSound = new BaseSound( context );
            done();
        } );

        describe( '#new BaseSound( context )', function () {

            it( "should have audioContext available", function () {
                expect( baseSound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );

            it( "should have number of inputs default to 0", function () {
                expect( baseSound.numberOfInputs )
                    .toBe( 0 );
            } );

            it( "should have a maximum number of sources default to 0", function () {
                expect( baseSound.maxSources )
                    .toBe( 0 );
            } );

            it( "should have releaseGainNode property as a GainNode object", function () {
                expect( baseSound.releaseGainNode )
                    .toBeInstanceOf( GainNode );
            } );

            it( "should have playing state default to false", function () {
                expect( baseSound.isPlaying )
                    .toEqual( false );
            } );

            it( "should have input node default to null", function () {
                expect( baseSound.inputNode )
                    .toBeNull();
            } );

            it( "should not throw an error if context is undefined", function () {
                expect( function () {
                    var a = new BaseSound();
                } )
                    .not.toThrowError();
            } );

        } );

        describe( '#maxSources', function () {

            it( "should default to 0 when given a negative value", function () {
                baseSound.maxSources = -1;
                expect( baseSound.maxSources )
                    .toBe( 0 );

                baseSound.maxSources = -100;
                expect( baseSound.maxSources )
                    .toBe( 0 );
            } );

            it( "should accept only integers and round off to nearest integer if float number placed", function () {
                baseSound.maxSources = 0.01;
                expect( baseSound.maxSources )
                    .toBe( 0 );

                baseSound.maxSources = 1.20;
                expect( baseSound.maxSources )
                    .toBe( 1 );

                baseSound.maxSources = 1.80;
                expect( baseSound.maxSources )
                    .toBe( 2 );
            } );

        } );

        describe( '#connect( destination, output, input )', function () {

            it( "should throw an error if destination is null", function () {
                expect( function () {
                    baseSound.connect( null, null, null );
                } )
                    .toThrow();
            } );

            it( "should throw an error if input or output exceeds number of inputs or outputs", function () {

                var gainNode = context.createGain();

                expect( function () {
                    baseSound.connect( gainNode, 0, -100 );
                } )
                    .toThrow();

                expect( function () {
                    baseSound.connect( gainNode, 100, 100 );
                } )
                    .toThrow();

                expect( function () {
                    baseSound.connect( gainNode, -100, 0 );
                } )
                    .toThrow();

            } );

        } );

        describe( '#start( when, offset, duration )', function () {

            it( "should start playing when called", function () {
                baseSound.start( 0, 0, 0 );
                expect( baseSound.isPlaying )
                    .toEqual( true );
            } );
        } );

        describe( '#play( )', function () {

            it( "should playing when called", function () {
                baseSound.play();
                expect( baseSound.isPlaying )
                    .toEqual( true );
            } );
        } );

        describe( '#pause( )', function () {

            it( "should pause when called", function () {
                baseSound.start( 0, 0, 0 );
                baseSound.pause();
                expect( baseSound.isPlaying )
                    .toEqual( false );
            } );
        } );

        describe( '#stop( when )', function () {

            it( "should stop playing when called", function () {
                baseSound.start( 0, 0, 0 );
                baseSound.stop( 0 );
                expect( baseSound.isPlaying )
                    .toEqual( false );
            } );
        } );
    } );
} );
