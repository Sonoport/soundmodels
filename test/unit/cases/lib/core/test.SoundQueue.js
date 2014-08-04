var spies = {
    start: jasmine.createSpy( 'start' ),
    stop: jasmine.createSpy( 'stop' ),
    play: jasmine.createSpy( 'play' ),
    pause: jasmine.createSpy( 'pause' ),
    release: jasmine.createSpy( 'release' ),
    setSources: jasmine.createSpy( 'setSources' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    listParams: jasmine.createSpy( 'listParams' ),
    startPointObj: {},
    riseTimeObj: {
        setValueAtTime: jasmine.createSpy( 'setValueAtTime' )
    },
    maxLoopsObj: {},
    decayTimeObj: {
        setValueAtTime: jasmine.createSpy( 'decayTime' )
    },
    playSpeedObj: {
        setValueAtTime: jasmine.createSpy( 'playSpeed' )
    }
};

var looperStub = {
    "models/Looper": function () {
        "use strict";
        return {
            isInitialized: true,
            playSpeed: spies.playSpeedObj,
            riseTime: spies.riseTimeObj,
            decayTime: spies.decayTimeObj,
            startPoint: spies.startPointObj,
            maxLoops: spies.maxLoopsObj,
            start: spies.start,
            stop: spies.stop,
            play: spies.play,
            pause: spies.pause,
            release: spies.release,
            setSources: spies.setSources,
            connect: spies.connect,
            disconnect: spies.disconnect,
            listParams: spies.listParams
        };
    }
};

var requireWithStubbedLooper = stubbedRequire( looperStub );

requireWithStubbedLooper( [ 'core/SoundQueue' ], function ( SoundQueue ) {
    "use strict";
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    makeContextRun( context );
    var queue;

    describe( 'SoundQueue.js', function () {

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

        function loadAndDecode( URL, ondecode ) {
            var request = new XMLHttpRequest();

            request.open( 'GET', URL, true );
            request.responseType = 'arraybuffer';

            request.onload = function () {
                context.decodeAudioData( request.response, function ( buffer ) {
                    ondecode( buffer );
                } );
            };
            request.send();
        }

        function resetAllSpies() {
            for ( var key in spies ) {
                if ( spies.hasOwnProperty( key ) && spies[ key ].calls ) {
                    spies[ key ].calls.reset();
                }
            }
        }

        beforeEach( function ( done ) {
            jasmine.addMatchers( customMatchers );
            queue = new SoundQueue( context );
            queue.connect( context.destination );
            resetAllSpies();
            done();
        } );

        describe( '#new ', function () {
            it( ' should be able to construct a new SoundQueue with various number of voices', function ( done ) {
                expect( function () {
                    var queue = new SoundQueue( context );
                } )
                    .not.toThrowError();

                expect( function () {
                    var queue = new SoundQueue( context, 4 );
                } )
                    .not.toThrowError();

                done();
            } );
        } );

        //  this.queueStart = function ( time, eventID, offset, attackDuration ) {
        describe( '#queueStart ', function () {
            it( ' should be able to enqueue a start event without an error', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = Math.random() * 10000;
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10;

                expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();

                window.setTimeout( function () {
                    expect( spies.start )
                        .toHaveBeenCalledWith( jasmine.any( Number ), offset, jasmine.any( Object ), attackDuration );
                    done();
                }, 400 );
            } );
        } );

        //  this.queueStop = function ( time, eventID ) {
        describe( '#queueStop ', function () {
            it( ' should be able to enqueue a stop event without an error', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueStop( time + 0.001, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.pause )
                        .toHaveBeenCalled();
                    done();
                }, 400 );
            } );

            it( ' an enqued stop event a corresponding start event should be dropped', function ( done ) {
                var time = context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10;
                expect( function () {
                    queue.queueStop( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.pause )
                        .not.toHaveBeenCalled();
                    done();
                }, 400 );
            } );
        } );

        // this.queueRelease = function ( time, eventID, releaseDuration ) {
        describe( '#queueRelease ', function () {
            it( ' should be able to enqueue a stop event without an error', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 1;
                expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueRelease( time + 0.001, eventID, attackDuration );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.release )
                        .toHaveBeenCalledWith( jasmine.any( Number ), attackDuration );
                    done();
                }, 400 );
            } );

            it( ' an enqued stop event a corresponding start event should be dropped', function ( done ) {
                var time = context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10;
                expect( function () {
                    queue.queueRelease( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.release )
                        .not.toHaveBeenCalled();
                    done();
                }, 400 );
            } );
        } );

        // this.queueSetParameter = function ( time, eventID, paramName, paramValue ) {
        describe( '#queueSetParameter ', function () {
            it( ' should be able to enqueue a setParameter event without an error of playSpeed', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var paramValue = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID );
                    queue.queueSetParameter( time + 0.001, eventID, 'playSpeed', paramValue );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.playSpeedObj.setValueAtTime )
                        .toHaveBeenCalled();
                    done();
                }, 400 );
            } );

            it( ' should be able to enqueue a setParameter event without an error on decayTime', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var paramValue = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID );
                    queue.queueSetParameter( time + 0.001, eventID, 'decayTime', paramValue );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.decayTimeObj.setValueAtTime )
                        .toHaveBeenCalled();
                    done();
                }, 400 );
            } );

            it( ' should not call the setValueAtTime if parameter doesn\'t exists', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var paramValue = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID );
                    queue.queueSetParameter( time + 0.001, eventID, 'randomParameter', paramValue );
                } )
                    .not.toThrowError();
                done();
            } );
        } );

        // this.queueSetSource = function ( time, eventID, sourceBuffer ) {
        describe( '#queueSetSource ', function () {
            it( ' should be able to enqueue a setSource event without an error', function ( done ) {

                loadAndDecode( "audio/sineloopstereomarked.wav", function ( buffer ) {
                    var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                    var eventID = parseInt( Math.random() * 10000 );
                    expect( function () {
                        queue.queueSetSource( time, eventID, buffer );
                    } )
                        .not.toThrowError();

                    window.setTimeout( function () {
                        expect( spies.setSources )
                            .toHaveBeenCalled();
                        done();
                    }, 400 );
                } );
            } );

            it( ' should be able to throw an error if the source is bad', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID, null );
                } )
                    .not.toThrowError();

                window.setTimeout( function () {
                    expect( spies.setSources )
                        .not.toHaveBeenCalled();
                    done();
                }, 400 );
            } );
        } );

        // this.queueUpdate = function ( eventType, eventID, propertyName, propertyValue ) {
        describe( '#queueUpdate ', function () {
            it( ' should be able to update an event without an error', function ( done ) {
                var time = context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueSetParameter( time + 0.2, eventID, "riseTime", attackDuration );
                } )
                    .not.toThrowError();

                expect( function () {
                    queue.queueUpdate( "QESETPARAM", eventID, "paramValue", attackDuration + 1 );
                } )
                    .not.toThrowError();

                window.setTimeout( function () {
                    expect( spies.riseTimeObj.setValueAtTime )
                        .toHaveBeenCalledWith( attackDuration + 1, time + 0.2 );
                    done();
                }, 600 );
            } );
        } );

        // this.stop = function ( when ) {
        describe( '#pause/stop ', function () {
            it( ' should be able to pause an empty queue', function ( done ) {
                expect( function () {
                    queue.pause();
                } )
                    .not.toThrowError();
                done();
            } );

            it( ' should be able to pause a running queue', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueSetParameter( time, eventID, "riseTime ", attackDuration );
                } )
                    .not.toThrowError();

                window.setTimeout( function () {
                    expect( function () {
                        queue.pause();
                        //spies.start.calls.reset();
                    } )
                        .not.toThrowError();
                }, 400 );

                window.setTimeout( function () {
                    expect( spies.release )
                        .toHaveBeenCalled();

                    expect( spies.start )
                        .toHaveBeenCalled();
                    expect( spies.riseTimeObj.setValueAtTime )
                        .toHaveBeenCalled();
                    done();
                }, 1000 );

            } );

            it( ' should be able to gracefully not stop the queue if had been already started', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueStart( time + 0.5, eventID, offset, attackDuration );
                    queue.queueSetParameter( time + 0.5, eventID, "riseTime ", attackDuration );
                } )
                    .not.toThrowError();

                window.setTimeout( function () {
                    expect( function () {
                        queue.pause();
                        spies.start.calls.reset();
                        spies.riseTimeObj.setValueAtTime.calls.reset();
                    } )
                        .not.toThrowError();
                }, 200 );

                window.setTimeout( function () {
                    expect( spies.release )
                        .toHaveBeenCalled();

                    expect( spies.start )
                        .not.toHaveBeenCalled();
                    expect( spies.riseTimeObj.setValueAtTime )
                        .not.toHaveBeenCalled();

                    done();
                }, 1000 );

            } );

        } );

        // this.connect = function ( destination, output, input ) {
        // this.disconnect = function ( outputIndex ) {
        describe( '#connect/disconnect ', function () {
            it( ' should be able to connect to an AudioNode', function ( done ) {
                expect( function () {
                    queue.connect( context.destination );
                } )
                    .not.toThrowError();
                done();
            } );
            it( ' should be able to disconnect from an AudioNode', function ( done ) {
                expect( function () {
                    queue.connect( context.destination );
                    queue.connect();
                } )
                    .not.toThrowError();
                done();
            } );
        } );
    } );
} );
