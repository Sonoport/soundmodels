require( [ 'models/Looper', 'core/BaseSound', 'core/SPAudioParam' ], function ( Looper, BaseSound, SPAudioParam ) {
    "use strict";
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];

    describe( 'Looper.js', function () {

        var sound;

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
            sound = new Looper( context, listofSounds, null, function () {
                done();
            } );
        } );

        describe( '#new Looper( context )', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 1", function () {
                expect( sound.minSources )
                    .toBe( 1 );
            } );

            it( "should have a maximum number of sources as 1", function () {
                expect( sound.maxSources )
                    .toBeGreaterThan( 1 );
            } );

            it( "should have a model name as Looper", function () {
                expect( sound.modelName )
                    .toBe( "Looper" );
            } );

            it( "should be a BaseSound", function () {
                expect( sound )
                    .toBeInstanceOf( BaseSound );
            } );

            it( "should be have been initialized", function () {
                expect( sound.isInitialized )
                    .toBe( true );
            } );

        } );

        describe( '#properties', function () {

            it( "should have a valid parameter playspeed", function () {
                expect( sound.playSpeed )
                    .toBeInstanceOf( SPAudioParam );
                expect( sound.playSpeed.name )
                    .toBe( "playSpeed" );
                expect( sound.playSpeed.value )
                    .toBe( 1.0 );
                expect( sound.playSpeed.minValue )
                    .toBe( 0.0 );
                expect( sound.playSpeed.maxValue )
                    .toBe( 10.0 );
            } );

            it( "should have a valid parameter riseTime", function () {
                expect( sound.riseTime )
                    .toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.riseTime = 0;
                } )
                    .toThrowError();
                expect( function () {
                    delete sound.riseTime;
                } )
                    .toThrowError();
                expect( sound.riseTime.name )
                    .toBe( "riseTime" );
                expect( sound.riseTime.value )
                    .toBe( 0.05 );
                expect( sound.riseTime.minValue )
                    .toBe( 0.05 );
                expect( sound.riseTime.maxValue )
                    .toBe( 10.0 );
            } );

            it( "should have a valid parameter decayTime", function () {
                expect( sound.decayTime )
                    .toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.decayTime = 0;
                } )
                    .toThrowError();
                expect( function () {
                    delete sound.decayTime;
                } )
                    .toThrowError();
                expect( sound.decayTime.name )
                    .toBe( "decayTime" );
                expect( sound.decayTime.value )
                    .toBe( 0.05 );
                expect( sound.decayTime.minValue )
                    .toBe( 0.05 );
                expect( sound.decayTime.maxValue )
                    .toBe( 10.0 );
            } );

            it( "should have a valid parameter maxLoops", function () {
                expect( sound.maxLoops )
                    .toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.maxLoops = 0;
                } )
                    .toThrowError();
                expect( function () {
                    delete sound.maxLoops;
                } )
                    .toThrowError();
                expect( sound.maxLoops.name )
                    .toBe( "maxLoops" );
                expect( sound.maxLoops.value )
                    .toBe( -1 );
                expect( sound.maxLoops.minValue )
                    .toBe( -1 );
                expect( sound.maxLoops.maxValue )
                    .toBe( 1 );
            } );

            it( "should have a valid parameter startPoint", function () {
                expect( sound.startPoint )
                    .toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.startPoint = 0;
                } )
                    .toThrowError();
                expect( function () {
                    delete sound.startPoint;
                } )
                    .toThrowError();
                expect( sound.startPoint.name )
                    .toBe( "startPoint" );
                expect( sound.startPoint.value )
                    .toBe( 0 );
                expect( sound.startPoint.minValue )
                    .toBe( 0 );
                expect( sound.startPoint.maxValue )
                    .toBe( 0.99 );
            } );

            it( "should have a valid parameter multiTrackGain", function () {
                expect( sound.multiTrackGain )
                    .toBeInstanceOf( Array );
                expect( sound.multiTrackGain.length )
                    .toBe( listofSounds.length );
                expect( sound.multiTrackGain[ 0 ] )
                    .toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.multiTrackGain = 0;
                } )
                    .toThrowError();
                expect( function () {
                    delete sound.multiTrackGain;
                } )
                    .toThrowError();
                expect( sound.multiTrackGain[ 0 ].name )
                    .toBe( "gain" );
                expect( sound.multiTrackGain[ 0 ].value )
                    .toBe( 1 );
                expect( sound.multiTrackGain[ 0 ].minValue )
                    .toBe( 0 );
                expect( sound.multiTrackGain[ 0 ].maxValue )
                    .toBe( 1 );
            } );

        } );

        describe( '#connect/disconnect', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );
        } );

        describe( '#actions', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );
        } );

        describe( '#parameter', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext )
                    .toBeInstanceOf( AudioContext );
            } );
        } );

    } );
} );
