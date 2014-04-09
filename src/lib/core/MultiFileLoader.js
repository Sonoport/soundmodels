/**
 * @module Core
 *
 * @class MuliFileLoader
 * @static
 */
define( [ 'core/FileLoader' ],
    function ( FileLoader ) {
        "use strict";

        /**
         * Helper class to loader multiple sounds from URL String, File or AudioBuffer Objects.
         *
         *
         * @method MuliFileLoader
         * @param {Array/String/File} sounds Array of or Individual String, AudioBuffer or File Objects which define the sounds to be loaded
         * @param {String} audioContext AudioContext to be used in decoding the file
         * @param {String} [onAllLoad] Callback function to be called when all sounds are loaded
         */
        function MultiFileLoader( sounds, audioContext, onAllLoad ) {

            //Private variables
            var self = this;
            var sourcesToLoad_ = 0;
            var loadedAudioBuffers_ = [];

            //Private functions
            function init() {
                var parameterType = Object.prototype.toString.call( sounds );

                if ( parameterType === '[object Array]' ) {
                    sourcesToLoad_ = sounds.length;
                    sounds.forEach( function ( thisSound ) {
                        loadSingleSound( thisSound, onSingleLoad );
                    } );
                } else if ( sounds !== undefined && sounds !== null ) {
                    sourcesToLoad_ = 1;
                    loadSingleSound( sounds, onSingleLoad );
                }
            }

            function loadSingleSound( sound, onSingleLoad ) {
                var parameterType = Object.prototype.toString.call( sound );
                if ( parameterType === "[object String]" ) {
                    var fileLoader = new FileLoader( sound, self.audioContext, function ( status ) {
                        if ( status ) {
                            onSingleLoad( status, fileLoader.getBuffer() );
                        }
                    } );
                } else if ( parameterType === "[object AudioBuffer]" ) {
                    onSingleLoad( true, sound );
                } else {
                    throw {
                        name: "Incorrect Parameter type Exception",
                        message: "Looper argument is not a URL or AudioBuffer",
                        toString: function () {
                            return this.name + ": " + this.message;
                        }
                    };
                }
            }

            function onSingleLoad( status, audioBuffer ) {
                sourcesToLoad_--;
                loadedAudioBuffers_.push( audioBuffer );
                if ( sourcesToLoad_ === 0 ) {
                    onAllLoad( status, loadedAudioBuffers_ );
                }
            }

            init();
        }

        return MultiFileLoader;
    } );
