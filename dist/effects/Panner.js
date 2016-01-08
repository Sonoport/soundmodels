/*soundmodels - v2.5.13 - Fri Jan 08 2016 09:14:29 GMT+0800 (SGT) */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Panner = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
!function(e,o){"use strict";"object"==typeof module&&module.exports&&"function"==typeof _dereq_?module.exports=o():"function"==typeof define&&"object"==typeof define.amd?define(o):e.log=o()}(this,function(){"use strict";function e(e){return typeof console===c?!1:void 0!==console[e]?o(console,e):void 0!==console.log?o(console,"log"):i}function o(e,o){var t=e[o];if("function"==typeof t.bind)return t.bind(e);try{return Function.prototype.bind.call(t,e)}catch(n){return function(){return Function.prototype.apply.apply(t,[e,arguments])}}}function t(e,o,t){return function(){typeof console!==c&&(n.call(this,o,t),this[e].apply(this,arguments))}}function n(e,o){for(var t=0;t<u.length;t++){var n=u[t];this[n]=e>t?i:this.methodFactory(n,e,o)}}function l(o){return e(o)||t.apply(this,arguments)}function r(e,o,t){function r(e){var o=(u[e]||"silent").toUpperCase();try{return void(window.localStorage[s]=o)}catch(t){}try{window.document.cookie=encodeURIComponent(s)+"="+o+";"}catch(t){}}function i(){var e;try{e=window.localStorage[s]}catch(o){}if(typeof e===c)try{var t=window.document.cookie,n=t.indexOf(encodeURIComponent(s)+"=");n&&(e=/^([^;]+)/.exec(t.slice(n))[1])}catch(o){}return void 0===f.levels[e]&&(e=void 0),e}var a,f=this,s="loglevel";e&&(s+=":"+e),f.levels={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},f.methodFactory=t||l,f.getLevel=function(){return a},f.setLevel=function(o,t){if("string"==typeof o&&void 0!==f.levels[o.toUpperCase()]&&(o=f.levels[o.toUpperCase()]),!("number"==typeof o&&o>=0&&o<=f.levels.SILENT))throw"log.setLevel() called with invalid level: "+o;return a=o,t!==!1&&r(o),n.call(f,o,e),typeof console===c&&o<f.levels.SILENT?"No console available for logging":void 0},f.setDefaultLevel=function(e){i()||f.setLevel(e,!1)},f.enableAll=function(e){f.setLevel(f.levels.TRACE,e)},f.disableAll=function(e){f.setLevel(f.levels.SILENT,e)};var d=i();null==d&&(d=null==o?"WARN":o),f.setLevel(d,!1)}var i=function(){},c="undefined",u=["trace","debug","info","warn","error"],a=new r,f={};a.getLogger=function(e){if("string"!=typeof e||""===e)throw new TypeError("You must supply a name when creating a logger.");var o=f[e];return o||(o=f[e]=new r(e,a.getLevel(),a.methodFactory)),o};var s=typeof window!==c?window.log:void 0;return a.noConflict=function(){return typeof window!==c&&window.log===a&&(window.log=s),a},a});

},{}],2:[function(_dereq_,module,exports){
"use strict";function AudioContextMonkeyPatch(){window.AudioContext=window.AudioContext||window.webkitAudioContext}module.exports=AudioContextMonkeyPatch;

},{}],3:[function(_dereq_,module,exports){
"use strict";function BaseEffect(t){function e(t){function e(){o.connect(t.destination),o.start(0),o.stop(t.currentTime+1e-4),o.disconnect(t.destination),document.body.removeEventListener("touchend",e),document.body.removeEventListener("webkitmouseforcewillbegin",e)}var n=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),i=/Safari/.test(navigator.userAgent)&&/Apple Computer/.test(navigator.vendor);if((n||i)&&(window.liveAudioContexts||(window.liveAudioContexts=[]),window.liveAudioContexts.indexOf(t)<0)){var o=t.createOscillator();document.body.addEventListener("touchend",e),document.body.addEventListener("webkitmouseforcewillbegin",e),window.liveAudioContexts.push(t)}}void 0===t||null===t?(log.debug("Making a new AudioContext"),this.audioContext=new AudioContext):this.audioContext=t,e(this.audioContext),this.inputNode=null,Object.defineProperty(this,"numberOfInputs",{enumerable:!0,configurable:!1,get:function(){return this.inputNode.numberOfOutputs||0}}),this.outputNode=null,Object.defineProperty(this,"numberOfOutputs",{enumerable:!0,configurable:!1,get:function(){return this.outputNode.numberOfOutputs||0}}),this.isPlaying=!1,this.isInitialized=!1,this.destinations=[],this.effectName="Effect",this.isBaseEffect=!0,this.parameterList_=[]}_dereq_("../core/AudioContextMonkeyPatch")();var log=_dereq_("loglevel");BaseEffect.prototype.connect=function(t,e,n){t instanceof AudioNode?(this.outputNode.connect(t,e,n),this.destinations.push({destination:t,output:e,input:n})):t.inputNode instanceof AudioNode?(this.outputNode.connect(t.inputNode,e,n),this.destinations.push({destination:t.inputNode,output:e,input:n})):log.error("No Input Connection - Attempts to connect "+typeof e+" to "+typeof this)},BaseEffect.prototype.disconnect=function(t){this.outputNode.disconnect(t),this.destinations=[]},BaseEffect.prototype.registerParameter=function(t,e){(void 0===e||null===e)&&(e=!1),Object.defineProperty(this,t.name,{enumerable:!0,configurable:e,value:t});var n=this,i=!1;this.parameterList_.forEach(function(e,o){e.name===t.name&&(n.parameterList_.splice(o,1,t),i=!0)}),i||this.parameterList_.push(t)},BaseEffect.prototype.listParams=function(){return this.parameterList_},module.exports=BaseEffect;

},{"../core/AudioContextMonkeyPatch":2,"loglevel":1}],4:[function(_dereq_,module,exports){
"use strict";function Config(){}Config.LOG_ERRORS=!0,Config.ZERO=parseFloat("1e-37"),Config.MAX_VOICES=8,Config.NOMINAL_REFRESH_RATE=60,Config.WINDOW_LENGTH=512,Config.CHUNK_LENGTH=2048,Config.DEFAULT_SMOOTHING_CONSTANT=.05,module.exports=Config;

},{}],5:[function(_dereq_,module,exports){
"use strict";function SPAudioParam(e,t,a,i,n,o,u,r){var l,f=1e-4,c=500,s=0,m=!1;if(this.defaultValue=null,this.maxValue=0,this.minValue=0,this.name="",this.isSPAudioParam=!0,Object.defineProperty(this,"value",{enumerable:!0,configurable:!1,set:function(f){if(log.debug("Setting param",t,"value to",f),typeof f!=typeof n)return void log.error("Attempt to set a",typeof n,"parameter to a",typeof f,"value");if("number"==typeof f&&(f>i?(log.debug(this.name,"clamping to max"),f=i):a>f&&(log.debug(this.name+" clamping to min"),f=a)),s=f,"function"==typeof u&&(f=u(f)),m||(log.debug("Clearing Automation for",t),window.clearInterval(l)),m=!1,"function"==typeof r&&e.audioContext)r(o,f,e.audioContext);else if(o){if(o instanceof AudioParam){var c=[];c.push(o),o=c}o.forEach(function(a){e.isPlaying?a.setTargetAtTime(f,e.audioContext.currentTime,Config.DEFAULT_SMOOTHING_CONSTANT):(log.debug("Setting param",t,"through setter"),a.setValueAtTime(f,e.audioContext.currentTime))})}},get:function(){return s}}),o&&(o instanceof AudioParam||o instanceof Array))var d=o[0]||o;t?this.name=t:d&&(this.name=d.name),"undefined"!=typeof n?(this.defaultValue=n,this.value=n):d&&(this.defaultValue=d.defaultValue,this.value=d.defaultValue),"undefined"!=typeof a?this.minValue=a:d&&(this.minValue=d.minValue),"undefined"!=typeof i?this.maxValue=i:d&&(this.maxValue=d.maxValue),this.setValueAtTime=function(t,a){if(o)"function"==typeof u&&(t=u(t)),o instanceof AudioParam?o.setValueAtTime(t,a):o instanceof Array&&o.forEach(function(e){e.setValueAtTime(t,a)});else{var i=this;webAudioDispatch(function(){i.value=t},a,e.audioContext)}},this.setTargetAtTime=function(t,a,i){if(o)"function"==typeof u&&(t=u(t)),o instanceof AudioParam?o.setTargetAtTime(t,a,i):o instanceof Array&&o.forEach(function(e){e.setTargetAtTime(t,a,i)});else{var n=this,r=n.value,s=e.audioContext.currentTime;log.debug("starting automation"),l=window.setInterval(function(){e.audioContext.currentTime>=a&&(m=!0,n.value=t+(r-t)*Math.exp(-(e.audioContext.currentTime-s)/i),Math.abs(n.value-t)<f&&window.clearInterval(l))},c)}},this.setValueCurveAtTime=function(t,a,i){if(o){if("function"==typeof u)for(var n=0;n<t.length;n++)t[n]=u(t[n]);o instanceof AudioParam?o.setValueCurveAtTime(t,a,i):o instanceof Array&&o.forEach(function(e){e.setValueCurveAtTime(t,a,i)})}else{var r=this,f=e.audioContext.currentTime;l=window.setInterval(function(){if(e.audioContext.currentTime>=a){var n=Math.floor(t.length*(e.audioContext.currentTime-f)/i);n<t.length?(m=!0,r.value=t[n]):window.clearInterval(l)}},c)}},this.exponentialRampToValueAtTime=function(t,a){if(o)"function"==typeof u&&(t=u(t)),o instanceof AudioParam?o.exponentialRampToValueAtTime(t,a):o instanceof Array&&o.forEach(function(e){e.exponentialRampToValueAtTime(t,a)});else{var i=this,n=i.value,r=e.audioContext.currentTime;0===n&&(n=.001),l=window.setInterval(function(){var o=(e.audioContext.currentTime-r)/(a-r);m=!0,i.value=n*Math.pow(t/n,o),e.audioContext.currentTime>=a&&window.clearInterval(l)},c)}},this.linearRampToValueAtTime=function(t,a){if(o)"function"==typeof u&&(t=u(t)),o instanceof AudioParam?o.linearRampToValueAtTime(t,a):o instanceof Array&&o.forEach(function(e){e.linearRampToValueAtTime(t,a)});else{var i=this,n=i.value,r=e.audioContext.currentTime;l=window.setInterval(function(){var o=(e.audioContext.currentTime-r)/(a-r);m=!0,i.value=n+(t-n)*o,e.audioContext.currentTime>=a&&window.clearInterval(l)},c)}},this.cancelScheduledValues=function(e){o?o instanceof AudioParam?o.cancelScheduledValues(e):o instanceof Array&&o.forEach(function(t){t.cancelScheduledValues(e)}):window.clearInterval(l)}}var webAudioDispatch=_dereq_("../core/WebAudioDispatch"),Config=_dereq_("../core/Config"),log=_dereq_("loglevel");SPAudioParam.createPsuedoParam=function(e,t,a,i,n){return new SPAudioParam(e,t,a,i,n,null,null,null)},module.exports=SPAudioParam;

},{"../core/Config":4,"../core/WebAudioDispatch":6,"loglevel":1}],6:[function(_dereq_,module,exports){
"use strict";function WebAudioDispatch(e,i,o){if(!o)return void log.error("No AudioContext provided");var t=o.currentTime;return t>=i||.005>i-t?(log.debug("Dispatching now"),e(),null):(log.debug("Dispatching in",1e3*(i-t),"ms"),window.setTimeout(function(){log.debug("Diff at dispatch",1e3*(i-o.currentTime),"ms"),e()},1e3*(i-t)))}var log=_dereq_("loglevel");module.exports=WebAudioDispatch;

},{"loglevel":1}],7:[function(_dereq_,module,exports){
"use strict";function Panner(e){function t(e){return e/90}function n(e,t){var n=parseInt(t),r=n+90;r>90&&(r=180-r);var i=Math.sin(n*(Math.PI/180)),o=Math.sin(r*(Math.PI/180));a.setPosition(i,0,o)}if(!(this instanceof Panner))throw new TypeError("Panner constructor cannot be called as a function.");BaseEffect.call(this,e),this.maxSources=0,this.minSources=0,this.effectName="Panner";var a,r="function"==typeof this.audioContext.createStereoPanner;r?(log.debug("using native panner"),a=this.audioContext.createStereoPanner()):(log.debug("using 3D panner"),a=this.audioContext.createPanner()),this.inputNode=a,this.outputNode=a,r?this.registerParameter(new SPAudioParam(this,"pan",-90,90,0,a.pan,t),!1):this.registerParameter(new SPAudioParam(this,"pan",-90,90,0,null,null,n),!1),this.isInitialized=!0}var BaseEffect=_dereq_("../core/BaseEffect"),SPAudioParam=_dereq_("../core/SPAudioParam"),log=_dereq_("loglevel");Panner.prototype=Object.create(BaseEffect.prototype),module.exports=Panner;
},{"../core/BaseEffect":3,"../core/SPAudioParam":5,"loglevel":1}]},{},[7])(7)
});