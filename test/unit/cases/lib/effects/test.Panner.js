"use strict";
require( [ 'effects/Panner', 'core/BaseEffect', 'core/SPAudioParam' ], function ( Panner, BaseEffect, SPAudioParam ) {
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    describe( 'Panner.js', function () {
        var panner;
        var internalSpies = {};
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
            if ( !panner ) {
                console.log( "Initing Panner.." );
                panner = new Panner( window.context );
            }
            done();
        } );

        describe( '#new Panner( context )', function () {

            it( "should have audioContext available", function () {
                expect( panner.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 0", function () {
                expect( panner.minSources ).toBe( 0 );
            } );

            it( "should have a maximum number of sources as 0", function () {
                expect( panner.maxSources ).toBe( 0 );
            } );

            it( "should have atleast 1 input", function () {
                expect( panner.numberOfInputs ).toBeGreaterThan( 0 );
            } );

            it( "should have atleast 1 output", function () {
                expect( panner.numberOfOutputs ).toBeGreaterThan( 0 );
            } );

            it( "should have a model name as Panner", function () {
                expect( panner.effectName ).toBe( 'Panner' );
            } );

            it( "should be a BaseSound", function () {
                expect( panner ).toBeInstanceOf( BaseEffect );
            } );

            it( "should be have been initialized", function () {
                expect( panner.isInitialized ).toBe( true );
            } );
        } );

        describe( '#properties', function () {
            it( "should have a valid parameter pan", function () {

                expect( panner.pan ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    panner.pan = 0;
                } ).toThrowError();

                expect( function () {
                    delete panner.pan;
                } ).toThrowError();

                expect( panner.pan.name ).toBe( 'pan' );
                expect( panner.pan.value ).toBe( 0 );
                expect( panner.pan.minValue ).toBe( -90 );
                expect( panner.pan.maxValue ).toBe( 90 );

            } );
        } );

        describe( '#connect/disconnect', function () {

            it( "have connect function defined", function () {
                expect( panner.connect ).toBeInstanceOf( Function );
            } );
            it( "have disconnect function defined", function () {
                expect( panner.disconnect ).toBeInstanceOf( Function );
            } );

        } );
    } );
} );
