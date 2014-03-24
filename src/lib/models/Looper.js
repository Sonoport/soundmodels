/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class Looper
 * @description A sound model which loads a sound file and allows it to be looped continuously at variable speed.
 * @module Looper
 */
define( [ 'core/BaseSound', 'core/SPAudioParam', "core/SPAudioBufferSourceNode", 'core/FileLoader' ],
    function ( BaseSound, SPAudioParam, SPAudioBufferSourceNode, FileLoader ) {
        "use strict";

        function Looper( sounds, onLoadCallback, context ) {
            if ( !( this instanceof Looper ) ) {
                throw new TypeError( "Looper constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );
            // Private vars
            var self = this;

            var sources_ = [];
            var multiTrackGains_ = [];
            var multiTrackGainNodes_ = [];
            var lastStopPosition_ = [];

            var sourcesToLoad = 0;

            var onSingleLoad = function () {
                sourcesToLoad--;
                lastStopPosition_.push( 0 );
                if ( sourcesToLoad === 0 ) {
                    self.releaseGainNode.connect( context.destination );
                    onLoadCallback( true );
                }
            };

            var insertBufferSource = function ( audioBuffer ) {
                var source = new SPAudioBufferSourceNode( self.audioContext );
                var gainNode = self.audioContext.createGain();

                source.buffer = audioBuffer;
                source.loopStart = source.buffer.duration * self.startPoint.value;
                source.loopEnd = source.buffer.duration;
                source.loop = true;

                source.connect( gainNode );
                gainNode.connect( self.releaseGainNode );

                var multiChannelGainParam = new SPAudioParam( "gainNode", 0.0, 1, 1, gainNode.gain, null, null, self.audioContext );

                sources_.push( source );
                multiTrackGainNodes_.push( gainNode );
                multiTrackGains_.push( multiChannelGainParam );
            };

            var setupSingleSound = function ( sound, onCompleteCallback ) {
                var parameterType = Object.prototype.toString.call( sounds );
                if ( parameterType === "[object String]" ) {
                    var fileLoader = new FileLoader( sound, self.audioContext, function ( status ) {
                        if ( status ) {
                            insertBufferSource( fileLoader.getBuffer() );
                            onCompleteCallback( status );
                        }
                    } );
                } else if ( parameterType === "[object AudioBuffer]" ) {
                    insertBufferSource( sounds );
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

            };

            // Public Properties
            this.riseTime = new SPAudioParam( "riseTime", 0.05, 10.0, 1, null, null, null, this.audioContext );
            this.decayTime = new SPAudioParam( "decayTime", 0.05, 10.0, 1, null, null, null, this.audioContext );

            this.startPoint = new SPAudioParam( "startPoint", 0.0, 0.99, 0.00, true, null, null, this.audioContext );
            this.playSpeed = new SPAudioParam( "playSpeed", -10.0, 10, 1, true, null, playSpeedSetter_, this.audioContext );

            // Public functions

            /**
             * Start playing after specific time and on what part of the sound.
             * @method start
             * @param {Number} startTime The delay in seconds before playing the sound
             * @param {Number} offset The starting position of the playhead
             */
            this.play = function () {

                if ( !this.isPlaying ) {
                    sources_.forEach( function ( thisSource, index ) {
                        var offset = ( lastStopPosition_ && lastStopPosition_[ index ] ) ? lastStopPosition_[ index ] : 0;
                        console.log( index + " staring from " + offset );
                        thisSource.start( 0, offset );
                    } );
                }

                BaseSound.prototype.start.call( this, 0 );

            };

            /**
             * Start playing after specific time and on what part of the sound.
             * @method start
             * @param {Number} startTime The delay in seconds before playing the sound
             * @param {Number} offset The starting position of the playhead
             */
            this.start = function ( startTime, offset ) {

                if ( !this.isPlaying ) {
                    sources_.forEach( function ( thisSource ) {
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
                    sources_.forEach( function ( thisSource ) {
                        thisSource.stop( startTime );
                    } );
                }

                BaseSound.prototype.stop.call( this, startTime );
            };

            /**
             * Pause the currently playing sound
             * @method pause
             */
            this.pause = function () {
                if ( this.isPlaying ) {
                    sources_ = sources_.map( function ( thisSource, index ) {
                        thisSource.stop( 0 );
                        lastStopPosition_[ index ] = thisSource.playbackPosition / thisSource.buffer.sampleRate;
                        console.log( index + " stopped at " + lastStopPosition_[ index ] );

                        thisSource.disconnect();

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

            // Load Sounds passed in the Constructor
            var parameterType = Object.prototype.toString.call( sounds );

            if ( parameterType === '[object Array]' ) {
                sourcesToLoad = sounds.length;
                sounds.forEach( function ( thisSound ) {
                    setupSingleSound( thisSound, onSingleLoad );
                } );
            } else {
                sourcesToLoad = 1;
                setupSingleSound( sounds, onSingleLoad );
            }
        }

        return Looper;
    } );
