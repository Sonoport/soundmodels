"use strict";
require( [ 'models/Looper', 'core/BaseSound', 'core/SPAudioParam' ], function ( Looper, BaseSound, SPAudioParam ) {
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
    describe( 'Looper.js', function () {
        var sound;
        var internalSpies = {
            onLoadProgress: jasmine.createSpy( "onLoadProgress" ),
            onLoadComplete: jasmine.createSpy( "onLoadComplete" ),
            onSoundStarted: jasmine.createSpy( "onSoundStarted" ),
            onSoundEnded: jasmine.createSpy( "onSoundEnded" )
        };
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
            sound = new Looper( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                done();
            }, internalSpies.onSoundStarted, internalSpies.onSoundEnded );
        } );

        function resetAllInternalSpies() {
            for ( var key in internalSpies ) {
                if ( internalSpies.hasOwnProperty( key ) && internalSpies[ key ].calls ) {
                    internalSpies[ key ].calls.reset();
                }
            }
        }

        describe( '#new Looper( context )', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 1", function () {
                expect( sound.minSources ).toBe( 1 );
            } );

            it( "should have a maximum number of sources as 1", function () {
                expect( sound.maxSources ).toBeGreaterThan( 1 );
            } );

            it( "should have a model name as Looper", function () {
                expect( sound.modelName ).toBe( "Looper" );
            } );

            it( "should be a BaseSound", function () {
                expect( sound ).toBeInstanceOf( BaseSound );
            } );

            it( "should be have been initialized", function () {
                expect( sound.isInitialized ).toBe( true );
            } );

            it( "should have called progress events", function () {
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
            } );

            it( "should have called load events", function () {
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
            } );

        } );
        describe( '#properties', function () {
            it( "should have a valid parameter playspeed", function () {

                expect( sound.playSpeed ).toBeInstanceOf( SPAudioParam );
                expect( sound.playSpeed.name ).toBe( "playSpeed" );
                expect( sound.playSpeed.value ).toBe( 1.0 );
                expect( sound.playSpeed.minValue ).toBe( 0.0 );
                expect( sound.playSpeed.maxValue ).toBe( 10.0 );

            } );

            it( "should have a valid parameter riseTime", function () {

                expect( sound.riseTime ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.riseTime = 0;
                } ).toThrowError();

                expect( function () {
                    delete sound.riseTime;
                } ).toThrowError();

                expect( sound.riseTime.name ).toBe( "riseTime" );
                expect( sound.riseTime.value ).toBe( 0.05 );
                expect( sound.riseTime.minValue ).toBe( 0.05 );
                expect( sound.riseTime.maxValue ).toBe( 10.0 );

            } );

            it( "should have a valid parameter decayTime", function () {
                expect( sound.decayTime ).toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.decayTime = 0;
                } ).toThrowError();

                expect( function () {
                    delete sound.decayTime;
                } ).toThrowError();

                expect( sound.decayTime.name ).toBe( "decayTime" );
                expect( sound.decayTime.value ).toBe( 0.05 );
                expect( sound.decayTime.minValue ).toBe( 0.05 );
                expect( sound.decayTime.maxValue ).toBe( 10.0 );

            } );

            it( "should have a valid parameter maxLoops", function () {
                expect( sound.maxLoops ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.maxLoops = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.maxLoops;
                } ).toThrowError();

                expect( sound.maxLoops.name ).toBe( "maxLoops" );
                expect( sound.maxLoops.value ).toBe( -1 );
                expect( sound.maxLoops.minValue ).toBe( -1 );
                expect( sound.maxLoops.maxValue ).toBe( 1 );

            } );

            it( "should have a valid parameter startPoint", function () {
                expect( sound.startPoint ).toBeInstanceOf( SPAudioParam );
                expect( function () {
                    sound.startPoint = 0;
                } ).toThrowError();

                expect( function () {
                    delete sound.startPoint;
                } ).toThrowError();

                expect( sound.startPoint.name ).toBe( "startPoint" );
                expect( sound.startPoint.value ).toBe( 0 );
                expect( sound.startPoint.minValue ).toBe( 0 );
                expect( sound.startPoint.maxValue ).toBe( 0.99 );

            } );

            it( "should have a valid parameter multiTrackGain", function () {
                expect( sound.multiTrackGain ).toBeInstanceOf( Array );
                expect( sound.multiTrackGain.length ).toBe( listofSounds.length );
                expect( sound.multiTrackGain[ 0 ] ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.multiTrackGain = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.multiTrackGain;
                } ).toThrowError();

                expect( sound.multiTrackGain[ 0 ].name ).toBe( "gain" );
                expect( sound.multiTrackGain[ 0 ].value ).toBe( 1 );
                expect( sound.multiTrackGain[ 0 ].minValue ).toBe( 0 );
                expect( sound.multiTrackGain[ 0 ].maxValue ).toBe( 1 );

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

                setTimeout( function () {
                    expect( internalSpies.onSoundStarted ).toHaveBeenCalled();
                }, 1000 );
                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.stop();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onSoundEnded ).toHaveBeenCalled();
                    done();
                }, 1000 );

            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( internalSpies.onSoundStarted ).toHaveBeenCalled();
                }, 1000 );

                expect( function () {
                    sound.pause();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( internalSpies.onSoundEnded ).toHaveBeenCalled();
                }, 1000 );
                expect( sound.isPlaying ).toBe( false );

                internalSpies.onSoundStarted.calls.reset();
                internalSpies.onSoundEnded.calls.reset();

                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( internalSpies.onSoundStarted ).toHaveBeenCalled();
                }, 1000 );
                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.pause();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onSoundEnded ).toHaveBeenCalled();
                    done();
                }, 1000 );
            } );

            it( "should be play/release audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( internalSpies.onSoundStarted ).toHaveBeenCalled();
                }, 1000 );

                expect( function () {
                    sound.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( sound.isPlaying ).toBe( false );
                    expect( internalSpies.onSoundEnded ).toHaveBeenCalled();
                    done();
                }, 1000 );
            } );
        } );
    } );
} );

var sourceSpies = {
    start: jasmine.createSpy( 'start' ),
    stop: jasmine.createSpy( 'stop' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    resetBufferSource: jasmine.createSpy( 'resetBuffer' )
};

var sourceStub = {
    "core/SPAudioBufferSourceNode": function () {
        return {
            playbackRate: {
                value: 1.0,
                defaultValue: 0
            },
            connect: sourceSpies.connect,
            disconnect: sourceSpies.disconnect,
            start: sourceSpies.start,
            stop: function ( when ) {
                this.onended();
                sourceSpies.stop( when );
            },
            resetBufferSource: sourceSpies.resetBufferSource,
        };
    }
};

var requireWithStubbedSource = stubbedRequire( sourceStub );
requireWithStubbedSource( [ 'models/Looper', 'core/BaseSound', 'core/SPAudioParam' ], function ( Looper, BaseSound, SPAudioParam ) {
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
    describe( 'Looper.js with stubbed Source', function () {
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
            sound = new Looper( context, listofSounds, null, function () {
                done();
            } );
        } );

        function resetAllSourceSpies() {
            for ( var key in sourceSpies ) {
                if ( sourceSpies.hasOwnProperty( key ) && sourceSpies[ key ].calls ) {
                    sourceSpies[ key ].calls.reset();
                }
            }
        }
        describe( '#new Looper( context ) ', function () {
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
                expect( sourceSpies.start ).toHaveBeenCalled();

                expect( function () {
                    sound.stop();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                expect( sourceSpies.stop ).toHaveBeenCalled();
                done();
            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sourceSpies.start ).toHaveBeenCalled();
                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.pause();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                expect( sourceSpies.stop ).toHaveBeenCalled();
                setTimeout( function () {
                    expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                }, 1000 );

                sourceSpies.start.calls.reset();
                sourceSpies.stop.calls.reset();
                sourceSpies.resetBufferSource.calls.reset();

                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );
                expect( sourceSpies.start ).toHaveBeenCalled();

                expect( function () {
                    sound.pause();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                expect( sourceSpies.stop ).toHaveBeenCalled();
                setTimeout( function () {
                    expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                    done();
                }, 1000 );

            } );

            it( "should be play/release audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );
                expect( sourceSpies.start ).toHaveBeenCalled();

                expect( function () {
                    sound.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( sound.isPlaying ).toBe( false );
                    expect( sourceSpies.stop ).toHaveBeenCalled();
                    expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                    done();
                }, 1000 );
            } );

            it( "should be pass parameters from start to source", function ( done ) {
                var when = Math.random();
                var offset = Math.random() / 2;
                var duration = Math.random() * 2;
                expect( function () {
                    sound.start( when, offset, duration, 0.5 );
                } ).not.toThrowError();

                expect( sourceSpies.start ).toHaveBeenCalledWith( when, offset, duration );
                done();
            } );

            it( "should be pass parameters from stop to source", function ( done ) {
                var duration = Math.random() * 2;
                expect( function () {
                    sound.start();
                } ).not.toThrowError();

                expect( function () {
                    sound.stop( duration );
                } ).not.toThrowError();

                expect( sourceSpies.stop ).toHaveBeenCalledWith( duration );
                done();
            } );
        } );
    } );
} );
