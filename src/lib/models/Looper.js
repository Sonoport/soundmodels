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

        var aSpPlaySpeeds_ = [];
        var aSpDecayTimes_ = [];
        var aSpMaxLoops_ = [];
        var aSpStartPoints_ = [];
        var aSpMultiTrackGains_ = [];

        // Global audioParams

        var nRiseTime_ = new SPAudioParam( "riseTime", 0.05, 10.0, 1, null, null, null, null );
        var nPlaySpeed_ = new SPAudioParam( "playSpeed", -10.0, 10, 1, null, null, null, null );

        // Bug fix
        nPlaySpeed_.value = 0;

        //        var nRiseTime_ = new SPAudioParam( "riseTime", 0.05, 10.0, 1, null, null, null, this.audioContext );

        //         var spRiseTime = new SPAudioParam( "riseTime", 0.05, 10.0, 1, null, null, null, this.audioContext );
        //            aSpRiseTimes_.push( spRiseTime );



        // console.log( "Looper created: " + sName_ );

        // Privilege functions

        this.setRiseTime_ = function ( value ) {

            nRiseTime_.value = value;

        };

        this.getRiseTime_ = function () {

            return nRiseTime_;

        };

        this.setPlaySpeed_ = function ( value ) {

            nPlaySpeed_.value = value;

        };

        this.getPlaySpeed_ = function () {

            return nPlaySpeed_;

        };

        this.setSpMultiTrackGains_ = function ( value ) {

            aSpMultiTrackGains_ = value;

        };

        this.getSpMultiTrackGains_ = function () {

            return aSpMultiTrackGains_;

        };

        this.setSpStartPoints_ = function ( value ) {

            aSpStartPoints_ = value;

        };

        this.getSpStartPoints_ = function () {

            return aSpStartPoints_;

        };

        this.setSpMaxLoops_ = function ( value ) {

            aSpMaxLoops_ = value;

        };

        this.getSpMaxLoops_ = function () {

            return aSpMaxLoops_;

        };

        this.setSpDecayTimes_ = function ( value ) {

            aSpDecayTimes_ = value;

        };

        this.getSpDecayTimes_ = function () {

            return aSpDecayTimes_;

        };

        this.setSpPlaySpeeds_ = function ( value ) {

            aSpPlaySpeeds_ = value;

        };

        this.getSpPlaySpeeds_ = function () {

            return aSpPlaySpeeds_;

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

        this.riseTimeSetter = function ( aParam, value, audioContext ) {

            aParam.linearRampToValueAtTime( value, audioContext.currentTime + that.getRiseTime_()
                .value );

        };

        /**
         * Create SpAudioParams for each buffer.
         * @private
         * @method createAudioParams
         * @param {Object} source
         */
        this.createAudioParams_ = function ( source ) {

            // Individual audioParams

            // Create playSpeed

            var spPlaySpeed = new SPAudioParam( this.getPlaySpeed_()
                .name, this.getPlaySpeed_()
                .minValue, this.getPlaySpeed_()
                .maxValue, this.getPlaySpeed_()
                .defaultValue, source.playbackRate, null, this.riseTimeSetter, this.audioContext );

            aSpPlaySpeeds_.push( spPlaySpeed );

            //this.riseTimeSetter(source.playbackRate, this.getPlaySpeed_().value, this.audioContext)

            //            // Create decayTime
            //            var spDecayTime = new SPAudioParam( "decayTime", 0.05, 10.0, 1, null, null, null, this.audioContext );
            //            aSpDecayTimes_.push( spDecayTime );
            //
            //            // Create maxLoops
            //            var spMaxLoop = new SPAudioParam( "maxLoops", -1, 1000, -1, null, null, null, this.audioContext );
            //            aSpMaxLoops_.push( spMaxLoop );
            //
            //            // Create startPoints
            //            var spStartPoint = new SPAudioParam( "startPoint", 0, 0.99, 0, null, null, null, this.audioContext );
            //            aSpMaxLoops_.push( spStartPoint );
            //
            //            // Create multiTrackGain
            //            var spMultiTrackGain = new SPAudioParam( "gain", 0, 1, 1, source.gain, null, null, this.audioContext );
            //            aSpMultiTrackGains_.push( spMultiTrackGain );

        };

        /**
         * Populate sources
         * @method populateSources
         * @private
         */
        this.populateSources_ = function () {

            // Reset all AudioParams list
            this.setSources_( [] );
            this.setSpPlaySpeeds_( [] );
            this.setSpDecayTimes_( [] );
            this.setSpMaxLoops_( [] );
            this.setSpStartPoints_( [] );
            this.setSpMultiTrackGains_( [] );

            for ( var i = 0; i < this.getFileReaders_()
                .length; i++ ) {

                if ( this.getFileReaders_()[ i ].isLoaded() ) {

                    var source = this.audioContext.createBufferSource();

                    source.connect( this.releaseGainNode );
                    source.loop = true;
                    source.buffer = this.getFileReaders_()[ i ].getBuffer();

                    this.createAudioParams_( source );
                    this.releaseGainNode.connect( this.audioContext.destination );
                    this.getSources_()
                        .push( source );


                }

            }

        };

        /**
         * Handler for successfull file / buffer loads
         * @private
         * @method onLoadSuccess
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

        // Start parsing parameters
        this.parseParameters_( sounds );

    }

    // Extend BaseSound
    Looper.prototype = Object.create( BaseSound.prototype );

    // Public functions

    Looper.prototype = {

        constructor: Looper,

        // Setter and Getter functions

        /**
         * Setter for playSpeed
         * @property playSpeed
         * @type Number
         * @param {Number} value The playSpeed
         */
        set playSpeed( value ) {

            this.setPlaySpeed_( value );

            for ( var i = 0; i < this.getSpPlaySpeeds_()
                .length; i++ ) {

                this.getSpPlaySpeeds_()[ i ].value = this.getPlaySpeed_()
                    .value;

            }

        },

        /**
         * Getter for playSpeed
         * @property playSpeed
         * @type Number
         * @returns {Number} The playSpeed
         */
        get playSpeed() {

            return this.getPlaySpeed_()
                .value;

        },

        /**
         * Setter for riseTime
         * @property riseTime
         * @type Number
         * @param {Number} value The riseTime
         */
        set riseTime( value ) {

            this.setRiseTime_( value );

        },

        /**
         * Getter for riseTime
         * @property riseTime
         * @type Number
         * @returns {Number} The riseTime
         */
        get riseTime() {

            return this.getRiseTime_()
                .value;

        },

        // Public functions

        /**
         * Start playing after specific time and on what part of the sound.
         * @method start
         * @param {Number} currTime The delay in seconds before playing the sound
         * @param {Number} offset The starting position of the playhead
         */
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

                this.getSpPlaySpeeds_()[ i ].value = this.getPlaySpeed_()
                    .value;
                //                this.getSpRiseTimes_()[ i ].value = this.getRiseTime_();
                this.getSources_()[ i ].start( this.audioContext.currentTime + currTime, offset % this.getSources_()[ i ].buffer.duration );

            }

            this.isPlaying = true;

        },

        /**
         * Stops the sound and resets play head to 0.
         * @method stop
         */
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

        /**
         * Plays the sound at position 0.
         * @method play
         */
        play: function () {

            this.setPlayPosition_( 0 );
            this.start( 0 );

        },

        /**
         * Pause the currently playing sound
         * @method pause
         */
        pause: function () {

            if ( this.isPlaying ) {

                var currentPlayPosition = this.getPlayPosition_();

                this.stop();
                this.setPlayPosition_( this.audioContext.currentTime - this.getStartPosition_() + currentPlayPosition );

            } else {

                this.start( 0, this.getPlayPosition_() );

            }

        },

        /**
         * Linearly ramp down the gain of the audio in time (seconds) to 0.
         * @method release
         * @param {Number} fadeTime Amount of time it takes for linear ramp down to happen.
         */
        release: function ( fadeTime ) {

            BaseSound.prototype.release.call( this, fadeTime );

        },

        /**
         * Connects release Gain Node to an AudioNode or AudioParam.
         * @method connect
         * @param {Object} output Connects to an AudioNode or AudioParam.
         */
        connect: function ( output ) {

            this.getBaseSound_()
                .connect( output );

        },

        /**
         * Disconnects release Gain Node from an AudioNode or AudioParam.
         * @param {Object} output Takes in an AudioNode or AudioParam.
         */
        disconnect: function ( output ) {

            this.getBaseSound_()
                .connect( output );

        },

        //        riseTime: function ( value ) {
        //
        //            for ( var i = 0; i < this.getSpRiseTimes_()
        //                .length; i++ ) {
        //
        //                //              this.getSpRiseTimes_()[i].value = value;
        //
        //            }
        //
        //        },

        decayTime: function ( value ) {

            for ( var i = 0; i < this.getSpDecayTimes_()
                .length; i++ ) {

                //              this.getSpDecayTimes_()[i].value = value;

            }

        },

        maxLoops: function ( value ) {

            for ( var i = 0; i < this.getSpMaxLoops_()
                .length; i++ ) {

                //              this.getSpMaxLoops_()[i].value = value;

            }

        },

        //        faySpeed: value,

        startPoint: function ( value ) {

            for ( var i = 0; i < this.getSpStartPoints_()
                .length; i++ ) {

                //              this.getSpStartPoints_()[i].value = value;

            }

        }

        //        multiTrackGain: function ( value ) {
        //
        //            for (var i = 0; i < this.getSpStartPoints_().length; i++) {
        //              
        ////              this.getSpStartPoints_()[i].value = value;
        //              
        //            }
        //
        //        }

    };

    return Looper;

} );
