require( [ 'models/Looper' ], function ( Looper ) {
    "use strict";
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];

    describe( 'Looper.js', function () {

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
            var numSounds = parseInt( Math.random() * listofSounds.length );
            var sounds = listofSounds;
            var baseSound = new Looper( sounds, context );
            done();
        } );

        describe( '#new Looper( context )', function () {

            it( "should have audioContext available", function () {
                expect( baseSound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );
        } );

        describe( '#properties', function () {

            it( "should have audioContext available", function () {
                expect( baseSound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );
        } );

        describe( '#connect/disconnect', function () {

            it( "should have audioContext available", function () {
                expect( baseSound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );
        } );

        describe( '#actions', function () {

            it( "should have audioContext available", function () {
                expect( baseSound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );
        } );

        describe( '#parameter', function () {

            it( "should have audioContext available", function () {
                expect( baseSound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );
        } );

    } );
} );
