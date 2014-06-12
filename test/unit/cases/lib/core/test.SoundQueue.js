require( [ 'core/SoundQueue' ], function ( SoundQueue ) {
    "use strict";
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    var queue;
    console.log( Looper );

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

        beforeEach( function () {
            jasmine.addMatchers( customMatchers );
            queue = new SoundQueue( context );
        } );

        describe( '#new ', function () {
            it( ' should be able to construct a new SoundQueue with various number of voices', function () {
                expect( function () {
                    var queue = new SoundQueue( context );
                } )
                    .not.toThrowError();

                expect( function () {
                    var queue = new SoundQueue( context, 4 );
                } )
                    .not.toThrowError();
            } );
        } );

        //  this.queueStart = function ( time, eventID, offset, attackDuration ) {
        describe( '#queueStart ', function () {
            it( ' should be able to enqueue a start event without an error', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );
        } );

        //  this.queueStop = function ( time, eventID ) {
        describe( '#queueStop ', function () {
            it( ' should be able to enqueue a stop event without an error', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );
        } );

        // this.queueRelease = function ( time, eventID, releaseDuration ) {
        describe( '#queueRelease ', function () {
            it( ' should be able to enqueue a release event without an error', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );
        } );

        // this.queueSetParameter = function ( time, eventID, paramName, paramValue ) {
        describe( '#queueSetParameter ', function () {
            it( ' should be able to enqueue a setParameter event without an error if parameter exists', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );

            it( ' should be able to enqueue a setParameter event without an error if parameter doesn\'t exists', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );
        } );

        // this.queueSetSource = function ( time, eventID, sourceBuffer ) {
        describe( '#queueSetSource ', function () {
            it( ' should be able to enqueue a setSource event without an error', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );
        } );

        // this.queueUpdate = function ( eventType, eventID, propertyName, propertyValue ) {
        describe( '#queueUpdate ', function () {
            it( ' should be able to update an event without an error', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );
        } );

        // this.stop = function ( when ) {
        describe( '#pause/stop ', function () {
            it( ' should be able to stop the queue without errors', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.start( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );

            it( ' should be able to pause the queue without errors', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.pause( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );
        } );

        // this.connect = function ( destination, output, input ) {
        // this.disconnect = function ( outputIndex ) {
        describe( '#connect/disconnect ', function () {
            it( ' should be able to enqueue a setParameter event without an error if parameter doesn\'t exists', function () {
                expect( function () {
                    var time = ( Math.random() - 0.1 ) * 10 + context.currentTime;
                    var eventID = Math.random() * 10000;
                    var offset = Math.random() * 100;
                    var attackDuration = Math.random() * 10;
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                    .not.toThrowError();
            } );
        } );
    } );
} );
