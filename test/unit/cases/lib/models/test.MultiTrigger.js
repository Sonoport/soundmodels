"use strict";
var MultiTrigger = require( 'models/MultiTrigger' );
if ( !window.context ) {
    window.context = new AudioContext();
}
var internalSpies = {
    onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
    onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
    onAudioStart: jasmine.createSpy( 'onAudioStart' ),
    onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
};
var listofSounds = [ 'audio/Hit5.mp3', 'audio/Hit6.mp3', 'audio/Hit7.mp3', 'audio/Hit8.mp3' ];
describe( 'MultiTrigger.js', function () {
    var multiTrigger;
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
        if ( !multiTrigger ) {
            console.log( "Initing MultiTrigger.." );
            multiTrigger = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
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

    describe( '#new MultiTrigger( context )', function () {

        it( "should have audioContext available", function () {
            expect( multiTrigger.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( multiTrigger.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( multiTrigger.maxSources ).toBe( 8 );
        } );

        it( "should have no inputs", function () {
            expect( multiTrigger.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( multiTrigger.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as MultiTrigger", function () {
            expect( multiTrigger.modelName ).toBe( 'MultiTrigger' );
        } );

        it( "should be a BaseSound", function () {
            expect( multiTrigger.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( multiTrigger.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            multiTrigger = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            multiTrigger = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( multiTrigger.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            multiTrigger.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            multiTrigger.setSources( 'audio/bullet.mp3', progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            multiTrigger.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {

        it( "should have a valid parameter pitchShift", function () {
            "use strict";

            expect( multiTrigger.pitchShift.isSPAudioParam ).toBe( true );

            expect( function () {
                multiTrigger.pitchShift = 0;
            } ).toThrowError();

            expect( function () {
                delete multiTrigger.pitchShift;
            } ).toThrowError();

            expect( multiTrigger.pitchShift.name ).toBe( 'pitchShift' );
            expect( multiTrigger.pitchShift.value ).toBe( 0 );
            expect( multiTrigger.pitchShift.minValue ).toBe( -60 );
            expect( multiTrigger.pitchShift.maxValue ).toBe( 60 );

        } );

        it( "should have a valid parameter pitchRand", function () {
            "use strict";
            expect( multiTrigger.pitchRand.isSPAudioParam ).toBe( true );
            expect( function () {
                multiTrigger.pitchRand = 0;
            } ).toThrowError();

            expect( function () {
                delete multiTrigger.pitchRand;
            } ).toThrowError();

            expect( multiTrigger.pitchRand.name ).toBe( 'pitchRand' );
            expect( multiTrigger.pitchRand.value ).toBe( 0 );
            expect( multiTrigger.pitchRand.minValue ).toBe( 0 );
            expect( multiTrigger.pitchRand.maxValue ).toBe( 24 );

        } );

        it( "should have a valid parameter eventRand", function () {
            "use strict";
            expect( multiTrigger.eventRand.isSPAudioParam ).toBe( true );

            expect( function () {
                multiTrigger.eventRand = 0;
            } ).toThrowError();
            expect( function () {
                delete multiTrigger.eventRand;
            } ).toThrowError();

            expect( multiTrigger.eventRand.name ).toBe( 'eventRand' );
            expect( multiTrigger.eventRand.value ).toBe( false );
            expect( multiTrigger.eventRand.minValue ).toBe( true );
            expect( multiTrigger.eventRand.maxValue ).toBe( false );

        } );

        it( "should have a valid parameter eventRate", function () {
            "use strict";
            expect( multiTrigger.eventRate.isSPAudioParam ).toBe( true );

            expect( function () {
                multiTrigger.eventRate = 0;
            } ).toThrowError();
            expect( function () {
                delete multiTrigger.eventRate;
            } ).toThrowError();

            expect( multiTrigger.eventRate.name ).toBe( 'eventRate' );
            expect( multiTrigger.eventRate.value ).toBe( 10.0 );
            expect( multiTrigger.eventRate.minValue ).toBe( 0.0 );
            expect( multiTrigger.eventRate.maxValue ).toBe( 60.0 );

        } );

        it( "should have a valid parameter eventJitter", function () {
            "use strict";
            expect( multiTrigger.eventJitter.isSPAudioParam ).toBe( true );

            expect( function () {
                multiTrigger.eventJitter = 0;
            } ).toThrowError();
            expect( function () {
                delete multiTrigger.eventJitter;
            } ).toThrowError();

            expect( multiTrigger.eventJitter.name ).toBe( 'eventJitter' );
            expect( multiTrigger.eventJitter.value ).toBe( 0.0 );
            expect( multiTrigger.eventJitter.minValue ).toBe( 0.0 );
            expect( multiTrigger.eventJitter.maxValue ).toBe( 0.99 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( multiTrigger.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( multiTrigger.disconnect ).toBeInstanceOf( Function );
        } );

    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( multiTrigger.start ).toBeInstanceOf( Function );
            expect( multiTrigger.stop ).toBeInstanceOf( Function );
            expect( multiTrigger.play ).toBeInstanceOf( Function );
            expect( multiTrigger.pause ).toBeInstanceOf( Function );
            expect( multiTrigger.release ).toBeInstanceOf( Function );
        } );

        it( "should be able to start/stop audio", function ( done ) {
            expect( function () {
                multiTrigger.start();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    multiTrigger.stop();
                } ).not.toThrowError();

                expect( multiTrigger.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be able to play/pause audio", function ( done ) {
            expect( function () {
                multiTrigger.play();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    multiTrigger.pause();
                } ).not.toThrowError();

                expect( multiTrigger.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    multiTrigger.onAudioStart = internalSpies.onAudioStart;
                    multiTrigger.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        multiTrigger.play();
                    } ).not.toThrowError();

                    expect( multiTrigger.isPlaying ).toBe( true );

                    setTimeout( function () {
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                        expect( function () {
                            multiTrigger.pause();
                        } ).not.toThrowError();

                        expect( multiTrigger.isPlaying ).toBe( false );
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
                multiTrigger.play();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    multiTrigger.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( multiTrigger.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1500 );
            }, 1000 );
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

var proxyquire = require( 'proxyquireify' )( require );
var sMultiTrigger = proxyquire( 'models/MultiTrigger', queueStub );

describe( 'MultiTrigger.js with stubbed Queue', function () {
    var multiTrigger;
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
        if ( !multiTrigger ) {
            multiTrigger = new sMultiTrigger( window.context, listofSounds, null, function () {
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
            expect( multiTrigger.audioContext ).toBeInstanceOf( AudioContext );
        } );
    } );
    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( multiTrigger.start ).toBeInstanceOf( Function );
            expect( multiTrigger.stop ).toBeInstanceOf( Function );
            expect( multiTrigger.play ).toBeInstanceOf( Function );
            expect( multiTrigger.pause ).toBeInstanceOf( Function );
            expect( multiTrigger.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                multiTrigger.start();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
            }, 2000 );

            expect( function () {
                multiTrigger.stop();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( false );
            setTimeout( function () {
                expect( queueSpies.pause ).toHaveBeenCalled();
            }, 2000 );
            done();
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                multiTrigger.play();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
                expect( multiTrigger.isPlaying ).toBe( true );

                expect( function () {
                    multiTrigger.pause();
                } ).not.toThrowError();

                expect( multiTrigger.isPlaying ).toBe( false );

                setTimeout( function () {
                    expect( queueSpies.pause ).toHaveBeenCalled();

                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.queueSetParameter.calls.reset();
                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.pause.calls.reset();

                    expect( function () {
                        multiTrigger.play();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                        expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                        expect( queueSpies.queueStart ).toHaveBeenCalled();
                        expect( multiTrigger.isPlaying ).toBe( true );

                        expect( function () {
                            multiTrigger.pause();
                        } ).not.toThrowError();

                        expect( multiTrigger.isPlaying ).toBe( false );
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
                multiTrigger.play();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            expect( queueSpies.queueSetSource ).toHaveBeenCalled();
            expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
            expect( queueSpies.queueStart ).toHaveBeenCalled();

            expect( function () {
                multiTrigger.release();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( multiTrigger.isPlaying ).toBe( false );
                expect( queueSpies.pause ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );
} );
