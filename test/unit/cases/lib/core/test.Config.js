"use strict";
var Config = require( 'core/Config' );
console.log( "Running Config Test... " );
describe( 'Config.js', function () {
    describe( '#Class{}', function () {
        it( "should have maximum number of voices supported default to 8", function () {
            expect( Config.MAX_VOICES )
                .toBe( 8 );
        } );

        it( "should have default nominal refresh rate (Hz) for SoundQueue to 60", function () {
            expect( Config.NOMINAL_REFRESH_RATE )
                .toBe( 60 );
        } );
    } );
} );
