"use strict";
var Trigger = require( 'models/Trigger' );
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
describe( 'Trigger.js', function () {
    var trigger;
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
        if ( !trigger ) {
            console.log( "Initing Trigger.." );

            trigger = new Trigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
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

    describe( '#new Trigger( context )', function () {

        it( "should have audioContext available", function () {
            expect( trigger.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( trigger.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( trigger.maxSources ).toBe( 8 );
        } );

        it( "should have no inputs", function () {
            expect( trigger.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( trigger.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Trigger", function () {
            expect( trigger.modelName ).toBe( 'Trigger' );
        } );

        it( "should be a BaseSound", function () {
            expect( trigger.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( trigger.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            trigger = new Trigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            trigger = new Trigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( trigger.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            trigger.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            trigger.setSources( listofSounds[ 0 ], progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            trigger.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {

        it( "should have a valid parameter pitchShift", function () {
            "use strict";
            expect( trigger.pitchShift.isSPAudioParam ).toBe( true );

            expect( function () {
                trigger.pitchShift = 0;
            } ).toThrowError();

            expect( function () {
                delete trigger.pitchShift;
            } ).toThrowError();

            expect( trigger.pitchShift.name ).toBe( 'pitchShift' );
            expect( trigger.pitchShift.value ).toBe( 0 );
            expect( trigger.pitchShift.minValue ).toBe( -60 );
            expect( trigger.pitchShift.maxValue ).toBe( 60 );

        } );

        it( "should have a valid parameter pitchRand", function () {
            "use strict";
            expect( trigger.pitchRand.isSPAudioParam ).toBe( true );
            expect( function () {
                trigger.pitchRand = 0;
            } ).toThrowError();

            expect( function () {
                delete trigger.pitchRand;
            } ).toThrowError();

            expect( trigger.pitchRand.name ).toBe( 'pitchRand' );
            expect( trigger.pitchRand.value ).toBe( 0 );
            expect( trigger.pitchRand.minValue ).toBe( 0 );
            expect( trigger.pitchRand.maxValue ).toBe( 24 );

        } );

        it( "should have a valid parameter eventRand", function () {
            "use strict";
            expect( trigger.eventRand.isSPAudioParam ).toBe( true );

            expect( function () {
                trigger.eventRand = 0;
            } ).toThrowError();
            expect( function () {
                delete trigger.eventRand;
            } ).toThrowError();

            expect( trigger.eventRand.name ).toBe( 'eventRand' );
            expect( trigger.eventRand.value ).toBe( false );
            expect( trigger.eventRand.minValue ).toBe( true );
            expect( trigger.eventRand.maxValue ).toBe( false );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( trigger.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( trigger.disconnect ).toBeInstanceOf( Function );
        } );

    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( trigger.start ).toBeInstanceOf( Function );
            expect( trigger.stop ).toBeInstanceOf( Function );
            expect( trigger.play ).toBeInstanceOf( Function );
            expect( trigger.pause ).toBeInstanceOf( Function );
            expect( trigger.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                trigger.start();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    trigger.stop();
                } ).not.toThrowError();

                expect( trigger.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                trigger.play();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    trigger.pause();
                } ).not.toThrowError();

                expect( trigger.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    trigger.onAudioStart = internalSpies.onAudioStart;
                    trigger.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        trigger.play();
                    } ).not.toThrowError();

                    expect( trigger.isPlaying ).toBe( true );

                    setTimeout( function () {
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                        expect( function () {
                            trigger.pause();
                        } ).not.toThrowError();

                        expect( trigger.isPlaying ).toBe( false );
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
                trigger.play();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    trigger.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( trigger.isPlaying ).toBe( false );
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

var proxyquire = require( 'proxyquireify' )( require );
var sTrigger = proxyquire( 'models/Trigger', queueStub );
describe( 'Trigger.js with stubbed Queue', function () {
    var trigger;
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
        if ( !trigger ) {
            trigger = new sTrigger( window.context, listofSounds, null, function () {
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
    describe( '#new Trigger( context ) ', function () {
        it( "should have audioContext available", function () {
            expect( trigger.audioContext ).toBeInstanceOf( AudioContext );
        } );
    } );
    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( trigger.start ).toBeInstanceOf( Function );
            expect( trigger.stop ).toBeInstanceOf( Function );
            expect( trigger.play ).toBeInstanceOf( Function );
            expect( trigger.pause ).toBeInstanceOf( Function );
            expect( trigger.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                trigger.start();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
            }, 2000 );

            expect( function () {
                trigger.stop();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( false );
            setTimeout( function () {
                expect( queueSpies.pause ).toHaveBeenCalled();
            }, 2000 );
            done();
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                trigger.play();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
                expect( trigger.isPlaying ).toBe( true );

                expect( function () {
                    trigger.pause();
                } ).not.toThrowError();

                expect( trigger.isPlaying ).toBe( false );

                setTimeout( function () {
                    expect( queueSpies.pause ).toHaveBeenCalled();

                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.queueSetParameter.calls.reset();
                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.pause.calls.reset();

                    expect( function () {
                        trigger.play();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                        expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                        expect( queueSpies.queueStart ).toHaveBeenCalled();
                        expect( trigger.isPlaying ).toBe( true );

                        expect( function () {
                            trigger.pause();
                        } ).not.toThrowError();

                        expect( trigger.isPlaying ).toBe( false );
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
                trigger.play();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            expect( queueSpies.queueSetSource ).toHaveBeenCalled();
            expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
            expect( queueSpies.queueStart ).toHaveBeenCalled();

            expect( function () {
                trigger.release();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( trigger.isPlaying ).toBe( false );
                expect( queueSpies.pause ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );
} );
