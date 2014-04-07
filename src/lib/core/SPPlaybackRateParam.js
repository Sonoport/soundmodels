/**
 * @class SPPlaybackRateParam
 * @description Wrapper Around AudioParam playbackRate of AudioBufferSourceNode to help
                        calculate the playbackPosition of the AudioBufferSourceNode.
 * @module Core
 */
define( [],
    function () {
        "use strict";

        /**
         * @constructor
         * @param {AudioParam} the playbackRate of a AudioBufferSourceNode.
         * @param {AudioNode} a AudioBufferSourceNode.
         */
        function SPPlaybackRateParam( audioParam, counterParam ) {
            this.defaultValue = audioParam.defaultValue;
            this.maxValue = audioParam.maxValue;
            this.minValue = audioParam.minValue;
            this.name = audioParam.name;
            this.units = audioParam.units;

            Object.defineProperty( this, 'value', {
                enumerable: true,
                set: function ( rate ) {
                    audioParam.value = rate;
                    counterParam.value = rate;
                },
                get: function () {
                    return audioParam.value;
                }
            } );
            this.linearRampToValueAtTime = function ( value, endTime ) {
                audioParam.linearRampToValueAtTime( value, endTime );
                counterParam.linearRampToValueAtTime( value, endTime );
            };
            this.exponentialRampToValueAtTime = function ( value, endTime ) {
                audioParam.exponentialRampToValueAtTime( value, endTime );
                counterParam.exponentialRampToValueAtTime( value, endTime );

            };
            this.setValueCurveAtTime = function ( values, startTime, duration ) {
                audioParam.setValueCurveAtTime( values, startTime, duration );
                counterParam.setValueCurveAtTime( values, startTime, duration );
            };
            this.setTargetAtTime = function ( target, startTime, timeConstant ) {
                audioParam.setTargetAtTime( target, startTime, timeConstant );
                counterParam.setTargetAtTime( target, startTime, timeConstant );

            };
            this.setValueAtTime = function ( value, time ) {
                audioParam.setValueAtTime( value, time );
                counterParam.setValueAtTime( value, time );
            };
            this.cancelScheduledValues = function ( time ) {
                audioParam.cancelScheduledValues( time );
                counterParam.cancelScheduledValues( time );
            };
        }
        return SPPlaybackRateParam;
    } );
