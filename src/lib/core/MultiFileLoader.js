/**
 * @module Core
 *
 * @class MuliFileLoader
 * @static
 */
define( [ 'core/FileLoader', 'core/SPAudioBuffer' ],
    function ( FileLoader, SPAudioBuffer ) {
        "use strict";

        /**
         * Helper class to loader multiple sounds from URL String, File or AudioBuffer Objects.
         *
         *
         * @method MuliFileLoader
         * @param {Array/String/File} sounds Array of or Individual String, AudioBuffer or File Objects which define the sounds to be loaded
         * @param {String} audioContext AudioContext to be used in decoding the file
         * @param {String} [onLoadProgress] Callback function to access the progress of the file loading.
         * @param {String} [onLoadComplete] Callback function to be called when all sounds are loaded
         */
        function MultiFileLoader( sounds, audioContext, onLoadProgress, onLoadComplete ) {

            //Private variables
            var self = this;
            this.audioContext = audioContext;
            var sourcesToLoad_ = 0;
            var loadedAudioBuffers_ = [];

            //Private functions
            function init() {

                // If not defined, set empty sources.
                if ( !sounds ) {
                    console.log( "Setting empty source. No sound may be heard" );
                    onLoadComplete( false, loadedAudioBuffers_ );
                    return;
                }

                // Convert to array.
                if ( !( sounds instanceof Array ) ) {
                    var soundsArray = [];
                    soundsArray.push( sounds );
                    sounds = soundsArray;
                }

                // If beyond size limits, log error and callback with false.
                if ( sounds.length < self.minSources || sounds.length > self.maxSources ) {
                    console.error( "Unsupported number of Sources. " + self.modelName + " only supports a minimum of " + self.minSources + " and a maximum of " + self.maxSources + " sources. Trying to load " + sounds.length + "." );
                    onLoadComplete( false, loadedAudioBuffers_ );
                    return;
                }

                // Load each of the sounds
                sourcesToLoad_ = sounds.length;
                loadedAudioBuffers_ = new Array( sourcesToLoad_ );
                sounds.forEach( function ( thisSound, index ) {
                    loadSingleSound( thisSound, onSingleLoadAt( index ) );
                } );
            }

            function loadSingleSound( sound, onSingleLoad ) {
                var parameterType = Object.prototype.toString.call( sound );
                var fileLoader;
                if ( parameterType === '[object AudioBuffer]' ||
                    ( sound instanceof SPAudioBuffer && sound.buffer ) ) {
                    onSingleLoad( true, sound.buffer );
                } else if ( parameterType === '[object String]' ||
                    parameterType === '[object File]' ||
                    ( sound instanceof SPAudioBuffer && sound.sourceURL ) ) {

                    if ( sound instanceof SPAudioBuffer && sound.sourceURL ) {
                        sound = sound.sourceURL;
                    }

                    fileLoader = new FileLoader( sound, self.audioContext, function ( status ) {
                        if ( status ) {
                            onSingleLoad( status, fileLoader.getBuffer() );
                        } else {
                            onSingleLoad( status );
                        }
                    }, function ( progressEvent ) {
                        if ( onLoadProgress && typeof onLoadProgress === 'function' ) {
                            onLoadProgress( progressEvent, sound );
                        }
                    } );
                } else {
                    console.error( "Incorrect Parameter Type - Source is not a URL, File or AudioBuffer or doesn't have sourceURL or buffer" );
                    onSingleLoad( false, {} );
                }
            }

            function onSingleLoadAt( index ) {
                return function ( status, audioBuffer ) {
                    if ( status ) {
                        var source;
                        if ( sounds instanceof Array ) {
                            source = sounds[ index ];
                        } else {
                            source = sounds;
                        }

                        if ( source instanceof SPAudioBuffer ) {
                            source.buffer = audioBuffer;
                            loadedAudioBuffers_[ index ] = source;
                        } else {
                            loadedAudioBuffers_[ index ] = new SPAudioBuffer( audioBuffer, {
                                sourceURL: source,
                                length: audioBuffer.length
                            } );
                        }
                    }
                    sourcesToLoad_--;
                    if ( sourcesToLoad_ === 0 ) {
                        var allStatus = true;
                        for ( var bIndex = 0; bIndex < loadedAudioBuffers_.length; ++bIndex ) {
                            if ( !loadedAudioBuffers_[ bIndex ] ) {
                                allStatus = false;
                                break;
                            }
                        }
                        onLoadComplete( allStatus, loadedAudioBuffers_ );
                    }
                };
            }
            init();
        }

        return MultiFileLoader;
    } );
