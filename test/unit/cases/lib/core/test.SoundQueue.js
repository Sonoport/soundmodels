"use strict";

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
    setValueAtTime: jasmine.createSpy( 'setValueAtTime' )
};

var looperStub = {
    "models/Looper": function () {
        return {
            isInitialized: true,
            playSpeed: {
                setValueAtTime: spies.setValueAtTime
            },
            riseTime: {},
            decayTime: {},
            startPoint: {},
            maxLoops: {},
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

        function resetAllSpies() {
            for ( var key in spies ) {
                if ( spies.hasOwnProperty( key ) ) {
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
                }, 200 );
            } );
        } );

        //  this.queueStop = function ( time, eventID ) {
        describe( '#queueStop ', function () {
            it( ' should be able to enqueue a stop event without an error', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10
                expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueStop( time + 0.001, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.pause )
                        .toHaveBeenCalled();
                    done();
                }, 200 );
            } );

            it( ' an enqued stop event a corresponding start event should be dropped', function ( done ) {
                var time = context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10
                expect( function () {
                    queue.queueStop( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.pause )
                        .not.toHaveBeenCalled();
                    done();
                }, 200 );
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
                }, 200 );
            } );

            it( ' an enqued stop event a corresponding start event should be dropped', function ( done ) {
                var time = context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var offset = Math.random() * 100;
                var attackDuration = Math.random() * 10
                expect( function () {
                    queue.queueRelease( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.release )
                        .not.toHaveBeenCalled();
                    done();
                }, 200 );
            } );
        } );

        // this.queueSetParameter = function ( time, eventID, paramName, paramValue ) {
        describe( '#queueSetParameter ', function () {
            it( ' should be able to enqueue a setParameter event without an error if parameter exists', function ( done ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                var paramValue = Math.random() * 10;
                expect( function () {
                    queue.queueStart( time, eventID );
                    queue.queueSetParameter( time + 0.001, eventID, 'playSpeed', paramValue );
                } )
                    .not.toThrowError();
                window.setTimeout( function () {
                    expect( spies.setValueAtTime )
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
                    queue.queueSetParameter( time + 0.001, eventID, 'asasdasd', paramValue );
                } )
                    .not.toThrowError();

                window.setTimeout( function () {
                    expect( spies.setValueAtTime )
                        .not.toHaveBeenCalled();
                    done();
                }, 400 );
            } );
        } );

        // this.queueSetSource = function ( time, eventID, sourceBuffer ) {
        describe( '#queueSetSource ', function () {
            it( ' should be able to enqueue a setSource event without an error', function ( done ) {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = parseInt( Math.random() * 10000 );
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                done();
            } );
        } );

        // this.queueUpdate = function ( eventType, eventID, propertyName, propertyValue ) {
        describe( '#queueUpdate ', function () {
            it( ' should be able to update an event without an error', function ( done ) {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = parseInt( Math.random() * 10000 );
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                done();
            } );
        } );

        // this.stop = function ( when ) {
        describe( '#pause/stop ', function () {
            it( ' should be able to stop the queue without errors', function ( done ) {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = parseInt( Math.random() * 10000 );
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.stop( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                done();
            } );

            it( ' should be able to pause the queue without errors', function ( done ) {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = parseInt( Math.random() * 10000 );
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.pause( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                done();
            } );
        } );

        // this.connect = function ( destination, output, input ) {
        // this.disconnect = function ( outputIndex ) {
        describe( '#connect/disconnect ', function () {
            it( ' should be able to enqueue a setParameter event without an error if parameter doesn\'t exists', function ( done ) {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = parseInt( Math.random() * 10000 );
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
                done();
            } );
        } );
    } );
} );
