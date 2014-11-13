/**
 * @module Core
 */
define( [ 'core/AudioContextMonkeyPatch' ], function () {
    'use strict';

    /**
     * Pseudo AudioNode class the encapsulates basic functionality of an Audio Node. To be extended by all other Effects
     *
     * @class BaseEffect
     * @constructor
     * @requires AudioContextMonkeyPatch
     * @param {AudioContext} [context] AudioContext in which this Sound is defined.
     */
    function BaseEffect( context ) {
        /**
         * Web Audio API's AudioContext. If the context passed to the constructor is an AudioContext, a new one is created here.
         *
         * @property audioContext
         * @type AudioContext
         */
        if ( context === undefined || context === null ) {
            console.log( 'Making a new AudioContext' );
            this.audioContext = new AudioContext();
        } else {
            this.audioContext = context;
        }

        bootAudioContext( this.audioContext );

        /**
         * Number of inputs
         *
         * @property numberOfInputs
         * @type Number
         * @default 0
         */
        this.numberOfInputs = 0;

        /**
         * Number of outputs
         *
         * @property numberOfOutputs
         * @type Number
         * @default 0
         */
        Object.defineProperty( this, 'numberOfOutputs', {
            enumerable: true,
            configurable: false,
            get: function () {
                return this.releaseGainNode.numberOfOutputs;
            }
        } );

        /**
         *Maximum number of sources that can be given to this Sound
         *
         * @property maxSources
         * @type Number
         * @default 0
         */
        var maxSources_ = 0;
        Object.defineProperty( this, 'maxSources', {
            enumerable: true,
            configurable: false,
            set: function ( max ) {
                if ( max < 0 ) {
                    max = 0;
                }
                maxSources_ = Math.round( max );
            },
            get: function () {
                return maxSources_;
            }
        } );

        /**
         *Minimum number of sources that can be given to this Sound
         *
         * @property minSources
         * @type Number
         * @default 0
         */
        var minSources_ = 0;
        Object.defineProperty( this, 'minSources', {
            enumerable: true,
            configurable: false,
            set: function ( max ) {
                if ( max < 0 ) {
                    max = 0;
                }
                minSources_ = Math.round( max );
            },
            get: function () {
                return minSources_;
            }
        } );

        /**
         * The output node of this effect. This node will be connected to the next Effect or destination
         *
         * @property releaseGainNode
         * @type GainNode
         * @default Internal GainNode
         * @final
         */
        this.outputNode = null;

        /**
         *  If Sound is currently playing.
         *
         * @property isPlaying
         * @type Boolean
         * @default false
         */
        this.isPlaying = false;

        /**
         *  If Sound is currently initialized.
         *
         * @property isInitialized
         * @type Boolean
         * @default false
         */
        this.isInitialized = false;

        /**
         * The input node that the output node will be connected to. <br />
         * Set this value to null if no connection can be made on the input node
         *
         * @property inputNode
         * @type Object
         * @default null
         **/
        this.inputNode = null;

        /**
         * Set of nodes the output of this effect is currently connected to.
         *
         * @property destinations
         * @type Array
         * @default
         **/
        this.destinations = [];

        /**
         * String name of the effect.
         *
         * @property modelName
         * @type String
         * @default "Model"
         **/
        this.effectName = 'Effect';

        this.parameterList_ = [];

        this.connect( this.audioContext.destination );

        function bootAudioContext( context ) {

            var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );

            function createDummyOsc() {
                //console.log( "Booting ", context );
                bootOsc.start( 0 );
                bootOsc.stop( context.currentTime + 0.0001 );
                window.liveAudioContexts.push( context );
                window.removeEventListener( 'touchstart', createDummyOsc );
            }

            if ( iOS ) {
                if ( !window.liveAudioContexts ) {
                    window.liveAudioContexts = [];
                }
                if ( window.liveAudioContexts.indexOf( context ) < 0 ) {
                    var bootOsc = context.createOscillator();
                    var bootGain = context.createGain();
                    bootGain.gain.value = 0;
                    bootOsc.connect( bootGain );
                    bootGain.connect( context.destination );
                    window.addEventListener( 'touchstart', createDummyOsc );
                }
            }
        }
    }

    /**
     * If the parameter `output` is an AudioNode, it connects to the releaseGainNode.
     * If the output is a BaseEffect, it will connect BaseEffect's outputNode to the output's inputNode.
     *
     * @method connect
     * @param {AudioNode} destination AudioNode to connect to.
     * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
     * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
     */
    BaseEffect.prototype.connect = function ( destination, output, input ) {
        if ( destination instanceof AudioNode ) {
            this.outputNode.connect( destination, output, input );
            this.destinations.push( {
                'destination': destination,
                'output': output,
                'input': input
            } );
        } else if ( destination.inputNode instanceof AudioNode ) {
            this.outputNode.connect( destination.inputNode, output, input );
            this.destinations.push( {
                'destination': destination.inputNode,
                'output': output,
                'input': input
            } );
        } else {
            console.error( "No Input Connection - Attempts to connect " + ( typeof output ) + " to " + ( typeof this ) );
        }
    };

    /**
     * Disconnects the Sound from the AudioNode Chain.
     *
     * @method disconnect
     * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
     **/
    BaseEffect.prototype.disconnect = function ( outputIndex ) {
        this.outputNode.disconnect( outputIndex );
        this.destinations = [];
    };

    /**
     * Registers a Parameter to the model. This ensures that the Parameter is unwritable and allows
     * to lock in the configurability of the object.
     *
     * @param  {SPAudioParam} audioParam
     */
    BaseEffect.prototype.registerParameter = function ( audioParam, configurable ) {

        if ( configurable === undefined || configurable === null ) {
            configurable = false;
        }

        Object.defineProperty( this, audioParam.name, {
            enumerable: true,
            configurable: configurable,
            value: audioParam
        } );

        var self = this;
        var replaced = false;
        this.parameterList_.forEach( function ( thisParam, paramIndex ) {
            if ( thisParam.name === audioParam.name ) {
                self.parameterList_.splice( paramIndex, 1, audioParam );
                replaced = true;
            }
        } );

        if ( !replaced ) {
            this.parameterList_.push( audioParam );
        }
    };

    /**
     * List all SPAudioParams this Sound exposes
     *
     * @method listParams
     * @param {Array} [paramArray] Array of all the SPAudioParams this Sound exposes.
     */
    BaseEffect.prototype.listParams = function () {
        return this.parameterList_;
    };

    // Return constructor function
    return BaseEffect;
} );
