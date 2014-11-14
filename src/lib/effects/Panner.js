/**
 * @module Effects
 */
define( [ 'core/Config', 'core/BaseSound', 'core/SPAudioParam' ],
    function ( Config, BaseSound, SPAudioParam ) {
        "use strict";

        /**
         *
         * A simple stereo fader which moves the stereophonic image of the source left or right.
         * @class Panner
         * @constructor
         * @extends BaseEffect
         */
        function Panner( context ) {
            if ( !( this instanceof Panner ) ) {
                throw new TypeError( "Panner constructor cannot be called as a function." );
            }
            // Call superclass constructor
            BaseSound.call( this, context );
            this.maxSources = 0;
            this.minSources = 0;
            this.modelName = 'Panner';

            this.numberOfInputs = 1;

            var panner_ = this.context.createPannerNode();

            function panPositionSetter( aParams, panValue ) {
                var xDeg = parseInt( panValue );
                var zDeg = xDeg + 90;
                if ( zDeg > 90 ) {
                    zDeg = 180 - zDeg;
                }
                var x = Math.sin( xDeg * ( Math.PI / 180 ) );
                var z = Math.sin( zDeg * ( Math.PI / 180 ) );
                panner_.setPosition( x, 0, z );
            }

            /**
             * Pans the audio to left or right stereo audio channels using a value in degrees of the angle
             * of the perceived audio source from the center. Positive value implies perceived source
             * being on the right of center. Negative value implies the perceived sources being on the left
             * of the center.
             *
             * @property pan
             * @type SPAudioParam
             * @default 0
             * @minvalue -90
             * @maxvalue 90
             */
            this.registerParameter( new SPAudioParam( this, 'pan', -90, 90, 0, null, null, panPositionSetter ), true );
        }

        Panner.prototype = Object.create( BaseSound.prototype );

        return Panner;

    } );
