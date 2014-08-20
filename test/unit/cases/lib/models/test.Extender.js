"use strict";
require( [ 'models/Extender', 'core/BaseSound', 'core/SPAudioParam' ], function ( Extender, BaseSound, SPAudioParam ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var listofSounds = [ 'audio/surf.mp3' ];
    describe( 'Extender.js', function () {
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
            sound = new Extender( context, listofSounds, null, function () {
                done();
            } );
        } );
        describe( '#new Extender( context )', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 1", function () {
                expect( sound.minSources ).toBe( 1 );
            } );

            it( "should have a maximum number of sources as 1", function () {
                expect( sound.maxSources ).toBe( 1 );
            } );

            it( "should have a model name as Extender", function () {
                expect( sound.modelName ).toBe( "Extender" );
            } );

            it( "should be a BaseSound", function () {
                expect( sound ).toBeInstanceOf( BaseSound );
            } );

            it( "should be have been initialized", function () {
                expect( sound.isInitialized ).toBe( true );
            } );
        } );
        describe( '#properties', function () {

            it( "should have a valid parameter pitchShift", function () {

                expect( sound.pitchShift ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.pitchShift = 0;
                } ).toThrowError();

                expect( function () {
                    delete sound.pitchShift;
                } ).toThrowError();

                expect( sound.pitchShift.name ).toBe( "pitchShift" );
                expect( sound.pitchShift.value ).toBe( 0 );
                expect( sound.pitchShift.minValue ).toBe( -60 );
                expect( sound.pitchShift.maxValue ).toBe( 60 );

            } );

            it( "should have a valid parameter eventPeriod", function () {
                expect( sound.eventPeriod ).toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.eventPeriod = 0;
                } ).toThrowError();

                expect( function () {
                    delete sound.eventPeriod;
                } ).toThrowError();

                expect( sound.eventPeriod.name ).toBe( "eventPeriod" );
                expect( sound.eventPeriod.value ).toBe( 2.0 );
                expect( sound.eventPeriod.minValue ).toBe( 0.1 );
                expect( sound.eventPeriod.maxValue ).toBe( 10 );

            } );

            it( "should have a valid parameter crossFadeDuration", function () {
                expect( sound.crossFadeDuration ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.crossFadeDuration = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.crossFadeDuration;
                } ).toThrowError();

                expect( sound.crossFadeDuration.name ).toBe( "crossFadeDuration" );
                expect( sound.crossFadeDuration.value ).toBe( 0.5 );
                expect( sound.crossFadeDuration.minValue ).toBe( 0.1 );
                expect( sound.crossFadeDuration.maxValue ).toBe( 0.99 );

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

var queueSpies = {
    queueStart: jasmine.createSpy( 'queueStart' ),
    queueRelease: jasmine.createSpy( 'queueRelease' ),
    queueSetParameter: jasmine.createSpy( 'queueSetParameter' ),
    queueSetSource: jasmine.createSpy( 'queueSetSource' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    pause: jasmine.createSpy( 'pause' ),
    stop: jasmine.createSpy( 'stop' )
};

var queueStub = {
    "core/SoundQueue": function () {
        return {
            connect: queueSpies.connect,
            disconnect: queueSpies.disconnect,
            pause: queueSpies.pause,
            stop: queueSpies.stop,
            queueStart: queueSpies.queueStart,
            queueRelease: queueSpies.queueRelease,
            queueSetSource: queueSpies.queueSetSource,
            queueSetParameter: queueSpies.queueSetParameter
        };
    }
};

var requireWithStubbedSource = stubbedRequire( queueStub );
requireWithStubbedSource( [ 'models/Extender', 'core/BaseSound', 'core/SPAudioParam' ], function ( Extender, BaseSound, SPAudioParam ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var listofSounds = [ 'audio/surf.mp3' ];

    describe( 'Extender.js with stubbed Queue', function () {
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
            resetAllSourceSpies();
            sound = new Extender( context, listofSounds, null, function () {
                done();
            } );
        } );

        function resetAllSourceSpies() {
            for ( var key in queueSpies ) {
                if ( queueSpies.hasOwnProperty( key ) && queueSpies[ key ].calls ) {
                    queueSpies[ key ].calls.reset();
                }
            }
        }
        describe( '#new Extender( context ) ', function () {
            it( "should have audioContext available", function () {
                expect( sound.audioContext ).toBeInstanceOf( AudioContext );
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
                setTimeout( function () {
                    expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                    expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                    expect( queueSpies.queueStart ).toHaveBeenCalled();
                }, 2000 );

                expect( function () {
                    sound.stop();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( queueSpies.pause ).toHaveBeenCalled();
                }, 2000 );
                done();
            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                    expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                    expect( queueSpies.queueStart ).toHaveBeenCalled();
                    expect( sound.isPlaying ).toBe( true );

                    expect( function () {
                        sound.pause();
                    } ).not.toThrowError();

                    expect( sound.isPlaying ).toBe( false );

                    setTimeout( function () {
                        expect( queueSpies.pause ).toHaveBeenCalled();

                        queueSpies.queueSetSource.calls.reset();
                        queueSpies.queueSetParameter.calls.reset();
                        queueSpies.queueSetSource.calls.reset();
                        queueSpies.pause.calls.reset();

                        expect( function () {
                            sound.play();
                        } ).not.toThrowError();

                        setTimeout( function () {
                            expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                            expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                            expect( queueSpies.queueStart ).toHaveBeenCalled();
                            expect( sound.isPlaying ).toBe( true );

                            expect( function () {
                                sound.pause();
                            } ).not.toThrowError();

                            expect( sound.isPlaying ).toBe( false );
                            setTimeout( function () {
                                expect( queueSpies.pause ).toHaveBeenCalled();
                                done();
                            }, 1000 );
                        }, 1000 );
                    }, 1000 );
                }, 1000 );

            } );

            it( "should be play/release audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();

                expect( function () {
                    sound.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( sound.isPlaying ).toBe( false );
                    expect( queueSpies.pause ).toHaveBeenCalled();
                    done();
                }, 1000 );
            } );
        } );
    } );
} );
