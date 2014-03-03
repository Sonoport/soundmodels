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
        var aMultiTrackGains_ = [];

        var bParameterIsString_ = false;
        var bParameterIsAnAudioBuffer_ = false;
        var bParameterIsAnArray_ = false;
        var bFromPausedState_ = false;

        var nNumberOfSourcesLoaded_ = 0;
        var nNumberOfSourcesTotal_ = 0;
        var nStartPosition_ = 0;
        var nPlayPosition_ = 0;

        var fCallback_ = callback;
        var sName_ = Math.random();

        var aSpPlaySpeeds_ = [];
        var aSpMultiTrackGains_ = [];

        // Global audioParams
        var nPlaySpeed_ = new SPAudioParam( "playSpeed", -10.0, 10, 1, null, null, null, null );
        var nRiseTime_ = new SPAudioParam( "riseTime", 0.05, 10.0, 1, null, null, null, null );
        var nDecayTime_ = new SPAudioParam( "decayTime", 0.05, 10, 1, null, null, null, null );
        var nStartPoint_ = new SPAudioParam( "startPoint", 0.0, 0.99, 1, null, null, null, null );
        var nMultiTrackGain_ = new SPAudioParam( "multiTrackGain", 0.0, 1, 1, null, null, null, null );

        // Privilege functions

        this.setStartPoint_ = function ( value ) {

            nStartPoint_.value = parseFloat( value );

        };

        this.getStartPoint_ = function () {

            return nStartPoint_;

        };

        this.setFromPausedState_ = function ( value ) {

            bFromPausedState_ = value;

        };

        this.getFromPausedState_ = function () {

            return bFromPausedState_;

        };

        this.setDecayTime_ = function ( value ) {

            nDecayTime_.value = parseFloat( value );

        };

        this.getDecayTime_ = function () {

            return nDecayTime_;

        };

        this.setRiseTime_ = function ( value ) {

            nRiseTime_.value = parseFloat( value );

        };

        this.getRiseTime_ = function () {

            return nRiseTime_;

        };

        this.setPlaySpeed_ = function ( value ) {

            nPlaySpeed_.value = parseFloat( value );

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

        this.setMultiTrackGainsArray_ = function ( value ) {

            aMultiTrackGains_ = value;

        };

        this.getMultiTrackGainsArray_ = function () {

            return aMultiTrackGains_;

        };

        this.getMultiTrackGains_ = function () {

            // Check for valid values and populate accordingly
            for ( var i = 0; i < aMultiTrackGains_.length; i++ ) {

                if ( isNaN( aMultiTrackGains_[ i ] ) ) {

                    aMultiTrackGains_[ i ] = nMultiTrackGain_.defaultValue;

                } else {

                    nMultiTrackGain_.value = parseFloat( aMultiTrackGains_[ i ] );
                    aMultiTrackGains_[ i ] = nMultiTrackGain_.value;

                }

            }

            // Match loaded sources length to total gains
            for ( var j = 0; j < aSpMultiTrackGains_.length; j++ ) {

                aSpMultiTrackGains_[ j ].value = aMultiTrackGains_[ j ];

            }

            var aData = aMultiTrackGains_.slice( 0, aSpMultiTrackGains_.length );

            // Pass back to get latest values. 
            aMultiTrackGains_ = aData;

            return aMultiTrackGains_;

        };

        this.getMultiTrackGain_ = function () {

            return nMultiTrackGain_;

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

        /**
         * Setter for paramSetter
         * @method paramSetter
         * @param {AudioParam} aParam
         * @param {Number} value
         * @param {Audiocontext} audioContext
         */
        this.paramSetter = function ( aParam, value, audioContext ) {

            aParam.cancelScheduledValues( audioContext.currentTime );
            aParam.setValueAtTime( aParam.value, audioContext.currentTime );

            // Skip delay if from paused position. Need to fix with proper buffer position location
            if ( that.getFromPausedState_() ) {

                aParam.linearRampToValueAtTime( value, audioContext.currentTime );
                return;

            }

            // Switch to rise or decay time depending on the current vs old value
            if ( value > aParam.value ) {

                aParam.linearRampToValueAtTime( value, audioContext.currentTime + that.getRiseTime_()
                    .value );


            } else {

                aParam.linearRampToValueAtTime( value, audioContext.currentTime + that.getDecayTime_()
                    .value );

            }

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
                .defaultValue, source.playbackRate, null, this.paramSetter, this.audioContext );

            aSpPlaySpeeds_.push( spPlaySpeed );

            // Create multiTrackGain
            var gainNode = this.audioContext.createGain();

            source.connect( gainNode );
            gainNode.connect( this.releaseGainNode );

            var spMultiTrackGain = new SPAudioParam( this.getMultiTrackGain_()
                .name, this.getMultiTrackGain_()
                .minValue, this.getMultiTrackGain_()
                .maxValue, this.getMultiTrackGain_()
                .defaultValue, gainNode.gain, null, this.paramSetter, this.audioContext );

            aSpMultiTrackGains_.push( spMultiTrackGain );

        };

        /**
         * Populate sources
         * @method populateSources
         * @private
         */
        this.populateSources_ = function () {

            // Reset values
            this.setSources_( [] );
            this.setMultiTrackGainsArray_( [] );
            this.setSpPlaySpeeds_( [] );
            this.setSpMultiTrackGains_( [] );

            for ( var i = 0; i < this.getFileReaders_()
                .length; i++ ) {

                if ( this.getFileReaders_()[ i ].isLoaded() ) {

                    var source = this.audioContext.createBufferSource();

                    source.buffer = this.getFileReaders_()[ i ].getBuffer();
                    source.loopStart = source.buffer.duration * this.getStartPoint_()
                        .value;
                    source.loopEnd = source.buffer.duration;
                    source.loop = true;

                    // set audio params for each buffer
                    this.createAudioParams_( source );

                    // Connect to releaseGainNode
                    this.releaseGainNode.connect( this.audioContext.destination );

                    // Save individual values
                    this.getMultiTrackGainsArray_()
                        .push( this.getSpMultiTrackGains_()[ i ].value );
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

            // If all possible sources loaded
            if ( nNumberOfSourcesLoaded_ === nNumberOfSourcesTotal_ ) {

                if ( nNumberOfSourcesLoaded_ > 0 ) {

                    // Execute successful callback
                    fCallback_( true );

                } else {

                    // Execute fail callback
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
         * Getter for multiTrackGain
         * @property multiTrackGain
         * @type Number
         * @returns {Number} The multiTrackGain
         */
        get multiTrackGain() {

            return this.getMultiTrackGains_();

        },

        /**
         * Setter for playSpeed
         * @property playSpeed
         * @type Number
         * @param {Number} value The playSpeed
         */
        set playSpeed( value ) {

            // Save playSpeed
            this.setPlaySpeed_( value );

            // Adjust individual playSpeed
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

        /**
         * Setter for decayTime
         * @property decayTime
         * @type Number
         * @param {Number} value The decayTime
         */
        set decayTime( value ) {

            this.setDecayTime_( value );

        },

        /**
         * Getter for decayTime
         * @property decayTime
         * @type Number
         * @returns {Number} The decayTime
         */
        get decayTime() {

            return this.getDecayTime_()
                .value;

        },

        /**
         * Setter for startPoint
         * @property startPoint
         * @type Number
         * @param {Number} value The startPoint
         */
        set startPoint( value ) {

            // Save startPoint
            this.setStartPoint_( value );

            // Set individual startPoints
            for ( var i = 0; i < this.getSources_()
                .length; i++ ) {

                this.getSources_()[ i ].loopStart = this.getSources_()[ i ].buffer.duration * this.getStartPoint_()
                    .value;

            }

        },

        /**
         * Getter for startPoint
         * @property startPoint
         * @type Number
         * @returns {Number} The startPoint
         */
        get startPoint() {

            return this.getStartPoint_()
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

            this.setStartPosition_( this.audioContext.currentTime );

            // Get sources again
            this.populateSources_();

            for ( var i = 0; i < this.getSources_()
                .length; i++ ) {

                var nPlaySpeed = 1;

                if ( this.getPlaySpeed_()
                    .value !== 0 ) {

                    nPlaySpeed = this.getPlaySpeed_()
                        .value;

                }

                this.getSpPlaySpeeds_()[ i ].value = this.getPlaySpeed_()
                    .value;

                // Not accurate if paused while on transition from one value to another. If the transition completes it's ok.
                this.getSources_()[ i ].start( currTime, this.getSources_()[ i ].loopStart + ( offset % this.getSources_()[ i ].buffer.duration * nPlaySpeed ) );

            }

            if ( this.getFromPausedState_() ) {

                this.setFromPausedState_( false );

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

                // Save current position before being erased at stop method
                var currentPlayPosition = this.getPlayPosition_();
                this.stop();
                this.setPlayPosition_( currentPlayPosition + this.audioContext.currentTime - this.getStartPosition_() );

            } else {

                this.setFromPausedState_( true );
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

        }

    };

    return Looper;

} );
