"use strict";
var Scrubber = require( 'models/Scrubber' );
if ( !window.context ) {
    window.context = new AudioContext();
}
var internalSpies = {
    onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
    onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
    onAudioStart: jasmine.createSpy( 'onAudioStart' ),
    onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
};
var listofSounds = [ 'audio/surf.mp3' ];

describe( 'Scrubber.js', function () {
    var scrubber;
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
        resetAllInternalSpies();
        if ( !scrubber ) {
            console.log( "Initing Scrubber.." );
            scrubber = new Scrubber( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } else {
            scrubber.stop();
            done();
        }
    } );

    function resetAllInternalSpies() {
        for ( var key in internalSpies ) {
            if ( internalSpies.hasOwnProperty( key ) && internalSpies[ key ].calls ) {
                internalSpies[ key ].calls.reset();
            }
        }
    }

    describe( '#new Scrubber( context )', function () {

        it( "should have audioContext available", function () {
            expect( scrubber.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( scrubber.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( scrubber.maxSources ).toBe( 1 );
        } );

        it( "should have no inputs", function () {
            expect( scrubber.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( scrubber.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Scrubber", function () {
            expect( scrubber.modelName ).toBe( 'Scrubber' );
        } );

        it( "should be a BaseSound", function () {
            expect( scrubber.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( scrubber.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            scrubber = new Scrubber( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            scrubber = new Scrubber( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( scrubber.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            scrubber.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            scrubber.setSources( listofSounds[ 0 ], progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            scrubber.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {

        it( "should have a valid parameter playPosition", function () {

            expect( scrubber.playPosition.isSPAudioParam ).toBe( true );

            expect( function () {
                scrubber.playPosition = 0;
            } ).toThrowError();

            expect( function () {
                delete scrubber.playPosition;
            } ).toThrowError();

            expect( scrubber.playPosition.name ).toBe( 'playPosition' );
            expect( scrubber.playPosition.value ).toBe( 0.0 );
            expect( scrubber.playPosition.minValue ).toBe( 0.0 );
            expect( scrubber.playPosition.maxValue ).toBe( 1.0 );

        } );

        it( "should have a valid parameter noMotionFade", function () {
            expect( scrubber.noMotionFade.isSPAudioParam ).toBe( true );

            expect( function () {
                scrubber.noMotionFade = 0;
            } ).toThrowError();
            expect( function () {
                delete scrubber.noMotionFade;
            } ).toThrowError();

            expect( scrubber.noMotionFade.name ).toBe( 'noMotionFade' );
            expect( scrubber.noMotionFade.value ).toBe( true );
            expect( scrubber.noMotionFade.minValue ).toBe( true );
            expect( scrubber.noMotionFade.maxValue ).toBe( false );

        } );

        it( "should have a valid parameter muteOnReverse", function () {
            expect( scrubber.muteOnReverse.isSPAudioParam ).toBe( true );
            expect( function () {
                scrubber.muteOnReverse = 0;
            } ).toThrowError();

            expect( function () {
                delete scrubber.muteOnReverse;
            } ).toThrowError();

            expect( scrubber.muteOnReverse.name ).toBe( 'muteOnReverse' );
            expect( scrubber.muteOnReverse.value ).toBe( true );
            expect( scrubber.muteOnReverse.minValue ).toBe( true );
            expect( scrubber.muteOnReverse.maxValue ).toBe( false );
        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( scrubber.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( scrubber.disconnect ).toBeInstanceOf( Function );
        } );
    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( scrubber.start ).toBeInstanceOf( Function );
            expect( scrubber.stop ).toBeInstanceOf( Function );
            expect( scrubber.play ).toBeInstanceOf( Function );
            expect( scrubber.pause ).toBeInstanceOf( Function );
            expect( scrubber.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                scrubber.start();
                scrubber.playPosition.value = 0.1;
            } ).not.toThrowError();

            setTimeout( function () {
                expect( scrubber.isPlaying ).toBe( true );
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    scrubber.stop();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( scrubber.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be play/pause audio", function ( done ) {
            var randomPlay;
            expect( function () {
                scrubber.play();
                scrubber.playPosition.value = 0;
                randomPlay = window.setInterval( function () {
                    scrubber.playPosition.value += Math.random() / 10;
                }, 100 );
            } ).not.toThrowError();

            setTimeout( function () {
                expect( scrubber.isPlaying ).toBe( true );
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    window.clearInterval( randomPlay );
                    scrubber.pause();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( scrubber.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    scrubber.onAudioStart = internalSpies.onAudioStart;
                    scrubber.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        scrubber.play();
                        scrubber.playPosition.value = 0;
                        randomPlay = window.setInterval( function () {
                            scrubber.playPosition.value += Math.random() / 10;
                        }, 100 );
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( scrubber.isPlaying ).toBe( true );
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                        expect( function () {
                            window.clearInterval( randomPlay );
                            scrubber.pause();
                        } ).not.toThrowError();

                        setTimeout( function () {
                            expect( scrubber.isPlaying ).toBe( false );
                            expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            var randomPlay;

            expect( function () {
                scrubber.play();
                scrubber.playPosition.value = 0;
                randomPlay = window.setInterval( function () {
                    scrubber.playPosition.value += Math.random() / 10;
                }, 100 );
            } ).not.toThrowError();

            setTimeout( function () {
                expect( scrubber.isPlaying ).toBe( true );
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    window.clearInterval( randomPlay );
                    scrubber.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( scrubber.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );
    } );
} );
