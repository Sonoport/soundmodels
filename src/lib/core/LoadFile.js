/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class LoadFile
 * @description Load file from a URL.
 * @module FileReader
 * @param {String} sLink The URL
 * @return {ArrayBuffer} An ArrayBuffer.
 */
define( [ 'core/LoopMarker' ], function ( LoopMarker ) {

    "use strict";

    function LoadFile() {

        if ( !( this instanceof LoadFile ) ) {

            throw new TypeError( "LoadFile constructor cannot be called as a function." );

        }

        var loopMarker_;
        var buffer_;
        var bIsNotWavFile_ = false;
        var bSoundLoaded_ = false;
        var context_;

        // Privilege functions

        this.setLoopMarker_ = function ( value ) {

            loopMarker_ = value;

        };

        this.getLoopMarker_ = function () {

            return loopMarker_;

        };

        this.setBuffer_ = function ( value ) {

            buffer_ = value;

        };

        this.getBuffer_ = function () {

            return buffer_;

        };

        this.setIsNotWavFile_ = function ( value ) {

            bIsNotWavFile_ = value;

        };

        this.getIsNotWavFile_ = function () {

            return bIsNotWavFile_;

        };

        this.setSoundLoaded_ = function ( value ) {

            bSoundLoaded_ = value;

        };

        this.getSoundLoaded_ = function () {

            return bSoundLoaded_;

        };

        this.setContext_ = function ( value ) {

            context_ = value;

        };

        this.getContext_ = function () {

            return context_;

        };

        // Private functions

        /**
         * Check if a value is an integer.
         * @private
         * @param {Object} value
         * @returns {Boolean} Result of test.
         */
        this.isInt_ = function ( value ) {

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
         * @returns {AudioBuffer} The trimmed buffer.
         */
        this.sliceBuffer_ = function ( start, end ) {

            var aChannels = [];
            var nChannels = buffer_.numberOfChannels;
            var nLength = buffer_.length;
            var newBuffer;

            // Set end if it is missing
            if ( typeof end === "undefined" ) {

                end = buffer_.length;

            }

            // Verify parameters
            if ( !this.isInt_( start ) ) {

                console.log( "getBuffer Start parameter is not an integer" );
                return;

            } else if ( !this.isInt_( end ) ) {

                console.log( "getBuffer End parameter is not an integer" );
                return;

            }

            // Check if start is smaller than end
            if ( start > end ) {

                console.log( "getBuffer Start parameter should be bigger than End parameter" );
                return;

            }

            // Check if start is beyong buffer size
            if ( start > buffer_.length ) {

                console.log( "getBuffer Start parameter should be within buffer length" );
                return;

            }

            // Check if end is larger that the buffer size and adjust accordingly
            if ( end > buffer_.length ) {

                end = -1;

            }

            // Start trimming
            for ( var i = 0; i < nChannels; i++ ) {

                var aData = new Float32Array( buffer_.getChannelData( i ) );
                aChannels[ i ] = aData.subarray( start, end );

            }

            if ( aChannels.length > 0 ) {

                nLength = aChannels[ 0 ].length;

            }

            // Create the new buffer
            newBuffer = context_.createBuffer( buffer_.numberOfChannels, nLength, buffer_.sampleRate );

            for ( var j = 0; j < nChannels; j++ ) {

                newBuffer.getChannelData( j )
                    .set( aChannels[ j ] );

            }

            return newBuffer;

        };

        /**
         * Check the link type
         * @param {String | Array | AudioBuffer} link
         * @returns {String} The link type
         */
        this.checkLinkType_ = function ( link ) {

            if ( typeof link === "string" ) {

                return "string";

            } else if ( Object.prototype.toString.call( link ) === '[object AudioBuffer]' ) {

                return "audiobuffer";
            }

            return "unknown";

        };

    }

    // Public functions

    LoadFile.prototype = {

        constructor: LoadFile,

        /**
         * Get the current buffer.
         * @method getBuffer
         * @param {Number} start The start index
         * @param {Number} end the end index
         * @returns {AudioBuffer} The AudioBuffer that was marked then trimmed if it is not a wav file.
         */
        getBuffer: function ( start, end ) {

            // Set start if it is missing
            if ( typeof start === "undefined" ) {

                start = 0;

            }

            // Set end if it is missing
            if ( typeof end === "undefined" ) {

                end = this.getBuffer_()
                    .length;

            }

            // Do trimming if it is not a wave file
            if ( this.getIsNotWavFile_() ) {

                if ( end + this.getLoopMarker_()
                    .getStartMarker() > this.getLoopMarker_()
                    .getEndMarker() ) {

                    end = this.getLoopMarker_()
                        .getEndMarker();

                }

                return this.sliceBuffer_( start + this.getLoopMarker_()
                    .getStartMarker(), end + this.getLoopMarker_()
                    .getStartMarker() );

            }

            return this.sliceBuffer_( start, end );

        },

        /**
         * Get the original buffer.
         * @method getRawBuffer
         * @returns {AudioBuffer} The original AudioBuffer.
         */
        getRawBuffer: function () {

            return this.getBuffer_();

        },

        /**
         * Check if sound is already loaded.
         * @method isLoaded
         * @returns {Boolean} True if file is loaded. Flase if file is not yeat loaded.
         */
        isLoaded: function () {

            return this.getSoundLoaded_();

        },

        /**
         * Load a file based on the URI.
         * @method load
         * @param {String} link The link of the file to load.
         * @param {AudioContext} context The Audio context.
         * @param {Function} callback The function to call when file loads.
         */
        load: function ( link, context, callback ) {

            var that = this;
            var request = new XMLHttpRequest();

            this.setSoundLoaded_( false );
            this.setIsNotWavFile_( false );
            this.setContext_( context );

            if ( this.checkLinkType_( link ) === "audiobuffer" ) {

                this.setSoundLoaded_( true );
                this.setBuffer_( link );
                callback.success();

                return;

            }

            request.open( 'GET', link, true );
            request.responseType = 'arraybuffer';

            // Handler for onLoad
            request.onload = function () {

                context.decodeAudioData( request.response, function ( buffer ) {

                    var aEr = /[^.]+$/.exec( link );

                    that.setSoundLoaded_( true );
                    that.setBuffer_( buffer );

                    // Do trimming if it is not a wave file
                    if ( aEr[ 0 ] !== "wav" ) {

                        that.setIsNotWavFile_( true );

                        // Detect loop markers
                        that.setLoopMarker_( new LoopMarker() );

                        that.getLoopMarker_()
                            .detectMarkers( that.getBuffer_() );

                    }

                    callback.success();

                }, onError );

            };

            // Handler for onError
            var onError = function () {

                console.log( "Error loading URL" );
                callback.error();

            };

            request.send();

        }

    };

    return LoadFile;

} );
