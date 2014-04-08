/**
 * @class MuliFileLoader
 * @description Helper class to loader multiple files etc.
 * @module Models
 * @extends BaseSound
 */
define( [ 'core/FileLoader' ],
    function ( FileLoader ) {
        "use strict";

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
                if ( parameterType === "[object String]" || parameterType === "[object File]" ) {
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
