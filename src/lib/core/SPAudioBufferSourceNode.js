/**
 * @class SPAudioBufferSourceNode
 * @description A wrapper around the AudioBufferSourceNode to be able to track the current
 *                      playPosition of a AudioBufferSourceNode.
 * @module Core
 */
define( [],
    function () {
        "use strict";

        function SPAudioBufferSourceNode( audioContext ) {
            var bufferSourceNode = audioContext.createBufferSource();
            var counterNode = audioContext.createBufferSource();

            var scopeNode = audioContext.createScriptProcessor();
            var lastPos = 0;

            this.channelCount = bufferSourceNode.channelCount;
            this.channelCountMode = bufferSourceNode.channelCountMode;
            this.channelInterpretation = bufferSourceNode.channelInterpretation;
            this.numberOfInputs = bufferSourceNode.numberOfInputs;
            this.numberOfOutputs = bufferSourceNode.numberOfOutputs;
            this.playbackState = bufferSourceNode.playbackState;

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

            Object.defineProperty( this, 'onended', {
                enumerable: true,
                set: function ( onended ) {
                    bufferSourceNode.onended = onended;
                },
                get: function () {
                    return bufferSourceNode.onended;
                }
            } );

            Object.defineProperty( this, 'gain', {
                enumerable: true,
                set: function ( gain ) {
                    bufferSourceNode.gain = gain;
                },
                get: function () {
                    return bufferSourceNode.gain;
                }
            } );

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

            Object.defineProperty( this, 'playbackRate', {
                enumerable: true,
                set: function ( playbackRate ) {
                    bufferSourceNode.playbackRate = playbackRate;
                    counterNode.playbackRate = playbackRate;
                },
                get: function () {
                    return bufferSourceNode.playbackRate;
                }
            } );

            Object.defineProperty( this, 'playbackPosition', {
                enumerable: true,
                get: function () {
                    return lastPos;
                }
            } );

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

            this.connect = function ( audioNode ) {
                bufferSourceNode.connect( audioNode );
                scopeNode.connect( audioNode );
            };

            this.disconnect = function ( output ) {
                bufferSourceNode.disconnect( output );
                scopeNode.disconnect( output );
            };

            this.start = function ( time, offset ) {
                bufferSourceNode.start( time, offset );
                counterNode.start( time, offset );
            };

            this.stop = function ( time ) {
                bufferSourceNode.stop( time );
                counterNode.stop( time );
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
                lastPos = inputBuffer[ inputBuffer.length ];
            }

            init();

        }
        return SPAudioBufferSourceNode;
    } );
