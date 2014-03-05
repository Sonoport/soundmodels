define( [],
    function () {
        "use strict";

        function SPPlaybackRateParam( audioParam, parentNode ) {

            this.defaultValue = audioParam.defaultValue;
            this.maxValue = audioParam.maxValue;
            this.minValue = audioParam.minValue;
            this.name = audioParam.name;
            this.units = audioParam.units;

            Object.defineProperty( this, 'value', {
                enumerable: true,
                set: function ( rate ) {
                    var cTime = parentNode.audioContext.currentTime;
                    var source = parentNode.bufferSourceNode;
                    if ( source.playbackState === source.PLAYING_STATE ) {
                        parentNode.addNewEvent( {
                            type: "set",
                            value: rate,
                            time: cTime
                        } );
                    }
                    audioParam.value = rate;
                },
                get: function () {
                    return audioParam.value;
                }
            } );

            this.linearRampToValueAtTime = function ( value, endTime ) {
                audioParam.linearRampToValueAtTime( value, endTime );
                parentNode.addNewEvent( {
                    type: "linear",
                    value: value,
                    time: endTime
                } );
            };

            this.exponentialRampToValueAtTime = function ( value, endTime ) {
                audioParam.exponentialRampToValueAtTime( value, endTime );
                parentNode.addNewEvent( {
                    type: "exponential",
                    value: value,
                    time: endTime
                } );
            };

            this.setValueCurveAtTime = function ( values, startTime, duration ) {
                audioParam.setValueCurveAtTime( values, startTime, duration );
                parentNode.addNewEvent( {
                    type: "curve",
                    curve: values,
                    duration: duration,
                    time: startTime
                } );
            };

            this.setTargetAtTime = function ( target, startTime, timeConstant ) {
                audioParam.setTargetAtTime( target, startTime, timeConstant );
                parentNode.addNewEvent( {
                    type: "target",
                    value: target,
                    time: startTime,
                    timeConstant: timeConstant
                } );
            };

            this.setValueAtTime = function ( value, time ) {
                audioParam.setValueAtTime( value, time );
                parentNode.addNewEvent( {
                    type: "set",
                    value: value,
                    time: time
                } );
            };

            this.cancelScheduledValues = function ( time ) {
                audioParam.cancelScheduledValues( time );
                parentNode.cancelScheduledValues( time );
            };

        }

        return SPPlaybackRateParam;

    } );
