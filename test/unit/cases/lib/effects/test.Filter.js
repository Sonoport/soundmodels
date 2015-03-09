"use strict";
var Filter = require( 'effects/Filter' );
if ( !window.context ) {
    window.context = new AudioContext();
}
describe( 'Filter.js', function () {
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
            console.log( "Initing Filter.." );
            filter = new Filter( window.context );
        }
        done();
    } );

    describe( '#new Filter( context )', function () {

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

        it( "should have a model name as Filter", function () {
            expect( filter.effectName ).toBe( 'Filter' );
        } );

        it( "should be a BaseEffect", function () {
            expect( filter.isBaseEffect ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( filter.isInitialized ).toBe( true );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter frequency", function () {

            expect( filter.frequency.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.frequency = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.frequency;
            } ).toThrowError();

            expect( filter.frequency.name ).toBe( 'frequency' );
            expect( filter.frequency.value ).toBe( 350 );
            expect( filter.frequency.minValue ).toBe( 10 );
            expect( filter.frequency.maxValue ).toBe( filter.audioContext.sampleRate / 2 );

        } );

        it( "should have a valid parameter detune", function () {

            expect( filter.detune.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.detune = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.detune;
            } ).toThrowError();

            expect( filter.detune.name ).toBe( 'detune' );
            expect( filter.detune.value ).toBe( 0 );
            expect( filter.detune.minValue ).toBe( -1200 );
            expect( filter.detune.maxValue ).toBe( 1200 );

        } );

        it( "should have a valid parameter Q", function () {

            expect( filter.Q.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.Q = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.Q;
            } ).toThrowError();

            expect( filter.Q.name ).toBe( 'Q' );
            expect( filter.Q.value ).toBe( 1 );
            expect( filter.Q.minValue ).toBe( 0.0001 );
            expect( filter.Q.maxValue ).toBe( 1000 );

        } );

        it( "should have a valid parameter type", function () {

            expect( filter.type.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.type = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.type;
            } ).toThrowError();

            expect( filter.type.name ).toBe( 'type' );
            expect( filter.type.value ).toBe( 'lowpass' );
            expect( filter.type.minValue ).toBe( 'lowpass' );
            expect( filter.type.maxValue ).toBe( 'allpass' );

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
