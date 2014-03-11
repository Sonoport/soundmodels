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
        var callback_;
        var request_;
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
         * @returns {AudioBuffer} The trimmed buffer.
         */
        var sliceBuffer_ = function ( start, end ) {

            var aChannels = [];
            var nChannels = buffer_.numberOfChannels;
            var nLength = buffer_.length;
            var newBuffer;

            // Set end if it is missing
            if ( typeof end === "undefined" ) {

                end = buffer_.length;

            }

            // Verify parameters
            if ( !isInt_( start ) ) {

                console.log( "getBuffer Start parameter is not an integer" );
                return;

            } else if ( !isInt_( end ) ) {

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
         * @private
         * @param {String | Array | AudioBuffer} link
         * @returns {String} The link type
         */
        var checkLinkType_ = function ( link ) {

            if ( typeof link === "string" ) {

                return "string";

            } else if ( Object.prototype.toString.call( link ) === '[object AudioBuffer]' ) {

                return "audiobuffer";
            }

            return "unknown";

        };

        /**
         * Handler for the load file request
         * @private
         * @method onLoad
         * @returns {undefined}
         */
        var onLoad_ = function () {

            context_.decodeAudioData( request_.response, function ( buffer ) {

                var aEr = /[^.]+$/.exec( link_ );

                bSoundLoaded_ = true;
                buffer_ = buffer;

                // Do trimming if it is not a wave file
                if ( aEr[ 0 ] !== "wav" ) {

                    bIsNotWavFile_ = true;

                    // Detect loop markers
                    loopMarker_ = new LoopMarker();

                    loopMarker_.detectMarkers( buffer_ );

                }

                callback_.success();

            }, function () {

                console.log( "Error loading URL" );
                callback_.error();

            } );

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

                end = buffer_.length;

            }

            // Do trimming if it is not a wave file
            if ( bIsNotWavFile_ ) {

                if ( end + loopMarker_.getStartMarker() > loopMarker_.getEndMarker() ) {

                    end = loopMarker_.getEndMarker();

                }

                return sliceBuffer_( start + loopMarker_.getStartMarker(), end + loopMarker_.getStartMarker() );

            }

            return sliceBuffer_( start, end );

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

        /**
         * Load a file based on the URI.
         * @method load
         * @param {String} link The link of the file to load.
         * @param {AudioContext} context The Audio context.
         * @param {Function} callback The function to call when file loads.
         */
        this.load = function ( link, context, callback ) {

            request_ = new XMLHttpRequest();

            bSoundLoaded_ = false;
            bIsNotWavFile_ = false;
            context_ = context;
            callback_ = callback;
            link_ = link;

            if ( checkLinkType_( link_ ) === "audiobuffer" ) {

                bSoundLoaded_ = true;
                buffer_ = link_;
                callback.success();

                return;

            }

            request_.open( 'GET', link_, true );
            request_.responseType = 'arraybuffer';
            request_.onload = onLoad_;

            request_.send();

        };

    }

    // Public functions

    LoadFile.prototype = {

        constructor: LoadFile

    };

    return LoadFile;

} );
