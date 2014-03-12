/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class Looper
 * @description A sound model which loads a sound file and allows it to be looped continuously at variable speed.
 * @module Looper
 */
define( [ 'core/BaseSound', 'core/SPAudioParam', 'core/FileReader' ], function ( BaseSound, SPAudioParam, FileReader ) {

    "use strict";

    function Looper( sounds, callback ) {

        if ( !( this instanceof Looper ) ) {

            throw new TypeError( "Looper constructor cannot be called as a function." );

        }

        // Call superclass constructor
        BaseSound.call( this );

        // Private vars

        var that = this;

        var aFileReaders_ = [];
        var aSources_ = [];
        var aMultiTrackGains_ = [];

        var bParameterIsString_ = false;
        var bParameterIsAnAudioBuffer_ = false;
        var bParameterIsAnArray_ = false;
        var bFromPausedState_ = false;

        var nNumberOfSourcesLoaded_ = 0;
        var nNumberOfSourcesTotal_ = 0;
        var nStartPosition_ = 0;
        var nPlayPosition_ = 0;

        var fCallback_ = callback;

        var bInnerLoopInitialized_ = false;
        var bInnerLoopCall_ = false;

        // Private functions  

        /**
         * Adjust the time according to decayTime and riseTime
         * @private
         * @method adjustTime
         * @param {Float} newValue
         * @param {Float} currentValue
         * @param {Number} time
         * @returns {Number}
         */
        var adjustTime_ = function ( newValue, currentValue, time ) {

            if ( isNaN( time ) || typeof time === "undefined" ) {

                time = that.audioContext.currentTime;

            }

            if ( newValue > currentValue ) {

                time += that.riseTime.value;


            } else {

                time += that.decayTime.value;

            }

            return time;

        };

        /**
         * Checks if parameter passed on the constructor is valid
         * @private
         * @method bParameterValid
         * @param {Object} sounds
         * @returns {Boolean}
         */
        var bParameterValid_ = function ( sounds ) {

            // Check if there is a parameter
            if ( typeof sounds === "undefined" ) {

                console.log( "Error. Missing Looper constructor parameter." );
                return false;

            }

            // Check if it is not a just a blank string
            if ( typeof sounds === "string" ) {

                if ( /\S/.test( sounds ) ) {

                    bParameterIsString_ = true;
                    return true;

                }

            }

            // Check if it an AudioBuffer
            if ( Object.prototype.toString.call( sounds ) === '[object AudioBuffer]' ) {

                bParameterIsAnAudioBuffer_ = true;
                return true;

            }

            // Check if it is an array
            if ( Object.prototype.toString.call( sounds ) === '[object Array]' ) {

                bParameterIsAnArray_ = true;
                return true;

            }

            console.log( "Error. Wrong parameter for Looper." );
            return false;

        };

        /**
         * Create gain nodes for each sources
         * @private
         * @method createGainNode
         * @param {AudioBuffer} source
         */
        var createGainNode_ = function ( source ) {

            var gainNode = that.audioContext.createGain();

            source.connect( gainNode );
            gainNode.connect( that.releaseGainNode );

            var spGainNode = new SPAudioParam( "gainNode", 0.0, 1, 1, gainNode.gain, null, multiTrackGainSetter_, that.audioContext );

            // spGainNode Overrides
            spGainNode.setValueAtTime = function ( value, startTime ) {

                var aParam = resetAudioParam_( gainNode.gain );
                aParam.setValueAtTime( value, adjustTime_( value, aParam.value, startTime ) );

            };

            spGainNode.setTargetAtTime = function ( target, startTime, timeConstant ) {

                var aParam = resetAudioParam_( gainNode.gain );
                aParam.setTargetAtTime( target, adjustTime_( target, aParam.value, startTime ), timeConstant );

            };

            spGainNode.setValueCurveAtTime = function ( values, startTime, duration ) {

                var aParam = resetAudioParam_( gainNode.gain );

                if ( isNaN( startTime ) || typeof startTime === "undefined" ) {

                    startTime = that.audioContext.currentTime;

                }

                aParam.setValueCurveAtTime( values, startTime, duration );

            };

            spGainNode.exponentialRampToValueAtTime = function ( value, endTime ) {

                var aParam = resetAudioParam_( gainNode.gain );
                aParam.exponentialRampToValueAtTime( value, adjustTime_( value, aParam.value, endTime ) );

            };

            spGainNode.linearRampToValueAtTime = function ( value, endTime ) {

                var aParam = resetAudioParam_( gainNode.gain );
                aParam.linearRampToValueAtTime( value, adjustTime_( value, aParam.value, endTime ) );

            };

            spGainNode.cancelScheduledValues = function ( startTime ) {

                var aParam = resetAudioParam_( gainNode.gain );
                aParam.cancelScheduledValues( startTime );

            };

            aMultiTrackGains_.push( spGainNode );

        };

        /**
         * Populate sources
         * @private
         * @method populateSources
         * @private
         */
        var populateSources_ = function () {

            // Reset values

            aSources_ = [];
            aMultiTrackGains_ = [];

            for ( var i = 0; i < aFileReaders_.length; i++ ) {

                if ( aFileReaders_[ i ].isLoaded() ) {

                    var source = that.audioContext.createBufferSource();

                    source.buffer = aFileReaders_[ i ].getBuffer();
                    source.loopStart = source.buffer.duration * that.startPoint.value;
                    source.loopEnd = source.buffer.duration;
                    source.loop = true;

                    // Create a gain node
                    createGainNode_( source );

                    // Connect to releaseGainNode
                    that.releaseGainNode.connect( that.audioContext.destination );

                    aSources_.push( source );

                } else {
                    console.log( "Not loaded" );
                }

            }

        };

        /**
         * Handler for successfull file / buffer loads
         * @private
         * @method onLoadSuccess
         * @param {Boolean} bSuccess The result if it was a success (true) or not (false).
         */
        var onLoadSuccess_ = function ( bSuccess ) {

            if ( bSuccess ) {

                nNumberOfSourcesLoaded_++;

            } else {

                nNumberOfSourcesTotal_--;

            }

            // If all possible sources loaded
            if ( nNumberOfSourcesLoaded_ === nNumberOfSourcesTotal_ ) {


                if ( typeof fCallback_ !== "undefined" && typeof fCallback_ === "function" ) {

                    if ( nNumberOfSourcesLoaded_ > 0 ) {

                        // Execute successful callback
                        fCallback_( true );

                    } else {

                        // Execute fail callback
                        fCallback_( false );

                    }

                }

            }

        };

        /**
         * Parse the parameter and look for links and audiobuffers
         * @private
         * @method parseParameters
         * @param {String | Array | AudioBuffer} sounds
         */
        var parseParameters_ = function ( sounds ) {

            nNumberOfSourcesTotal_ = 1;

            if ( bParameterIsString_ || bParameterIsAnAudioBuffer_ ) {

                var frSingle = new FileReader( that.audioContext );

                aFileReaders_.push( frSingle );
                frSingle.open( sounds, onLoadSuccess_ );

            } else if ( bParameterIsAnArray_ ) {

                nNumberOfSourcesTotal_ = sounds.length;

                for ( var i = 0; i < nNumberOfSourcesTotal_; i++ ) {

                    var bIsString = false;
                    var bIsBuffer = false;

                    // Check individually each entry if it is a string
                    if ( typeof sounds[ i ] === "string" ) {

                        if ( /\S/.test( sounds[ i ] ) ) {

                            bIsString = true;

                        }

                    } else if ( Object.prototype.toString.call( sounds[ i ] ) === '[object AudioBuffer]' ) {

                        bIsBuffer = true;

                    }

                    // If either of the two, go nuts
                    if ( bIsString || bIsBuffer ) {

                        var frArray = new FileReader( that.audioContext );

                        aFileReaders_.push( frArray );
                        frArray.open( sounds[ i ], onLoadSuccess_ );

                    }

                }

            }

        };

        /**
         * Reset AudioParam setting
         * @param {AudioParam} aParam
         * @method resetAudioParam
         * @returns {AudioParam}
         */
        var resetAudioParam_ = function ( aParam ) {

            aParam.cancelScheduledValues( that.audioContext.currentTime );
            aParam.setValueAtTime( aParam.value, that.audioContext.currentTime );

            return aParam;

        };

        // AudioParam Mappers and Setters

        /**
         * Setter for multiTrackGain SPAudioParam
         * @private
         * @method multiTrackGainSetter
         * @param {AudioParam} aParam
         * @param {Number} value
         * @param {AudioContext} audioContext
         */
        var multiTrackGainSetter_ = function ( aParam, value, audioContext ) {

            var nTime = audioContext.currentTime;
            aParam = resetAudioParam_( aParam );

            // Skip delay if from paused position. Need to fix with proper buffer position location
            if ( bFromPausedState_ ) {

                aParam.setValueAtTime( value, nTime );
                return;

            }

            aParam.linearRampToValueAtTime( value, adjustTime_( value, aParam.value, nTime ) );

        };

        /**
         * Setter for playSpeed SPAudioParam
         * @private
         * @method playSpeedSetter
         * @param {AudioParam} aParam
         * @param {Number} value
         * @param {AudioContext} audioContext
         */
        var playSpeedSetter_ = function ( aParam, value, audioContext ) {

            for ( var i = 0; i < aSources_.length; i++ ) {

                var nTime = audioContext.currentTime;
                aParam = resetAudioParam_( aSources_[ i ].playbackRate );

                // Skip delay if from paused position. Need to fix with proper buffer position location
                if ( bFromPausedState_ ) {

                    aParam.setValueAtTime( value, nTime );
                    return;

                }

                aParam.linearRampToValueAtTime( value, adjustTime_( value, aParam.value, nTime ) );

            }

        };

        /**
         * Setter for innerStartPoint SPAudioParam
         * @private
         * @method innerStartPointSetter
         * @param {AudioParam} aParam
         * @param {Number} value
         * @param {AudioContext} audioContext
         */
        var innerStartPointSetter_ = function ( aParam, value, audioContext ) {

            bInnerLoopCall_ = false;

        };

        /**
         * Setter for startPoint SPAudioParam
         * @private
         * @method startPointSetter
         * @param {AudioParam} aParam
         * @param {Number} value
         * @param {AudioContext} audioContext
         */
        var startPointSetter_ = function ( aParam, value, audioContext ) {

            if ( !bInnerLoopCall_ ) {

                if ( typeof innerStartPoint_ !== "undefined" ) {

                    innerStartPoint_.cancelScheduledValues( 0 );
                    bInnerLoopInitialized_ = true;
                    innerStartPoint_.linearRampToValueAtTime( value, adjustTime_( value, that.startPoint.value ) );

                }

            }

        };

        /**
         * Mapper for startPoint SPAudioParam
         * @private
         * @method startPointMapper
         * @param {Number} value
         */
        var startPointMapper_ = function ( value ) {

            if ( bInnerLoopCall_ ) {

                for ( var i = 0; i < aSources_.length; i++ ) {

                    aSources_[ i ].loopStart = aSources_[ i ].buffer.duration * value;

                }

            }

            return value;

        };

        /**
         * Mapper for innerStartPoint SPAudioParam
         * @private
         * @method innerStartPointMapper
         * @param {Number} value
         */
        var innerStartPointMapper_ = function ( value ) {

            bInnerLoopCall_ = true;

            if ( !bInnerLoopInitialized_ ) {

                that.startPoint.value = value;

            } else {

                bInnerLoopInitialized_ = false;

            }

            return value;

        };

        /**
         * Mapper for riseTime SPAudioParam
         * @private
         * @method riseTimeMapper
         * @param {Number} value
         */
        var riseTimeMapper_ = function ( value ) {

            that.riseTime.cancelScheduledValues( 0 );
            return value;

        };

        /**
         * Mapper for decayTime SPAudioParam
         * @private
         * @method decayTimeMapper
         * @param {Number} value
         */
        var decayTimeMapper_ = function ( value ) {

            that.decayTime.cancelScheduledValues( 0 );
            return value;

        };

        // Public vars

        // AudioParams

        this.riseTime = new SPAudioParam( "riseTime", 0.05, 10.0, 1, null, riseTimeMapper_, null, this.audioContext );
        this.decayTime = new SPAudioParam( "decayTime", 0.05, 10.0, 1, null, decayTimeMapper_, null, this.audioContext );
        this.startPoint = new SPAudioParam( "startPoint", 0.0, 0.99, 0.03, true, startPointMapper_, startPointSetter_, this.audioContext );
        this.playSpeed = new SPAudioParam( "playSpeed", -10.0, 10, 1, true, null, playSpeedSetter_, this.audioContext );

        var innerStartPoint_ = new SPAudioParam( "innerStartPoint", this.startPoint.minValue, this.startPoint.maxValue, this.startPoint.defaultValue, true, innerStartPointMapper_, innerStartPointSetter_, this.audioContext );

        // startPoint Overrides
        this.startPoint.setValueAtTime = function ( value, startTime ) {

            innerStartPoint_.cancelScheduledValues( 0 );
            bInnerLoopInitialized_ = true;

            innerStartPoint_.setValueAtTime( value, adjustTime_( value, that.startPoint.value, startTime ) );

        };

        this.startPoint.setTargetAtTime = function ( target, startTime, timeConstant ) {

            innerStartPoint_.cancelScheduledValues( 0 );
            bInnerLoopInitialized_ = true;

            innerStartPoint_.setTargetAtTime( target, adjustTime_( target, that.startPoint.value, startTime ), timeConstant );

        };

        this.startPoint.setValueCurveAtTime = function ( values, startTime, duration ) {

            innerStartPoint_.cancelScheduledValues( 0 );
            bInnerLoopInitialized_ = true;

            if ( isNaN( startTime ) || typeof startTime === "undefined" ) {

                startTime = this.audioContext.currentTime;

            }

            innerStartPoint_.setValueCurveAtTime( values, startTime, duration );

        };

        this.startPoint.exponentialRampToValueAtTime = function ( value, endTime ) {

            innerStartPoint_.cancelScheduledValues( 0 );
            bInnerLoopInitialized_ = true;
            innerStartPoint_.exponentialRampToValueAtTime( value, adjustTime_( value, that.startPoint.value, endTime ) );

        };

        this.startPoint.linearRampToValueAtTime = function ( value, endTime ) {

            innerStartPoint_.cancelScheduledValues( 0 );
            bInnerLoopInitialized_ = true;
            innerStartPoint_.linearRampToValueAtTime( value, adjustTime_( value, that.startPoint.value, endTime ) );

        };

        this.startPoint.cancelScheduledValues = function ( startTime ) {

            bInnerLoopInitialized_ = true;
            innerStartPoint_.cancelScheduledValues( startTime );

        };

        // playSpeed Overrides
        this.playSpeed.setValueAtTime = function ( value, startTime ) {

            for ( var i = 0; i < aSources_.length; i++ ) {

                var aParam = resetAudioParam_( aSources_[ i ].playbackRate );
                aParam.setValueAtTime( value, adjustTime_( value, aParam.value, startTime ) );

            }

        };

        this.playSpeed.setTargetAtTime = function ( target, startTime, timeConstant ) {

            for ( var i = 0; i < aSources_.length; i++ ) {

                var aParam = resetAudioParam_( aSources_[ i ].playbackRate );
                aParam.setTargetAtTime( target, adjustTime_( target, aParam.value, startTime ), timeConstant );

            }

        };

        this.playSpeed.setValueCurveAtTime = function ( values, startTime, duration ) {

            for ( var i = 0; i < aSources_.length; i++ ) {

                var aParam = resetAudioParam_( aSources_[ i ].playbackRate );

                if ( isNaN( startTime ) || typeof startTime === "undefined" ) {

                    startTime = this.audioContext.currentTime;

                }

                aParam.setValueCurveAtTime( values, startTime, duration );

            }

        };

        this.playSpeed.exponentialRampToValueAtTime = function ( value, endTime ) {

            for ( var i = 0; i < aSources_.length; i++ ) {

                var aParam = resetAudioParam_( aSources_[ i ].playbackRate );
                aParam.exponentialRampToValueAtTime( value, adjustTime_( value, aParam.value, endTime ) );

            }

        };

        this.playSpeed.linearRampToValueAtTime = function ( value, endTime ) {

            for ( var i = 0; i < aSources_.length; i++ ) {

                var aParam = resetAudioParam_( aSources_[ i ].playbackRate );
                aParam.linearRampToValueAtTime( value, adjustTime_( value, aParam.value, endTime ) );

            }

        };

        this.playSpeed.cancelScheduledValues = function ( startTime ) {

            for ( var i = 0; i < aSources_.length; i++ ) {

                var aParam = resetAudioParam_( aSources_[ i ].playbackRate );
                aParam.cancelScheduledValues( startTime );

            }

        };

        /**
         * Getter for multiTrackGain
         * @type Arguments
         */
        this.__defineGetter__( 'multiTrackGain', function () {

            return aMultiTrackGains_;

        } );

        // Public functions 

        /**
         * Plays the sound at position 0.
         * @method play
         */
        this.play = function () {

            nPlayPosition_ = 0;
            this.start( 0 );

        };

        /**
         * Start playing after specific time and on what part of the sound.
         * @method start
         * @param {Number} currTime The delay in seconds before playing the sound
         * @param {Number} offset The starting position of the playhead
         */
        this.start = function ( currTime, offset ) {

            if ( typeof currTime === "undefined" ) {

                currTime = 0;

            }

            if ( typeof offset === "undefined" ) {

                offset = 0;

            }

            if ( this.isPlaying ) {

                this.stop();

            }

            nStartPosition_ = this.audioContext.currentTime;

            // Get sources again
            populateSources_();

            for ( var i = 0; i < aSources_.length; i++ ) {

                var nDefaultPlaySpeed = 1;

                if ( this.playSpeed.value !== 0 ) {

                    nDefaultPlaySpeed = this.playSpeed.value;

                }

                // Not accurate if paused while on transition from one value to another. If the transition completes it's ok.
                aSources_[ i ].start( currTime, aSources_[ i ].loopStart + ( offset % aSources_[ i ].buffer.duration * nDefaultPlaySpeed ) );

            }

            if ( bFromPausedState_ ) {

                bFromPausedState_ = false;

            }

            this.isPlaying = true;

        };

        /**
         * Stops the sound and resets play head to 0.
         * @method stop
         * @param {Number} value Time offset to stop
         */
        this.stop = function ( value ) {

            if ( typeof value === "undefined" ) {

                value = this.audioContext.currentTime;

            }

            if ( this.isPlaying ) {

                for ( var i = 0; i < aSources_.length; i++ ) {

                    aSources_[ i ].noteOff( value );

                }

                nPlayPosition_ = 0;
                this.isPlaying = false;

            }

        };

        /**
         * Pause the currently playing sound
         * @method pause
         */
        this.pause = function () {

            if ( this.isPlaying ) {

                // Save current position before being erased at stop method
                var currentPlayPosition = nPlayPosition_;
                this.stop();
                nPlayPosition_ = currentPlayPosition + this.audioContext.currentTime - nStartPosition_;

            } else {

                bFromPausedState_ = true;
                this.start( 0, nPlayPosition_ );

            }

        };

        /**
         * Linearly ramp down the gain of the audio in time (seconds) to 0.
         * @method release
         * @param {Number} fadeTime Amount of time it takes for linear ramp down to happen.
         */
        this.release = function ( fadeTime ) {

            BaseSound.prototype.release.call( this, fadeTime );

        };

        /**
         * Connects release Gain Node to an AudioNode or AudioParam.
         * @method connect
         * @param {Object} output Connects to an AudioNode or AudioParam.
         */
        this.connect = function ( output ) {

            BaseSound.prototype.connect.call( this, output );

        };

        /**
         * Disconnects release Gain Node from an AudioNode or AudioParam.
         * @param {Object} output Takes in an AudioNode or AudioParam.
         */
        this.disconnect = function ( output ) {

            BaseSound.prototype.disconnect.call( this, output );

        };

        // Init

        // Do validation of constructor parameter
        if ( !bParameterValid_( sounds ) ) {

            return;

        }

        // Start parsing parameters
        parseParameters_( sounds );

    }

    // Extend BaseSound
    Looper.prototype = Object.create( BaseSound.prototype );

    Looper.prototype = {

        constructor: Looper

    };

    return Looper;

} );
