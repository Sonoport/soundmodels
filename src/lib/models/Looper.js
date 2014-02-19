/**
 * @author Cliburn M. Solano
 * @email cliburn.solano@sonoport.com
 * @class Looper
 * @description A sound model which loads a sound file and allows it to be looped continuously at variable speed.
 * @module Looper
 */
define( [ 'core/BaseSound', 'core/SPAudioParam', 'core/FileReader' ], function ( BaseSound, SPAudioParam, FileReader ) {

    "use strict";

    var baseSound_;
    var spAudioParam_;

    var aFileReaders_;
    var aAudioBuffers_;
    var aSources_;

    var bParameterIsString_;
    var bParameterIsAnAudioBuffer_;
    var bParameterIsAnArray_;

    var nNumberOfSourcesLoaded_;
    var nNumberOfSourcesTotal_;
    
    var fCallback_;

    function Looper( sounds, callback ) {

        if ( !( this instanceof Looper ) ) {

            throw new TypeError( "Looper constructor cannot be called as a function." );

        }

        aFileReaders_ = [];
        aAudioBuffers_ = [];
        aSources_ = [];

        bParameterIsString_ = false;
        bParameterIsAnAudioBuffer_ = false;
        bParameterIsAnArray_ = false;

        nNumberOfSourcesLoaded_ = 0;

        // Do validation of constructor parameter
        if ( !bParameterValid_( sounds ) ) {

            return;

        }

        baseSound_ = new BaseSound();
        fCallback_ = callback;
        parseParameters_( sounds );

    }

    /**
     * Checks if parameter passed on the constructor is valid
     * @private
     * @method bParameterValid
     * @param {Object} sounds
     * @returns {Boolean}
     */
    function bParameterValid_( sounds ) {

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

    }

    function onLoadSuccess_() {
 
        
        nNumberOfSourcesLoaded_++;
        console.log( "Loaded: " + nNumberOfSourcesLoaded_ );

    }

    /**
     * Parse the parameter and look for links and audiobuffers
     * @private
     * @method parseParameters
     * @param {type} sounds
     * @returns {_L8.parseParameters_}
     */
    function parseParameters_( sounds ) {

        console.log( "bParameterIsString_: " + bParameterIsString_ );
        console.log( "bParameterIsAnAudioBuffer_: " + bParameterIsAnAudioBuffer_ );
        console.log( "bParameterIsAnArray_: " + bParameterIsAnArray_ );

        nNumberOfSourcesTotal_ = 1;

        if ( bParameterIsString_ ) {

            var frString = new FileReader();
            
            aFileReaders_.push(frString);
            
            frString.open( sounds, onLoadSuccess_ );
      
        } 
        
//      else if (bParameterIsAnAudioBuffer_) {
//          
//          
//          
//        }


        //        if (bParameterIsAnAudioBuffer_) {
        //          
        //          aAudioBuffers_.push(sounds);
        //          
        //        }
        //        
        //        console.log(aFileReaders_.length);
        //        console.log(aAudioBuffers_.length)

        //
        //        for ( var i = 0; i < sounds.length; i++ ) {
        //
        //            aFileReaders_[ i ] = new FileReader( baseSound_.audioContext );
        //            aFileReaders_[ i ].open( sounds[ i ], ok );
        //            console.log( sounds[ i ] );
        //
        //        }

    }

    Looper.prototype = {

        constructor: Looper,

        start: function ( currTime ) {

            baseSound_.start( currTime );

        },

        stop: function ( currTime ) {

            baseSound_.stop( currTime );

        },

        play: function () {

            baseSound_.play();

        },

        pause: function () {

            baseSound_.start();

        },

        release: function ( fadeTime ) {

            baseSound_.release( fadeTime );

        },

        connect: function ( output ) {

            baseSound_.connect( output );

        },

        disconnect: function ( output ) {

            baseSound_.connect( output );

        },

        playSpeed: function ( value ) {

            spAudioParam_.connect( value );

        }

    };

    return Looper;

} );
