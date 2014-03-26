/**
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
            var rawBuffer_;
            var loopStart_ = 0;
            var loopEnd_ = 0;
            var loopLength_ = 0;

            var isSoundLoaded_ = false;

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

                // Set end if it is missing
                if ( typeof end == "undefined" ) {
                    end = rawBuffer_.length;
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
                if ( start > loopEnd_ || start < loopStart_ ) {
                    throw {
                        name: "Incorrect parameter type Exception",
                        message: "FileLoader getBuffer start parameter should be within the buffer size : 0-" + rawBuffer_.length,
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }

                // Check if end is within the buffer size
                if ( end > loopEnd_ || end < loopStart_ ) {
                    throw {
                        name: "Incorrect parameter type Exception",
                        message: "FileLoader getBuffer end parameter should be within the buffer size : 0-" + rawBuffer_.length,
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }

                var length = end - start;

                // Create the new buffer
                var newBuffer = context.createBuffer( rawBuffer_.numberOfChannels, length, rawBuffer_.sampleRate );

                // Start trimming
                for ( var i = 0; i < rawBuffer_.numberOfChannels; i++ ) {
                    var aData = new Float32Array( rawBuffer_.getChannelData( i ) );
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
                if ( typeof start == "undefined" ) {
                    start = 0;
                }
                // Set end if it is missing
                if ( typeof end == "undefined" ) {
                    end = loopEnd_ - loopStart_;
                }

                return sliceBuffer_( loopStart_ + start, loopStart_ + end );
            };

            /**
             * Get the original buffer.
             * @method getRawBuffer
             * @returns {AudioBuffer} The original AudioBuffer.
             */
            this.getRawBuffer = function () {
                return rawBuffer_;
            };

            /**
             * Check if sound is already loaded.
             * @method isLoaded
             * @returns {Boolean} True if file is loaded. Flase if file is not yeat loaded.
             */
            this.isLoaded = function () {
                return isSoundLoaded_;
            };

            // Make a request
            var fileExtension = /[^.]+$/.exec( URL );
            var request = new XMLHttpRequest();
            request.open( 'GET', URL, true );
            request.responseType = 'arraybuffer';
            request.onload = function () {
                context.decodeAudioData( request.response, function ( buffer ) {
                    isSoundLoaded_ = true;
                    rawBuffer_ = buffer;
                    // Do trimming if it is not a wave file
                    loopStart_ = 0;
                    loopEnd_ = rawBuffer_.length;
                    if ( fileExtension[ 0 ] !== "wav" ) {
                        // Trim Buffer based on Markers
                        var markers = detectLoopMarkers( rawBuffer_ );
                        if ( markers ) {
                            loopStart_ = markers.start;
                            loopEnd_ = markers.end;
                        }
                    }
                    if ( onloadCallback && typeof onloadCallback === "function" ) {
                        onloadCallback( true );
                    }
                }, function () {
                    console.log( "Error Decoding " + URL );
                    if ( onloadCallback && typeof onloadCallback === "function" ) {
                        onloadCallback( false );
                    }
                } );
            };
            request.send();
        }

        return FileLoader;
    } );
