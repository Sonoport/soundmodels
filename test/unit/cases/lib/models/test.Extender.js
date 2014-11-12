"use strict";
require( [ 'models/Extender', 'core/BaseSound', 'core/SPAudioParam' ], function ( Extender, BaseSound, SPAudioParam ) {
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
    describe( 'Extender.js', function () {
        var extender;
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
            if ( !extender ) {
                console.log( "Initing Extender.." );
                extender = new Extender( window.context, listofSounds, internalSpies.onLoadProgress, function () {
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

        describe( '#new Extender( context )', function () {

            it( "should have audioContext available", function () {
                expect( extender.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 1", function () {
                expect( extender.minSources ).toBe( 1 );
            } );

            it( "should have a maximum number of sources as 1", function () {
                expect( extender.maxSources ).toBe( 1 );
            } );

            it( "should have a model name as Extender", function () {
                expect( extender.modelName ).toBe( "Extender" );
            } );

            it( "should be a BaseSound", function () {
                expect( extender ).toBeInstanceOf( BaseSound );
            } );

            it( "should be have been initialized", function () {
                expect( extender.isInitialized ).toBe( true );
            } );

            it( "should have called progress events", function ( done ) {
                extender = new Extender( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                    internalSpies.onLoadComplete();
                    expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                    done();
                }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
            } );

            it( "should have called load events", function ( done ) {
                extender = new Extender( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                    internalSpies.onLoadComplete();
                    expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                    done();
                }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
            } );
        } );

        describe( '#setSources()', function () {
            it( "should have method setSources defined", function () {
                expect( extender.setSources ).toBeInstanceOf( Function );
            } );

            it( "should be able to change sources", function ( done ) {
                extender.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                    expect( audioBufferArray.length ).toBe( 1 );
                    done();
                } );
            } );

            it( "should call onprogress events", function ( done ) {
                var progressSpy = jasmine.createSpy( 'progressSpy' );
                extender.setSources( listofSounds[ 0 ], progressSpy, function () {
                    expect( progressSpy ).toHaveBeenCalled();
                    done();
                } );
            } );

            it( "should call onload event", function ( done ) {
                var loadSpy = jasmine.createSpy( 'loadSpy' );
                extender.setSources( listofSounds, null, loadSpy );
                window.setTimeout( function () {
                    expect( loadSpy ).toHaveBeenCalled();
                    done();
                }, 1000 );
            } );
        } );

        describe( '#properties', function () {

            it( "should have a valid parameter pitchShift", function () {

                expect( extender.pitchShift ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    extender.pitchShift = 0;
                } ).toThrowError();

                expect( function () {
                    delete extender.pitchShift;
                } ).toThrowError();

                expect( extender.pitchShift.name ).toBe( 'pitchShift' );
                expect( extender.pitchShift.value ).toBe( 0 );
                expect( extender.pitchShift.minValue ).toBe( -60 );
                expect( extender.pitchShift.maxValue ).toBe( 60 );

            } );

            it( "should have a valid parameter eventPeriod", function () {
                expect( extender.eventPeriod ).toBeInstanceOf( SPAudioParam );
                expect( function () {
                    extender.eventPeriod = 0;
                } ).toThrowError();

                expect( function () {
                    delete extender.eventPeriod;
                } ).toThrowError();

                expect( extender.eventPeriod.name ).toBe( 'eventPeriod' );
                expect( extender.eventPeriod.value ).toBe( 2.0 );
                expect( extender.eventPeriod.minValue ).toBe( 0.1 );
                expect( extender.eventPeriod.maxValue ).toBe( 10 );

            } );

            it( "should have a valid parameter crossFadeDuration", function () {
                expect( extender.crossFadeDuration ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    extender.crossFadeDuration = 0;
                } ).toThrowError();
                expect( function () {
                    delete extender.crossFadeDuration;
                } ).toThrowError();

                expect( extender.crossFadeDuration.name ).toBe( 'crossFadeDuration' );
                expect( extender.crossFadeDuration.value ).toBe( 0.5 );
                expect( extender.crossFadeDuration.minValue ).toBe( 0.1 );
                expect( extender.crossFadeDuration.maxValue ).toBe( 0.99 );

            } );
        } );

        describe( '#connect/disconnect', function () {

            it( "have connect function defined", function () {
                expect( extender.connect ).toBeInstanceOf( Function );
            } );
            it( "have disconnect function defined", function () {
                expect( extender.connect ).toBeInstanceOf( Function );
            } );

        } );

        describe( '#actions', function () {
            it( "should have start/stop/play/pause/release defined", function () {
                expect( extender.start ).toBeInstanceOf( Function );
                expect( extender.stop ).toBeInstanceOf( Function );
                expect( extender.play ).toBeInstanceOf( Function );
                expect( extender.pause ).toBeInstanceOf( Function );
                expect( extender.release ).toBeInstanceOf( Function );
            } );

            it( "should be start/stop audio", function ( done ) {
                expect( function () {
                    extender.start();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                    expect( function () {
                        extender.stop();
                    } ).not.toThrowError();

                    expect( extender.isPlaying ).toBe( false );
                    setTimeout( function () {
                        expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                        done();
                    }, 1000 );
                }, 1000 );
            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    extender.play();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                    expect( function () {
                        extender.pause();
                    } ).not.toThrowError();

                    expect( extender.isPlaying ).toBe( false );
                    setTimeout( function () {
                        expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                        internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                        internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                        extender.onAudioStart = internalSpies.onAudioStart;
                        extender.onAudioEnd = internalSpies.onAudioEnd;

                        expect( function () {
                            extender.play();
                        } ).not.toThrowError();

                        expect( extender.isPlaying ).toBe( true );

                        setTimeout( function () {
                            expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                            expect( function () {
                                extender.pause();
                            } ).not.toThrowError();

                            expect( extender.isPlaying ).toBe( false );
                            setTimeout( function () {
                                expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                                done();
                            }, 1000 );
                        }, 1000 );
                    }, 1000 );
                }, 1000 );

            } );

            it( "should be play/release audio", function ( done ) {
                expect( function () {
                    extender.play();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                    expect( function () {
                        extender.release();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( extender.isPlaying ).toBe( false );
                        expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
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
    if ( !window.context ) {
        window.context = new AudioContext();
    }
    var listofSounds = [ 'audio/surf.mp3' ];

    describe( 'Extender.js with stubbed Queue', function () {
        var extender;
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
            if ( !extender ) {
                console.log( "Initing Stubbed Extender.." );
                extender = new Extender( window.context, listofSounds, null, function () {
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
        describe( '#new Extender( context ) ', function () {
            it( "should have audioContext available", function () {
                expect( extender.audioContext ).toBeInstanceOf( AudioContext );
            } );
        } );
        describe( '#actions', function () {
            it( "should have start/stop/play/pause/release defined", function () {
                expect( extender.start ).toBeInstanceOf( Function );
                expect( extender.stop ).toBeInstanceOf( Function );
                expect( extender.play ).toBeInstanceOf( Function );
                expect( extender.pause ).toBeInstanceOf( Function );
                expect( extender.release ).toBeInstanceOf( Function );
            } );

            it( "should be start/stop audio", function ( done ) {
                expect( function () {
                    extender.start();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( true );
                setTimeout( function () {
                    expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                    expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                    expect( queueSpies.queueStart ).toHaveBeenCalled();
                }, 2000 );

                expect( function () {
                    extender.stop();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( queueSpies.pause ).toHaveBeenCalled();
                }, 2000 );
                done();
            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    extender.play();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                    expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                    expect( queueSpies.queueStart ).toHaveBeenCalled();
                    expect( extender.isPlaying ).toBe( true );

                    expect( function () {
                        extender.pause();
                    } ).not.toThrowError();

                    expect( extender.isPlaying ).toBe( false );

                    setTimeout( function () {
                        expect( queueSpies.pause ).toHaveBeenCalled();

                        queueSpies.queueSetSource.calls.reset();
                        queueSpies.queueSetParameter.calls.reset();
                        queueSpies.queueSetSource.calls.reset();
                        queueSpies.pause.calls.reset();

                        expect( function () {
                            extender.play();
                        } ).not.toThrowError();

                        setTimeout( function () {
                            expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                            expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                            expect( queueSpies.queueStart ).toHaveBeenCalled();
                            expect( extender.isPlaying ).toBe( true );

                            expect( function () {
                                extender.pause();
                            } ).not.toThrowError();

                            expect( extender.isPlaying ).toBe( false );
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
                    extender.play();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( true );
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();

                expect( function () {
                    extender.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( extender.isPlaying ).toBe( false );
                    expect( queueSpies.pause ).toHaveBeenCalled();
                    done();
                }, 1000 );
            } );
        } );
    } );
} );
