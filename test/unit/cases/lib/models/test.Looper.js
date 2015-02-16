"use strict";
require( [ 'models/Looper', 'core/BaseSound', 'core/SPAudioParam' ], function ( Looper, BaseSound, SPAudioParam ) {
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
    describe( 'Looper.js', function () {
        var looper;
        var internalSpies = {
            onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
            onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
            onAudioStart: jasmine.createSpy( 'onAudioStart' ),
            onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
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
            if ( !looper ) {
                console.log( "Initing Looper.." );
                looper = new Looper( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                    internalSpies.onLoadComplete();
                    done();
                }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
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

        describe( '#new Looper( context )', function () {

            it( "should have audioContext available", function () {
                expect( looper.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 1", function () {
                expect( looper.minSources ).toBe( 1 );
            } );

            it( "should have a maximum number of sources as 1", function () {
                expect( looper.maxSources ).toBeGreaterThan( 1 );
            } );

            it( "should have no inputs", function () {
                expect( looper.numberOfInputs ).toBe( 0 );
            } );

            it( "should have atleast 1 output", function () {
                expect( looper.numberOfOutputs ).toBeGreaterThan( 0 );
            } );

            it( "should have a model name as Looper", function () {
                expect( looper.modelName ).toBe( 'Looper' );
            } );

            it( "should be a BaseSound", function () {
                expect( looper ).toBeInstanceOf( BaseSound );
            } );

            it( "should be have been initialized", function () {
                expect( looper.isInitialized ).toBe( true );
            } );

            it( "should have called progress events", function ( done ) {
                looper = new Looper( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                    internalSpies.onLoadComplete();
                    expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                    done();
                }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
            } );

            it( "should have called load events", function ( done ) {
                looper = new Looper( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                    internalSpies.onLoadComplete();
                    expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                    done();
                }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
            } );

        } );

        describe( '#setSources()', function () {
            it( "should have method setSources defined", function () {
                expect( looper.setSources ).toBeInstanceOf( Function );
            } );

            it( "should be able to change sources", function ( done ) {
                looper.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                    expect( audioBufferArray.length ).toBe( 1 );
                    done();
                } );
            } );

            it( "should call onprogress events", function ( done ) {
                var progressSpy = jasmine.createSpy( 'progressSpy' );
                looper.setSources( listofSounds[ 0 ], progressSpy, function () {
                    expect( progressSpy ).toHaveBeenCalled();
                    done();
                } );
            } );

            it( "should call onload event", function ( done ) {
                var loadSpy = jasmine.createSpy( 'loadSpy' );
                looper.setSources( listofSounds, null, loadSpy );
                window.setTimeout( function () {
                    expect( loadSpy ).toHaveBeenCalled();
                    done();
                }, 1000 );
            } );
        } );

        describe( '#properties', function () {
            it( "should have a valid parameter playspeed", function () {

                expect( looper.playSpeed ).toBeInstanceOf( SPAudioParam );
                expect( looper.playSpeed.name ).toBe( 'playSpeed' );
                expect( looper.playSpeed.value ).toBe( 1.0 );
                expect( looper.playSpeed.minValue ).toBe( 0.0 );
                expect( looper.playSpeed.maxValue ).toBe( 10.0 );

            } );

            it( "should have a valid parameter easeIn", function () {

                expect( looper.easeIn ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    looper.easeIn = 0;
                } ).toThrowError();

                expect( function () {
                    delete looper.easeIn;
                } ).toThrowError();

                expect( looper.easeIn.name ).toBe( 'easeIn' );
                expect( looper.easeIn.value ).toBe( 0.05 );
                expect( looper.easeIn.minValue ).toBe( 0.05 );
                expect( looper.easeIn.maxValue ).toBe( 10.0 );

            } );

            it( "should have a valid parameter easeOut", function () {
                expect( looper.easeOut ).toBeInstanceOf( SPAudioParam );
                expect( function () {
                    looper.easeOut = 0;
                } ).toThrowError();

                expect( function () {
                    delete looper.easeOut;
                } ).toThrowError();

                expect( looper.easeOut.name ).toBe( "easeOut" );
                expect( looper.easeOut.value ).toBe( 0.05 );
                expect( looper.easeOut.minValue ).toBe( 0.05 );
                expect( looper.easeOut.maxValue ).toBe( 10.0 );

            } );

            it( "should have a valid parameter maxLoops", function () {
                expect( looper.maxLoops ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    looper.maxLoops = 0;
                } ).toThrowError();
                expect( function () {
                    delete looper.maxLoops;
                } ).toThrowError();

                expect( looper.maxLoops.name ).toBe( "maxLoops" );
                expect( looper.maxLoops.value ).toBe( -1 );
                expect( looper.maxLoops.minValue ).toBe( -1 );
                expect( looper.maxLoops.maxValue ).toBe( 1 );

            } );

            it( "should have a valid parameter multiTrackGain", function () {
                expect( looper.multiTrackGain ).toBeInstanceOf( Array );
                expect( looper.multiTrackGain.length ).toBe( listofSounds.length );
                expect( looper.multiTrackGain[ 0 ] ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    looper.multiTrackGain = 0;
                } ).toThrowError();
                expect( function () {
                    delete looper.multiTrackGain;
                } ).toThrowError();

                expect( looper.multiTrackGain[ 0 ].name ).toBe( 'track-0-gain' );
                expect( looper.multiTrackGain[ 0 ].value ).toBe( 1 );
                expect( looper.multiTrackGain[ 0 ].minValue ).toBe( 0 );
                expect( looper.multiTrackGain[ 0 ].maxValue ).toBe( 1 );

            } );
        } );

        describe( '#connect/disconnect', function () {

            it( "have connect function defined", function () {
                expect( looper.connect ).toBeInstanceOf( Function );
            } );
            it( "have disconnect function defined", function () {
                expect( looper.disconnect ).toBeInstanceOf( Function );
            } );

        } );

        describe( '#actions', function () {
            it( "should have start/stop/play/pause/release defined", function () {
                expect( looper.start ).toBeInstanceOf( Function );
                expect( looper.stop ).toBeInstanceOf( Function );
                expect( looper.play ).toBeInstanceOf( Function );
                expect( looper.pause ).toBeInstanceOf( Function );
                expect( looper.release ).toBeInstanceOf( Function );
            } );

            it( "should be able to start/stop audio", function ( done ) {
                expect( function () {
                    looper.start( 0 );
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                    expect( looper.isPlaying ).toBe( true );

                    expect( function () {
                        looper.stop( 0 );
                    } ).not.toThrowError();

                    expect( looper.isPlaying ).toBe( false );
                    setTimeout( function () {
                        expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                        done();
                    }, 1000 );
                }, 1000 );
            } );

            it( "should able to be play/pause audio", function ( done ) {
                expect( function () {
                    looper.play();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( looper.isPlaying ).toBe( true );
                    expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                    expect( function () {
                        looper.pause();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                        expect( looper.isPlaying ).toBe( false );

                        internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                        internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                        looper.onAudioStart = internalSpies.onAudioStart;
                        looper.onAudioEnd = internalSpies.onAudioEnd;

                        expect( function () {
                            looper.play();
                        } ).not.toThrowError();

                        setTimeout( function () {
                            expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                            expect( looper.isPlaying ).toBe( true );

                            expect( function () {
                                looper.pause();
                            } ).not.toThrowError();

                            expect( looper.isPlaying ).toBe( false );
                            setTimeout( function () {
                                expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                                done();
                            }, 1000 );
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            } );

            it( "should be able to play/release audio", function ( done ) {
                expect( function () {
                    looper.play();
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                    expect( function () {
                        looper.release();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( looper.isPlaying ).toBe( false );
                        expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                        done();
                    }, 1000 );
                }, 1000 );
            } );

            it( "should be able to play/release audio with reset", function ( done ) {
                expect( function () {
                    looper.play();
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                    expect( function () {
                        looper.release( null, null, true );
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( looper.isPlaying ).toBe( false );
                        expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                        setTimeout( function () {
                            expect( function () {
                                looper.start( 0 );
                            } ).not.toThrowError();
                            setTimeout( function () {
                                expect( function () {
                                    looper.release();
                                } ).not.toThrowError();
                                setTimeout( function () {
                                    expect( looper.isPlaying ).toBe( false );
                                    done();
                                }, 800 );
                            }, 800 );
                        }, 800 );
                    }, 800 );
                }, 800 );
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
            loopStart: 0,
            loopEnd: 1,
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
        var looper;
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
            if ( !looper ) {
                console.log( "Initing Stubbed Looper.." );
                looper = new Looper( window.context, listofSounds, null, function () {
                    done();
                } );
            } else {
                done();
            }
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
                expect( looper.audioContext ).toBeInstanceOf( AudioContext );
            } );
        } );

        describe( '#actions', function () {
            it( "should have start/stop/play/pause/release defined", function () {
                expect( looper.start ).toBeInstanceOf( Function );
                expect( looper.stop ).toBeInstanceOf( Function );
                expect( looper.play ).toBeInstanceOf( Function );
                expect( looper.pause ).toBeInstanceOf( Function );
                expect( looper.release ).toBeInstanceOf( Function );
            } );

            it( "should be start/stop audio", function ( done ) {
                expect( function () {
                    looper.start( 0 );
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( true );
                expect( sourceSpies.start ).toHaveBeenCalled();

                expect( function () {
                    looper.stop( 0 );
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( false );
                expect( sourceSpies.stop ).toHaveBeenCalled();
                done();
            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    looper.play();
                } ).not.toThrowError();

                expect( sourceSpies.start ).toHaveBeenCalled();
                expect( looper.isPlaying ).toBe( true );

                expect( function () {
                    looper.pause();
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( false );
                expect( sourceSpies.stop ).toHaveBeenCalled();
                setTimeout( function () {
                    expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                }, 1000 );

                sourceSpies.start.calls.reset();
                sourceSpies.stop.calls.reset();
                sourceSpies.resetBufferSource.calls.reset();

                expect( function () {
                    looper.play();
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( true );
                expect( sourceSpies.start ).toHaveBeenCalled();

                expect( function () {
                    looper.pause();
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( false );
                expect( sourceSpies.stop ).toHaveBeenCalled();
                setTimeout( function () {
                    expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                    done();
                }, 1000 );

            } );

            it( "should be play/release audio", function ( done ) {
                expect( function () {
                    looper.play();
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( true );
                expect( sourceSpies.start ).toHaveBeenCalled();

                expect( function () {
                    looper.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( looper.isPlaying ).toBe( false );
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
                    looper.start( when, offset, duration, 0.5 );
                } ).not.toThrowError();

                expect( sourceSpies.start ).toHaveBeenCalledWith( when, offset, duration );
                done();
            } );

            it( "should be pass parameters from stop to source", function ( done ) {
                var duration = Math.random() * 2;
                expect( function () {
                    looper.start( 0 );
                } ).not.toThrowError();

                expect( function () {
                    looper.stop( duration );
                } ).not.toThrowError();

                expect( sourceSpies.stop ).toHaveBeenCalledWith( duration );
                done();
            } );
        } );
    } );
} );
