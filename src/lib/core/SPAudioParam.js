
/**
Mock AudioParam for external use on Models.

@class SPAudioParam
@constructor
**/
function SPAudioParam(){
  "use strict";
  /**
  @property defaultValue
  @default 0
  **/
  this.defaultValue = 0;
   /**
  @property maxValue
  @default 0
  **/
  this.maxValue = 0;
   /**
  @property minValue
  @default 0
  **/
  this.minValue = 0;
   /**
  @property name
  @default ""
  **/
  this.name = "";
   /**
  @property value
  @default 0
  **/
  this.value = 0;
}


/**
Schedules a parameter value change at the given time.

@method setValueAtTime
@return  null
@param {Number} value The value parameter is the value the parameter will change to at the given time.
@param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.

**/
SPAudioParam.prototype.setValueAtTime = function (value,startTime){

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
SPAudioParam.prototype.setTargetAtTime = function(target, startTime, timeConstant){

};

/**
Sets an array of arbitrary parameter values starting at the given time for the given duration. The number of values will be scaled to fit into the desired duration.

During the time interval: startTime <= t < startTime + duration, values will be calculated:

      v(t) = values[N * (t - startTime) / duration], where N is the length of the values array.

@method setTargetValueAtTime
@return  null
@param {Float32Array} values The values parameter is a Float32Array representing a parameter value curve. These values will apply starting at the given time and lasting for the given duration.
@param {Number} startTime The startTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
@param {Number} duration The duration parameter is the amount of time in seconds (after the time parameter) where values will be calculated according to the values parameter.
**/
SPAudioParam.prototype.setTargetValueAtTime = function (values,startTime,duration){

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
SPAudioParam.prototype.setValueCurveAtTime = function(values, startTime, duration){

};

/**
Schedules an exponential continuous change in parameter value from the previous scheduled parameter value to the given value.

@method exponentialRampToValueAtTime
@return  null
@param {Float32Array} value The value parameter is the value the parameter will exponentially ramp to at the given time.
@param {Number} endTime The endTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
**/
SPAudioParam.prototype.exponentialRampToValueAtTime = function(value, endTime){

};

/**
Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.

@method linearRampToValueAtTime
@return  null
@param {Float32Array} value The value parameter is the value the parameter will exponentially ramp to at the given time.
@param {Number} endTime The endTime parameter is the time in the same time coordinate system as AudioContext.currentTime.
**/
SPAudioParam.prototype.linearRampToValueAtTime = function(value, endTime){

};

/**
Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.

@method cancelScheduledValues
@return  null
@param {Number} startTime The startTime parameter is the starting time at and after which any previously scheduled parameter changes will be cancelled.
**/
SPAudioParam.prototype.cancelScheduledValues = function(startTime){

};
