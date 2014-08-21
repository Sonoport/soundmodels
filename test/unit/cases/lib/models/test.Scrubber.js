"use strict";
require( [ 'models/Scrubber', 'core/BaseSound', 'core/SPAudioParam' ], function ( Scrubber, BaseSound, SPAudioParam ) {
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    var listofSounds = [ 'audio/surf.mp3' ];

    describe( 'Scrubber.js', function () {
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
            sound = new Scrubber( context, listofSounds, null, function () {
                done();
            } );
        } );
        describe( '#new Scrubber( context )', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 1", function () {
                expect( sound.minSources ).toBe( 1 );
            } );

            it( "should have a maximum number of sources as 1", function () {
                expect( sound.maxSources ).toBe( 1 );
            } );

            it( "should have a model name as Scrubber", function () {
                expect( sound.modelName ).toBe( "Scrubber" );
            } );

            it( "should be a BaseSound", function () {
                expect( sound ).toBeInstanceOf( BaseSound );
            } );

            it( "should be have been initialized", function () {
                expect( sound.isInitialized ).toBe( true );
            } );
        } );
        describe( '#properties', function () {

            it( "should have a valid parameter playPosition", function () {

                expect( sound.playPosition ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.playPosition = 0;
                } ).toThrowError();

                expect( function () {
                    delete sound.playPosition;
                } ).toThrowError();

                expect( sound.playPosition.name ).toBe( "playPosition" );
                expect( sound.playPosition.value ).toBe( 0.0 );
                expect( sound.playPosition.minValue ).toBe( 0.0 );
                expect( sound.playPosition.maxValue ).toBe( 1.0 );

            } );

            it( "should have a valid parameter noMotionFade", function () {
                expect( sound.noMotionFade ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.noMotionFade = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.noMotionFade;
                } ).toThrowError();

                expect( sound.noMotionFade.name ).toBe( "noMotionFade" );
                expect( sound.noMotionFade.value ).toBe( true );
                expect( sound.noMotionFade.minValue ).toBe( true );
                expect( sound.noMotionFade.maxValue ).toBe( false );

            } );

            it( "should have a valid parameter muteOnReverse", function () {
                expect( sound.muteOnReverse ).toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.muteOnReverse = 0;
                } ).toThrowError();

                expect( function () {
                    delete sound.muteOnReverse;
                } ).toThrowError();

                expect( sound.muteOnReverse.name ).toBe( "muteOnReverse" );
                expect( sound.muteOnReverse.value ).toBe( true );
                expect( sound.muteOnReverse.minValue ).toBe( true );
                expect( sound.muteOnReverse.maxValue ).toBe( false );

            } );
        } );

        describe( '#connect/disconnect', function () {

            it( "have connect function defined", function () {
                expect( sound.connect ).toBeInstanceOf( Function );
            } );
            it( "have disconnect function defined", function () {
                expect( sound.connect ).toBeInstanceOf( Function );
            } );

        } );

        describe( '#actions', function () {
            it( "should have start/stop/play/pause/release defined", function () {
                expect( sound.start ).toBeInstanceOf( Function );
                expect( sound.stop ).toBeInstanceOf( Function );
                expect( sound.play ).toBeInstanceOf( Function );
                expect( sound.pause ).toBeInstanceOf( Function );
                expect( sound.release ).toBeInstanceOf( Function );
            } );

            it( "should be start/stop audio", function ( done ) {
                expect( function () {
                    sound.start();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.stop();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                done();
            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.pause();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );

                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.pause();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                done();
            } );

            it( "should be play/release audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( sound.isPlaying ).toBe( false );
                    done();
                }, 1000 );
            } );
        } );
    } );
} );
