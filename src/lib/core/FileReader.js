/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class FileReader
 * @description Read contents of file.
 * @module FileReader
 */
define( [ 'core/LoadFile' ], function ( loadFile ) {

    "use strict";

    function FileReader( context ) {

        if ( !( this instanceof FileReader ) ) {

            throw new TypeError( "FileReader constructor cannot be called as a function." );

        }

        // Determine if AudioContext was pass as a parameter. If not make one.
        if ( typeof context === "undefined" ) {

            console.log( "No AudioContext instance found. Creating a new AudioContext." );
            context = new AudioContext();

        }

        /**
         * @property context
         * @type @new;AudioContext
         */
        this.context = context;

    }

    FileReader.prototype = {

        constructor: FileReader,

        /**
         * Load a file from URI.
         * @method open
         * @param {String} link The link of the file to load.
         * @param {Function} callback The function to call when file loads.
         */
        open: function ( link, callback ) {

            if ( window.AudioContext || window.webkitAudioContext ) {

                loadFile.load( link, this.context, {

                    success: function () {

                        callback();

                    }

                } );

            } else {

                console.log( "Web Audio API is not supported. Failed to open file." );

            }

        },

        /**
         * Determine if file is loaded.
         * @method isLoaded
         * @return {Boolean} True if file is loaded. False if file is not loaded.
         */
        isLoaded: function () {

            return loadFile.isLoaded();

        },

        /**
         * Get the AudioContext buffer.
         * @method getBuffer
         * @param {Number} start The start index
         * @param {Number} end the end index
         * @returns {AudioBuffer} The new AudioBuffer that was marked then trimmed.
         */
        getBuffer: function ( start, end ) {

            return loadFile.getBuffer( start, end );

        },

        /**
         * Get the original buffer.
         * @method getRawBuffer
         * @returns {AudioBuffer} The original AudioBuffer.
         */
        getRawBuffer: function () {

            return loadFile.getRawBuffer();

        }

    };

    return FileReader;

} );
