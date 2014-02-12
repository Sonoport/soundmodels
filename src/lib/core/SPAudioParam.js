define(
    [],
    function() {
        "use strict";
        /**
          Mock AudioParam for external use on Models.

          @class SPAudioParam
          @constructor
          **/
        function SPAudioParam(name, minValue, maxValue, defaultValue, aParam, mapping, audioContext) {
            // Min diff between set and actual
            // values to stop updates.
            var MIN_DIFF = 0.0001;
            var UPDATE_INTERVAL_MS = 100;

            var intervalID;

            /**
                  @property defaultValue
                  @type Number
                  @default 0
                  **/
            this.defaultValue = 0;

            /**
                  @property maxValue
                  @type Number
                  @default 0
                  **/
            this.maxValue = 0;

            /**
                  @property minValue
                  @type Number
                  @default 0
                  **/
            this.minValue = 0;

            /**
                  @property name
                  @type String
                  @default ""
                  **/
            this.name = "";

            /**
                  @property value
                  @type String
                  @default 0
                  **/
            var mValue = 0;
            Object.defineProperty(this, 'value', {
                enumerable: true,
                configurable: true,
                set: function(value) {
                    // Sanitize the value with min/max
                    // bounds first.
                    if (value > maxValue) {
                        value = maxValue;
                    } else if (value < minValue) {
                        value = minValue;
                    }

                    if (aParam) {
                        // If mapped param
                        if (typeof mapping === 'function') {
                            // Map if mapping is defined
                            value = mapping(value);
                        }
                        aParam.value = value;
                    } else {
                        // If Psuedo param
                        mValue = value;
                    }
                },
                get: function() {
                    if (aParam && aParam instanceof AudioParam) {
                        return aParam.value;
                    } else {
                        return mValue;
                    }
                }
            });

            if (aParam && aParam instanceof AudioParam) {
                this.defaultValue = aParam.defaultValue;
                this.value = aParam.defaultValue;
                this.name = aParam.name;
                this.minValue = aParam.minValue;
                this.maxValue = aParam.maxValue;
            }

            if (defaultValue) {
                this.defaultValue = defaultValue;
                this.value = defaultValue;
            }

            if (name) {
                this.name = name;
            }

            if (minValue) {
                this.minValue = minValue;
            }

            if (maxValue) {
                this.maxValue = maxValue;
            }


            /**
              Schedules a parameter value change at the given time.

              @method setValueAtTime
              @return  null
              @param {Number} value The value parameter is the value the parameter will change to at the given time.
              @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
              **/
            this.setValueAtTime = function(value, startTime) {
                if (typeof mapping === 'function') {
                    value = mapping(value);
                }

                if (aParam) {
                    aParam.setValueAtTime(value, startTime);
                } else {
                    // Horrible hack for the case we don't have access to
                    // a real AudioParam.
                    var self = this;
                    var remainingTime = startTime - audioContext.currentTime;
                    window.setTimeout(function() {
                        self.value = value;
                    }, remainingTime * 1000);
                }
            };

            /**
              Start exponentially approaching the target value at the given time with a rate having the given time constant.

              During the time interval: T0 <= t < T1, where T0 is the startTime parameter and T1 represents the time of the event following this event (or infinity if there are no following events):
                     v(t) = V1 + (V0 - V1) * exp(-(t - T0) / timeConstant)

              @method setTargetAtTime
              @return  null
              @param {Number} target The target parameter is the value the parameter will start changing to at the given time.
              @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
              @param {Number} timeConstant The timeConstant parameter is the time-constant value of first-order filter (exponential) approach to the target value. The larger this value is, the slower the transition will be.
              **/
            this.setTargetAtTime = function(target, startTime, timeConstant) {
                if (typeof mapping === 'function') {
                    target = mapping(target);
                }
                if (aParam) {
                    aParam.setTargetAtTime(target, startTime, timeConstant);
                } else {
                    // Horrible hack for the case we don't have access to
                    // a real AudioParam.
                    var self = this;
                    var initValue = self.value;
                    var initTime = audioContext.currentTime;
                    intervalID = window.setInterval(function() {
                        if (audioContext.currentTime >= startTime) {
                            self.value = target + (initValue - target) * Math.exp(-(audioContext.currentTime - initTime) / timeConstant);
                            if (Math.abs(self.value - target) < MIN_DIFF) {
                                window.clearInterval(intervalID);
                            }
                        }
                    }, UPDATE_INTERVAL_MS);
                }
            };

            /**
              Sets an array of arbitrary parameter values starting at the given time for the given duration. The number of values will be scaled to fit into the desired duration.

              During the time interval: startTime <= t < startTime + duration, values will be calculated:

                    v(t) = values[N * (t - startTime) / duration], where N is the length of the values array.

              @method setValueCurveAtTime
              @return  null
              @param {Float32Array} values The values parameter is a Float32Array representing a parameter value curve. These values will apply starting at the given time and lasting for the given duration.
              @param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
              @param {Number} duration The duration parameter is the amount of time in seconds (after the time parameter) where values will be calculated according to the values parameter.
              **/
            this.setValueCurveAtTime = function(values, startTime, duration) {
                if (typeof mapping === 'function') {
                    var index = 0;
                    for (; index < values.length; index++) {
                        values[index] = mapping(values[index]);
                    }
                }
                if (aParam) {
                    aParam.setValueCurveAtTime(values, startTime, duration);
                } else {
                    var self = this;
                    var initTime = audioContext.currentTime;
                    intervalID = window.setInterval(function() {
                        if (audioContext.currentTime > startTime) {
                            var index = Math.floor(values.length * (audioContext.currentTime - initTime) / duration);
                            console.log('index is ' + index);
                            if (index < values.length) {
                                self.value = values[index];
                            } else {
                                window.clearInterval(intervalID);
                            }
                        }
                    }, UPDATE_INTERVAL_MS);
                }
            };

            /**
              Schedules an exponential continuous change in parameter value from the previous scheduled parameter value to the given value.

               v(t) = V0 * (V1 / V0) ^ ((t - T0) / (T1 - T0))

              @method exponentialRampToValueAtTime
              @return  null
              @param {Number} value The value parameter is the value the parameter will exponentially ramp to at the given time.
              @param {Number} endTime The endTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
              **/
            this.exponentialRampToValueAtTime = function(value, endTime) {
                if (typeof mapping === 'function') {
                    value = mapping(value);
                }
                if (aParam) {
                    aParam.exponentialRampToValueAtTime(value, endTime);
                } else {
                    var self = this;
                    var initValue = self.value;
                    var initTime = audioContext.currentTime;
                    intervalID = window.setInterval(function() {
                        var timeRatio = (audioContext.currentTime - initTime) / (endTime - initTime);
                        self.value = initValue * Math.pow(value / initValue, timeRatio);
                        if (audioContext.currentTime >= endTime) {
                            window.clearInterval(intervalID);
                        }
                    }, UPDATE_INTERVAL_MS);
                }
            };

            /**
              Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.

              @method linearRampToValueAtTime
              @return  null
              @param {Float32Array} value The value parameter is the value the parameter will exponentially ramp to at the given time.
              @param {Number} endTime The endTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
              **/
            this.linearRampToValueAtTime = function(value, endTime) {
                if (typeof mapping === 'function') {
                    value = mapping(value);
                }
                if (aParam) {
                    aParam.linearRampToValueAtTime(value, endTime);
                } else {
                    var self = this;
                    var initValue = self.value;
                    var initTime = audioContext.currentTime;
                    intervalID = window.setInterval(function() {
                        var timeRatio = (audioContext.currentTime - initTime) / (endTime - initTime);
                        self.value = initValue + ((value - initValue) * timeRatio);
                        if (audioContext.currentTime >= endTime) {
                            window.clearInterval(intervalID);
                        }
                    }, UPDATE_INTERVAL_MS);
                }
            };

            /**
              Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.

              @method cancelScheduledValues
              @return  null
              @param {Number} startTime The startTime parameter is the starting time at and after which any previously scheduled parameter changes will be cancelled.
              **/
            this.cancelScheduledValues = function(startTime) {
                if (aParam) {
                    aParam.cancelScheduledValues(startTime);
                } else {
                    window.clearInterval(intervalID);
                }
            };
        }

        /**
          Static helper method to create Psuedo parameters which are not connected to
          any WebAudio AudioParams.

          @method createPsuedoParam
          @return  SPAudioParam
          @param {String} name The name of the parameter..
          @param {Number} minValue The minimum value of the parameter.
          @param {Number} maxValue The maximum value of the parameter.
          @param {Number} defaultValue The default and starting value of the parameter.
          @param {AudioContext} audioContext An audiocontext in which this model exists.
          **/
        SPAudioParam.createPsuedoParam = function(name, minValue, maxValue, defaultValue, audioContext) {

            return new SPAudioParam(name, minValue, maxValue, defaultValue, null, null, audioContext);

        };


        /**
          Static helper method to create a parameter which is mapped to an underlying
          WebAudio AudioParam

          @method createPsuedoParam
          @return  SPAudioParam
          @param {String} name The name of the parameter..
          @param {Number} minValue The minimum value of the parameter.
          @param {Number} maxValue The maximum value of the parameter.
          @param {Number} defaultValue The default and starting value of the parameter.
          @param {AudioParam} aParam A WebAudio parameter which will be set/get when this parameter is changed.
          @param {Function} mapping A mapping function to map values between the mapped SPAudioParam and the underlying WebAudio AudioParam.
          **/
        SPAudioParam.createMappedParam = function(name, minValue, maxValue, defaultValue, aParam, mapping) {

            return new SPAudioParam(name, minValue, maxValue, defaultValue, aParam, mapping);
        };

        return SPAudioParam;
    });
