/**
 * @class Trigger
 * @description A sound model which triggers a specific sound file with multiple voices
 * @module Looper
 */
define( [ 'core/SoundQueue' ],
    function ( SoundQueue ) {
        "use strict";

        function Trigger( sounds, onLoadCallback, context ) {
            if ( !( this instanceof Trigger ) ) {
                throw new TypeError( "Looper constructor cannot be called as a function." );
            }

            // Call superclass constructor
            BaseSound.call( this, context );

            // Private vars
            var self = this;

            // Private Variables

            // Private Functions

            // Public Properties

            // Public Functions

        }

        return Trigger;

    } );
