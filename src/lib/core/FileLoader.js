/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class FileLoader
 * @description Load file from a URL.
 */
define( [ 'core/DetectLoopMarkers' ],
    function ( detectLoopMarkers ) {
        "use strict";

        /*
         * @constructor
         * @param {String} URL URL of the file to be Loaded
         * @param {String} context AudioContext to be used in decoding the file
         * @param {String} onloadCallback Callback function to be called when the file loading is complete.
         */
        function FileLoader( URL, context, onloadCallback ) {
            if ( !( this instanceof FileLoader ) ) {
                throw new TypeError( "FileLoader constructor cannot be called as a function." );
            }
            var buffer_;
            var nLoopStart_ = 0;
            var nLoopEnd_ = 0;
            var nLoopLength_ = 0;

            var bSoundLoaded_ = false;

            var context_;
            var callback_;
            var link_;

            // Private functions
            /**
             * Check if a value is an integer.
             * @private
             * @param {Object} value
             * @returns {Boolean} Result of test.
             */
            var isInt_ = function ( value ) {
                var er = /^[0-9]+$/;
                if ( er.test( value ) ) {
                    return true;
                }
                return false;
            };

            /**
             * Get a buffer based on the start and end markers.
             * @private
             * @method sliceBuffer
             * @param {Number} start The start of the buffer to load.
             * @param {Number} end The end of the buffer to load.
             * @returns {AudioBuffer} The requested sliced buffer.
             */
            var sliceBuffer_ = function ( start, end ) {
                var aChannels = [];
                var nChannels = buffer_.numberOfChannels;

                // Set end if it is missing
                if ( typeof end === "undefined" ) {
                    end = buffer_.length;
                }
                // Verify parameters
                if ( !isInt_( start ) ) {
                    throw {
                        name: "Incorrect parameter type Exception",
                        message: "FileLoader getBuffer start parameter is not an integer",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                } else if ( !isInt_( end ) ) {
                    throw {
                        name: "Incorrect parameter type Exception",
                        message: "FileLoader getBuffer end parameter is not an integer",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }
                // Check if start is smaller than end
                if ( start > end ) {
                    throw {
                        name: "Incorrect parameter type Exception",
                        message: "FileLoader getBuffer start parameter should be smaller than end parameter",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }
                // Check if start is within the buffer size
                if ( start > nLoopEnd_ || start < nLoopStart_ ) {
                    throw {
                        name: "Incorrect parameter type Exception",
                        message: "FileLoader getBuffer start parameter should be within the buffer size : 0-" + buffer_.length,
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }

                // Check if end is within the buffer size
                if ( end > nLoopEnd_ || end < nLoopStart_ ) {
                    throw {
                        name: "Incorrect parameter type Exception",
                        message: "FileLoader getBuffer end parameter should be within the buffer size : 0-" + buffer_.length,
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }

                nLength = end - start;

                // Create the new buffer
                var newBuffer = context_.createBuffer( buffer_.numberOfChannels, nLength, buffer_.sampleRate );

                // Start trimming
                for ( var i = 0; i < nChannels; i++ ) {
                    var aData = new Float32Array( buffer_.getChannelData( i ) );
                    newBuffer.getChannelData( i )
                        .set( aData.subarray( start, end ) );
                }

                return newBuffer;
            };

            // Public functions
            /**
             * Get the current buffer.
             * @method getBuffer
             * @param {Number} start The start index
             * @param {Number} end the end index
             * @returns {AudioBuffer} The AudioBuffer that was marked then trimmed if it is not a wav file.
             */
            this.getBuffer = function ( start, end ) {
                // Set start if it is missing
                if ( typeof start === "undefined" ) {
                    start = 0;
                }
                // Set end if it is missing
                if ( typeof end === "undefined" ) {
                    end = nLoopEnd_ - nLoopStart_;
                }

                return sliceBuffer_( nLoopStart_ + start, nLoopStart_ + end );
            };

            /**
             * Get the original buffer.
             * @method getRawBuffer
             * @returns {AudioBuffer} The original AudioBuffer.
             */
            this.getRawBuffer = function () {
                return buffer_;
            };

            /**
             * Check if sound is already loaded.
             * @method isLoaded
             * @returns {Boolean} True if file is loaded. Flase if file is not yeat loaded.
             */
            this.isLoaded = function () {
                return bSoundLoaded_;
            };

            context_ = context;
            callback_ = onloadCallback;
            link_ = URL;

            // Make a request
            var request = new XMLHttpRequest();
            request.open( 'GET', link_, true );
            request.responseType = 'arraybuffer';
            request.onload = function () {
                context_.decodeAudioData( request.response, function ( buffer ) {
                    var fileExtension = /[^.]+$/.exec( link_ );
                    bSoundLoaded_ = true;
                    buffer_ = buffer;
                    // Do trimming if it is not a wave file
                    if ( fileExtension[ 0 ] !== "wav" ) {
                        // Trim Buffer based on Markers
                        var markers = detectLoopMarkers( buffer_ );
                        if ( markers ) {
                            nLoopStart_ = markers.start;
                            nLoopEnd_ = markers.end;
                        } else {
                            nLoopStart_ = 0;
                            nLoopEnd_ = buffer_.length;
                        }
                    }
                    if ( typeof callback_ !== "undefined" && typeof callback_ === "function" ) {
                        callback_( true );
                    }
                }, function () {
                    console.log( "Error loading URL" );
                    if ( typeof callback_ !== "undefined" && typeof callback_ === "function" ) {
                        callback_( false );
                    }
                } );
            };
            request.send();
        }

        return FileLoader;
    } );
