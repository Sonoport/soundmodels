/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class Looper
 * @description A sound model which loads a sound file and allows it to be looped continuously at variable speed.
 * @module Looper
 */
define( [ 'core/BaseSound', 'core/SPAudioParam', 'core/FileReader' ], function ( BaseSound, SPAudioParam, FileReader ) {

    "use strict";

    function Looper( sounds, callback ) {

        if ( !( this instanceof Looper ) ) {

            throw new TypeError( "Looper constructor cannot be called as a function." );

        }

        // Call superclass constructor
        BaseSound.call( this );

        var that = this;
        var spAudioParam_;

        var aFileReaders_ = [];
        var aSources_ = [];

        var bParameterIsString_ = false;
        var bParameterIsAnAudioBuffer_ = false;
        var bParameterIsAnArray_ = false;

        var nNumberOfSourcesLoaded_ = 0;
        var nNumberOfSourcesTotal_;
        var nStartPosition_ = 0;
        var nPlayPosition_ = 0;

        var fCallback_ = callback;
        var sName_ = Math.random();

        // console.log( "Looper created: " + sName_ );

        // Privilege functions

        this.setSpAudioParam_ = function ( value ) {

            spAudioParam_ = value;

        };

        this.getSpAudioParam_ = function () {

            return spAudioParam_;

        };

        this.setFileReaders_ = function ( value ) {

            aFileReaders_ = value;

        };

        this.getFileReaders_ = function () {

            return aFileReaders_;

        };

        this.setSources_ = function ( value ) {

            aSources_ = value;

        };

        this.getSources_ = function () {

            return aSources_;

        };

        this.setParameterIsString_ = function ( value ) {

            bParameterIsString_ = value;

        };

        this.setParameterIsString_ = function () {

            return bParameterIsString_;

        };

        this.setParameterIsAnAudioBuffer_ = function ( value ) {

            bParameterIsAnAudioBuffer_ = value;

        };

        this.getParameterIsAnAudioBuffer_ = function () {

            return bParameterIsAnAudioBuffer_;

        };

        this.setParameterIsAnArray_ = function ( value ) {

            bParameterIsAnArray_ = value;

        };

        this.setParameterIsAnArray_ = function () {

            return bParameterIsAnArray_;

        };

        this.setNumberOfSourcesLoaded_ = function ( value ) {

            nNumberOfSourcesLoaded_ = value;

        };

        this.getNumberOfSourcesLoaded_ = function () {

            return nNumberOfSourcesLoaded_;

        };

        this.setNumberOfSourcesTotal_ = function ( value ) {

            nNumberOfSourcesTotal_ = value;

        };

        this.getNumberOfSourcesTotal_ = function () {

            return nNumberOfSourcesTotal_;

        };

        this.setCallback_ = function ( value ) {

            fCallback_ = value;

        };

        this.getCallback_ = function () {

            return fCallback_;

        };

        this.setPlayPosition_ = function ( value ) {

            nPlayPosition_ = value;

        };

        this.getPlayPosition_ = function () {

            return nPlayPosition_;

        };

        this.setStartPosition_ = function ( value ) {

            nStartPosition_ = value;

        };

        this.getStartPosition_ = function () {

            return nStartPosition_;

        };

        this.setName_ = function ( value ) {

            sName_ = value;

        };

        this.getName_ = function () {

            return sName_;

        };

        // Private functions  

        /**
         * Checks if parameter passed on the constructor is valid
         * @private
         * @method bParameterValid
         * @param {Object} sounds
         * @returns {Boolean}
         */
        this.bParameterValid_ = function ( sounds ) {

            // Check if there is a parameter
            if ( typeof sounds === "undefined" ) {

                console.log( "Error. Missing Looper constructor parameter." );
                return false;

            }

            // Check if it is not a just a blank string
            if ( typeof sounds === "string" ) {

                if ( /\S/.test( sounds ) ) {

                    bParameterIsString_ = true;
                    return true;

                }

            }

            // Check if it an AudioBuffer
            if ( Object.prototype.toString.call( sounds ) === '[object AudioBuffer]' ) {

                bParameterIsAnAudioBuffer_ = true;
                return true;

            }

            // Check if it is an array
            if ( Object.prototype.toString.call( sounds ) === '[object Array]' ) {

                bParameterIsAnArray_ = true;
                return true;

            }

            console.log( "Error. Wrong parameter for Looper." );
            return false;

        };

        /**
         * Populate sources
         * @private
         */
        this.populateSources_ = function () {

            this.setSources_( [] );

            for ( var i = 0; i < this.getFileReaders_()
                .length; i++ ) {

                if ( this.getFileReaders_()[ i ].isLoaded() ) {

                    var source = this.audioContext.createBufferSource();

                    /////

                    var gainNode = this.audioContext.createGain();

                    source.connect( gainNode );


                    /////

                    source.loop = true;
                    source.buffer = this.getFileReaders_()[ i ].getBuffer();
                    //                    source.connect( this.audioContext.destination );

                    gainNode.connect( this.audioContext.destination );
                    gainNode.gain.value = 0.1;

                    //
                    this.getSources_()
                        .push( source );

                }

            }

        };

        /**
         * Handler for successfull file / buffer loads
         * @private
         * @param {Boolean} bSuccess The result if it was a success (true) or not (false).
         */
        this.onLoadSuccess_ = function ( bSuccess ) {

            if ( bSuccess ) {

                nNumberOfSourcesLoaded_++;

            } else {

                nNumberOfSourcesTotal_--;

            }

            if ( nNumberOfSourcesLoaded_ === nNumberOfSourcesTotal_ ) {

                if ( nNumberOfSourcesLoaded_ > 0 ) {

                    fCallback_( true );

                } else {

                    fCallback_( false );

                }

            }

        };

        /**
         * Parse the parameter and look for links and audiobuffers
         * @private
         * @method parseParameters
         * @param {String | Array | AudioBuffer} sounds
         */
        this.parseParameters_ = function ( sounds ) {

            nNumberOfSourcesTotal_ = 1;

            if ( bParameterIsString_ || bParameterIsAnAudioBuffer_ ) {

                var frSingle = new FileReader( that.audioContext );

                aFileReaders_.push( frSingle );
                frSingle.open( sounds, this.onLoadSuccess_ );

            } else if ( bParameterIsAnArray_ ) {

                nNumberOfSourcesTotal_ = sounds.length;

                for ( var i = 0; i < nNumberOfSourcesTotal_; i++ ) {

                    var bIsString = false;
                    var bIsBuffer = false;

                    // Check individually each entry if it is a string
                    if ( typeof sounds[ i ] === "string" ) {

                        if ( /\S/.test( sounds[ i ] ) ) {

                            bIsString = true;

                        }

                    } else if ( Object.prototype.toString.call( sounds[ i ] ) === '[object AudioBuffer]' ) {

                        bIsBuffer = true;

                    }

                    // If either of the two, go nuts
                    if ( bIsString || bIsBuffer ) {

                        var frArray = new FileReader( this.audioContext );

                        aFileReaders_.push( frArray );
                        frArray.open( sounds[ i ], this.onLoadSuccess_ );

                    }

                }

            }

        };

        // Init

        // Do validation of constructor parameter
        if ( !this.bParameterValid_( sounds ) ) {

            return;

        }

        this.parseParameters_( sounds );

    }

    // Extend BaseSound
    Looper.prototype = Object.create( BaseSound.prototype );

    // Public functions

    Looper.prototype = {

        constructor: Looper,

        start: function ( currTime, offset ) {

            if ( typeof currTime === "undefined" ) {

                currTime = 0;

            }

            if ( typeof offset === "undefined" ) {

                offset = 0;

            }

            if ( this.isPlaying ) {

                this.stop();

            }

            this.populateSources_();
            this.setStartPosition_( this.audioContext.currentTime );

            for ( var i = 0; i < this.getSources_()
                .length; i++ ) {

                this.getSources_()[ i ].start( this.audioContext.currentTime + currTime, offset % this.getSources_()[ i ].buffer.duration );

            }

            this.isPlaying = true;

        },

        stop: function () {

            if ( this.isPlaying ) {

                for ( var i = 0; i < this.getSources_()
                    .length; i++ ) {

                    this.getSources_()[ i ].noteOff( 0 );

                }

                this.setPlayPosition_( 0 );
                this.isPlaying = false;

            }

        },

        play: function () {

            this.setPlayPosition_( 0 );
            this.start( 0 );

        },

        pause: function () {

            if ( this.isPlaying ) {

                var temp = this.getPlayPosition_();

                this.stop();
                this.setPlayPosition_( this.audioContext.currentTime - this.getStartPosition_() + temp );

            } else {

                this.start( 0, this.getPlayPosition_() );

            }

        }
        //
        //        release: function () {
        //
        //            this.getBaseSound_()
        //                .release();
        //
        //        },
        //
        //        connect: function ( output ) {
        //
        //            this.getBaseSound_()
        //                .connect( output );
        //
        //        },
        //
        //        disconnect: function ( output ) {
        //
        //            this.getBaseSound_()
        //                .connect( output );
        //
        //        },
        //
        //        playSpeed: function ( value ) {
        //
        //            this.getSpAudioParam_()
        //                .connect( value );
        //
        //        }

    };

    return Looper;

} );
