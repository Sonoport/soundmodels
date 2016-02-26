/*
 ** @module Core
 */

"use strict";
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var Config = require( '../core/Config' );
var log = require( 'loglevel' );

/**
 * Mock AudioParam used to create Parameters for Sonoport Sound Models. The SPAudioParam supports either a AudioParam backed parameter, or a completely Javascript mocked up Parameter, which supports a rough version of parameter automation.
 *
 *
 * @class SPAudioParam
 * @constructor
 * @param {BaseSound} baseSound A reference to the BaseSound which exposes this parameter.
 * @param {String} [name] The name of the parameter.
 * @param {Number} [minValue] The minimum value of the parameter.
 * @param {Number} [maxValue] The maximum value of the parameter.
 * @param {Number} [defaultValue] The default and starting value of the parameter.
 * @param {AudioParam/Array} [aParams] A WebAudio parameter which will be set/get when this parameter is changed.
 * @param {Function} [mappingFunction] A mapping function to map values between the mapped SPAudioParam and the underlying WebAudio AudioParam.
 * @param {Function} [setter] A setter function which can be used to set the underlying audioParam. If this function is undefined, then the parameter is set directly.
 */
function SPAudioParam( baseSound, name, minValue, maxValue, defaultValue, aParams, mappingFunction, setter ) {
    // Min diff between set and actual
    // values to stop updates.
    var MIN_DIFF = 0.0001;
    var UPDATE_INTERVAL_MS = 500;
    var intervalID_;

    var value_ = 0;
    var calledFromAutomation_ = false;

    /**
     * Initial value for the value attribute.
     *
     * @property defaultValue
     * @type Number/Boolean
     * @default 0
     */
    this.defaultValue = null;

    /**
     *  Maximum value which the value attribute can be set to.
     *
     *
     * @property maxValue
     * @type Number/Boolean
     * @default 0
     */
    this.maxValue = 0;

    /**
     * Minimum value which the value attribute can be set to.
     *
     * @property minValue
     * @type Number/Boolean
     * @default 0
     */

    this.minValue = 0;

    /**
     * Name of the Parameter.
     *
     * @property name
     * @type String
     * @default ""
     */

    this.name = "";

    this.isSPAudioParam = true;

    /**
     * The parameter's value. This attribute is initialized to the defaultValue. If value is set during a time when there are any automation events scheduled then it will be ignored and no exception will be thrown.
     *
     *
     * @property value
     * @type Number/Boolean
     * @default 0
     */
    Object.defineProperty( this, 'value', {
        enumerable: true,
        configurable: false,
        set: function ( value ) {
            log.debug( "Setting param", name, "value to", value );
            // Sanitize the value with min/max
            // bounds first.
            if ( typeof value !== typeof defaultValue ) {
                log.error( "Attempt to set a", ( typeof defaultValue ), "parameter to a", ( typeof value ), "value" );
                return;
            }
            // Sanitize the value with min/max
            // bounds first.
            if ( typeof value === "number" ) {
                if ( value > maxValue ) {
                    log.debug( this.name, 'clamping to max' );
                    value = maxValue;
                } else if ( value < minValue ) {
                    log.debug( this.name + ' clamping to min' );
                    value = minValue;
                }
            }

            // Store the incoming value for getter
            value_ = value;

            // Map the value
            if ( typeof mappingFunction === 'function' ) {
                // Map if mappingFunction is defined
                value = mappingFunction( value );
            }

            if ( !calledFromAutomation_ ) {
                log.debug( "Clearing Automation for", name );
                window.clearInterval( intervalID_ );
            }
            calledFromAutomation_ = false;

            // Dispatch the value
            if ( typeof setter === 'function' && baseSound.audioContext ) {
                setter( aParams, value, baseSound.audioContext );
            } else if ( aParams ) {
                // else if param is defined, set directly
                if ( aParams instanceof AudioParam ) {
                    var array = [];
                    array.push( aParams );
                    aParams = array;
                }
                aParams.forEach( function ( thisParam ) {
                    if ( baseSound.isPlaying ) {
                        //dezipper if already playing
                        thisParam.setTargetAtTime( value, baseSound.audioContext.currentTime, Config.DEFAULT_SMOOTHING_CONSTANT );
                    } else {
                        //set directly if not playing
                        log.debug( "Setting param", name, 'through setter' );
                        thisParam.setValueAtTime( value, baseSound.audioContext.currentTime );
                    }
                } );
            }
        },
        get: function () {
            return value_;
        }
    } );
    if ( aParams && ( aParams instanceof AudioParam || aParams instanceof Array ) ) {
        // Use a nominal Parameter to populate the values.
        var aParam = aParams[ 0 ] || aParams;
    }

    if ( name ) {
        this.name = name;
    } else if ( aParam ) {
        this.name = aParam.name;
    }

    if ( typeof defaultValue !== 'undefined' ) {
        this.defaultValue = defaultValue;
        this.value = defaultValue;
    } else if ( aParam ) {
        this.defaultValue = aParam.defaultValue;
        this.value = aParam.defaultValue;
    }

    if ( typeof minValue !== 'undefined' ) {
        this.minValue = minValue;
    } else if ( aParam ) {
        this.minValue = aParam.minValue;
    }

    if ( typeof maxValue !== 'undefined' ) {
        this.maxValue = maxValue;
    } else if ( aParam ) {
        this.maxValue = aParam.maxValue;
    }

    /**
     * Schedules a parameter value change at the given time.
     *
     * @method setValueAtTime
     * @param {Number} value The value parameter is the value the parameter will change to at the given time.
     * @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
     */
    this.setValueAtTime = function ( value, startTime ) {
        if ( aParams ) {
            if ( typeof mappingFunction === 'function' ) {
                value = mappingFunction( value );
            }
            if ( aParams instanceof AudioParam ) {
                aParams.setValueAtTime( value, startTime );
            } else if ( aParams instanceof Array ) {
                aParams.forEach( function ( thisParam ) {
                    thisParam.setValueAtTime( value, startTime );
                } );
            }
        } else {
            // Horrible hack for the case we don't have access to
            // a real AudioParam.
            var self = this;
            webAudioDispatch( function () {
                self.value = value;
            }, startTime, baseSound.audioContext );
        }
    };

    /**
     * Start exponentially approaching the target value at the given time with a rate having the given time constant.
     *
     * During the time interval: T0 <= t < T1, where T0 is the startTime parameter and T1 represents the time of the event following this event (or infinity if there are no following events):
     *     v(t) = V1 + (V0 - V1) * exp(-(t - T0) / timeConstant)
     *
     * @method setTargetAtTime
     * @param {Number} target The target parameter is the value the parameter will start changing to at the given time.
     * @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
     * @param {Number} timeConstant The timeConstant parameter is the time-constant value of first-order filter (exponential) approach to the target value. The larger this value is, the slower the transition will be.
     */
    this.setTargetAtTime = function ( target, startTime, timeConstant ) {
        if ( aParams ) {
            if ( typeof mappingFunction === 'function' ) {
                target = mappingFunction( target );
            }
            if ( aParams instanceof AudioParam ) {
                aParams.setTargetAtTime( target, startTime, timeConstant );
            } else if ( aParams instanceof Array ) {
                aParams.forEach( function ( thisParam ) {
                    thisParam.setTargetAtTime( target, startTime, timeConstant );
                } );
            }
        } else {
            // Horrible hack for the case we don't have access to
            // a real AudioParam.
            var self = this;
            var initValue_ = self.value;
            var initTime_ = baseSound.audioContext.currentTime;
            log.debug( "starting automation" );
            intervalID_ = window.setInterval( function () {
                if ( baseSound.audioContext.currentTime >= startTime ) {
                    calledFromAutomation_ = true;
                    self.value = target + ( initValue_ - target ) * Math.exp( -( baseSound.audioContext.currentTime - initTime_ ) / timeConstant );
                    if ( Math.abs( self.value - target ) < MIN_DIFF ) {
                        window.clearInterval( intervalID_ );
                    }
                }
            }, UPDATE_INTERVAL_MS );
        }
    };
    /**
     * Sets an array of arbitrary parameter values starting at the given time for the given duration. The number of values will be scaled to fit into the desired duration.

     * During the time interval: startTime <= t < startTime + duration, values will be calculated:
     *
     *   v(t) = values[N * (t - startTime) / duration], where N is the length of the values array.
     *
     * @method setValueCurveAtTime
     * @param {Float32Array} values The values parameter is a Float32Array representing a parameter value curve. These values will apply starting at the given time and lasting for the given duration.
     * @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
     * @param {Number} duration The duration parameter is the amount of time in seconds (after the startTime parameter) where values will be calculated according to the values parameter.
     */
    this.setValueCurveAtTime = function ( values, startTime, duration ) {
        if ( aParams ) {
            if ( typeof mappingFunction === 'function' ) {
                for ( var index = 0; index < values.length; index++ ) {
                    values[ index ] = mappingFunction( values[ index ] );
                }
            }
            if ( aParams instanceof AudioParam ) {
                aParams.setValueCurveAtTime( values, startTime, duration );
            } else if ( aParams instanceof Array ) {
                aParams.forEach( function ( thisParam ) {
                    thisParam.setValueCurveAtTime( values, startTime, duration );
                } );
            }
        } else {
            var self = this;
            var initTime_ = baseSound.audioContext.currentTime;
            intervalID_ = window.setInterval( function () {
                if ( baseSound.audioContext.currentTime >= startTime ) {
                    var index = Math.floor( values.length * ( baseSound.audioContext.currentTime - initTime_ ) / duration );
                    if ( index < values.length ) {
                        calledFromAutomation_ = true;
                        self.value = values[ index ];
                    } else {
                        window.clearInterval( intervalID_ );
                    }
                }
            }, UPDATE_INTERVAL_MS );
        }
    };

    /**
     * Schedules an exponential continuous change in parameter value from the previous scheduled parameter value to the given value.
     *
     * v(t) = V0 * (V1 / V0) ^ ((t - T0) / (T1 - T0))
     *
     * @method exponentialRampToValueAtTime
     * @param {Number} value The value parameter is the value the parameter will exponentially ramp to at the given time.
     * @param {Number} endTime The endTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
     */
    this.exponentialRampToValueAtTime = function ( value, endTime ) {
        if ( aParams ) {
            if ( typeof mappingFunction === 'function' ) {
                value = mappingFunction( value );
            }
            if ( aParams instanceof AudioParam ) {
                aParams.exponentialRampToValueAtTime( value, endTime );
            } else if ( aParams instanceof Array ) {
                aParams.forEach( function ( thisParam ) {
                    thisParam.exponentialRampToValueAtTime( value, endTime );
                } );
            }
        } else {
            var self = this;
            var initValue_ = self.value;
            var initTime_ = baseSound.audioContext.currentTime;
            if ( initValue_ === 0 ) {
                initValue_ = 0.001;
            }
            intervalID_ = window.setInterval( function () {
                var timeRatio = ( baseSound.audioContext.currentTime - initTime_ ) / ( endTime - initTime_ );
                calledFromAutomation_ = true;
                self.value = initValue_ * Math.pow( value / initValue_, timeRatio );
                if ( baseSound.audioContext.currentTime >= endTime ) {
                    window.clearInterval( intervalID_ );
                }
            }, UPDATE_INTERVAL_MS );
        }
    };

    /**
     *Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.
     *
     * @method linearRampToValueAtTime
     * @param {Float32Array} value The value parameter is the value the parameter will exponentially ramp to at the given time.
     * @param {Number} endTime The endTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
     */
    this.linearRampToValueAtTime = function ( value, endTime ) {
        if ( aParams ) {
            if ( typeof mappingFunction === 'function' ) {
                value = mappingFunction( value );
            }
            if ( aParams instanceof AudioParam ) {
                aParams.linearRampToValueAtTime( value, endTime );
            } else if ( aParams instanceof Array ) {
                aParams.forEach( function ( thisParam ) {
                    thisParam.linearRampToValueAtTime( value, endTime );
                } );
            }
        } else {
            var self = this;
            var initValue_ = self.value;
            var initTime_ = baseSound.audioContext.currentTime;
            intervalID_ = window.setInterval( function () {
                var timeRatio = ( baseSound.audioContext.currentTime - initTime_ ) / ( endTime - initTime_ );
                calledFromAutomation_ = true;
                self.value = initValue_ + ( ( value - initValue_ ) * timeRatio );
                if ( baseSound.audioContext.currentTime >= endTime ) {
                    window.clearInterval( intervalID_ );
                }
            }, UPDATE_INTERVAL_MS );
        }
    };

    /**
     * Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.
     *
     * @method cancelScheduledValues
     * @param {Number} startTime The startTime parameter is the starting time at and after which any previously scheduled parameter changes will be cancelled.
     */
    this.cancelScheduledValues = function ( startTime ) {
        if ( aParams ) {
            if ( aParams instanceof AudioParam ) {
                aParams.cancelScheduledValues( startTime );
            } else if ( aParams instanceof Array ) {
                aParams.forEach( function ( thisParam ) {
                    thisParam.cancelScheduledValues( startTime );
                } );
            }
        } else {
            window.clearInterval( intervalID_ );
        }
    };
}

/**
 * Static helper method to create Psuedo parameters which are not connected to
any WebAudio AudioParams.
 *
 * @method createPsuedoParam
 * @static
 * @return  SPAudioParam
 * @param {BaseSound} baseSound A reference to the BaseSound which exposes this parameter.
 * @param {String} name The name of the parameter..
 * @param {Number} minValue The minimum value of the parameter.
 * @param {Number} maxValue The maximum value of the parameter.
 * @param {Number} defaultValue The default and starting value of the parameter.
 */
SPAudioParam.createPsuedoParam = function ( baseSound, name, minValue, maxValue, defaultValue ) {
    return new SPAudioParam( baseSound, name, minValue, maxValue, defaultValue, null, null, null );
};

module.exports = SPAudioParam;
