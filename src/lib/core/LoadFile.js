/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class LoadFile
 * @description Load file from a URL.
 * @module FileReader
 * @param {String} sLink The URL
 * @return {ArrayBuffer} An ArrayBuffer.
 */
define( [ 'core/LoopMarker' ], function ( loopMarker ) {

    "use strict";

    var buffer_;
    var bIsNotWavFile_ = false;
    var bSoundLoaded_ = false;
    var context_;
    var sLink_;

    /**
     * Check if a value is an integer.
     * @private
     * @param {Object} value
     * @returns {Boolean} Result of test.
     */
    function isInt_( value ) {

        var er = /^[0-9]+$/;

        if ( er.test( value ) ) {

            return true;

        }

        return false;

    }

    /**
     * Get a buffer based on the start and end markers.
     * @private
     * @method sliceBuffer
     * @param {Number} start The start of the buffer to load.
     * @param {Number} end The end of the buffer to load.
     * @returns {AudioBuffer} The trimmed buffer.
     */
    function sliceBuffer_( start, end ) {

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

            console.log( "getBuffer Start parameter should be withing buffer length" );
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

    }

    /**
     * Get the current buffer.
     * @method getBuffer
     * @param {Number} start The start index
     * @param {Number} end the end index
     * @returns {AudioBuffer} The AudioBuffer that was marked then trimmed if it is not a wav file.
     */
    var getBuffer = function ( start, end ) {

        // Do trimming if it is not a wave file
        if ( bIsNotWavFile_ ) {

            if ( end + loopMarker.getStartMarker() > loopMarker.getEndMarker() ) {

                end = loopMarker.getEndMarker();

            }

            return sliceBuffer_( start + loopMarker.getStartMarker(), end + loopMarker.getStartMarker() );

        }

        return sliceBuffer_( start, end );

    };

    /**
     * Get the original buffer.
     * @method getRawBuffer
     * @returns {AudioBuffer} The original AudioBuffer.
     */
    var getRawBuffer = function () {

        return buffer_;

    };

    /**
     * Check if sound is already loaded.
     * @method isLoaded
     * @returns {Boolean} True if file is loaded. Flase if file is not yeat loaded.
     */
    var isLoaded = function () {

        return bSoundLoaded_;

    };

    /**
     * Load a file based on the URI.
     * @method load
     * @param {String} link The link of the file to load.
     * @param {AudioContext} context The Audio context.
     * @param {Function} callback The function to call when file loads.
     */
    var load = function ( sLink, context, fCallback ) {

        var request = new XMLHttpRequest();

        bSoundLoaded_ = false;
        bIsNotWavFile_ = false;
        context_ = context;
        sLink_ = sLink.toLocaleLowerCase();

        request.open( 'GET', sLink, true );
        request.responseType = 'arraybuffer';

        // Handler for onLoad
        request.onload = function () {

            context.decodeAudioData( request.response, function ( buffer ) {

                var aEr = /[^.]+$/.exec( sLink_ );

                console.log( "File successfully loaded" );

                bSoundLoaded_ = true;
                buffer_ = buffer;

                // Do trimming if it is not a wave file
                if ( aEr[ 0 ] !== "wav" ) {

                    bIsNotWavFile_ = true;

                    // Detect loop markers
                    loopMarker.detectMarkers( buffer_ );

                }

                fCallback.success();

            }, onError );

        };

        // Handler for onError
        var onError = function () {

            console.log( "Error loading URL" );

        };

        request.send();

    };

    // Exposed methods
    return {

        isLoaded: isLoaded,
        load: load,
        getBuffer: getBuffer,
        getRawBuffer: getRawBuffer

    };

} );
