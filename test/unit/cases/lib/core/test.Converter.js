"use strict";
var Converter = require( 'core/Converter' );
console.log( "Running Converter Test... " );
describe( 'Converter.js', function () {
    describe( '#Class{}', function () {
        it( "should be able to convert semitones to ratio correctly", function () {
            expect( Converter.semitonesToRatio( 12 ) )
                .toBe( 2 );
            expect( Converter.semitonesToRatio( -60 ) )
                .toBe( 1 / 32 );
            expect( Converter.semitonesToRatio( 60 ) )
                .toBe( 32 );
            expect( Converter.semitonesToRatio( 36 ) )
                .toBe( 8 );
            expect( Converter.semitonesToRatio( -36 ) )
                .toBe( 1 / 8 );
            expect( Converter.semitonesToRatio( 0 ) )
                .toBe( 1 );
        } );
    } );
} );
