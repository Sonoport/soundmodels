"use strict";
require( [ 'effects/Fader', 'core/BaseEffect', 'core/SPAudioParam' ], function ( Fader, BaseEffect, SPAudioParam ) {
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    describe( 'Fader.js', function () {
        var fader;
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
            if ( !fader ) {
                console.log( "Initing Fader.." );
                fader = new Fader( window.context );
            }
            done();
        } );

        describe( '#new Fader( context )', function () {

            it( "should have audioContext available", function () {
                expect( fader.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 0", function () {
                expect( fader.minSources ).toBe( 0 );
            } );

            it( "should have a maximum number of sources as 0", function () {
                expect( fader.maxSources ).toBe( 0 );
            } );

            it( "should have atleast 1 input", function () {
                expect( fader.numberOfInputs ).toBeGreaterThan( 0 );
            } );

            it( "should have atleast 1 output", function () {
                expect( fader.numberOfOutputs ).toBeGreaterThan( 0 );
            } );

            it( "should have a model name as Fader", function () {
                expect( fader.effectName ).toBe( 'Fader' );
            } );

            it( "should be a BaseSound", function () {
                expect( fader ).toBeInstanceOf( BaseEffect );
            } );

            it( "should be have been initialized", function () {
                expect( fader.isInitialized ).toBe( true );
            } );
        } );

        describe( '#properties', function () {
            it( "should have a valid parameter volume", function () {

                expect( fader.volume ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    fader.volume = 0;
                } ).toThrowError();

                expect( function () {
                    delete fader.volume;
                } ).toThrowError();

                expect( fader.volume.name ).toBe( 'volume' );
                expect( fader.volume.value ).toBe( 100 );
                expect( fader.volume.minValue ).toBe( 0 );
                expect( fader.volume.maxValue ).toBe( 100 );

            } );

            it( "should have a valid parameter volumeInDB", function () {

                expect( fader.volumeInDB ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    fader.volumeInDB = 0;
                } ).toThrowError();

                expect( function () {
                    delete fader.volumeInDB;
                } ).toThrowError();

                expect( fader.volumeInDB.name ).toBe( 'volumeInDB' );
                expect( fader.volumeInDB.value ).toBe( 0 );
                expect( fader.volumeInDB.minValue ).toBe( -80 );
                expect( fader.volumeInDB.maxValue ).toBe( 0 );

            } );
        } );

        describe( '#connect/disconnect', function () {

            it( "have connect function defined", function () {
                expect( fader.connect ).toBeInstanceOf( Function );
            } );
            it( "have disconnect function defined", function () {
                expect( fader.disconnect ).toBeInstanceOf( Function );
            } );

        } );
    } );
} );
