/**
 * @module Core
 */
define( [ 'core/SPPlaybackRateParam', 'core/WebAudioDispatch' ],
    function ( SPPlaybackRateParam, webAudioDispatch ) {
        "use strict";

        /**
         * A wrapper around the AudioBufferSourceNode to be able to track the current playPosition of a AudioBufferSourceNode.
         *
         * @class SPAudioBufferSourceNode
         * @constructor
         * @param {AudioContext} AudioContext to be used in timing the parameter automation events
         */
        function SPAudioBufferSourceNode( audioContext ) {
            var bufferSourceNode = audioContext.createBufferSource();
            var counterNode = audioContext.createBufferSource();

            var scopeNode = audioContext.createScriptProcessor( 256, 1, 1 );
            var lastPos = 0;

            this.audioContext = audioContext;
            this.channelCount = bufferSourceNode.channelCount;
            this.channelCountMode = bufferSourceNode.channelCountMode;
            this.channelInterpretation = bufferSourceNode.channelInterpretation;
            this.numberOfInputs = bufferSourceNode.numberOfInputs;
            this.numberOfOutputs = bufferSourceNode.numberOfOutputs;
            this.playbackState = bufferSourceNode.playbackState;

            /**
             * The speed at which to render the audio stream. Its default value is 1. This parameter is a-rate.
             *
             * @property playbackRate
             * @type AudioParam
             * @default 1
             *
             */
            this.playbackRate = new SPPlaybackRateParam( bufferSourceNode.playbackRate, counterNode.playbackRate );

            /**
             * An optional value in seconds where looping should end if the loop attribute is true.
             *
             * @property loopEnd
             * @type Number
             * @default 0
             *
             */
            Object.defineProperty( this, 'loopEnd', {
                enumerable: true,
                set: function ( loopEnd ) {
                    bufferSourceNode.loopEnd = loopEnd;
                    counterNode.loopEnd = loopEnd;
                },
                get: function () {
                    return bufferSourceNode.loopEnd;
                }
            } );

            /**
             * An optional value in seconds where looping should begin if the loop attribute is true.
             *
             * @property loopStart
             * @type Number
             * @default 0
             *
             */
            Object.defineProperty( this, 'loopStart', {
                enumerable: true,
                set: function ( loopStart ) {
                    bufferSourceNode.loopStart = loopStart;
                    counterNode.loopStart = loopStart;
                },
                get: function () {
                    return bufferSourceNode.loopStart;
                }
            } );

            /**
             * A property used to set the EventHandler for the ended event that is dispatched to AudioBufferSourceNode node types
             *
             * @property onended
             * @type Function
             * @default null
             *
             */
            Object.defineProperty( this, 'onended', {
                enumerable: true,
                set: function ( onended ) {
                    bufferSourceNode.onended = onended;
                },
                get: function () {
                    return bufferSourceNode.onended;
                }
            } );

            /**
             * Indicates if the audio data should play in a loop.
             *
             * @property loop
             * @type Boolean
             * @default false
             *
             */
            Object.defineProperty( this, 'loop', {
                enumerable: true,
                set: function ( loop ) {
                    bufferSourceNode.loop = loop;
                    counterNode.loop = loop;
                },
                get: function () {
                    return bufferSourceNode.loop;
                }
            } );

            /**
             * Position (in seconds) of the last frame played back by the AudioContext
             *
             * @property playbackPosition
             * @type Number
             * @default 0
             *
             */
            Object.defineProperty( this, 'playbackPosition', {
                enumerable: true,
                get: function () {
                    return lastPos;
                }
            } );

            /**
             * Represents the audio asset to be played.
             *
             * @property buffer
             * @type AudioBuffer
             * @default null
             *
             */
            Object.defineProperty( this, 'buffer', {
                enumerable: true,
                set: function ( buffer ) {
                    bufferSourceNode.buffer = buffer;
                    counterNode.buffer = createCounterBuffer( buffer );
                },
                get: function () {
                    return bufferSourceNode.buffer;
                }
            } );

            /**
             * Connects the AudioNode to the input of another AudioNode.
             *
             * @method connect
             * @param {AudioNode} destination AudioNode to connect to.
             * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
             * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
             *
             */
            this.connect = function ( destination, output, input ) {
                bufferSourceNode.connect( destination, output, input );
                scopeNode.connect( destination, output, input );
            };

            /**
             * Disconnects the AudioNode from the input of another AudioNode.
             *
             * @method disconnect
             * @param {Number} [output] Index describing which output of the AudioNode to disconnect.
             *
             */
            this.disconnect = function ( output ) {
                bufferSourceNode.disconnect( output );
                scopeNode.disconnect( output );
            };

            /**
             * Schedules a sound to playback at an exact time.
             *
             * @method start
             * @param {Number} when Time (in seconds) when the sound should start playing.
             * @param {Number} [offset] Offset time in the buffer (in seconds) where playback will begin
             * @param {Number} [duration] Duration of the portion (in seconds) to be played
             *
             */
            this.start = function ( when, offset, duration ) {
                if ( typeof duration == 'undefined' ) {
                    duration = bufferSourceNode.buffer.duration;
                }
                bufferSourceNode.start( when, offset, duration );
                counterNode.start( when, offset, duration );
            };

            /**
             * Schedules a sound to stop playback at an exact time.
             *
             * @method stop
             * @param {Number} when Time (in seconds) when the sound should stop playing.
             *
             */
            this.stop = function ( when ) {
                bufferSourceNode.stop( when );
                counterNode.stop( when );
            };

            /**
             * Resets the SP Buffer Source with a fresh BufferSource.
             *
             * @method resetBufferSource
             * @param {Number} when Time (in seconds) when the Buffer source should be reset.
             * @param {AudioNode} output The output to which the BufferSource is to be connected.
             *
             */
            this.resetBufferSource = function ( when, output ) {

                var self = this;
                webAudioDispatch( function () {
                    self.disconnect( output );
                    var newSource = self.audioContext.createBufferSource();
                    newSource.buffer = bufferSourceNode.buffer;
                    newSource.loopStart = bufferSourceNode.loopStart;
                    newSource.loopEnd = bufferSourceNode.loopEnd;
                    newSource.onended = bufferSourceNode.onended;
                    bufferSourceNode = newSource;
                    var newCounterNode = audioContext.createBufferSource();
                    newCounterNode.buffer = counterNode.buffer;
                    newCounterNode.connect( scopeNode );
                    counterNode = newCounterNode;

                    self.playbackRate = new SPPlaybackRateParam( bufferSourceNode.playbackRate, counterNode.playbackRate );
                    self.connect( output );
                }, when, this.audioContext );
            };

            // Private Methods

            function createCounterBuffer( buffer ) {
                var array = new Float32Array( buffer.length );
                var audioBuf = audioContext.createBuffer( 1, buffer.length, 44100 );

                for ( var index = 0; index < buffer.length; index++ ) {
                    array[ index ] = index;
                }

                audioBuf.getChannelData( 0 )
                    .set( array );
                return audioBuf;
            }

            function init() {
                counterNode.connect( scopeNode );
                scopeNode.onaudioprocess = savePosition;
            }

            function savePosition( processEvent ) {
                var inputBuffer = processEvent.inputBuffer.getChannelData( 0 );
                lastPos = inputBuffer[ inputBuffer.length - 1 ] || 0;
            }

            init();

        }
        return SPAudioBufferSourceNode;
    } );
