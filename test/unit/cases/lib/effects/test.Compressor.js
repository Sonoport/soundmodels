"use strict";
var Compressor = require( 'effects/Compressor' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
describe( 'Compressor.js', function () {
    var filter;
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
        if ( !filter ) {
            console.log( "Initing Compressor.." );
            filter = new Compressor( window.context );
        }
        done();
    } );

    describe( '#new Compressor( context )', function () {

        it( "should have audioContext available", function () {
            expect( filter.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 0", function () {
            expect( filter.minSources ).toBe( 0 );
        } );

        it( "should have a maximum number of sources as 0", function () {
            expect( filter.maxSources ).toBe( 0 );
        } );

        it( "should have atleast 1 input", function () {
            expect( filter.numberOfInputs ).toBeGreaterThan( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( filter.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Compressor", function () {
            expect( filter.effectName ).toBe( 'Compressor' );
        } );

        it( "should be a BaseEffect", function () {
            expect( filter.isBaseEffect ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( filter.isInitialized ).toBe( true );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter attack", function () {

            expect( filter.attack.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.attack = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.attack;
            } ).toThrowError();

            expect( filter.attack.name ).toBe( 'attack' );
            expect( filter.attack.value ).toBe( 0.003 );
            expect( filter.attack.minValue ).toBe( 0 );
            expect( filter.attack.maxValue ).toBe( 1 );

        } );

        it( "should have a valid parameter knee", function () {

            expect( filter.knee.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.knee = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.knee;
            } ).toThrowError();

            expect( filter.knee.name ).toBe( 'knee' );
            expect( filter.knee.value ).toBe( 30 );
            expect( filter.knee.minValue ).toBe( 0 );
            expect( filter.knee.maxValue ).toBe( 40 );

        } );

        it( "should have a valid parameter ratio", function () {

            expect( filter.ratio.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.ratio = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.ratio;
            } ).toThrowError();

            expect( filter.ratio.name ).toBe( 'ratio' );
            expect( filter.ratio.value ).toBe( 12 );
            expect( filter.ratio.minValue ).toBe( 0 );
            expect( filter.ratio.maxValue ).toBe( 20 );

        } );

        it( "should have a valid parameter release", function () {

            expect( filter.release.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.release = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.release;
            } ).toThrowError();

            expect( filter.release.name ).toBe( 'release' );
            expect( filter.release.value ).toBe( 0.25 );
            expect( filter.release.minValue ).toBe( 0 );
            expect( filter.release.maxValue ).toBe( 1 );

        } );

        it( "should have a valid parameter threshold", function () {

            expect( filter.threshold.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.threshold = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.threshold;
            } ).toThrowError();

            expect( filter.threshold.name ).toBe( 'threshold' );
            expect( filter.threshold.value ).toBe( -24 );
            expect( filter.threshold.minValue ).toBe( -100 );
            expect( filter.threshold.maxValue ).toBe( 0 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( filter.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( filter.disconnect ).toBeInstanceOf( Function );
        } );

    } );
} );
