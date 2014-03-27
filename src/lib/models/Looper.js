/**
 * @class Looper
 * @description A sound model which loads a sound file and allows it to be looped continuously at variable speed.
 * @module Models
 * @extends BaseSound
 */
define( [ 'core/BaseSound', 'core/SPAudioParam', "core/SPAudioBufferSourceNode", 'core/FileLoader' ],
    function ( BaseSound, SPAudioParam, SPAudioBufferSourceNode, FileLoader ) {
        "use strict";

        /**
        @constructor
        @param {AudioBuffer/String} sounds Single or Array of either URLs or AudioBuffers of sounds.
        @param {Function} onLoadCallback Callback when all sounds have finished loading.
        @context {AudioContext} AudioContext to be used.
        */
        function Looper( sounds, onLoadCallback, context ) {
            if ( !( this instanceof Looper ) ) {
                throw new TypeError( "Looper constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );

            // Private vars
            var self = this;

            var sources_ = [];
            var multiTrackGainNodes_ = [];
            var lastStopPosition_ = [];

            var sourcesToLoad_ = 0;

            var onSingleLoad = function () {
                sourcesToLoad_--;
                lastStopPosition_.push( 0 );
                if ( sourcesToLoad_ === 0 ) {
                    self.releaseGainNode.connect( context.destination );
                    onLoadCallback( true );
                }
            };

            var insertBufferSource = function ( audioBuffer ) {
                var source = new SPAudioBufferSourceNode( self.audioContext );
                var gainNode = self.audioContext.createGain();

                source.buffer = audioBuffer;
                source.loop = true;
                source.loopEnd = audioBuffer.duration;

                source.connect( gainNode );
                gainNode.connect( self.releaseGainNode );

                var multiChannelGainParam = new SPAudioParam( "gainNode", 0.0, 1, 1, gainNode.gain, null, null, self.audioContext );

                sources_.push( source );
                multiTrackGainNodes_.push( gainNode );
                self.multiTrackGain.push( multiChannelGainParam );
            };

            var setupSingleSound = function ( sound, onCompleteCallback ) {
                var parameterType = Object.prototype.toString.call( sound );
                if ( parameterType === "[object String]" ) {
                    var fileLoader = new FileLoader( sound, self.audioContext, function ( status ) {
                        if ( status ) {
                            insertBufferSource( fileLoader.getBuffer() );
                            onCompleteCallback( status );
                        }
                    } );
                } else if ( parameterType === "[object AudioBuffer]" ) {
                    insertBufferSource( sound );
                    onCompleteCallback( true );
                } else {
                    throw {
                        name: "Incorrect Parameter type Exception",
                        message: "Looper argument is not a URL or AudioBuffer",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }
            };

            var playSpeedSetter_ = function ( aParam, value, audioContext ) {
                /* 0.001 - 60dB Drop
                  e(-n) = 0.001; - Decay Rate of setTargetAtTime.
                  n = 6.90776;
                  */
                var t60multiplier = 6.90776;

                var currentSpeed = sources_[ 0 ] ? sources_[ 0 ].playbackRate.value : 1;

                if ( value > currentSpeed ) {
                    sources_.forEach( function ( thisSource ) {
                        thisSource.cancelScheduledValues( audioContext.currentTime );
                        thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.riseTime.value * t60multiplier );
                    } );
                } else if ( value < currentSpeed ) {
                    sources_.forEach( function ( thisSource ) {
                        thisSource.cancelScheduledValues( audioContext.currentTime );
                        thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.decayTime.value * t60multiplier );
                    } );
                }

            };

            var startPointSetter_ = function ( aParam, value ) {
                sources_.forEach( function ( thisSource ) {
                    thisSource.loopStart = value * thisSource.buffer.duration;
                } );
            };

            function init() {
                // Load Sounds passed in the Constructor
                var parameterType = Object.prototype.toString.call( sounds );

                if ( parameterType === '[object Array]' ) {
                    sourcesToLoad_ = sounds.length;
                    sounds.forEach( function ( thisSound ) {
                        setupSingleSound( thisSound, onSingleLoad );
                    } );
                } else {
                    sourcesToLoad_ = 1;
                    setupSingleSound( sounds, onSingleLoad );
                }
            }

            // Public Properties

            /**
            @property riseTime
            @type Number
            @default 0.05
            **/
            this.riseTime = SPAudioParam.createPsuedoParam( "riseTime", 0.05, 10.0, 1, this.audioContext );

            /**
            @property decayTime
            @type Number
            @default 0.05
            **/
            this.decayTime = SPAudioParam.createPsuedoParam( "decayTime", 0.05, 10.0, 1, this.audioContext );

            /**
            @property startPoint
            @type Number
            @default 0
            **/
            this.startPoint = new SPAudioParam( "startPoint", 0.0, 0.99, 0.00, null, null, startPointSetter_, this.audioContext );

            /**
            @property playSpeed
            @type Number
            @default 1.0
            **/
            this.playSpeed = new SPAudioParam( "playSpeed", -10.0, 10, 1, null, null, playSpeedSetter_, this.audioContext );

            /**
            @property multiTrackGain
            @type Array of SPAudioParam
            @default 1.0
            **/
            this.multiTrackGain = [];

            // Public functions

            /**
             * Plays the sound immediately. If the sound is paused, the sound will be
             * played back from the same position as it was paused at.
             * @method start
             */
            this.play = function () {

                if ( !this.isPlaying ) {
                    sources_.forEach( function ( thisSource, index ) {
                        var offset = ( lastStopPosition_ && lastStopPosition_[ index ] ) ? lastStopPosition_[ index ] : self.startPoint.value * thisSource.buffer.duration;
                        thisSource.start( 0, offset );
                    } );
                }

                BaseSound.prototype.start.call( this, 0 );

            };

            /**
             * Start playing after specific time and from a specific offset. If offset is not defined,
             * the value of startPoint property is used.
             * @method start
             * @param {Number} startTime The delay in seconds before playing the sound
             * @param {Number} offset The starting position of the playhead
             */
            this.start = function ( startTime, offset ) {
                if ( !this.isPlaying ) {
                    sources_.forEach( function ( thisSource ) {
                        if ( typeof offset === 'undefined' ) {
                            offset = self.startPoint.value * thisSource.buffer.duration;
                        }
                        thisSource.start( startTime, offset );
                    } );
                }

                BaseSound.prototype.start.call( this, startTime );
            };

            /**
             * Stops the sound and resets play head to 0.
             * @method stop
             * @param {Number} startTime Time offset to stop
             */
            this.stop = function ( startTime ) {

                if ( this.isPlaying ) {
                    sources_ = sources_.map( function ( thisSource, index ) {
                        thisSource.stop( startTime );
                        lastStopPosition_[ index ] = 0;

                        // Create a new source since SourceNodes can't play again.
                        var newSource = new SPAudioBufferSourceNode( self.audioContext );
                        newSource.buffer = thisSource.buffer;
                        newSource.loopStart = newSource.buffer.duration * self.startPoint.value;
                        newSource.loopEnd = newSource.buffer.duration;
                        newSource.loop = true;
                        newSource.connect( multiTrackGainNodes_[ index ] );

                        return newSource;
                    } );
                }

                BaseSound.prototype.stop.call( this, startTime );
            };

            /**
             * Pause the currently playing sound at the current position.
             * @note Position property is not sample accurate, but accurate enough.
             * @method pause
             */
            this.pause = function () {
                if ( this.isPlaying ) {
                    sources_ = sources_.map( function ( thisSource, index ) {
                        thisSource.stop( 0 );
                        lastStopPosition_[ index ] = thisSource.playbackPosition / thisSource.buffer.sampleRate;
                        //console.log( index + " stopped at " + lastStopPosition_[ index ] );

                        thisSource.disconnect();

                        // Create a new source since SourceNodes can't play again.
                        var newSource = new SPAudioBufferSourceNode( self.audioContext );
                        newSource.buffer = thisSource.buffer;
                        newSource.loopStart = newSource.buffer.duration * self.startPoint.value;
                        newSource.loopEnd = newSource.buffer.duration;
                        newSource.loop = true;
                        newSource.connect( multiTrackGainNodes_[ index ] );

                        return newSource;
                    } );
                }

                BaseSound.prototype.stop.call( this, 0 );
            };

            // Initialize the sounds.
            init();
        }

        return Looper;
    } );
