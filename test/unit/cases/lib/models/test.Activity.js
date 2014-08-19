"use strict";
require( [ 'models/Activity', 'core/BaseSound', 'core/SPAudioParam' ], function ( Activity, BaseSound, SPAudioParam ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
    describe( 'Activity.js', function () {
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
            sound = new Activity( context, listofSounds, null, function () {
                done();
            } );
        } );
        describe( '#new Activity( context )', function () {

            it( "should have audioContext available", function () {
                expect( sound.audioContext ).toBeInstanceOf( AudioContext );
            } );

            it( "should have a minimum number of sources as 1", function () {
                expect( sound.minSources ).toBe( 1 );
            } );

            it( "should have a maximum number of sources as 1", function () {
                expect( sound.maxSources ).toBeGreaterThan( 1 );
            } );

            it( "should have a model name as Activity", function () {
                expect( sound.modelName ).toBe( "Activity" );
            } );

            it( "should be a BaseSound", function () {
                expect( sound ).toBeInstanceOf( BaseSound );
            } );

            it( "should be have been initialized", function () {
                expect( sound.isInitialized ).toBe( true );
            } );
        } );
        describe( '#properties', function () {
            it( "should have a valid parameter maxSpeed", function () {

                expect( sound.maxSpeed ).toBeInstanceOf( SPAudioParam );
                expect( sound.maxSpeed.name ).toBe( "maxSpeed" );
                expect( sound.maxSpeed.value ).toBe( 1.0 );
                expect( sound.maxSpeed.minValue ).toBe( 0.05 );
                expect( sound.maxSpeed.maxValue ).toBe( 8 );

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
                expect( sound.riseTime.value ).toBe( 1 );
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
                expect( sound.decayTime.value ).toBe( 1 );
                expect( sound.decayTime.minValue ).toBe( 0.05 );
                expect( sound.decayTime.maxValue ).toBe( 10.0 );

            } );

            it( "should have a valid parameter activity", function () {
                expect( sound.action ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.action = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.action;
                } ).toThrowError();

                expect( sound.action.name ).toBe( "action" );
                expect( sound.action.value ).toBe( 0 );
                expect( sound.action.minValue ).toBe( 0 );
                expect( sound.action.maxValue ).toBe( 1 );

            } );

            it( "should have a valid parameter sensitivity", function () {
                expect( sound.sensitivity ).toBeInstanceOf( SPAudioParam );

                expect( function () {
                    sound.sensitivity = 0;
                } ).toThrowError();
                expect( function () {
                    delete sound.sensitivity;
                } ).toThrowError();

                expect( sound.sensitivity.name ).toBe( "sensitivity" );
                expect( sound.sensitivity.value ).toBe( 0.5 );
                expect( sound.sensitivity.minValue ).toBe( 0 );
                expect( sound.sensitivity.maxValue ).toBe( 1 );

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

                expect( function () {
                    sound.stop();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                done();
            } );

            it( "should be play/pause audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.pause();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );

                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.pause();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( false );
                done();
            } );

            it( "should be play/release audio", function ( done ) {
                expect( function () {
                    sound.play();
                } ).not.toThrowError();

                expect( sound.isPlaying ).toBe( true );

                expect( function () {
                    sound.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( sound.isPlaying ).toBe( false );
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
// var requireWithStubbedSource = stubbedRequire( sourceStub );
// requireWithStubbedSource( [ 'models/Activity', 'core/BaseSound', 'core/SPAudioParam' ], function ( Activity, BaseSound, SPAudioParam ) {
//     window.AudioContext = window.AudioContext || window.webkitAudioContext;
//     var context = new AudioContext();
//     var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
//     describe( 'Activity.js with stubbed Source', function () {
//         var sound;
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
//             sound = new Activity( context, listofSounds, null, function () {
//                 done();
//             } );
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
//                 expect( sound.audioContext ).toBeInstanceOf( AudioContext );
//             } );
//         } );
//         describe( '#actions', function () {
//             it( "should have start/stop/play/pause/release defined", function () {
//                 expect( sound.start ).toBeInstanceOf( Function );
//                 expect( sound.stop ).toBeInstanceOf( Function );
//                 expect( sound.play ).toBeInstanceOf( Function );
//                 expect( sound.pause ).toBeInstanceOf( Function );
//                 expect( sound.release ).toBeInstanceOf( Function );
//             } );

//             it( "should be start/stop audio", function ( done ) {
//                 expect( function () {
//                     sound.start();
//                 } ).not.toThrowError();

//                 expect( sound.isPlaying ).toBe( true );
//                 expect( sourceSpies.start ).toHaveBeenCalled();

//                 expect( function () {
//                     sound.stop();
//                 } ).not.toThrowError();

//                 expect( sound.isPlaying ).toBe( false );
//                 expect( sourceSpies.stop ).toHaveBeenCalled();
//                 done();
//             } );

//             it( "should be play/pause audio", function ( done ) {
//                 expect( function () {
//                     sound.play();
//                 } ).not.toThrowError();

//                 expect( sourceSpies.start ).toHaveBeenCalled();
//                 expect( sound.isPlaying ).toBe( true );

//                 expect( function () {
//                     sound.pause();
//                 } ).not.toThrowError();

//                 expect( sound.isPlaying ).toBe( false );
//                 expect( sourceSpies.stop ).toHaveBeenCalled();
//                 setTimeout( function () {
//                     expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
//                 }, 1000 );

//                 sourceSpies.start.calls.reset();
//                 sourceSpies.stop.calls.reset();
//                 sourceSpies.resetBufferSource.calls.reset();

//                 expect( function () {
//                     sound.play();
//                 } ).not.toThrowError();

//                 expect( sound.isPlaying ).toBe( true );
//                 expect( sourceSpies.start ).toHaveBeenCalled();

//                 expect( function () {
//                     sound.pause();
//                 } ).not.toThrowError();

//                 expect( sound.isPlaying ).toBe( false );
//                 expect( sourceSpies.stop ).toHaveBeenCalled();
//                 setTimeout( function () {
//                     expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
//                     done();
//                 }, 1000 );

//             } );

//             it( "should be play/release audio", function ( done ) {
//                 expect( function () {
//                     sound.play();
//                 } ).not.toThrowError();

//                 expect( sound.isPlaying ).toBe( true );
//                 expect( sourceSpies.start ).toHaveBeenCalled();

//                 expect( function () {
//                     sound.release();
//                 } ).not.toThrowError();

//                 setTimeout( function () {
//                     expect( sound.isPlaying ).toBe( false );
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
//                     sound.start( when, offset, duration, 0.5 );
//                 } ).not.toThrowError();

//                 expect( sourceSpies.start ).toHaveBeenCalledWith( when, offset, duration );
//                 done();
//             } );

//             it( "should be pass parameters from stop to source", function ( done ) {
//                 var duration = Math.random() * 2;
//                 expect( function () {
//                     sound.start();
//                 } ).not.toThrowError();

//                 expect( function () {
//                     sound.stop( duration );
//                 } ).not.toThrowError();

//                 expect( sourceSpies.stop ).toHaveBeenCalledWith( duration );
//                 done();
//             } );
//         } );
//     } );
// } );
