"use strict";
var Distorter = require( 'effects/Distorter' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
describe( 'Distorter.js', function () {
    var distorter;
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
        if ( !distorter ) {
            console.log( "Initing Distorter.." );
            distorter = new Distorter( window.context );
        }
        done();
    } );

    describe( '#new Distorter( context )', function () {

        it( "should have audioContext available", function () {
            expect( distorter.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 0", function () {
            expect( distorter.minSources ).toBe( 0 );
        } );

        it( "should have a maximum number of sources as 0", function () {
            expect( distorter.maxSources ).toBe( 0 );
        } );

        it( "should have atleast 1 input", function () {
            expect( distorter.numberOfInputs ).toBeGreaterThan( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( distorter.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Distorter", function () {
            expect( distorter.effectName ).toBe( 'Distorter' );
        } );

        it( "should be a BaseEffect", function () {
            expect( distorter.isBaseEffect ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( distorter.isInitialized ).toBe( true );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter drive", function () {

            expect( distorter.drive.isSPAudioParam ).toBe( true );

            expect( function () {
                distorter.drive = 0;
            } ).toThrowError();

            expect( function () {
                delete distorter.drive;
            } ).toThrowError();

            expect( distorter.drive.name ).toBe( 'drive' );
            expect( distorter.drive.value ).toBe( 0.5 );
            expect( distorter.drive.minValue ).toBe( 0 );
            expect( distorter.drive.maxValue ).toBe( 1.0 );

        } );

        it( "should have a valid parameter color", function () {

            expect( distorter.color.isSPAudioParam ).toBe( true );

            expect( function () {
                distorter.color = 0;
            } ).toThrowError();

            expect( function () {
                delete distorter.color;
            } ).toThrowError();

            expect( distorter.color.name ).toBe( 'color' );
            expect( distorter.color.value ).toBe( 800 );
            expect( distorter.color.minValue ).toBe( 0 );
            expect( distorter.color.maxValue ).toBe( 22050 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( distorter.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( distorter.disconnect ).toBeInstanceOf( Function );
        } );

    } );
} );
