"use strict";
var Activity = require( 'models/Activity' );
if ( !window.context ) {
    window.context = new AudioContext();
}
var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
describe( 'Activity.js', function () {
    var activity;
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
        if ( !activity ) {
            console.log( "Initing Stubbed Activity.." );
            activity = new Activity( window.context, listofSounds, internalSpies.onLoadProgress, function () {
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

    describe( '#new Activity( context )', function () {

        it( "should have audioContext available", function () {
            expect( activity.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( activity.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( activity.maxSources ).toBeGreaterThan( 1 );
        } );

        it( "should have no inputs", function () {
            expect( activity.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( activity.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Activity", function () {
            expect( activity.modelName ).toBe( 'Activity' );
        } );

        it( "should be a BaseSound", function () {
            expect( activity.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( activity.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            activity = new Activity( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            activity = new Activity( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( activity.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            activity.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            activity.setSources( listofSounds[ 0 ], progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            activity.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter maxSpeed", function () {

            expect( activity.maxSpeed.isSPAudioParam ).toBe( true );
            expect( activity.maxSpeed.name ).toBe( 'maxSpeed' );
            expect( activity.maxSpeed.value ).toBe( 1.0 );
            expect( activity.maxSpeed.minValue ).toBe( 0.05 );
            expect( activity.maxSpeed.maxValue ).toBe( 8 );

        } );

        it( "should have a valid parameter easeIn", function () {

            expect( activity.easeIn.isSPAudioParam ).toBe( true );

            expect( function () {
                activity.easeIn = 0;
            } ).toThrowError();

            expect( function () {
                delete activity.easeIn;
            } ).toThrowError();

            expect( activity.easeIn.name ).toBe( 'easeIn' );
            expect( activity.easeIn.value ).toBe( 1 );
            expect( activity.easeIn.minValue ).toBe( 0.05 );
            expect( activity.easeIn.maxValue ).toBe( 10.0 );

        } );

        it( "should have a valid parameter easeOut", function () {
            expect( activity.easeOut.isSPAudioParam ).toBe( true );
            expect( function () {
                activity.easeOut = 0;
            } ).toThrowError();

            expect( function () {
                delete activity.easeOut;
            } ).toThrowError();

            expect( activity.easeOut.name ).toBe( 'easeOut' );
            expect( activity.easeOut.value ).toBe( 1 );
            expect( activity.easeOut.minValue ).toBe( 0.05 );
            expect( activity.easeOut.maxValue ).toBe( 10.0 );

        } );

        it( "should have a valid parameter action", function () {
            expect( activity.action.isSPAudioParam ).toBe( true );

            expect( function () {
                activity.action = 0;
            } ).toThrowError();
            expect( function () {
                delete activity.action;
            } ).toThrowError();

            expect( activity.action.name ).toBe( 'action' );
            expect( activity.action.value ).toBe( 0 );
            expect( activity.action.minValue ).toBe( 0 );
            expect( activity.action.maxValue ).toBe( 1 );

        } );

        it( "should have a valid parameter sensitivity", function () {
            expect( activity.sensitivity.isSPAudioParam ).toBe( true );

            expect( function () {
                activity.sensitivity = 0;
            } ).toThrowError();
            expect( function () {
                delete activity.sensitivity;
            } ).toThrowError();

            expect( activity.sensitivity.name ).toBe( 'sensitivity' );
            expect( activity.sensitivity.value ).toBe( 0.5 );
            expect( activity.sensitivity.minValue ).toBe( 0 );
            expect( activity.sensitivity.maxValue ).toBe( 1 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( activity.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( activity.disconnect ).toBeInstanceOf( Function );
        } );

    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( activity.start ).toBeInstanceOf( Function );
            expect( activity.stop ).toBeInstanceOf( Function );
            expect( activity.play ).toBeInstanceOf( Function );
            expect( activity.pause ).toBeInstanceOf( Function );
            expect( activity.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                activity.start( 0 );
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    activity.stop( 0 );
                } ).not.toThrowError();

                expect( activity.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                activity.play();
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    activity.pause();
                } ).not.toThrowError();

                expect( activity.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    activity.onAudioStart = internalSpies.onAudioStart;
                    activity.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        activity.play();
                    } ).not.toThrowError();

                    expect( activity.isPlaying ).toBe( true );

                    setTimeout( function () {
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                        expect( function () {
                            activity.pause();
                        } ).not.toThrowError();

                        expect( activity.isPlaying ).toBe( false );
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
                activity.play();
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    activity.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( activity.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1500 );
            }, 1000 );
        } );
    } );
} );

// var sourceSpies = {
//     start: jasmine.createSpy( 'start' ),
//     stop: jasmine.createSpy( 'stop' ),
//     connect: jasmine.createSpy( 'connect' ),
//     disconnect: jasmine.createSpy( 'disconnect' ),
//     resetBufferSource: jasmine.createSpy( 'resetBuffer' )
// };
// var sourceStub = {
//     "core/SPAudioBufferSourceNode": function () {
//         return {
//             playbackRate: {
//                 value: 1.0,
//                 defaultValue: 0,
//                 setValueAtTime: function () {}
//             },
//             connect: sourceSpies.connect,
//             disconnect: sourceSpies.disconnect,
//             start: sourceSpies.start,
//             loopStart: 0,
//             loopEnd: 1,
//             stop: function ( when ) {
//                 this.onended();
//                 sourceSpies.stop( when );
//             },
//             resetBufferSource: sourceSpies.resetBufferSource,
//         };
//     }
// };

// var requireWithStubbedSource = stubbedRequire( sourceStub );
// requireWithStubbedSource( [ 'models/Activity', 'core/BaseSound', 'core/SPAudioParam' ], function ( Activity, BaseSound, SPAudioParam ) {
//     if ( !window.context ) {
//         window.context = new AudioContext();
//     }
//     var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
//     describe( 'Activity.js with stubbed Source', function () {
//         var activity;
//         var customMatchers = {
//             toBeInstanceOf: function () {
//                 return {
//                     compare: function ( actual, expected ) {
//                         var result = {};
//                         result.pass = actual instanceof expected;
//                         if ( result.pass ) {
//                             result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
//                         } else {
//                             result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
//                         }
//                         return result;
//                     }
//                 };
//             }
//         };
//         beforeEach( function ( done ) {
//             jasmine.addMatchers( customMatchers );
//             resetAllSourceSpies();
//             if ( !activity ) {
//                 console.log( "Initing Activity.." );
//                 activity = new Activity( window.context, listofSounds, null, function () {
//                     done();
//                 } );
//             } else {
//                 done();
//             }
//         } );

//         function resetAllSourceSpies() {
//             for ( var key in sourceSpies ) {
//                 if ( sourceSpies.hasOwnProperty( key ) && sourceSpies[ key ].calls ) {
//                     sourceSpies[ key ].calls.reset();
//                 }
//             }
//         }
//         describe( '#new Activity( context ) ', function () {
//             it( "should have audioContext available", function () {
//                 expect( activity.audioContext ).toBeInstanceOf( AudioContext );
//             } );
//         } );
//         describe( '#actions', function () {
//             it( "should have start/stop/play/pause/release defined", function () {
//                 expect( activity.start ).toBeInstanceOf( Function );
//                 expect( activity.stop ).toBeInstanceOf( Function );
//                 expect( activity.play ).toBeInstanceOf( Function );
//                 expect( activity.pause ).toBeInstanceOf( Function );
//                 expect( activity.release ).toBeInstanceOf( Function );
//             } );

//             it( "should be start/stop audio", function ( done ) {
//                 expect( function () {
//                     activity.start( 0 );
//                 } ).not.toThrowError();

//                 expect( activity.isPlaying ).toBe( true );
//                 expect( sourceSpies.start ).toHaveBeenCalled();

//                 expect( function () {
//                     activity.stop( 0 );
//                 } ).not.toThrowError();

//                 expect( activity.isPlaying ).toBe( false );
//                 expect( sourceSpies.stop ).toHaveBeenCalled();
//                 done();
//             } );

//             it( "should be play/pause audio", function ( done ) {
//                 expect( function () {
//                     activity.play();
//                 } ).not.toThrowError();

//                 expect( sourceSpies.start ).toHaveBeenCalled();
//                 expect( activity.isPlaying ).toBe( true );

//                 expect( function () {
//                     activity.pause();
//                 } ).not.toThrowError();

//                 expect( activity.isPlaying ).toBe( false );
//                 expect( sourceSpies.stop ).toHaveBeenCalled();
//                 setTimeout( function () {
//                     expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
//                 }, 1000 );

//                 sourceSpies.start.calls.reset();
//                 sourceSpies.stop.calls.reset();
//                 sourceSpies.resetBufferSource.calls.reset();

//                 expect( function () {
//                     activity.play();
//                 } ).not.toThrowError();

//                 expect( activity.isPlaying ).toBe( true );
//                 expect( sourceSpies.start ).toHaveBeenCalled();

//                 expect( function () {
//                     activity.pause();
//                 } ).not.toThrowError();

//                 expect( activity.isPlaying ).toBe( false );
//                 expect( sourceSpies.stop ).toHaveBeenCalled();
//                 setTimeout( function () {
//                     expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
//                     done();
//                 }, 1000 );

//             } );

//             it( "should be play/release audio", function ( done ) {
//                 expect( function () {
//                     activity.play();
//                 } ).not.toThrowError();

//                 expect( activity.isPlaying ).toBe( true );
//                 expect( sourceSpies.start ).toHaveBeenCalled();

//                 expect( function () {
//                     activity.release();
//                 } ).not.toThrowError();

//                 setTimeout( function () {
//                     expect( activity.isPlaying ).toBe( false );
//                     expect( sourceSpies.stop ).toHaveBeenCalled();
//                     expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
//                     done();
//                 }, 1000 );
//             } );

//             it( "should be pass parameters from start to source", function ( done ) {
//                 var when = Math.random();
//                 var offset = Math.random() / 2;
//                 var duration = Math.random() * 2;
//                 expect( function () {
//                     activity.start( when, offset, duration, 0.5 );
//                 } ).not.toThrowError();

//                 expect( sourceSpies.start ).toHaveBeenCalledWith( when, offset, duration );
//                 done();
//             } );

//             it( "should be pass parameters from stop to source", function ( done ) {
//                 var duration = Math.random() * 2;
//                 expect( function () {
//                     activity.start( 0 );
//                 } ).not.toThrowError();

//                 expect( function () {
//                     activity.stop( duration );
//                 } ).not.toThrowError();

//                 expect( sourceSpies.stop ).toHaveBeenCalledWith( duration );
//                 done();
//             } );
//         } );
//     } );
// } );
