"use strict";
var SPAudioParam = require( 'core/SPAudioParam' );
console.log( "Running SPAudioParam Test... " );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}

describe( 'SPAudioParam.js', function () {

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
        it( "should be able to create a new SPAudioParam", function () {
            var param;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', 0.0, 10, 1, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.name )
                .toBeDefined();
            expect( param.defaultValue )
                .toBeDefined();
        } );
    } );

    describe( 'value property ', function () {
        it( "should be able accept a value property between max and min", function () {
            var param;
            var max = 10;
            var min = 1;
            var value = ( Math.random() * ( max - min ) ) + min;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', min, max, value, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.value )
                .toBe( value );
        } );

        it( "should be clamped if the value is below min", function () {
            var param;
            var max = 10;
            var min = 1;
            var value = min - Math.random() * max;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', min, max, value, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.value )
                .toBe( min );
        } );

        it( "should be clamped if the value is above max", function () {
            var param;
            var max = 10;
            var min = 1;
            var value = Math.random() * max + max;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', min, max, value, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.value )
                .toBe( max );
        } );
    } );

    describe( 'mappingFunction', function () {
        it( "should be called on the set value", function () {
            var param;
            var max = 10;
            var min = 1;
            var mappingFunction = jasmine.createSpy( 'mappingFunction' );
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', min, max, 1, null, mappingFunction, null, context );
                } )
                .not.toThrowError();

            var value = ( Math.random() * ( max - min ) ) + min;
            param.value = value;
            expect( mappingFunction )
                .toHaveBeenCalledWith( value );
        } );
    } );

    describe( 'setter', function () {
        it( "should be called on the set value", function () {
            var param;
            var max = 10;
            var min = 1;
            var setter = jasmine.createSpy( 'setter' );
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', 0.0, 10, 1, null, null, setter, context );
                    var value = ( Math.random() * ( max - min ) ) + min;
                    param.value = value;
                    expect( setter )
                        .toHaveBeenCalledWith( null, value, context );
                } )
                .not.toThrowError();
        } );
    } );

    describe( 'parameter automation', function () {
        it( " should be defined", function () {
            var param;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', 0.0, 10, 1, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.setValueAtTime )
                .toBeDefined();
            expect( param.setTargetAtTime )
                .toBeDefined();
            expect( param.setValueCurveAtTime )
                .toBeDefined();
            expect( param.linearRampToValueAtTime )
                .toBeDefined();
            expect( param.exponentialRampToValueAtTime )
                .toBeDefined();
            expect( param.cancelScheduledValues )
                .toBeDefined();
        } );
    } );
} );
