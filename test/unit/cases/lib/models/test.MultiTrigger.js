"use strict";
require( [ 'models/MultiTrigger', 'core/BaseSound', 'core/SPAudioParam' ], function ( MultiTrigger, BaseSound, SPAudioParam ) {
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    var internalSpies = {
        onLoadProgress: jasmine.createSpy( "onLoadProgress" ),
        onLoadComplete: jasmine.createSpy( "onLoadComplete" ),
        onSoundStarted: jasmine.createSpy( "onSoundStarted" ),
        onSoundEnded: jasmine.createSpy( "onSoundEnded" )
    };
    var listofSounds = [ 'audio/Hit5.mp3', 'audio/Hit6.mp3', 'audio/Hit7.mp3', 'audio/Hit8.mp3' ];
    describe( 'MultiTrigger.js', function () {
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
            resetAllInternalSpies();
            if ( !sound ) {
                console.log( "Initing MultiTrigger.." );
                sound = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                    internalSpies.onLoadComplete();
                    done();
                }, internalSpies.onSoundStarted, internalSpies.onSoundEnded );
            } else {
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

        describe( '#new MultiTrigger( context )', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 1", function () {
                expect( sound.minSources ).toBe( 1 );
            } );

            it( "should have a maximum number of sources as 1", function () {
                expect( sound.maxSources ).toBe( 8 );
            } );

            it( "should have a model name as MultiTrigger", function () {
                expect( sound.modelName ).toBe( "MultiTrigger" );
            } );

            it( "should be a BaseSound", function () {
                expect( sound ).toBeInstanceOf( BaseSound );
            } );

            it( "should be have been initialized", function () {
                expect( sound.isInitialized ).toBe( true );
            } );

            it( "should have called progress events", function ( done ) {
                sound = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                    internalSpies.onLoadComplete();
                    expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                    done();
                }, internalSpies.onSoundStarted, internalSpies.onSoundEnded );
            } );

            it( "should have called load events", function ( done ) {
                sound = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                    internalSpies.onLoadComplete();
                    expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                    done();
                }, internalSpies.onSoundStarted, internalSpies.onSoundEnded );
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

            it( "should have a valid parameter pitchRand", function () {
                expect( sound.pitchRand ).toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.pitchRand = 0;
                } ).toThrowError();

                expect( function () {
                    delete sound.pitchRand;
                } ).toThrowError();

                expect( sound.pitchRand.name ).toBe( "pitchRand" );
                expect( sound.pitchRand.value ).toBe( 0 );
                expect( sound.pitchRand.minValue ).toBe( 0 );
                expect( sound.pitchRand.maxValue ).toBe( 24 );

            } );

            it( "should have a valid parameter eventRand", function () {
                expect( sound.eventRand ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.eventRand = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.eventRand;
                } ).toThrowError();

                expect( sound.eventRand.name ).toBe( "eventRand" );
                expect( sound.eventRand.value ).toBe( false );
                expect( sound.eventRand.minValue ).toBe( true );
                expect( sound.eventRand.maxValue ).toBe( false );

            } );

            it( "should have a valid parameter eventRate", function () {
                expect( sound.eventRate ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.eventRate = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.eventRate;
                } ).toThrowError();

                expect( sound.eventRate.name ).toBe( "eventRate" );
                expect( sound.eventRate.value ).toBe( 10.0 );
                expect( sound.eventRate.minValue ).toBe( 0.0 );
                expect( sound.eventRate.maxValue ).toBe( 60.0 );

            } );

            it( "should have a valid parameter eventJitter", function () {
                expect( sound.eventJitter ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.eventJitter = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.eventJitter;
                } ).toThrowError();

                expect( sound.eventJitter.name ).toBe( "eventJitter" );
                expect( sound.eventJitter.value ).toBe( 0.0 );
                expect( sound.eventJitter.minValue ).toBe( 0.0 );
                expect( sound.eventJitter.maxValue ).toBe( 0.99 );

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
                setTimeout( function () {
                    expect( internalSpies.onSoundStarted ).toHaveBeenCalled();
                    expect( function () {
                        sound.stop();
                    } ).not.toThrowError();

                    expect( sound.isPlaying ).toBe( false );
                    setTimeout( function () {
                        expect( internalSpies.onSoundEnded ).toHaveBeenCalled();
                        done();
                    }, 1000 );
                }, 1000 );
            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( internalSpies.onSoundStarted ).toHaveBeenCalled();

                    expect( function () {
                        sound.pause();
                    } ).not.toThrowError();

                    expect( sound.isPlaying ).toBe( false );
                    setTimeout( function () {
                        expect( internalSpies.onSoundEnded ).toHaveBeenCalled();

                        internalSpies.onSoundStarted.calls.reset();
                        internalSpies.onSoundEnded.calls.reset();

                        expect( function () {
                            sound.play();
                        } ).not.toThrowError();

                        expect( sound.isPlaying ).toBe( true );

                        setTimeout( function () {
                            expect( internalSpies.onSoundStarted ).toHaveBeenCalled();
                            expect( function () {
                                sound.pause();
                            } ).not.toThrowError();

                            expect( sound.isPlaying ).toBe( false );
                            setTimeout( function () {
                                expect( internalSpies.onSoundEnded ).toHaveBeenCalled();
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
                setTimeout( function () {
                    expect( internalSpies.onSoundStarted ).toHaveBeenCalled();

                    expect( function () {
                        sound.release();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( sound.isPlaying ).toBe( false );
                        expect( internalSpies.onSoundEnded ).toHaveBeenCalled();
                        done();
                    }, 1500 );
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
    queueUpdate: jasmine.createSpy( 'queueUpdate' ),
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
            queueUpdate: queueSpies.queueUpdate,
            queueRelease: queueSpies.queueRelease,
            queueSetSource: queueSpies.queueSetSource,
            queueSetParameter: queueSpies.queueSetParameter
        };
    }
};

var requireWithStubbedSource = stubbedRequire( queueStub );
requireWithStubbedSource( [ 'models/MultiTrigger', 'core/BaseSound', 'core/SPAudioParam' ], function ( MultiTrigger, BaseSound, SPAudioParam ) {
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];

    describe( 'MultiTrigger.js with stubbed Queue', function () {
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
            if ( !sound ) {
                sound = new MultiTrigger( window.context, listofSounds, null, function () {
                    done();
                } );
            } else {
                done();
            }
        } );

        function resetAllSourceSpies() {
            for ( var key in queueSpies ) {
                if ( queueSpies.hasOwnProperty( key ) && queueSpies[ key ].calls ) {
                    queueSpies[ key ].calls.reset();
                }
            }
        }
        describe( '#new MultiTrigger( context ) ', function () {
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
