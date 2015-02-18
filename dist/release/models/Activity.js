/*javascript-sound-models - v2.1.0 - Mon Feb 16 2015 14:53:21 GMT+0800 (SGT) */ 
console.log("   ____                           __ \n" + "  / _____  ___ ___  ___ ___  ____/ /_\n" + " _\\ \\/ _ \\/ _ / _ \\/ _ / _ \\/ __/ __/\n" + "/___/\\___/_//_\\___/ .__\\___/_/  \\__/ \n" + "                 /_/                 \n" + "Hello Developer!\n" + "Thanks for using Sonoport Dynamic Sound Library v2.1.0.");
define("core/Config",[],function(){function e(){}return e.LOG_ERRORS=!0,e.ZERO=parseFloat("1e-37"),e.MAX_VOICES=8,e.NOMINAL_REFRESH_RATE=60,e.WINDOW_LENGTH=512,e.CHUNK_LENGTH=256,e.DEFAULT_SMOOTHING_CONSTANT=.05,e}),define("core/WebAudioDispatch",[],function(){function e(e,t,n){if(!n)return void console.warn("No AudioContext provided");var o=n.currentTime;o>=t||.005>t-o?e():window.setTimeout(function(){e()},1e3*(t-o))}return e}),define("core/AudioContextMonkeyPatch",[],function(){function e(e){e&&(e.setTargetAtTime||(e.setTargetAtTime=e.setTargetValueAtTime))}window.hasOwnProperty("webkitAudioContext")&&!window.hasOwnProperty("AudioContext")&&(window.AudioContext=webkitAudioContext,AudioContext.prototype.hasOwnProperty("createGain")||(AudioContext.prototype.createGain=AudioContext.prototype.createGainNode),AudioContext.prototype.hasOwnProperty("createDelay")||(AudioContext.prototype.createDelay=AudioContext.prototype.createDelayNode),AudioContext.prototype.hasOwnProperty("createScriptProcessor")||(AudioContext.prototype.createScriptProcessor=AudioContext.prototype.createJavaScriptNode),AudioContext.prototype.internal_createGain=AudioContext.prototype.createGain,AudioContext.prototype.createGain=function(){var t=this.internal_createGain();return e(t.gain),t},AudioContext.prototype.internal_createDelay=AudioContext.prototype.createDelay,AudioContext.prototype.createDelay=function(t){var n=t?this.internal_createDelay(t):this.internal_createDelay();return e(n.delayTime),n},AudioContext.prototype.internal_createBufferSource=AudioContext.prototype.createBufferSource,AudioContext.prototype.createBufferSource=function(){var t=this.internal_createBufferSource();return t.start||(t.start=function(e,t,n){t||n?this.noteGrainOn(e,t,n):this.noteOn(e)}),t.stop||(t.stop=t.noteOff),e(t.playbackRate),t},AudioContext.prototype.internal_createDynamicsCompressor=AudioContext.prototype.createDynamicsCompressor,AudioContext.prototype.createDynamicsCompressor=function(){var t=this.internal_createDynamicsCompressor();return e(t.threshold),e(t.knee),e(t.ratio),e(t.reduction),e(t.attack),e(t.release),t},AudioContext.prototype.internal_createBiquadFilter=AudioContext.prototype.createBiquadFilter,AudioContext.prototype.createBiquadFilter=function(){var t=this.internal_createBiquadFilter();return e(t.frequency),e(t.detune),e(t.Q),e(t.gain),t},AudioContext.prototype.hasOwnProperty("createOscillator")&&(AudioContext.prototype.internal_createOscillator=AudioContext.prototype.createOscillator,AudioContext.prototype.createOscillator=function(){var t=this.internal_createOscillator();return t.start||(t.start=t.noteOn),t.stop||(t.stop=t.noteOff),e(t.frequency),e(t.detune),t}))}),define("core/BaseSound",["core/WebAudioDispatch","core/AudioContextMonkeyPatch"],function(e){function t(e){function t(e){function t(){o.start(0),o.stop(e.currentTime+1e-4),window.liveAudioContexts.push(e),window.removeEventListener("touchstart",t)}var n=/(iPad|iPhone|iPod)/g.test(navigator.userAgent);if(n&&(window.liveAudioContexts||(window.liveAudioContexts=[]),window.liveAudioContexts.indexOf(e)<0)){var o=e.createOscillator(),i=e.createGain();i.gain.value=0,o.connect(i),i.connect(e.destination),window.addEventListener("touchstart",t)}}void 0===e||null===e?(console.log("Making a new AudioContext"),this.audioContext=new AudioContext):this.audioContext=e,t(this.audioContext),this.numberOfInputs=0,Object.defineProperty(this,"numberOfOutputs",{enumerable:!0,configurable:!1,get:function(){return this.releaseGainNode.numberOfOutputs}});var n=0;Object.defineProperty(this,"maxSources",{enumerable:!0,configurable:!1,set:function(e){0>e&&(e=0),n=Math.round(e)},get:function(){return n}});var o=0;Object.defineProperty(this,"minSources",{enumerable:!0,configurable:!1,set:function(e){0>e&&(e=0),o=Math.round(e)},get:function(){return o}}),this.releaseGainNode=this.audioContext.createGain(),this.isPlaying=!1,this.isInitialized=!1,this.inputNode=null,this.destinations=[],this.modelName="Model",this.onLoadProgress=null,this.onLoadComplete=null,this.onAudioStart=null,this.onAudioEnd=null,this.parameterList_=[],this.connect(this.audioContext.destination)}return t.prototype.connect=function(e,t,n){e instanceof AudioNode?(this.releaseGainNode.connect(e,t,n),this.destinations.push({destination:e,output:t,input:n})):e.inputNode instanceof AudioNode?(this.releaseGainNode.connect(e.inputNode,t,n),this.destinations.push({destination:e.inputNode,output:t,input:n})):console.error("No Input Connection - Attempts to connect "+typeof e+" to "+typeof this)},t.prototype.disconnect=function(e){this.releaseGainNode.disconnect(e),this.destinations=[]},t.prototype.start=function(t,n,o,i){("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime),this.releaseGainNode.gain.cancelScheduledValues(t),"undefined"!=typeof i?(this.releaseGainNode.gain.setValueAtTime(0,t),this.releaseGainNode.gain.linearRampToValueAtTime(1,t+i)):this.releaseGainNode.gain.setValueAtTime(1,t);var a=this;e(function(){a.isPlaying=!0},t,this.audioContext)},t.prototype.stop=function(t){("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime);var n=this;e(function(){n.isPlaying=!1},t,this.audioContext),this.releaseGainNode.gain.cancelScheduledValues(t)},t.prototype.release=function(t,n,o){if(this.isPlaying){var i=.5;if(("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime),n=n||i,this.releaseGainNode.gain.setValueAtTime(this.releaseGainNode.gain.value,t),this.releaseGainNode.gain.linearRampToValueAtTime(0,t+n),!o){var a=this;e(function(){a.pause()},t+n,this.audioContext)}}},t.prototype.setSources=function(e,t,n){this.isInitialized=!1,"function"==typeof t&&(this.onLoadProgress=t),"function"==typeof n&&(this.onLoadComplete=n)},t.prototype.play=function(){this.start(0)},t.prototype.pause=function(){this.isPlaying=!1},t.prototype.registerParameter=function(e,t){(void 0===t||null===t)&&(t=!1),Object.defineProperty(this,e.name,{enumerable:!0,configurable:t,value:e});var n=this,o=!1;this.parameterList_.forEach(function(t,i){t.name===e.name&&(n.parameterList_.splice(i,1,e),o=!0)}),o||this.parameterList_.push(e)},t.prototype.listParams=function(){return this.parameterList_},t}),define("core/SPAudioParam",["core/WebAudioDispatch","core/Config"],function(e,t){function n(n,o,i,a,r,u,s,c){var l,f=1e-4,d=500,h=0,p=!1;if(this.defaultValue=null,this.maxValue=0,this.minValue=0,this.name="",Object.defineProperty(this,"value",{enumerable:!0,configurable:!1,set:function(e){if(typeof e!=typeof r)return void console.error("Attempt to set a "+typeof r+" parameter to a "+typeof e+" value");if("number"==typeof e&&(e>a?(console.warn(this.name+" clamping to max"),e=a):i>e&&(console.warn(this.name+" clamping to min"),e=i)),h=e,"function"==typeof s&&(e=s(e)),p||window.clearInterval(l),p=!1,"function"==typeof c&&n.audioContext)c(u,e,n.audioContext);else if(u){if(u instanceof AudioParam){var o=[];o.push(u),u=o}u.forEach(function(o){n.isPlaying?o.setTargetAtTime(e,n.audioContext.currentTime,t.DEFAULT_SMOOTHING_CONSTANT):o.setValueAtTime(e,n.audioContext.currentTime)})}},get:function(){return h}}),u&&(u instanceof AudioParam||u instanceof Array))var m=u[0]||u;o?this.name=o:m&&(this.name=m.name),"undefined"!=typeof r?(this.defaultValue=r,this.value=r):m&&(this.defaultValue=m.defaultValue,this.value=m.defaultValue),"undefined"!=typeof i?this.minValue=i:m&&(this.minValue=m.minValue),"undefined"!=typeof a?this.maxValue=a:m&&(this.maxValue=m.maxValue),this.setValueAtTime=function(t,o){if(u)"function"==typeof s&&(t=s(t)),u instanceof AudioParam?u.setValueAtTime(t,o):u instanceof Array&&u.forEach(function(e){e.setValueAtTime(t,o)});else{var i=this;e(function(){i.value=t},o,n.audioContext)}},this.setTargetAtTime=function(e,t,o){if(u)"function"==typeof s&&(e=s(e)),u instanceof AudioParam?u.setTargetAtTime(e,t,o):u instanceof Array&&u.forEach(function(n){n.setTargetAtTime(e,t,o)});else{var i=this,a=i.value,r=n.audioContext.currentTime;console.log("starting automation"),l=window.setInterval(function(){n.audioContext.currentTime>=t&&(p=!0,i.value=e+(a-e)*Math.exp(-(n.audioContext.currentTime-r)/o),Math.abs(i.value-e)<f&&window.clearInterval(l))},d)}},this.setValueCurveAtTime=function(e,t,o){if(u){if("function"==typeof s)for(var i=0;i<e.length;i++)e[i]=s(e[i]);u instanceof AudioParam?u.setValueCurveAtTime(e,t,o):u instanceof Array&&u.forEach(function(n){n.setValueCurveAtTime(e,t,o)})}else{var a=this,r=n.audioContext.currentTime;l=window.setInterval(function(){if(n.audioContext.currentTime>=t){var i=Math.floor(e.length*(n.audioContext.currentTime-r)/o);i<e.length?(p=!0,a.value=e[i]):window.clearInterval(l)}},d)}},this.exponentialRampToValueAtTime=function(e,t){if(u)"function"==typeof s&&(e=s(e)),u instanceof AudioParam?u.exponentialRampToValueAtTime(e,t):u instanceof Array&&u.forEach(function(n){n.exponentialRampToValueAtTime(e,t)});else{var o=this,i=o.value,a=n.audioContext.currentTime;0===i&&(i=.001),l=window.setInterval(function(){var r=(n.audioContext.currentTime-a)/(t-a);p=!0,o.value=i*Math.pow(e/i,r),n.audioContext.currentTime>=t&&window.clearInterval(l)},d)}},this.linearRampToValueAtTime=function(e,t){if(u)"function"==typeof s&&(e=s(e)),u instanceof AudioParam?u.linearRampToValueAtTime(e,t):u instanceof Array&&u.forEach(function(n){n.linearRampToValueAtTime(e,t)});else{var o=this,i=o.value,a=n.audioContext.currentTime;l=window.setInterval(function(){var r=(n.audioContext.currentTime-a)/(t-a);p=!0,o.value=i+(e-i)*r,n.audioContext.currentTime>=t&&window.clearInterval(l)},d)}},this.cancelScheduledValues=function(e){u?u instanceof AudioParam?u.cancelScheduledValues(e):u instanceof Array&&u.forEach(function(t){t.cancelScheduledValues(e)}):window.clearInterval(l)}}return n.createPsuedoParam=function(e,t,o,i,a){return new n(e,t,o,i,a,null,null,null)},n}),define("core/SPPlaybackRateParam",["core/Config"],function(e){function t(t,n,o){this.defaultValue=n.defaultValue,this.maxValue=n.maxValue,this.minValue=n.minValue,this.name=n.name,this.units=n.units,Object.defineProperty(this,"value",{enumerable:!0,configurable:!1,set:function(i){t.playbackState===t.PLAYING_STATE?(n.setTargetAtTime(i,t.audioContext.currentTime,e.DEFAULT_SMOOTHING_CONSTANT),o.setTargetAtTime(i,t.audioContext.currentTime,e.DEFAULT_SMOOTHING_CONSTANT)):(n.setValueAtTime(i,t.audioContext.currentTime),o.setValueAtTime(i,t.audioContext.currentTime))},get:function(){return n.value}}),n.value=n.value,o.value=n.value,this.linearRampToValueAtTime=function(e,t){n.linearRampToValueAtTime(e,t),o.linearRampToValueAtTime(e,t)},this.exponentialRampToValueAtTime=function(e,t){n.exponentialRampToValueAtTime(e,t),o.exponentialRampToValueAtTime(e,t)},this.setValueCurveAtTime=function(e,t,i){n.setValueCurveAtTime(e,t,i),o.setValueCurveAtTime(e,t,i)},this.setTargetAtTime=function(e,t,i){n.setTargetAtTime(e,t,i),o.setTargetAtTime(e,t,i)},this.setValueAtTime=function(e,t){n.setValueAtTime(e,t),o.setValueAtTime(e,t)},this.cancelScheduledValues=function(e){n.cancelScheduledValues(e),o.cancelScheduledValues(e)}}return t}),define("core/SPAudioBuffer",[],function(){function e(e,t,n,o,i){if(!(e instanceof AudioContext))return void console.error("First argument to SPAudioBuffer must be a valid AudioContext");var a,r,u,s;this.audioContext=e,this.duration=null,Object.defineProperty(this,"numberOfChannels",{get:function(){return this.buffer?this.buffer.numberOfChannels:0}}),Object.defineProperty(this,"sampleRate",{get:function(){return this.buffer?this.buffer.sampleRate:0}}),this.getChannelData=function(e){return this.buffer?this.buffer.getChannelData(e):null},Object.defineProperty(this,"buffer",{set:function(e){if(null===u)this.startPoint=0;else if(u>e.length/e.sampleRate)return void console.error("SPAudioBuffer : startPoint cannot be greater than buffer length");if(null===s)this.endPoint=this.rawBuffer_.length;else if(s>e.length/e.sampleRate)return void console.error("SPAudioBuffer : endPoint cannot be greater than buffer length");r=e,this.updateBuffer()}.bind(this),get:function(){return a}}),this.sourceURL=null,Object.defineProperty(this,"startPoint",{set:function(e){return void 0!==s&&e>=s?void console.error("SPAudioBuffer : startPoint cannot be greater than endPoint"):r&&e*r.sampleRate>=r.length?void console.error("SPAudioBuffer : startPoint cannot be greater than or equal to buffer length"):(u=e,void this.updateBuffer())}.bind(this),get:function(){return u}}),Object.defineProperty(this,"endPoint",{set:function(e){return void 0!==u&&u>=e?void console.error("SPAudioBuffer : endPoint cannot be lesser than startPoint"):r&&e*r.sampleRate>=r.length?void console.error("SPAudioBuffer : endPoint cannot be greater than buffer or equal to length"):(s=e,void this.updateBuffer())}.bind(this),get:function(){return s}}),this.updateBuffer=function(){if(r){if((null===u||void 0===u)&&(u=0),(null===s||void 0===s)&&(s=r.duration),this.duration=s-u,this.length=Math.ceil(r.sampleRate*this.duration)+1,this.length>0){a&&a.length==this.length&&a.numberOfChannels==r.numberOfChannels&&a.sampleRate==r.sampleRate||(a=this.audioContext.createBuffer(r.numberOfChannels,this.length,r.sampleRate));for(var e=Math.floor(u*r.sampleRate),t=Math.ceil(s*r.sampleRate),n=0;n<r.numberOfChannels;n++){var o=new Float32Array(r.getChannelData(n));a.getChannelData(n).set(o.subarray(e,t))}}}else this.duration=0};var c=Object.prototype.toString.call(t),l=Object.prototype.toString.call(n),f=Object.prototype.toString.call(o),d=Object.prototype.toString.call(i);"[object String]"===c||"[object File]"===c?this.sourceURL=t:"[object AudioBuffer]"===c?this.buffer=t:console.warn("Incorrect Parameter Type. url can only be a String, File or an AudioBuffer"),"[object Number]"===l?this.startPoint=parseFloat(n):"[object Undefined]"!==l&&console.warn("Incorrect Parameter Type. startPoint should be a Number"),"[object Number]"===f?this.endPoint=parseFloat(o):"[object Undefined]"!==l&&console.warn("Incorrect Parameter Type. endPoint should be a Number"),"[object AudioBuffer]"!==d||this.buffer||(this.buffer=i)}return e}),define("core/SPAudioBufferSourceNode",["core/SPPlaybackRateParam","core/SPAudioBuffer","core/WebAudioDispatch"],function(e,t,n){function o(o){function i(e){for(var t=new Float32Array(e.length),n=o.createBuffer(1,e.length,44100),i=0;i<e.length;i++)t[i]=i;return n.getChannelData(0).set(t),n}function a(){c.connect(l),s.connect(f),l.connect(f),l.onaudioprocess=r}function r(e){var t=e.inputBuffer.getChannelData(0);d=t[t.length-1]||0}function u(e,t){return function(n){e.playbackState=e.FINISHED_STATE,"function"==typeof t&&t(n)}}var s=o.createBufferSource(),c=o.createBufferSource(),l=o.createScriptProcessor(256,1,1),f=o.createGain(),d=0;this.audioContext=o,this.channelCount=s.channelCount,this.channelCountMode=s.channelCountMode,this.channelInterpretation=s.channelInterpretation,this.numberOfInputs=s.numberOfInputs,this.numberOfOutputs=s.numberOfOutputs,this.playbackState=0,this.UNSCHEDULED_STATE=0,this.SCHEDULED_STATE=1,this.PLAYING_STATE=2,this.FINISHED_STATE=3,this.playbackRate=new e(this,s.playbackRate,c.playbackRate),Object.defineProperty(this,"loopEnd",{enumerable:!0,configurable:!1,set:function(e){s.loopEnd=e,c.loopEnd=e},get:function(){return s.loopEnd}}),Object.defineProperty(this,"loopStart",{enumerable:!0,configurable:!1,set:function(e){s.loopStart=e,c.loopStart=e},get:function(){return s.loopStart}}),Object.defineProperty(this,"onended",{enumerable:!0,configurable:!1,set:function(e){s.onended=u(this,e)},get:function(){return s.onended}}),Object.defineProperty(this,"loop",{enumerable:!0,configurable:!1,set:function(e){s.loop=e,c.loop=e},get:function(){return s.loop}}),Object.defineProperty(this,"playbackPosition",{enumerable:!0,configurable:!1,get:function(){return d}}),Object.defineProperty(this,"buffer",{enumerable:!0,configurable:!1,set:function(e){e instanceof t?(s.buffer=e.buffer,c.buffer=i(e.buffer)):e instanceof AudioBuffer&&(s.buffer=e,c.buffer=i(e))},get:function(){return s.buffer}}),Object.defineProperty(this,"gain",{enumerable:!0,configurable:!1,get:function(){return f.gain}}),this.connect=function(e,t,n){f.connect(e,t,n)},this.disconnect=function(e){f.disconnect(e)},this.start=function(e,t,o){"undefined"==typeof o&&(o=s.buffer.duration),"undefined"==typeof t&&(t=0),this.playbackState===this.UNSCHEDULED_STATE&&(s.start(e,t,o),c.start(e,t,o),this.playbackState=this.SCHEDULED_STATE);var i=this;n(function(){i.playbackState=i.PLAYING_STATE},e,this.audioContext)},this.stop=function(e){(this.playbackState===this.PLAYING_STATE||this.playbackState===this.SCHEDULED_STATE)&&(s.stop(e),c.stop(e))},this.resetBufferSource=function(t,i){var a=this;n(function(){l.disconnect();var t=a.audioContext.createGain();t.gain.value=f.gain.value,f=t;var n=a.audioContext.createBufferSource();n.buffer=s.buffer,n.loopStart=s.loopStart,n.loopEnd=s.loopEnd,n.onended=u(a,s.onended),s.onended=null,c.disconnect();var r=o.createBufferSource();r.buffer=c.buffer,s=n,c=r;var d=a.playbackRate.value;a.playbackRate=new e(a,s.playbackRate,c.playbackRate),a.playbackRate.setValueAtTime(d,0),c.connect(l),s.connect(f),l.connect(f),a.connect(i),a.playbackState=a.UNSCHEDULED_STATE},t,this.audioContext)},a()}return o}),define("core/DetectLoopMarkers",[],function(){function e(e){var t=0,n=0,o=!0,i=5e3,a=44100,r=.5,u=2e4,s=.01,c=1024,l=16,f=[],d=0,h=function(e,t){for(var n=0,o=t+l;t+l+c>o;++o)n+=Math.abs(e[o]);return s>n/c},p=function(e){return function(t,n,o){var i;return i=o%2===0?n[e]>r:n[e]<-r,t&&i}},m=function(o){var r=null,s=null;t=0,n=d;for(var c=0;null===r&&d>c&&u>c;){if(o.reduce(p(c),!0)&&(1!==o.length||h(o[0],c))){r=c;break}c++}for(c=d;null===s&&c>0&&u>d-c;){if(o.reduce(p(c),!0)){s=c;break}c--}var l=Math.round(i/2*e.sampleRate/a);return null!==r&&null!==s&&s>r+l?(t=r+l,n=s-l,!0):!1},y=function(e){return function(t,n){return t&&Math.abs(n[e])<s}},g=function(e){var o=!0;for(t=0;u>t&&d>t&&(o=e.reduce(y(t),!0));)t++;for(n=d;u>d-n&&n>0&&(o=e.reduce(y(n),!0));)n--;t>n&&(t=0)};d=e.length;for(var b=0;b<e.numberOfChannels;b++)f.push(new Float32Array(e.getChannelData(b)));return m(f)||(g(f),o=!1),{marked:o,start:t,end:n}}return e}),define("core/FileLoader",["core/DetectLoopMarkers"],function(e){function t(n,o,i,a){function r(){var e=Object.prototype.toString.call(n),t=/[^.]+$/.exec(n);if("[object String]"===e){var o=new XMLHttpRequest;o.open("GET",n,!0),o.responseType="arraybuffer",o.addEventListener("progress",a,!1),o.onload=function(){u(o.response,t)},o.send()}else if("[object File]"===e||"[object Blob]"===e){var i=new FileReader;i.addEventListener("progress",a,!1),i.onload=function(){u(i.result,t)},i.readAsArrayBuffer(n)}}function u(t,a){o.decodeAudioData(t,function(t){if(f=!0,s=t,c=0,l=s.length,"wav"!==a[0]){var n=e(s);n&&(c=n.start,l=n.end)}i&&"function"==typeof i&&i(!0)},function(){console.warn("Error Decoding "+n),i&&"function"==typeof i&&i(!1)})}if(!(this instanceof t))throw new TypeError("FileLoader constructor cannot be called as a function.");var s,c=0,l=0,f=!1,d=function(e){var t=/^[0-9]+$/;return t.test(e)?!0:!1},h=function(e,t){"undefined"==typeof t&&(t=s.length),d(e)?d(t)||(console.warn("Incorrect parameter Type - FileLoader getBuffer end parameter is not an integer"),t=Number.isNan(t)?0:Math.round(Number(t))):(e=Number.isNan(e)?0:Math.round(Number(e)),console.warn("Incorrect parameter Type - FileLoader getBuffer start parameter is not an integer. Coercing it to an Integer - start")),e>t&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter "+e+" should be smaller than end parameter "+t+" . Setting them to the same value "+e),t=e),(e>l||c>e)&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-"+s.length+" . Setting start to "+c),e=c),(t>l||c>t)&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-"+s.length+" . Setting start to "+l),t=l);var n=t-e;if(!s)return console.error("No Buffer Found - Buffer loading has not completed or has failed."),null;for(var i=o.createBuffer(s.numberOfChannels,n,s.sampleRate),a=0;a<s.numberOfChannels;a++){var r=new Float32Array(s.getChannelData(a));i.getChannelData(a).set(r.subarray(e,t))}return i};this.getBuffer=function(e,t){return"undefined"==typeof e&&(e=0),"undefined"==typeof t&&(t=l-c),h(c+e,c+t)},this.getRawBuffer=function(){return f?s:(console.error("No Buffer Found - Buffer loading has not completed or has failed."),null)},this.isLoaded=function(){return f},r()}return t}),define("core/MultiFileLoader",["core/FileLoader","core/SPAudioBuffer"],function(e,t){function n(n,o,i,a){function r(){if(!n)return console.log("Setting empty source. No sound may be heard"),void a(!1,f);if(!(n instanceof Array)){var e=[];e.push(n),n=e}return n.length<c.minSources||n.length>c.maxSources?(console.error("Unsupported number of Sources. "+c.modelName+" only supports a minimum of "+c.minSources+" and a maximum of "+c.maxSources+" sources. Trying to load "+n.length+"."),void a(!1,f)):(l=n.length,f=new Array(l),void n.forEach(function(e,t){u(e,s(t))}))}function u(n,o){var a,r=Object.prototype.toString.call(n);if("[object AudioBuffer]"===r)a=new t(c.audioContext,n),o(!0,a);else if(n instanceof t&&n.buffer)o(!0,n);else if("[object String]"===r||"[object File]"===r||n instanceof t&&n.sourceURL){var u;n instanceof t&&n.sourceURL?(u=n.sourceURL,a=n):(u=n,a=new t(c.audioContext,u));var s=new e(u,c.audioContext,function(e){e?(a.buffer=s.getBuffer(),o(e,a)):o(e)},function(e){i&&"function"==typeof i&&i(e,a)})}else console.error("Incorrect Parameter Type - Source is not a URL, File or AudioBuffer or doesn't have sourceURL or buffer"),o(!1,{})}function s(e){return function(t,n){if(t&&(f[e]=n),l--,0===l){for(var o=!0,i=0;i<f.length;++i)if(!f[i]){o=!1;break}a(o,f)}}}var c=this;this.audioContext=o;var l=0,f=[];r()}return n}),define("models/Looper",["core/Config","core/BaseSound","core/SPAudioParam","core/SPAudioBufferSourceNode","core/MultiFileLoader","core/WebAudioDispatch"],function(e,t,n,o,i,a){function r(u,s,c,l,f,d,h){function p(e){b=[],y.forEach(function(e){e.disconnect()}),m.multiTrackGain.length=0,i.call(m,e,m.audioContext,m.onLoadProgress,A)}if(!(this instanceof r))throw new TypeError("Looper constructor cannot be called as a function.");t.call(this,u),this.maxSources=e.MAX_VOICES,this.minSources=1,this.modelName="Looper",this.onLoadProgress=c,this.onLoadComplete=l,this.onAudioStart=f,this.onAudioEnd=d;var m=this,y=[],g=[],b=[],A=function(e,t){m.multiTrackGain.length=t.length,t.forEach(function(e,n){g.push(0),T(e,n,t.length)}),b&&b.length>0&&m.registerParameter(new n(m,"playSpeed",0,10,1,b,null,C),!0),e&&(m.isInitialized=!0),"function"==typeof m.onLoadComplete&&m.onLoadComplete(e,t)},T=function(e,t,i){var a;if(a=y[t]instanceof o?y[t]:new o(m.audioContext),a.buffer=e,a.loopEnd=e.duration,a.onended=function(e){v(e,t,a)},i>1){var r=new n(m,"track-"+t+"-gain",0,1,1,a.gain,null,null);m.multiTrackGain.splice(t,1,r)}a.connect(m.releaseGainNode),y.splice(t,1,a),b.push(a.playbackRate)},v=function(e,t,o){var i=m.audioContext.currentTime;if(o.resetBufferSource(i,m.releaseGainNode),m.multiTrackGain.length>1){var a=new n(m,"track-"+t+"-gain"+t,0,1,1,o.gain,null,null);m.multiTrackGain.splice(t,1,a)}"function"==typeof m.onTrackEnd&&h(m,t);var r=y.reduce(function(e,t){return e&&(t.playbackState===t.FINISHED_STATE||t.playbackState===t.UNSCHEDULED_STATE)},!0);r&&m.isPlaying&&(m.isPlaying=!1,"function"==typeof m.onAudioEnd&&m.onAudioEnd())},C=function(e,t,n){if(m.isInitialized){var o=6.90776,i=y[0]?y[0].playbackRate.value:1;m.isPlaying?t>i?y.forEach(function(e){e.playbackRate.cancelScheduledValues(n.currentTime),e.playbackRate.setTargetAtTime(t,n.currentTime,m.easeIn.value/o)}):i>t&&y.forEach(function(e){e.playbackRate.cancelScheduledValues(n.currentTime),e.playbackRate.setTargetAtTime(t,n.currentTime,m.easeOut.value/o)}):y.forEach(function(e){e.playbackRate.cancelScheduledValues(n.currentTime),e.playbackRate.setValueAtTime(t,n.currentTime)})}};this.onTrackEnd=h,this.registerParameter(new n(this,"playSpeed",0,10,1.005,null,null,C),!0),this.registerParameter(n.createPsuedoParam(this,"easeIn",.05,10,.05)),this.registerParameter(n.createPsuedoParam(this,"easeOut",.05,10,.05));var S=[];S.name="multiTrackGain",this.registerParameter(S,!1),this.registerParameter(n.createPsuedoParam(this,"maxLoops",-1,1,-1)),this.setSources=function(e,n,o){t.prototype.setSources.call(this,e,n,o),p(e)},this.play=function(){if(!this.isInitialized)throw new Error(this.modelName,"hasn't finished Initializing yet. Please wait before calling start/play");var e=this.audioContext.currentTime;this.isPlaying||(y.forEach(function(t,n){var o=g&&g[n]?g[n]:t.loopStart;t.loop=1!==m.maxLoops.value,t.start(e,o)}),t.prototype.start.call(this,e),a(function(){"function"==typeof m.onAudioStart&&m.onAudioStart()},e,this.audioContext))},this.start=function(e,n,o,i){return this.isInitialized?void(this.isPlaying||(y.forEach(function(t){n=t.loopStart+parseFloat(n)||0,("undefined"==typeof o||null===o)&&(o=t.buffer.duration),t.loop=1!==m.maxLoops.value,t.start(e,n,o)}),t.prototype.start.call(this,e,n,o,i),a(function(){"function"==typeof m.onAudioStart&&m.onAudioStart()},e,this.audioContext))):void console.error(this.modelName," hasn't finished Initializing yet. Please wait before calling start/play")},this.stop=function(e){m.isPlaying&&(y.forEach(function(t,n){t.stop(e),g[n]=0}),t.prototype.stop.call(this,e),a(function(){"function"==typeof m.onAudioEnd&&m.isPlaying===!1&&m.onAudioEnd()},e,this.audioContext))},this.pause=function(){m.isPlaying&&(y.forEach(function(e,t){e.stop(0),g[t]=e.playbackPosition/e.buffer.sampleRate}),t.prototype.stop.call(this,0),a(function(){"function"==typeof m.onAudioEnd&&m.onAudioEnd()},0,this.audioContext))},this.release=function(e,o,i){("undefined"==typeof e||e<this.audioContext.currentTime)&&(e=this.audioContext.currentTime);var r=.5;o=o||r,t.prototype.release.call(this,e,o,i),i&&(this.releaseGainNode=this.audioContext.createGain(),this.destinations.forEach(function(e){m.releaseGainNode.connect(e.destination,e.output,e.input)}),y.forEach(function(t,i){t.stop(e+o),g[i]=0,t.resetBufferSource(e,m.releaseGainNode);var a=new n(m,"gain-"+i,0,1,1,t.gain,null,null);m.multiTrackGain.splice(i,1,a)}),this.isPlaying=!1,a(function(){"function"==typeof m.onAudioEnd&&m.isPlaying===!1&&m.onAudioEnd()},e+o,this.audioContext))},window.setTimeout(function(){p(s)},0)}return r.prototype=Object.create(t.prototype),r}),define("core/webAudioDispatch",[],function(){function e(e,t,n){if(!n)return void console.warn("No AudioContext provided");var o=n.currentTime;o>=t||.005>t-o?e():window.setTimeout(function(){e()},1e3*(t-o))}return e}),define("models/Activity",["core/Config","core/BaseSound","models/Looper","core/SPAudioParam","core/webAudioDispatch"],function(e,t,n,o,i){function a(r,u,s,c,l,f){function d(t,n){T.playSpeed.setValueAtTime(e.ZERO,A.audioContext.currentTime),t&&(A.isInitialized=!0),v=0,C=0,S=0,"function"==typeof A.onLoadComplete&&A.onLoadComplete(t,n)}function h(e){T=new n(A.audioContext,e,A.onLoadProgress,d,A.onAudioStart,A.onAudioEnd),T.easeIn.value=A.easeIn.value,T.easeOut.value=A.easeOut.value}function p(e,t,n){if(A.isInitialized){var o=t,i=n.currentTime,a=Math.abs(o-v),r=i-C;if(r>0){var u=Math.log(E),s=Math.log(O),c=Math.exp(u+A.sensitivity.value*(s-u));S=S>V?.5*S+.5*r:r;var l=A.maxSpeed.value,f=l*c*a/S;f=Math.min(Math.abs(f),N*l),T.playSpeed.value=f,f>0&&!w&&(w=!0,A.play()),P&&window.clearTimeout(P),P=window.setTimeout(function(){T.playSpeed.value=0},1e3*Math.min(10*r,L)),x&&window.clearTimeout(x),x=window.setTimeout(function(){w&&(w=!1,A.release())},1e3*T.easeOut.value)}v=o,C=i}}function m(e,t){A.isInitialized&&(T.easeIn.value=t)}function y(e,t){A.isInitialized&&(T.easeOut.value=t)}if(!(this instanceof a))throw new TypeError("Activity constructor cannot be called as a function.");t.call(this,r),this.maxSources=e.MAX_VOICES,this.minSources=1,this.modelName="Activity",this.onLoadProgress=s,this.onLoadComplete=c;var g=l,b=f;Object.defineProperty(this,"onAudioStart",{enumerable:!0,configurable:!1,set:function(e){T&&(g=e,T.onAudioStart=e)},get:function(){return g}}),Object.defineProperty(this,"onAudioEnd",{enumerable:!0,configurable:!1,set:function(e){b=e,T&&(T.onAudioEnd=e)},get:function(){return b}});var A=this,T=null,v=0,C=0,S=0,P=null,x=null,w=!1,E=.1,O=100,N=1.2,L=.1,V=.001;this.registerParameter(o.createPsuedoParam(this,"maxSpeed",.05,8,1)),this.registerParameter(new o(this,"action",0,1,0,null,null,p)),this.registerParameter(o.createPsuedoParam(this,"sensitivity",0,1,.5)),this.registerParameter(new o(this,"easeIn",.05,10,1,null,null,m)),this.registerParameter(new o(this,"easeOut",.05,10,1,null,null,y)),this.setSources=function(e,n,o){t.prototype.setSources.call(this,e,n,o),T.setSources(e,n,d)},this.play=function(e){return this.isInitialized?(T.play(e),void t.prototype.play.call(this,e)):void console.error(this.modelName," hasn't finished Initializing yet. Please wait before calling start/play")},this.start=function(e,n,o,i){return this.isInitialized?(T.start(e,n,o),void t.prototype.start.call(this,e,n,o,i)):void console.error(this.modelName," hasn't finished Initializing yet. Please wait before calling start/play")},this.stop=function(e){T.stop(e),t.prototype.stop.call(this,e)},this.pause=function(){T.pause(),t.prototype.pause.call(this)},this.release=function(e,t){T.release(e,t);var n=this;i(function(){n.isPlaying=!1},e+t,this.audioContext)},this.disconnect=function(e){T.disconnect(e)},this.connect=function(e,t,n){T.connect(e,t,n)},window.setTimeout(function(){h(u)},0)}return a.prototype=Object.create(t.prototype),a});
/**
 * @module Models
 *
 */
"use strict";

var Config = require( 'core/Config' );
var BaseSound = require( "core/BaseSound" );
var Looper = require( 'models/Looper' );
var SPAudioParam = require( "core/SPAudioParam" );
var webAudioDispatch = require( "core/webAudioDispatch" );

/**
 * A model plays back the source at various speeds based on the movement of the activity parameter.
 *
 *
 * @class Activity
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [source] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when the source has finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function Activity( context, source, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd ) {
    if ( !( this instanceof Activity ) ) {
        throw new TypeError( "Activity constructor cannot be called as a function." );
    }

    BaseSound.call( this, context );
    /*Support upto 8 seperate voices*/
    this.maxSources = Config.MAX_VOICES;
    this.minSources = 1;
    this.modelName = 'Activity';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;
    var onAudioStart_ = onAudioStart;
    var onAudioEnd_ = onAudioEnd;

    Object.defineProperty( this, 'onAudioStart', {
        enumerable: true,
        configurable: false,
        set: function ( startCallback ) {
            if ( internalLooper_ ) {
                onAudioStart_ = startCallback;
                internalLooper_.onAudioStart = startCallback;
            }
        },
        get: function () {
            return onAudioStart_;
        }
    } );

    Object.defineProperty( this, 'onAudioEnd', {
        enumerable: true,
        configurable: false,
        set: function ( endCallback ) {
            onAudioEnd_ = endCallback;
            if ( internalLooper_ ) {
                internalLooper_.onAudioEnd = endCallback;
            }
        },
        get: function () {
            return onAudioEnd_;
        }
    } );

    // Private vars
    var self = this;

    // Private Variables
    var internalLooper_ = null;
    var lastPosition_ = 0;
    var lastUpdateTime_ = 0;
    var smoothDeltaTime_ = 0;
    var timeoutID = null;
    var endEventTimeout = null;
    var audioPlaying = false;

    // Constants

    var MIN_SENSITIVITY = 0.1;
    var MAX_SENSITIVITY = 100.0;
    var MAX_OVERSHOOT = 1.2;
    var MAX_TIME_OUT = 0.1;
    var MIN_DIFF = 0.001;

    // Private Functions

    function onLoadAll( status, audioBufferArray ) {
        internalLooper_.playSpeed.setValueAtTime( Config.ZERO, self.audioContext.currentTime );
        if ( status ) {
            self.isInitialized = true;
        }
        lastPosition_ = 0;
        lastUpdateTime_ = 0;
        smoothDeltaTime_ = 0;

        if ( typeof self.onLoadComplete === 'function' ) {
            self.onLoadComplete( status, audioBufferArray );
        }
    }

    function init( source ) {
        internalLooper_ = new Looper( self.audioContext, source, self.onLoadProgress, onLoadAll, self.onAudioStart, self.onAudioEnd );
        internalLooper_.easeIn.value = self.easeIn.value;
        internalLooper_.easeOut.value = self.easeOut.value;
    }

    function actionSetter_( aParam, value, audioContext ) {
        if ( self.isInitialized ) {

            var newPosition = value;
            var time = audioContext.currentTime;

            var deltaPos = Math.abs( newPosition - lastPosition_ );
            var deltaTime = ( time - lastUpdateTime_ );

            //console.log( deltaTime );

            if ( deltaTime > 0 ) {

                // The target level is dependent on the rate of motion and the sensitivity.

                // The sensitivity slider is mapped logarithmically to a very wide range of sensitivities [0.1 100.0].
                var logMinSens = Math.log( MIN_SENSITIVITY );
                var logMaxSens = Math.log( MAX_SENSITIVITY );
                var sensitivityLg = Math.exp( logMinSens + self.sensitivity.value * ( logMaxSens - logMinSens ) );

                // Sometimes updates to the position get "bunched up", resulting in misleadingly
                // small deltaTime values. This bit of code applies a low-pass filter to delta time.
                // The general idea is that if you move the mouse at constant speed, the position update
                // should come in at regular time *and* position intervals, and deltaPos/deltaTime should be
                // fairly stable. In reality, however, deltaPos is pretty stable, but deltaTime is highly
                // irregular. Applying a low-pass filter to to the time intervals fixes things.
                if ( smoothDeltaTime_ > MIN_DIFF ) {
                    smoothDeltaTime_ = ( 0.5 * smoothDeltaTime_ + 0.5 * deltaTime );
                } else {
                    smoothDeltaTime_ = deltaTime;
                }

                var maxRate = self.maxSpeed.value;

                //var sensivityScaling:Number = Math.pow( 10, getParamVal(SENSITIVITY) );
                var targetPlaySpeed_ = maxRate * sensitivityLg * deltaPos / smoothDeltaTime_;

                // Target level is always positive (hence abs).  We clamp it at some maximum to avoid generating ridiculously large levels when deltaTime is small (which happens if the mouse events get delayed and clumped up).
                // The maximum is slightly *higher* than the max rate, i.e. we allow some overshoot in the target value.
                //This is so that if you're shaking the "Action" slider vigorously, the rate will get pinned at the maximum, and not momentarily drop below the maximum during those very brief instants when the target rate drops well below the max.

                targetPlaySpeed_ = Math.min( Math.abs( targetPlaySpeed_ ), MAX_OVERSHOOT * maxRate );

                internalLooper_.playSpeed.value = targetPlaySpeed_;

                if ( targetPlaySpeed_ > 0 && !audioPlaying ) {
                    audioPlaying = true;
                    self.play();
                }

                // We use a timeout to prevent the target level from staying at a non-zero value
                // forever when motion stops.  For best response, we adapt the timeout based on
                // how frequently we've been getting position updates.
                if ( timeoutID ) {
                    window.clearTimeout( timeoutID );
                }
                timeoutID = window.setTimeout( function () {
                    internalLooper_.playSpeed.value = 0;
                }, 1000 * Math.min( 10 * deltaTime, MAX_TIME_OUT ) );

                if ( endEventTimeout ) {
                    window.clearTimeout( endEventTimeout );
                }
                endEventTimeout = window.setTimeout( function () {
                    if ( audioPlaying ) {
                        audioPlaying = false;
                        self.release();
                    }
                }, 1000 * internalLooper_.easeOut.value );
            }

            lastPosition_ = newPosition;
            lastUpdateTime_ = time;
        }
    }

    function easeInSetter_( aParam, value ) {
        if ( self.isInitialized ) {
            internalLooper_.easeIn.value = value;
        }
    }

    function easeOutSetter_( aParam, value ) {
        if ( self.isInitialized ) {
            internalLooper_.easeOut.value = value;
        }
    }

    // Public Properties

    /**
     *  Maximum value at which the playback speed of the source will be capped to.
     *
     * @property maxSpeed
     * @type SPAudioParam
     * @default 1
     * @minvalue 0.05
     * @maxvalue 8.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'maxSpeed', 0.05, 8.0, 1 ) );

    /**
     * Controls the playback of the source. The more this parameter is moved, the higher the speed of playback.
     *
     * @property action
     * @type SPAudioParam
     * @default 0
     * @minvalue 0.0
     * @maxvalue 1.0
     */
    this.registerParameter( new SPAudioParam( this, 'action', 0, 1.0, 0.0, null, null, actionSetter_ ) );

    /**
     * Maximum value for random pitch shift of the triggered voices in semitones.
     *
     * @property sensitivity
     * @type SPAudioParam
     * @default 0.5
     * @minvalue 0.0
     * @maxvalue 1.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'sensitivity', 0.0, 1.0, 0.5 ) );

    /**
     * Rate of increase of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
     *
     * @property easeIn
     * @type SPAudioParam
     * @default 1
     * @minvalue 0.05
     * @maxvalue 10.0
     */
    this.registerParameter( new SPAudioParam( this, 'easeIn', 0.05, 10.0, 1, null, null, easeInSetter_ ) );

    /**
     *  Rate of decrease of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
     *
     * @property easeOut
     * @type SPAudioParam
     * @default 1
     * @minvalue 0.05
     * @maxvalue 10.0
     */
    this.registerParameter( new SPAudioParam( this, 'easeOut', 0.05, 10.0, 1, null, null, easeOutSetter_ ) );

    // Public Functions

    /**
     * Reinitializes a Activity and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} source Single or Array of either URLs or AudioBuffers of audio sources.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( source, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, source, onLoadProgress, onLoadComplete );
        internalLooper_.setSources( source, onLoadProgress, onLoadAll );
    };

    /**
     * Enable playback.
     *
     * @method play
     * @param {Number} [when] At what time (in seconds) the source be triggered
     *
     */
    this.play = function ( when ) {
        if ( !this.isInitialized ) {
            console.error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }
        internalLooper_.play( when );
        BaseSound.prototype.play.call( this, when );
    };

    /**
     * Start playing after specific time and from a specific offset.
     *
     * @method start
     * @param {Number} when The delay in seconds before playing the model
     * @param {Number} [offset] The starting position of the playhead
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     */
    this.start = function ( when, offset, duration, attackDuration ) {
        if ( !this.isInitialized ) {
            console.error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }
        internalLooper_.start( when, offset, duration );
        BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
    };

    /**
     * Stops the source and resets play head to 0.
     * @method stop
     * @param {Number} when Time offset to stop
     */
    this.stop = function ( when ) {
        internalLooper_.stop( when );
        BaseSound.prototype.stop.call( this, when );
    };

    /**
     * Pause the currently playing source at the current position.
     *
     * @method pause
     */
    this.pause = function () {
        internalLooper_.pause();
        BaseSound.prototype.pause.call( this );
    };

    /**
     * Linearly ramp down the gain of the audio in time (seconds) to 0.
     *
     * @method release
     * @param {Number} [when] Time (in seconds) at which the Envelope will release.
     * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
     */
    this.release = function ( when, fadeTime ) {
        internalLooper_.release( when, fadeTime );
        var self = this;
        webAudioDispatch( function () {
            self.isPlaying = false;
        }, when + fadeTime, this.audioContext );
        //BaseSound.prototype.release.call( this, when, fadeTime );
    };

    /**
     * Disconnects the Sound from the AudioNode Chain.
     *
     * @method disconnect
     * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
     **/
    this.disconnect = function ( outputIndex ) {
        internalLooper_.disconnect( outputIndex );
    };

    /**
     * If the parameter `output` is an AudioNode, it connects to the releaseGainNode.
     * If the output is a BaseSound, it will connect BaseSound's releaseGainNode to the output's inputNode.
     *
     * @method connect
     * @param {AudioNode} destination AudioNode to connect to.
     * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
     * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
     */
    this.connect = function ( destination, output, input ) {
        internalLooper_.connect( destination, output, input );
    };

    // Initialize the sources.
    window.setTimeout( function () {
        init( source );
    }, 0 );

}

Activity.prototype = Object.create( BaseSound.prototype );

module.exports = Activity;

},{"core/BaseSound":3,"core/Config":4,"core/SPAudioParam":9,"core/webAudioDispatch":13,"models/Looper":14}],2:[function(require,module,exports){
/**
 *
 *
 * @module Core
 *
 */
"use strict";

/*
 *  MonkeyPatch for AudioContext. Normalizes AudioContext across browsers and implementations.
 *
 * @class AudioContextMonkeyPatch
 */
function AudioContextMonkeyPatch() {

    function fixSetTarget( param ) {
        if ( !param ) { // if NYI, just return
            return;
        }
        if ( !param.setTargetAtTime ) {
            param.setTargetAtTime = param.setTargetValueAtTime;
        }
    }
    if ( window.hasOwnProperty( 'webkitAudioContext' ) && !window.hasOwnProperty( 'AudioContext' ) ) {
        window.AudioContext = webkitAudioContext;
        if ( !AudioContext.prototype.hasOwnProperty( 'createGain' ) ) {
            AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
        }
        if ( !AudioContext.prototype.hasOwnProperty( 'createDelay' ) ) {
            AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
        }
        if ( !AudioContext.prototype.hasOwnProperty( 'createScriptProcessor' ) ) {
            AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
        }
        AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
        AudioContext.prototype.createGain = function () {
            var node = this.internal_createGain();
            fixSetTarget( node.gain );
            return node;
        };
        AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
        AudioContext.prototype.createDelay = function ( maxDelayTime ) {
            var node = maxDelayTime ? this.internal_createDelay( maxDelayTime ) : this.internal_createDelay();
            fixSetTarget( node.delayTime );
            return node;
        };
        AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
        AudioContext.prototype.createBufferSource = function () {
            var node = this.internal_createBufferSource();
            if ( !node.start ) {
                node.start = function ( when, offset, duration ) {
                    if ( offset || duration ) {
                        this.noteGrainOn( when, offset, duration );
                    } else {
                        this.noteOn( when );
                    }
                };
            }
            if ( !node.stop ) {
                node.stop = node.noteOff;
            }
            fixSetTarget( node.playbackRate );
            return node;
        };
        AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
        AudioContext.prototype.createDynamicsCompressor = function () {
            var node = this.internal_createDynamicsCompressor();
            fixSetTarget( node.threshold );
            fixSetTarget( node.knee );
            fixSetTarget( node.ratio );
            fixSetTarget( node.reduction );
            fixSetTarget( node.attack );
            fixSetTarget( node.release );
            return node;
        };
        AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
        AudioContext.prototype.createBiquadFilter = function () {
            var node = this.internal_createBiquadFilter();
            fixSetTarget( node.frequency );
            fixSetTarget( node.detune );
            fixSetTarget( node.Q );
            fixSetTarget( node.gain );
            return node;
        };
        if ( AudioContext.prototype.hasOwnProperty( 'createOscillator' ) ) {
            AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
            AudioContext.prototype.createOscillator = function () {
                var node = this.internal_createOscillator();
                if ( !node.start ) {
                    node.start = node.noteOn;
                }
                if ( !node.stop ) {
                    node.stop = node.noteOff;
                }
                fixSetTarget( node.frequency );
                fixSetTarget( node.detune );
                return node;
            };
        }
    }
}

module.exports = AudioContextMonkeyPatch;

},{}],3:[function(require,module,exports){
/**
 * @module Core
 */

'use strict';
require( 'core/AudioContextMonkeyPatch' );
var webAudioDispatch = require( 'core/WebAudioDispatch' );

/**
 * Pseudo AudioNode class the encapsulates basic functionality of an Audio Node. To be extended by all other Sound Models
 *
 * @class BaseSound
 * @constructor
 * @requires AudioContextMonkeyPatch
 * @param {AudioContext} [context] AudioContext in which this Sound is defined.
 */
function BaseSound( context ) {
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
     * Release Gain Node
     *
     * @property releaseGainNode
     * @type GainNode
     * @default Internal GainNode
     * @final
     */
    this.releaseGainNode = this.audioContext.createGain();

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
     * Set of nodes the output of this sound is currently connected to.
     *
     * @property destinations
     * @type Array
     * @default
     **/
    this.destinations = [];

    /**
     * String name of the model.
     *
     * @property modelName
     * @type String
     * @default "Model"
     **/
    this.modelName = 'Model';

    /**
     * Callback for handling progress events thrown during loading of audio files.
     *
     * @property onLoadProgress
     * @type Function
     * @default null
     */
    this.onLoadProgress = null;

    /**
     * Callback for when loading of audio files is done and the the model is initalized.
     *
     * @property onLoadComplete
     * @type Function
     * @default null
     */
    this.onLoadComplete = null;

    /**
     * Callback for when the audio is about to start playing.
     *
     * @property onAudioStart
     * @type Function
     * @default null
     */
    this.onAudioStart = null;

    /**
     * Callback for the audio is about to stop playing.
     *
     * @property onAudioEnd
     * @type Function
     * @default null
     */
    this.onAudioEnd = null;

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
 * If the output is a BaseSound, it will connect BaseSound's releaseGainNode to the output's inputNode.
 *
 * @method connect
 * @param {AudioNode} destination AudioNode to connect to.
 * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
 * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
 */
BaseSound.prototype.connect = function ( destination, output, input ) {
    if ( destination instanceof AudioNode ) {
        this.releaseGainNode.connect( destination, output, input );
        this.destinations.push( {
            'destination': destination,
            'output': output,
            'input': input
        } );
    } else if ( destination.inputNode instanceof AudioNode ) {
        this.releaseGainNode.connect( destination.inputNode, output, input );
        this.destinations.push( {
            'destination': destination.inputNode,
            'output': output,
            'input': input
        } );
    } else {
        console.error( "No Input Connection - Attempts to connect " + ( typeof destination ) + " to " + ( typeof this ) );
    }
};

/**
 * Disconnects the Sound from the AudioNode Chain.
 *
 * @method disconnect
 * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
 **/
BaseSound.prototype.disconnect = function ( outputIndex ) {
    this.releaseGainNode.disconnect( outputIndex );
    this.destinations = [];
};

/**
 * Start the AudioNode. Abstract method. Override this method when a Node is defined.
 *
 * @method start
 * @param {Number} when Time (in seconds) when the sound should start playing.
 * @param {Number} [offset] The starting position of the playhead
 * @param {Number} [duration] Duration of the portion (in seconds) to be played
 * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
 */
BaseSound.prototype.start = function ( when, offset, duration, attackDuration ) {
    if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
        when = this.audioContext.currentTime;
    }

    this.releaseGainNode.gain.cancelScheduledValues( when );
    if ( typeof attackDuration !== 'undefined' ) {
        //console.log( "Ramping from " + offset + "  in " + attackDuration );
        this.releaseGainNode.gain.setValueAtTime( 0, when );
        this.releaseGainNode.gain.linearRampToValueAtTime( 1, when + attackDuration );
    } else {
        this.releaseGainNode.gain.setValueAtTime( 1, when );
    }

    var self = this;
    webAudioDispatch( function () {
        self.isPlaying = true;
    }, when, this.audioContext );
};

/**
 * Stop the AudioNode. Abstract method. Override this method when a Node is defined.
 *
 * @method stop
 * @param {Number} [when] Time (in seconds) the sound should stop playing
 */
BaseSound.prototype.stop = function ( when ) {
    if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
        when = this.audioContext.currentTime;
    }

    var self = this;
    webAudioDispatch( function () {
        self.isPlaying = false;
    }, when, this.audioContext );

    // cancel all scheduled ramps on this releaseGainNode
    this.releaseGainNode.gain.cancelScheduledValues( when );
};

/**
 * Linearly ramp down the gain of the audio in time (seconds) to 0.
 *
 * @method release
 * @param {Number} [when] Time (in seconds) at which the Envelope will release.
 * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
 * @param {Boolean} [resetOnRelease] Boolean to define if release stops (resets) the playback or just pauses it.
 */
BaseSound.prototype.release = function ( when, fadeTime, resetOnRelease ) {

    if ( this.isPlaying ) {
        var FADE_TIME = 0.5;
        //var FADE_TIME_PAD = 1 / this.audioContext.sampleRate;

        if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        fadeTime = fadeTime || FADE_TIME;
        // Clamp the current gain value at this point of time to prevent sudden jumps.
        this.releaseGainNode.gain.setValueAtTime( this.releaseGainNode.gain.value, when );

        // Now there won't be any glitch and there is a smooth ramp down.
        this.releaseGainNode.gain.linearRampToValueAtTime( 0, when + fadeTime );

        // Pause the sound after currentTime + fadeTime + FADE_TIME_PAD
        if ( !resetOnRelease ) {
            var self = this;
            webAudioDispatch( function () {
                self.pause();
            }, when + fadeTime, this.audioContext );
        }
    }
};

/**
 * Reinitializes the model and sets it's sources.
 *
 * @method setSources
 * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers or File Objects of the audio sources.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
 */
BaseSound.prototype.setSources = function ( sources, onLoadProgress, onLoadComplete ) {
    this.isInitialized = false;

    if ( typeof onLoadProgress === 'function' ) {
        this.onLoadProgress = onLoadProgress;
    }

    if ( typeof onLoadComplete === 'function' ) {
        this.onLoadComplete = onLoadComplete;
    }
};

/**
 * Play sound. Abstract method. Override this method when a Node is defined.
 *
 * @method play
 */
BaseSound.prototype.play = function () {
    this.start( 0 );
};

/**
 * Pause sound. Abstract method. Override this method when a Node is defined.
 *
 * @method pause
 */
BaseSound.prototype.pause = function () {
    this.isPlaying = false;
};

/**
 * Registers a Parameter to the model. This ensures that the Parameter is unwritable and allows
 * to lock in the configurability of the object.
 *
 * @param  {SPAudioParam} audioParam
 */
BaseSound.prototype.registerParameter = function ( audioParam, configurable ) {

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
BaseSound.prototype.listParams = function () {
    return this.parameterList_;
};

// Return constructor function
module.exports = BaseSound;

},{"core/AudioContextMonkeyPatch":2,"core/WebAudioDispatch":11}],4:[function(require,module,exports){
/**
 * A structure for static configuration options.
 *
 * @module Core
 * @class Config
 */
"use strict";

function Config() {}

/**
 * Define if Errors are logged using errorception.
 *
 * @final
 * @static
 * @property LOG_ERRORS
 * @default true
 *
 */
Config.LOG_ERRORS = true;

/**
 * Very small number considered non-zero by WebAudio.
 *
 * @final
 * @static
 * @property ZERO
 * @default 1e-37
 *
 */
Config.ZERO = parseFloat( '1e-37' );

/**
 * Maximum number of voices supported
 *
 * @final
 * @static
 * @property MAX_VOICES
 * @default 8
 *
 */
Config.MAX_VOICES = 8;

/**
 * Default nominal refresh rate (Hz) for SoundQueue.
 *
 * @final
 * @static
 * @property NOMINAL_REFRESH_RATE
 * @default 60
 *
 */
Config.NOMINAL_REFRESH_RATE = 60;

/**
 * Default window length for window and add functionality
 *
 * @final
 * @static
 * @property NOMINAL_REFRESH_RATE
 * @default 512
 *
 */
Config.WINDOW_LENGTH = 512;

/**
 * Default Chunk Length for ScriptNodes.
 *
 * @final
 * @static
 * @property CHUNK_LENGTH
 * @default 256
 *
 */
Config.CHUNK_LENGTH = 256;

/**
 * Default smoothing constant.
 *
 * @final
 * @static
 * @property CHUNK_LENGTH
 * @default 0.05
 *
 */
Config.DEFAULT_SMOOTHING_CONSTANT = 0.05;

module.exports = Config;

},{}],5:[function(require,module,exports){
/**
 * @module Core
 */
"use strict";

/**
 * @class DetectLoopMarkers
 * @static
 */

/**
/**
 *Detector for Loop Marker or Silence. This method helps to detect and trim given AudioBuffer based on Sonoport Loop Markers or based on silence detection.
 *
 *
 * @class DetectLoopMarkers
 * @param {AudioBuffer} buffer A buffer to be trimmed to Loop Markers or Silence.
 * @return {Object} An object with `start` and `end` properties containing the index of the detected start and end points.
 */
function DetectLoopMarkers( buffer ) {

    var nLoopStart_ = 0;
    var nLoopEnd_ = 0;
    var nMarked_ = true;

    /*
     * Length of PRE and POSTFIX Silence used in Loop Marking
     */
    var PREPOSTFIX_LEN = 5000;

    /*
     * Length of PRE and POSTFIX Silence used in Loop Marking
     */
    var DEFAULT_SAMPLING_RATE = 44100;

    /*
     * Threshold for Spike Detection in Loop Marking
     */
    var SPIKE_THRESH = 0.5;

    /*
     * Index bounds for searching for Loop Markers and Silence.
     */
    var MAX_MP3_SILENCE = 20000;

    /*
     * Threshold for Silence Detection
     */
    var SILENCE_THRESH = 0.01;

    /*
     * Length for which the channel has to be empty
     */
    var EMPTY_CHECK_LENGTH = 1024;

    /*
     * Length samples to ignore after the spike
     */
    var IGNORE_LENGTH = 16;

    /*
     * Array of all Channel Data
     */
    var channels_ = [];

    /*
     * Number of samples in the buffer
     */
    var numSamples_ = 0;

    /**
     * A helper method to help find the silence in across multiple channels
     *
     * @private
     * @method silenceCheckGenerator_
     * @param {Number} testIndex The index of the sample which is being checked.
     * @return {Function} A function which can check if the specific sample is beyond the silence threshold
     */
    var isChannelEmptyAfter = function ( channel, position ) {
        //console.log( "checking at " + position );
        var sum = 0;
        for ( var sIndex = position + IGNORE_LENGTH; sIndex < position + IGNORE_LENGTH + EMPTY_CHECK_LENGTH; ++sIndex ) {
            sum += Math.abs( channel[ sIndex ] );
        }

        return ( sum / EMPTY_CHECK_LENGTH ) < SILENCE_THRESH;
    };

    /**
     * A helper method to help find the spikes in across multiple channels
     *
     * @private
     * @method silenceCheckGenerator_
     * @param {Number} testIndex The index of the sample which is being checked.
     * @return {Function} A function which can check if the specific sample is beyond the spike threshold
     */
    var thresholdCheckGenerator_ = function ( testIndex ) {
        return function ( prev, thisChannel, index ) {
            var isSpike;
            if ( index % 2 === 0 ) {
                isSpike = thisChannel[ testIndex ] > SPIKE_THRESH;
            } else {
                isSpike = thisChannel[ testIndex ] < -SPIKE_THRESH;
            }
            return prev && isSpike;
        };
    };

    /**
     * A helper method to help find the markers in an Array of Float32Arrays made from an AudioBuffer.
     *
     * @private
     * @method findSilence_
     * @param {Array} channels An array of buffer data in Float32Arrays within which markers needs to be detected.
     * @return {Boolean} If Loop Markers were found.
     */
    var findMarkers_ = function ( channels ) {
        var startSpikePos = null;
        var endSpikePos = null;

        nLoopStart_ = 0;
        nLoopEnd_ = numSamples_;

        // Find marker near start of file
        var pos = 0;

        while ( startSpikePos === null && pos < numSamples_ && pos < MAX_MP3_SILENCE ) {
            if ( channels.reduce( thresholdCheckGenerator_( pos ), true ) &&
                ( channels.length !== 1 || isChannelEmptyAfter( channels[ 0 ], pos ) ) ) {
                // Only check for emptiness at the start to ensure that it's indeed marked
                startSpikePos = pos;
                break;
            } else {
                pos++;
            }
        }

        // Find marker near end of file
        pos = numSamples_;

        while ( endSpikePos === null && pos > 0 && numSamples_ - pos < MAX_MP3_SILENCE ) {
            if ( channels.reduce( thresholdCheckGenerator_( pos ), true ) ) {
                endSpikePos = pos;
                break;
            } else {
                pos--;
            }
        }
        // If both markers found
        var correctedPostfixLen = Math.round( ( PREPOSTFIX_LEN / 2 ) * buffer.sampleRate / DEFAULT_SAMPLING_RATE );
        if ( startSpikePos !== null && endSpikePos !== null && endSpikePos > startSpikePos + correctedPostfixLen ) {
            // Compute loop start and length
            nLoopStart_ = startSpikePos + correctedPostfixLen;
            nLoopEnd_ = endSpikePos - correctedPostfixLen;
            //console.log( "Found loop between " + nLoopStart_ + " - " + nLoopEnd_ );
            //console.log( "Spikes at  " + startSpikePos + " - " + endSpikePos );
            return true;
        } else {
            // Spikes not found!
            //console.log( "No loop found" );
            return false;
        }
    };

    /**
     * A helper method to help find the silence in across multiple channels
     *
     * @private
     * @method silenceCheckGenerator_
     * @param {Number} testIndex The index of the sample which is being checked.
     * @return {Function} A function which can check if the specific sample is beyond the silence threshold
     */
    var silenceCheckGenerator_ = function ( testIndex ) {
        return function ( prev, thisChannel ) {
            return prev && ( Math.abs( thisChannel[ testIndex ] ) < SILENCE_THRESH );
        };
    };

    /**
     * A helper method to help find the silence in an AudioBuffer. Used of Loop Markers are not
     * found in the AudioBuffer. Updates nLoopStart_ and nLoopEnd_ directly.
     *
     * @private
     * @method findSilence_
     * @param {Array} channels channel An array of buffer data in Float32Arrays within which silence needs to be detected.
     */
    var findSilence_ = function ( channels ) {

        var allChannelsSilent = true;

        nLoopStart_ = 0;
        while ( nLoopStart_ < MAX_MP3_SILENCE && nLoopStart_ < numSamples_ ) {

            allChannelsSilent = channels.reduce( silenceCheckGenerator_( nLoopStart_ ), true );

            if ( allChannelsSilent ) {
                nLoopStart_++;
            } else {
                break;
            }
        }

        nLoopEnd_ = numSamples_;
        while ( numSamples_ - nLoopEnd_ < MAX_MP3_SILENCE &&
            nLoopEnd_ > 0 ) {

            allChannelsSilent = channels.reduce( silenceCheckGenerator_( nLoopEnd_ ), true );

            if ( allChannelsSilent ) {
                nLoopEnd_--;
            } else {
                break;
            }
        }

        if ( nLoopEnd_ < nLoopStart_ ) {
            nLoopStart_ = 0;
        }
    };

    numSamples_ = buffer.length;
    for ( var index = 0; index < buffer.numberOfChannels; index++ ) {
        channels_.push( new Float32Array( buffer.getChannelData( index ) ) );
    }

    if ( ( !findMarkers_( channels_ ) ) ) {
        findSilence_( channels_ );
        nMarked_ = false;
    }

    // return the markers which were found
    return {
        marked: nMarked_,
        start: nLoopStart_,
        end: nLoopEnd_
    };
}

module.exports = DetectLoopMarkers;

},{}],6:[function(require,module,exports){
/**
 * @module Core
 */
"use strict";
var detectLoopMarkers = require( 'core/DetectLoopMarkers' );

/**
 * Load a single file from a URL or a File object.
 *
 * @class FileLoader
 * @constructor
 * @param {String/File} URL URL of the file to be Loaded
 * @param {String} context AudioContext to be used in decoding the file
 * @param {Function} [onloadCallback] Callback function to be called when the file loading is
 * @param {Function} [onProgressCallback] Callback function to access the progress of the file loading.
 */
function FileLoader( URL, context, onloadCallback, onProgressCallback ) {
    if ( !( this instanceof FileLoader ) ) {
        throw new TypeError( "FileLoader constructor cannot be called as a function." );
    }
    var rawBuffer_;
    var loopStart_ = 0;
    var loopEnd_ = 0;

    var isSoundLoaded_ = false;

    // Private functions

    /**
     * Check if a value is an integer.
     * @method isInt_
     * @private
     * @param {Object} value
     * @return {Boolean} Result of test.
     */
    var isInt_ = function ( value ) {
        var er = /^[0-9]+$/;
        if ( er.test( value ) ) {
            return true;
        }
        return false;
    };

    /**
     * Get a buffer based on the start and end markers.
     * @private
     * @method sliceBuffer
     * @param {Number} start The start of the buffer to load.
     * @param {Number} end The end of the buffer to load.
     * @return {AudioBuffer} The requested sliced buffer.
     */
    var sliceBuffer_ = function ( start, end ) {

        // Set end if it is missing
        if ( typeof end == 'undefined' ) {
            end = rawBuffer_.length;
        }
        // Verify parameters
        if ( !isInt_( start ) ) {
            start = Number.isNan( start ) ? 0 : Math.round( Number( start ) );
            console.warn( "Incorrect parameter Type - FileLoader getBuffer start parameter is not an integer. Coercing it to an Integer - start" );
        } else if ( !isInt_( end ) ) {
            console.warn( "Incorrect parameter Type - FileLoader getBuffer end parameter is not an integer" );
            end = Number.isNan( end ) ? 0 : Math.round( Number( end ) );
        }
        // Check if start is smaller than end
        if ( start > end ) {
            console.error( "Incorrect parameter Type - FileLoader getBuffer start parameter " + start + " should be smaller than end parameter " + end + " . Setting them to the same value " + start );
            end = start;
        }
        // Check if start is within the buffer size
        if ( start > loopEnd_ || start < loopStart_ ) {
            console.error( "Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-" + rawBuffer_.length + " . Setting start to " + loopStart_ );
            start = loopStart_;
        }

        // Check if end is within the buffer size
        if ( end > loopEnd_ || end < loopStart_ ) {
            console.error( "Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-" + rawBuffer_.length + " . Setting start to " + loopEnd_ );
            end = loopEnd_;
        }

        var length = end - start;

        if ( !rawBuffer_ ) {
            console.error( "No Buffer Found - Buffer loading has not completed or has failed." );
            return null;
        }

        // Create the new buffer
        var newBuffer = context.createBuffer( rawBuffer_.numberOfChannels, length, rawBuffer_.sampleRate );

        // Start trimming
        for ( var i = 0; i < rawBuffer_.numberOfChannels; i++ ) {
            var aData = new Float32Array( rawBuffer_.getChannelData( i ) );
            newBuffer.getChannelData( i )
                .set( aData.subarray( start, end ) );
        }

        return newBuffer;
    };

    function init() {
        var parameterType = Object.prototype.toString.call( URL );
        var fileExtension = /[^.]+$/.exec( URL );
        if ( parameterType === '[object String]' ) {
            var request = new XMLHttpRequest();
            request.open( 'GET', URL, true );
            request.responseType = 'arraybuffer';
            request.addEventListener( 'progress', onProgressCallback, false );
            request.onload = function () {
                decodeAudio( request.response, fileExtension );
            };
            request.send();
        } else if ( parameterType === '[object File]' || parameterType === '[object Blob]' ) {
            var reader = new FileReader();
            reader.addEventListener( 'progress', onProgressCallback, false );
            reader.onload = function () {
                decodeAudio( reader.result, fileExtension );
            };
            reader.readAsArrayBuffer( URL );
        }

    }

    function decodeAudio( result, fileExt ) {
        context.decodeAudioData( result, function ( buffer ) {
            isSoundLoaded_ = true;
            rawBuffer_ = buffer;
            // Do trimming if it is not a wave file
            loopStart_ = 0;
            loopEnd_ = rawBuffer_.length;
            if ( fileExt[ 0 ] !== 'wav' ) {
                // Trim Buffer based on Markers
                var markers = detectLoopMarkers( rawBuffer_ );
                if ( markers ) {
                    loopStart_ = markers.start;
                    loopEnd_ = markers.end;
                }
            }
            if ( onloadCallback && typeof onloadCallback === 'function' ) {
                onloadCallback( true );
            }
        }, function () {
            console.warn( "Error Decoding " + URL );
            if ( onloadCallback && typeof onloadCallback === 'function' ) {
                onloadCallback( false );
            }
        } );
    }

    // Public functions
    /**
     * Get the current buffer.
     * @method getBuffer
     * @param {Number} start The start index
     * @param {Number} end The end index
     * @return {AudioBuffer} The AudioBuffer that was marked then trimmed if it is not a wav file.
     */
    this.getBuffer = function ( start, end ) {
        // Set start if it is missing
        if ( typeof start == 'undefined' ) {
            start = 0;
        }
        // Set end if it is missing
        if ( typeof end == 'undefined' ) {
            end = loopEnd_ - loopStart_;
        }

        return sliceBuffer_( loopStart_ + start, loopStart_ + end );
    };

    /**
     * Get the original buffer.
     * @method getRawBuffer
     * @return {AudioBuffer} The original AudioBuffer.
     */
    this.getRawBuffer = function () {
        if ( !isSoundLoaded_ ) {
            console.error( "No Buffer Found - Buffer loading has not completed or has failed." );
            return null;
        }
        return rawBuffer_;
    };

    /**
     * Check if sound is already loaded.
     * @method isLoaded
     * @return {Boolean} True if file is loaded. Flase if file is not yeat loaded.
     */
    this.isLoaded = function () {
        return isSoundLoaded_;
    };

    // Make a request
    init();
}

module.exports = FileLoader;

},{"core/DetectLoopMarkers":5}],7:[function(require,module,exports){
/**
 * @module Core
 */

"use strict";
/**
 * Wrapper around AudioBuffer to support audio source caching and allowing clipping of audiobuffers to various lengths.
 *
 * @class SPAudioBuffer
 * @constructor
 * @param {AudioContext} audioContext WebAudio Context.
 * @param {String/AudioBuffer/File} URL The source URL or File object or an AudioBuffer to encapsulate.
 * @param {Number} startPoint The startPoint of the AudioBuffer in seconds.
 * @param {Number} endPoint The endPoint of the AudioBuffer in seconds.
 * @param [AudioBuffer] audioBuffer An AudioBuffer object incase the URL has already been downloaded and decoded.
 */
function SPAudioBuffer( audioContext, URL, startPoint, endPoint, audioBuffer ) {

    // new SPAudioBuffer("http://example.com", 0.8,1.0)
    // new SPAudioBuffer("http://example.com", 0.8,1.0, [object AudioBuffer])
    // new SPAudioBuffer([object File], 0.8,1.0)
    // new SPAudioBuffer([object AudioBuffer], 0.8,1.0)

    if ( !( audioContext instanceof AudioContext ) ) {
        console.error( 'First argument to SPAudioBuffer must be a valid AudioContext' );
        return;
    }

    // Private Variables
    var buffer_;
    var rawBuffer_;
    var startPoint_;
    var endPoint_;

    this.audioContext = audioContext;

    // Variables exposed by AudioBuffer

    this.duration = null;

    /**
     * The number of discrete audio channels.
     *
     * @property numberOfChannels
     * @type Number
     * @readOnly
     */
    Object.defineProperty( this, 'numberOfChannels', {
        get: function () {
            return this.buffer ? this.buffer.numberOfChannels : 0;
        }
    } );

    /**
     * The sample-rate for the PCM audio data in samples per second.
     *
     * @property sampleRate
     * @type Number
     * @readOnly
     */
    Object.defineProperty( this, 'sampleRate', {
        get: function () {
            return this.buffer ? this.buffer.sampleRate : 0;
        }
    } );

    /**
     * Returns the Float32Array representing the PCM audio data for the specific channel.
     *
     * @method getChannelData
     * @param {Number} channel This parameter is an index representing the particular channel to get data for. An index value of 0 represents the first channel.
     *
     */
    this.getChannelData = function ( channel ) {
        if ( !this.buffer ) {
            return null;
        } else {
            return this.buffer.getChannelData( channel );
        }
    };

    /*
     * For Duck-Type-Checking
     */
    this.isSPAudioBuffer = true;

    /**
     * The actual AudioBuffer that this SPAudioBuffer object is wrapping around. The getter of this property returns a clipped AudioBuffer based on the startPoint and endPoint properties.
     *
     * @property buffer
     * @type AudioBuffer
     * @default null
     */
    Object.defineProperty( this, 'buffer', {
        set: function ( buffer ) {

            if ( startPoint_ === null ) {
                this.startPoint = 0;
            } else if ( startPoint_ > buffer.length / buffer.sampleRate ) {
                console.error( "SPAudioBuffer : startPoint cannot be greater than buffer length" );
                return;
            }
            if ( endPoint_ === null ) {
                this.endPoint = this.rawBuffer_.length;
            } else if ( endPoint_ > buffer.length / buffer.sampleRate ) {
                console.error( "SPAudioBuffer : endPoint cannot be greater than buffer length" );
                return;
            }

            rawBuffer_ = buffer;
            this.updateBuffer();
        }.bind( this ),
        get: function () {
            return buffer_;
        }
    } );

    /**
     * URL or File object that is the source of the sound in the buffer. This property can be used for indexing and caching decoded sound buffers.
     *
     * @property sourceURL
     * @type String/File
     * @default null
     */
    this.sourceURL = null;

    /**
     * The starting point of the buffer in seconds. This, along with the {{#crossLink "SPAudioBuffer/endPoint:property"}}endPoint{{/crossLink}} property, decides which part of the original buffer is clipped and returned by the getter of the {{#crossLink "SPAudioBuffer/buffer:property"}}buffer{{/crossLink}} property.
     *
     * @property startPoint
     * @type Number
     * @default null
     * @minvalue 0
     */
    Object.defineProperty( this, 'startPoint', {
        set: function ( startPoint ) {
            if ( endPoint_ !== undefined && startPoint >= endPoint_ ) {
                console.error( "SPAudioBuffer : startPoint cannot be greater than endPoint" );
                return;
            }

            if ( rawBuffer_ && ( startPoint * rawBuffer_.sampleRate ) >= rawBuffer_.length ) {
                console.error( "SPAudioBuffer : startPoint cannot be greater than or equal to buffer length" );
                return;
            }

            startPoint_ = startPoint;
            this.updateBuffer();
        }.bind( this ),
        get: function () {
            return startPoint_;
        }
    } );

    /**
     * The ending point of the buffer in seconds. This, along with the {{#crossLink "SPAudioBuffer/startPoint:property"}}startPoint{{/crossLink}} property, decides which part of the original buffer is clipped and returned by the getter of the {{#crossLink "SPAudioBuffer/buffer:property"}}buffer{{/crossLink}} property.
     *
     * @property endPoint
     * @type Number
     * @default null
     * @minvalue 0
     */
    Object.defineProperty( this, 'endPoint', {
        set: function ( endPoint ) {
            if ( startPoint_ !== undefined && endPoint <= startPoint_ ) {
                console.error( "SPAudioBuffer : endPoint cannot be lesser than startPoint" );
                return;
            }

            if ( rawBuffer_ && ( endPoint * rawBuffer_.sampleRate ) >= rawBuffer_.length ) {
                console.error( "SPAudioBuffer : endPoint cannot be greater than buffer or equal to length" );
                return;
            }

            endPoint_ = endPoint;
            this.updateBuffer();
        }.bind( this ),
        get: function () {
            return endPoint_;
        }
    } );

    this.updateBuffer = function () {
        if ( !rawBuffer_ ) {
            this.duration = 0;
        } else {
            if ( startPoint_ === null || startPoint_ === undefined ) {
                startPoint_ = 0;
            }
            if ( endPoint_ === null || endPoint_ === undefined ) {
                endPoint_ = rawBuffer_.duration;
            }

            this.duration = endPoint_ - startPoint_;
            this.length = Math.ceil( rawBuffer_.sampleRate * this.duration ) + 1;

            if ( this.length > 0 ) {
                // Start trimming
                if ( !buffer_ ||
                    buffer_.length != this.length ||
                    buffer_.numberOfChannels != rawBuffer_.numberOfChannels ||
                    buffer_.sampleRate != rawBuffer_.sampleRate
                ) {
                    buffer_ = this.audioContext.createBuffer( rawBuffer_.numberOfChannels, this.length, rawBuffer_.sampleRate );
                }

                var startIndex = Math.floor( startPoint_ * rawBuffer_.sampleRate );
                var endIndex = Math.ceil( endPoint_ * rawBuffer_.sampleRate );

                for ( var i = 0; i < rawBuffer_.numberOfChannels; i++ ) {
                    var aData = new Float32Array( rawBuffer_.getChannelData( i ) );
                    buffer_.getChannelData( i )
                        .set( aData.subarray( startIndex, endIndex ) );
                }
            }
        }
    };

    var urlType = Object.prototype.toString.call( URL );
    var startPointType = Object.prototype.toString.call( startPoint );
    var endPointType = Object.prototype.toString.call( endPoint );
    var bufferType = Object.prototype.toString.call( audioBuffer );

    if ( urlType === "[object String]" || urlType === "[object File]" ) {
        this.sourceURL = URL;
    } else if ( urlType === "[object AudioBuffer]" ) {
        this.buffer = URL;
    } else {
        console.warn( "Incorrect Parameter Type. url can only be a String, File or an AudioBuffer" );
    }

    if ( startPointType === "[object Number]" ) {
        this.startPoint = parseFloat( startPoint );
    } else {
        if ( startPointType !== "[object Undefined]" ) {
            console.warn( "Incorrect Parameter Type. startPoint should be a Number" );
        }
    }

    if ( endPointType === "[object Number]" ) {
        this.endPoint = parseFloat( endPoint );
    } else {
        if ( startPointType !== "[object Undefined]" ) {
            console.warn( "Incorrect Parameter Type. endPoint should be a Number" );
        }
    }

    if ( bufferType === "[object AudioBuffer]" && !this.buffer ) {
        this.buffer = audioBuffer;
    }
}
module.exports = SPAudioBuffer;

},{}],8:[function(require,module,exports){
/**
 * @module Core
 */

"use strict";
var SPPlaybackRateParam = require( 'core/SPPlaybackRateParam' );
var webAudioDispatch = require( 'core/WebAudioDispatch' );

/**
 * A wrapper around the AudioBufferSourceNode to be able to track the current playPosition of a AudioBufferSourceNode.
 *
 * @class SPAudioBufferSourceNode
 * @constructor
 * @param {AudioContext} AudioContext to be used in timing the parameter automation events
 */
function SPAudioBufferSourceNode( audioContext ) {
    var bufferSourceNode_ = audioContext.createBufferSource();
    var counterNode_ = audioContext.createBufferSource();

    var scopeNode_ = audioContext.createScriptProcessor( 256, 1, 1 );
    var trackGainNode_ = audioContext.createGain();
    var lastPos = 0;

    this.audioContext = audioContext;
    this.channelCount = bufferSourceNode_.channelCount;
    this.channelCountMode = bufferSourceNode_.channelCountMode;
    this.channelInterpretation = bufferSourceNode_.channelInterpretation;
    this.numberOfInputs = bufferSourceNode_.numberOfInputs;
    this.numberOfOutputs = bufferSourceNode_.numberOfOutputs;
    this.playbackState = 0;

    /**
     * Playback States Constant.
     *
     * @property UNSCHEDULED_STATE
     * @type Number
     * @default "Model"
     **/
    this.UNSCHEDULED_STATE = 0;

    /**
     * Playback States Constant.
     *
     * @property SCHEDULED_STATE
     * @type Number
     * @default "1"
     **/
    this.SCHEDULED_STATE = 1;

    /**
     * Playback States Constant.
     *
     * @property PLAYING_STATE
     * @type Number
     * @default "2"
     **/
    this.PLAYING_STATE = 2;

    /**
     * Playback States Constant.
     *
     * @property FINISHED_STATE
     * @type Number
     * @default "3"
     **/
    this.FINISHED_STATE = 3;

    /**
     * The speed at which to render the audio stream. Its default value is 1. This parameter is a-rate.
     *
     * @property playbackRate
     * @type AudioParam
     * @default 1
     *
     */
    this.playbackRate = new SPPlaybackRateParam( this, bufferSourceNode_.playbackRate, counterNode_.playbackRate );

    /**
     * An optional value in seconds where looping should end if the loop attribute is true.
     *
     * @property loopEnd
     * @type Number
     * @default 0
     *
     */
    Object.defineProperty( this, 'loopEnd', {
        enumerable: true,
        configurable: false,
        set: function ( loopEnd ) {
            bufferSourceNode_.loopEnd = loopEnd;
            counterNode_.loopEnd = loopEnd;
        },
        get: function () {
            return bufferSourceNode_.loopEnd;
        }
    } );

    /**
     * An optional value in seconds where looping should begin if the loop attribute is true.
     *
     * @property loopStart
     * @type Number
     * @default 0
     *
     */
    Object.defineProperty( this, 'loopStart', {
        enumerable: true,
        configurable: false,
        set: function ( loopStart ) {
            bufferSourceNode_.loopStart = loopStart;
            counterNode_.loopStart = loopStart;
        },
        get: function () {
            return bufferSourceNode_.loopStart;
        }
    } );

    /**
     * A property used to set the EventHandler for the ended event that is dispatched to AudioBufferSourceNode node types
     *
     * @property onended
     * @type Function
     * @default null
     *
     */
    Object.defineProperty( this, 'onended', {
        enumerable: true,
        configurable: false,
        set: function ( onended ) {
            bufferSourceNode_.onended = wrapAroundOnEnded( this, onended );
        },
        get: function () {
            return bufferSourceNode_.onended;
        }
    } );

    /**
     * Indicates if the audio data should play in a loop.
     *
     * @property loop
     * @type Boolean
     * @default false
     *
     */
    Object.defineProperty( this, 'loop', {
        enumerable: true,
        configurable: false,
        set: function ( loop ) {
            bufferSourceNode_.loop = loop;
            counterNode_.loop = loop;
        },
        get: function () {
            return bufferSourceNode_.loop;
        }
    } );

    /**
     * Position (in seconds) of the last frame played back by the AudioContext
     *
     * @property playbackPosition
     * @type Number
     * @default 0
     *
     */
    Object.defineProperty( this, 'playbackPosition', {
        enumerable: true,
        configurable: false,
        get: function () {
            return lastPos;
        }
    } );

    /**
     * Represents the audio asset to be played.
     *
     * @property buffer
     * @type AudioBuffer
     * @default null
     *
     */
    Object.defineProperty( this, 'buffer', {
        enumerable: true,
        configurable: false,
        set: function ( buffer ) {
            if ( buffer.isSPAudioBuffer ) {
                bufferSourceNode_.buffer = buffer.buffer;
                counterNode_.buffer = createCounterBuffer( buffer.buffer );
            } else if ( buffer instanceof AudioBuffer ) {
                bufferSourceNode_.buffer = buffer;
                counterNode_.buffer = createCounterBuffer( buffer );
            }

        },
        get: function () {
            return bufferSourceNode_.buffer;
        }
    } );

    /**
     * Track gain for this specific buffer.
     *
     * @property buffer
     * @type AudioBuffer
     * @default null
     *
     */
    Object.defineProperty( this, 'gain', {
        enumerable: true,
        configurable: false,
        get: function () {
            return trackGainNode_.gain;
        }
    } );

    /**
     * Connects the AudioNode to the input of another AudioNode.
     *
     * @method connect
     * @param {AudioNode} destination AudioNode to connect to.
     * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
     * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
     *
     */
    this.connect = function ( destination, output, input ) {
        trackGainNode_.connect( destination, output, input );
    };

    /**
     * Disconnects the AudioNode from the input of another AudioNode.
     *
     * @method disconnect
     * @param {Number} [output] Index describing which output of the AudioNode to disconnect.
     *
     */
    this.disconnect = function ( output ) {
        trackGainNode_.disconnect( output );
    };

    /**
     * Schedules a sound to playback at an exact time.
     *
     * @method start
     * @param {Number} when Time (in seconds) when the sound should start playing.
     * @param {Number} [offset] Offset time in the buffer (in seconds) where playback will begin
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     *
     */
    this.start = function ( when, offset, duration ) {
        if ( typeof duration == 'undefined' ) {
            duration = bufferSourceNode_.buffer.duration;
        }

        if ( typeof offset == 'undefined' ) {
            offset = 0;
        }

        if ( this.playbackState === this.UNSCHEDULED_STATE ) {
            bufferSourceNode_.start( when, offset, duration );
            counterNode_.start( when, offset, duration );
            this.playbackState = this.SCHEDULED_STATE;
        }

        var self = this;
        webAudioDispatch( function () {
            self.playbackState = self.PLAYING_STATE;
        }, when, this.audioContext );
    };

    /**
     * Schedules a sound to stop playback at an exact time.
     *
     * @method stop
     * @param {Number} when Time (in seconds) when the sound should stop playing.
     *
     */
    this.stop = function ( when ) {
        if ( this.playbackState === this.PLAYING_STATE || this.playbackState === this.SCHEDULED_STATE ) {
            bufferSourceNode_.stop( when );
            counterNode_.stop( when );
        }
    };

    /**
     * Resets the SP Buffer Source with a fresh BufferSource.
     *
     * @method resetBufferSource
     * @param {Number} when Time (in seconds) when the Buffer source should be reset.
     * @param {AudioNode} output The output to which the BufferSource is to be connected.
     *
     */
    this.resetBufferSource = function ( when, output ) {

        var self = this;
        webAudioDispatch( function () {
            //console.log( 'resetting' );
            // Disconnect source(s) from output.
            // self.disconnect( );

            // Disconnect scope node from trackGain
            scopeNode_.disconnect();

            var newTrackGain = self.audioContext.createGain();
            newTrackGain.gain.value = trackGainNode_.gain.value;
            trackGainNode_ = newTrackGain;

            // Create new sources and copy all the parameters over.
            var newSource = self.audioContext.createBufferSource();
            newSource.buffer = bufferSourceNode_.buffer;
            newSource.loopStart = bufferSourceNode_.loopStart;
            newSource.loopEnd = bufferSourceNode_.loopEnd;
            newSource.onended = wrapAroundOnEnded( self, bufferSourceNode_.onended );

            // Remove onended callback from old buffer
            bufferSourceNode_.onended = null;

            // Throw away the counter node;
            counterNode_.disconnect();

            var newCounterNode = audioContext.createBufferSource();
            newCounterNode.buffer = counterNode_.buffer;

            // Assign the new local variables to new sources
            bufferSourceNode_ = newSource;
            counterNode_ = newCounterNode;

            // Create new parameters for rate parameter
            var playBackRateVal = self.playbackRate.value;
            self.playbackRate = new SPPlaybackRateParam( self, bufferSourceNode_.playbackRate, counterNode_.playbackRate );
            self.playbackRate.setValueAtTime( playBackRateVal, 0 );

            // Reconnect to output.
            counterNode_.connect( scopeNode_ );
            bufferSourceNode_.connect( trackGainNode_ );
            scopeNode_.connect( trackGainNode_ );
            self.connect( output );
            self.playbackState = self.UNSCHEDULED_STATE;
        }, when, this.audioContext );
    };

    // Private Methods

    function createCounterBuffer( buffer ) {
        var array = new Float32Array( buffer.length );
        var audioBuf = audioContext.createBuffer( 1, buffer.length, 44100 );

        for ( var index = 0; index < buffer.length; index++ ) {
            array[ index ] = index;
        }

        audioBuf.getChannelData( 0 )
            .set( array );
        return audioBuf;
    }

    function init() {
        counterNode_.connect( scopeNode_ );
        bufferSourceNode_.connect( trackGainNode_ );
        scopeNode_.connect( trackGainNode_ );
        scopeNode_.onaudioprocess = savePosition;
    }

    function savePosition( processEvent ) {
        var inputBuffer = processEvent.inputBuffer.getChannelData( 0 );
        lastPos = inputBuffer[ inputBuffer.length - 1 ] || 0;
    }

    function wrapAroundOnEnded( node, onended ) {
        return function ( event ) {
            node.playbackState = node.FINISHED_STATE;
            if ( typeof onended === 'function' ) {
                onended( event );
            }
        };
    }

    init();

}
module.exports = SPAudioBufferSourceNode;

},{"core/SPPlaybackRateParam":10,"core/WebAudioDispatch":11}],9:[function(require,module,exports){
/*
 ** @module Core
 */

"use strict";
var webAudioDispatch = require( 'core/WebAudioDispatch' );
var Config = require( 'core/Config' );

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
            //console.log( "setting", name );
            // Sanitize the value with min/max
            // bounds first.
            if ( typeof value !== typeof defaultValue ) {
                console.error( "Attempt to set a " + ( typeof defaultValue ) + " parameter to a " + ( typeof value ) + " value" );
                return;
            }
            // Sanitize the value with min/max
            // bounds first.
            if ( typeof value === "number" ) {
                if ( value > maxValue ) {
                    console.warn( this.name + ' clamping to max' );
                    value = maxValue;
                } else if ( value < minValue ) {
                    console.warn( this.name + ' clamping to min' );
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
                // console.log( "clearing automation" );
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
                        //console.log( "setting directly" );
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
            console.log( "starting automation" );
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

},{"core/Config":4,"core/WebAudioDispatch":11}],10:[function(require,module,exports){
/**
 * @module Core
 */
"use strict";
var Config = require( 'core/Config' );

/**
 * Wrapper around AudioParam playbackRate of SPAudioBufferSourceNode to help calculate the playbackPosition of the AudioBufferSourceNode.
 *
 * @class SPPlaybackRateParam
 * @constructor
 * @param {SPAudioBufferSourceNode} bufferSourceNode Reference to the parent SPAudioBufferSourceNode.
 * @param {AudioParam} audioParam The playbackRate of a source AudioBufferSourceNode.
 * @param {AudioParam} counterParam The playbackRate of counter AudioBufferSourceNode.
 */
function SPPlaybackRateParam( bufferSourceNode, audioParam, counterParam ) {
    this.defaultValue = audioParam.defaultValue;
    this.maxValue = audioParam.maxValue;
    this.minValue = audioParam.minValue;
    this.name = audioParam.name;
    this.units = audioParam.units;

    Object.defineProperty( this, 'value', {
        enumerable: true,
        configurable: false,
        set: function ( rate ) {
            if ( bufferSourceNode.playbackState === bufferSourceNode.PLAYING_STATE ) {
                audioParam.setTargetAtTime( rate, bufferSourceNode.audioContext.currentTime, Config.DEFAULT_SMOOTHING_CONSTANT );
                counterParam.setTargetAtTime( rate, bufferSourceNode.audioContext.currentTime, Config.DEFAULT_SMOOTHING_CONSTANT );
            } else {
                audioParam.setValueAtTime( rate, bufferSourceNode.audioContext.currentTime );
                counterParam.setValueAtTime( rate, bufferSourceNode.audioContext.currentTime );
            }

        },
        get: function () {
            return audioParam.value;
        }
    } );

    audioParam.value = audioParam.value;
    counterParam.value = audioParam.value;

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
module.exports = SPPlaybackRateParam;

},{"core/Config":4}],11:[function(require,module,exports){
/**
 * @module Core
 *
 * @class WebAudioDispatch
 * @static
 */
"use strict";
/**
 * Helper class to dispatch manual syncronized calls to for WebAudioAPI. This is to be used for API calls which can't don't take in a time argument and hence are inherently Syncronized.
 *
 *
 * @method WebAudioDispatch
 * @param {Function} Function to be called at a specific time in the future.
 * @param {Number} TimeStamp at which the above function is to be called.
 * @param {String} audioContext AudioContext to be used for timing.
 */

function WebAudioDispatch( functionCall, time, audioContext ) {
    if ( !audioContext ) {
        console.warn( "No AudioContext provided" );
        return;
    }
    var currentTime = audioContext.currentTime;
    // Dispatch anything that's scheduled for anything before current time, current time and the next 5 msecs
    if ( currentTime >= time || time - currentTime < 0.005 ) {
        //console.log( "Dispatching now" );
        functionCall();
    } else {
        //console.log( "Dispatching in ", ( time - currentTime ) * 1000 );
        window.setTimeout( function () {
            //console.log( "Diff at dispatch ", ( time - audioContext.currentTime ) * 1000 );
            functionCall();
        }, ( time - currentTime ) * 1000 );
    }
}

module.exports = WebAudioDispatch;

},{}],12:[function(require,module,exports){
 /**
  * @module Core
  *
  * @class MuliFileLoader
  * @static
  */

 "use strict";

 var FileLoader = require( 'core/FileLoader' );
 var SPAudioBuffer = require( 'core/SPAudioBuffer' );

 /**
  * Helper class to loader multiple sources from URL String, File or AudioBuffer or SPAudioBuffer Objects.
  *
  *
  * @method MuliFileLoader
  * @param {Array/String/File} sources Array of or Individual String, AudioBuffer or File Objects which define the sounds to be loaded
  * @param {String} audioContext AudioContext to be used in decoding the file
  * @param {String} [onLoadProgress] Callback function to access the progress of the file loading.
  * @param {String} [onLoadComplete] Callback function to be called when all sources are loaded
  */
 function MultiFileLoader( sources, audioContext, onLoadProgress, onLoadComplete ) {

     //Private variables
     var self = this;
     this.audioContext = audioContext;
     var sourcesToLoad_ = 0;
     var loadedAudioBuffers_ = [];

     //Private functions
     function init() {

         // If not defined, set empty sources.
         if ( !sources ) {
             console.log( "Setting empty source. No sound may be heard" );
             onLoadComplete( false, loadedAudioBuffers_ );
             return;
         }

         // Convert to array.
         if ( !( sources instanceof Array ) ) {
             var sourceArray = [];
             sourceArray.push( sources );
             sources = sourceArray;
         }

         // If beyond size limits, log error and callback with false.
         if ( sources.length < self.minSources || sources.length > self.maxSources ) {
             console.error( "Unsupported number of Sources. " + self.modelName + " only supports a minimum of " + self.minSources + " and a maximum of " + self.maxSources + " sources. Trying to load " + sources.length + "." );
             onLoadComplete( false, loadedAudioBuffers_ );
             return;
         }

         // Load each of the sources
         sourcesToLoad_ = sources.length;
         loadedAudioBuffers_ = new Array( sourcesToLoad_ );
         sources.forEach( function ( thisSound, index ) {
             loadSingleSound( thisSound, onSingleLoadAt( index ) );
         } );
     }

     function loadSingleSound( source, onSingleLoad ) {
         var sourceType = Object.prototype.toString.call( source );
         var audioBuffer;
         if ( sourceType === '[object AudioBuffer]' ) {
             audioBuffer = new SPAudioBuffer( self.audioContext, source );
             onSingleLoad( true, audioBuffer );
         } else if ( source.isSPAudioBuffer && source.buffer ) {
             onSingleLoad( true, source );
         } else if ( sourceType === '[object String]' ||
             sourceType === '[object File]' ||
             ( source.isSPAudioBuffer && source.sourceURL ) ) {

             var sourceURL;
             if ( source.isSPAudioBuffer && source.sourceURL ) {
                 sourceURL = source.sourceURL;
                 audioBuffer = source;
             } else {
                 sourceURL = source;
                 audioBuffer = new SPAudioBuffer( self.audioContext, sourceURL );
             }

             var fileLoader = new FileLoader( sourceURL, self.audioContext, function ( status ) {
                 if ( status ) {
                     audioBuffer.buffer = fileLoader.getBuffer();
                     onSingleLoad( status, audioBuffer );
                 } else {
                     onSingleLoad( status );
                 }
             }, function ( progressEvent ) {
                 if ( onLoadProgress && typeof onLoadProgress === 'function' ) {
                     onLoadProgress( progressEvent, audioBuffer );
                 }
             } );
         } else {
             console.error( "Incorrect Parameter Type - Source is not a URL, File or AudioBuffer or doesn't have sourceURL or buffer" );
             onSingleLoad( false, {} );
         }
     }

     function onSingleLoadAt( index ) {
         return function ( status, loadedSound ) {
             if ( status ) {
                 //console.log( "Loaded ", index, "successfully" );
                 loadedAudioBuffers_[ index ] = loadedSound;
             }
             sourcesToLoad_--;
             if ( sourcesToLoad_ === 0 ) {
                 var allStatus = true;
                 for ( var bIndex = 0; bIndex < loadedAudioBuffers_.length; ++bIndex ) {
                     if ( !loadedAudioBuffers_[ bIndex ] ) {
                         allStatus = false;
                         break;
                     }
                 }
                 onLoadComplete( allStatus, loadedAudioBuffers_ );
             }
         };
     }
     init();
 }
 module.exports = MultiFileLoader;

},{"core/FileLoader":6,"core/SPAudioBuffer":7}],13:[function(require,module,exports){
module.exports=require(11)
},{"/Users/chinmay/Documents/Sonoport/Projects/javascript-sound-models/src/lib/core/WebAudioDispatch.js":11}],14:[function(require,module,exports){
/**
 * @module Models
 */

"use strict";

var Config = require( 'core/Config' );
var BaseSound = require( "core/BaseSound" );
var SPAudioParam = require( "core/SPAudioParam" );
var SPAudioBufferSourceNode = require( "core/SPAudioBufferSourceNode" );
var multiFileLoader = require( "core/multiFileLoader" );
var webAudioDispatch = require( "core/webAudioDispatch" );

/**
 *
 * A model which loads one or more sources and allows them to be looped continuously at variable speed.
 * @class Looper
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/SPAudioBuffer/File} [sources] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 * @param {Function} [onTrackEnd] Callback when an individual track has finished playing.
 */
function Looper( context, sources, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd, onTrackEnd ) {
    if ( !( this instanceof Looper ) ) {
        throw new TypeError( "Looper constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseSound.call( this, context );
    this.maxSources = Config.MAX_VOICES;
    this.minSources = 1;
    this.modelName = 'Looper';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;
    this.onAudioStart = onAudioStart;
    this.onAudioEnd = onAudioEnd;

    // Private vars
    var self = this;

    var sourceBufferNodes_ = [];
    var lastStopPosition_ = [];
    var rateArray_ = [];

    var onLoadAll = function ( status, arrayOfBuffers ) {
        self.multiTrackGain.length = arrayOfBuffers.length;
        arrayOfBuffers.forEach( function ( thisBuffer, trackIndex ) {
            lastStopPosition_.push( 0 );
            insertBufferSource( thisBuffer, trackIndex, arrayOfBuffers.length );
        } );

        if ( rateArray_ && rateArray_.length > 0 ) {
            self.registerParameter( new SPAudioParam( self, 'playSpeed', 0.0, 10, 1, rateArray_, null, playSpeedSetter_ ), true );
        }

        if ( status ) {
            self.isInitialized = true;
        }

        if ( typeof self.onLoadComplete === 'function' ) {
            self.onLoadComplete( status, arrayOfBuffers );
        }
    };

    var insertBufferSource = function ( audioBuffer, trackIndex, totalTracks ) {
        var source;
        if ( !( sourceBufferNodes_[ trackIndex ] instanceof SPAudioBufferSourceNode ) ) {
            source = new SPAudioBufferSourceNode( self.audioContext );
        } else {
            source = sourceBufferNodes_[ trackIndex ];
        }

        source.buffer = audioBuffer;
        source.loopEnd = audioBuffer.duration;
        source.onended = function ( event ) {
            onSourceEnd( event, trackIndex, source );
        };

        if ( totalTracks > 1 ) {
            var multiChannelGainParam = new SPAudioParam( self, 'track-' + trackIndex + '-gain', 0.0, 1, 1, source.gain, null, null );
            self.multiTrackGain.splice( trackIndex, 1, multiChannelGainParam );
        }

        source.connect( self.releaseGainNode );

        sourceBufferNodes_.splice( trackIndex, 1, source );
        rateArray_.push( source.playbackRate );
    };

    var onSourceEnd = function ( event, trackIndex, source ) {
        var cTime = self.audioContext.currentTime;
        // Create a new source since SourceNodes can't play again.
        source.resetBufferSource( cTime, self.releaseGainNode );

        if ( self.multiTrackGain.length > 1 ) {
            var multiChannelGainParam = new SPAudioParam( self, 'track-' + trackIndex + '-gain' + trackIndex, 0.0, 1, 1, source.gain, null, null );
            self.multiTrackGain.splice( trackIndex, 1, multiChannelGainParam );
        }

        if ( typeof self.onTrackEnd === 'function' ) {
            onTrackEnd( self, trackIndex );
        }

        var allSourcesEnded = sourceBufferNodes_.reduce( function ( prevState, thisSource ) {
            return prevState && ( thisSource.playbackState === thisSource.FINISHED_STATE ||
                thisSource.playbackState === thisSource.UNSCHEDULED_STATE );
        }, true );

        if ( allSourcesEnded && self.isPlaying ) {
            self.isPlaying = false;
            if ( typeof self.onAudioEnd === 'function' ) {
                self.onAudioEnd();
            }
        }
    };

    var playSpeedSetter_ = function ( aParam, value, audioContext ) {
        if ( self.isInitialized ) {
            /* 0.001 - 60dB Drop
                e(-n) = 0.001; - Decay Rate of setTargetAtTime.
                n = 6.90776;
                */
            var t60multiplier = 6.90776;

            var currentSpeed = sourceBufferNodes_[ 0 ] ? sourceBufferNodes_[ 0 ].playbackRate.value : 1;

            if ( self.isPlaying ) {
                // console.log( "easingIn/Out" );
                // easeIn/Out
                if ( value > currentSpeed ) {
                    sourceBufferNodes_.forEach( function ( thisSource ) {
                        thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                        thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.easeIn.value / t60multiplier );
                    } );
                } else if ( value < currentSpeed ) {
                    sourceBufferNodes_.forEach( function ( thisSource ) {
                        thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                        thisSource.playbackRate.setTargetAtTime( value, audioContext.currentTime, self.easeOut.value / t60multiplier );
                    } );
                }
            } else {
                // console.log( "changing directly" );
                sourceBufferNodes_.forEach( function ( thisSource ) {
                    thisSource.playbackRate.cancelScheduledValues( audioContext.currentTime );
                    thisSource.playbackRate.setValueAtTime( value, audioContext.currentTime );
                } );
            }
        }
    };

    function init( sources ) {
        rateArray_ = [];
        sourceBufferNodes_.forEach( function ( thisSource ) {
            thisSource.disconnect();
        } );
        self.multiTrackGain.length = 0;
        multiFileLoader.call( self, sources, self.audioContext, self.onLoadProgress, onLoadAll );
    }

    // Public Properties

    /**
     * Event Handler or Callback for ending of a individual track.
     *
     * @property onTrackEnd
     * @type Function
     * @default null
     */
    this.onTrackEnd = onTrackEnd;

    /**
     * Speed of playback of the source. Affects both pitch and tempo.
     *
     * @property playSpeed
     * @type SPAudioParam
     * @default 1.0
     * @minvalue 0.0
     * @maxvalue 10.0
     */
    this.registerParameter( new SPAudioParam( this, 'playSpeed', 0.0, 10, 1.005, null, null, playSpeedSetter_ ), true );

    /**
     * Rate of increase of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
     *
     * @property easeIn
     * @type SPAudioParam
     * @default 0.05
     * @minvalue 0.05
     * @maxvalue 10.0
     */

    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'easeIn', 0.05, 10.0, 0.05 ) );

    /**
     * Rate of decrease of Play Speed. It is the time-constant value of first-order filter (exponential) which approaches the target speed set by the {{#crossLink "Looper/playSpeed:property"}}{{/crossLink}} property.
     *
     * @property easeOut
     * @type SPAudioParam
     * @default 0.05
     * @minvalue 0.05
     * @maxvalue 10.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'easeOut', 0.05, 10.0, 0.05 ) );

    /**
     * The volume (loudness) for each individual track if multiple sources are used. Works even if a single source is used.
     *
     *
     * @property multiTrackGain
     * @type Array of SPAudioParams
     * @default 1.0
     * @minvalue 0.0
     * @maxvalue 1.0
     */
    var multiTrackGainArray = [];
    multiTrackGainArray.name = 'multiTrackGain';
    this.registerParameter( multiTrackGainArray, false );

    /**
     * The maximum number time the source will be looped before stopping. Currently only supports -1 (loop indefinitely), and 1 (only play the track once, ie. no looping).
     *
     * @property maxLoops
     * @type SPAudioParam
     * @default -1 (Infinite)
     * @minvalue -1 (Infinite)
     * @maxvalue 1
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'maxLoops', -1, 1, -1 ) );

    /**
     * Reinitializes a Looper and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers of sources.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( sources, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, sources, onLoadProgress, onLoadComplete );
        init( sources );
    };

    /**
     * Plays the model immediately. If the model is paused, the model will be played back from the same position as it was paused at.
     *
     * @method play
     *
     */
    this.play = function () {

        if ( !this.isInitialized ) {
            throw new Error( this.modelName, "hasn't finished Initializing yet. Please wait before calling start/play" );
        }

        var now = this.audioContext.currentTime;

        if ( !this.isPlaying ) {
            sourceBufferNodes_.forEach( function ( thisSource, index ) {
                var offset = ( lastStopPosition_ && lastStopPosition_[ index ] ) ? lastStopPosition_[ index ] : thisSource.loopStart;
                thisSource.loop = ( self.maxLoops.value !== 1 );
                thisSource.start( now, offset );
            } );
            BaseSound.prototype.start.call( this, now );
            webAudioDispatch( function () {
                if ( typeof self.onAudioStart === 'function' ) {
                    self.onAudioStart();
                }
            }, now, this.audioContext );
        }
    };

    /**
     * Start playing after specific time and from a specific offset.
     *
     * @method start
     * @param {Number} when Time (in seconds) when the sound should start playing.
     * @param {Number} [offset] The starting position of the playhead in seconds
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     */
    this.start = function ( when, offset, duration, attackDuration ) {
        if ( !this.isInitialized ) {
            console.error( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }

        if ( !this.isPlaying ) {
            sourceBufferNodes_.forEach( function ( thisSource ) {

                offset = thisSource.loopStart + parseFloat( offset ) || 0;

                if ( typeof duration == 'undefined' || duration === null ) {
                    duration = thisSource.buffer.duration;
                }
                thisSource.loop = ( self.maxLoops.value !== 1 );
                thisSource.start( when, offset, duration );
            } );

            BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
            webAudioDispatch( function () {
                if ( typeof self.onAudioStart === 'function' ) {
                    self.onAudioStart();
                }
            }, when, this.audioContext );
        }
    };

    /**
     * Stops the model and resets play head to 0.
     * @method stop
     * @param {Number} when Time offset to stop
     */
    this.stop = function ( when ) {
        if ( self.isPlaying ) {
            sourceBufferNodes_.forEach( function ( thisSource, index ) {
                thisSource.stop( when );
                lastStopPosition_[ index ] = 0;
            } );

            BaseSound.prototype.stop.call( this, when );
            webAudioDispatch( function () {
                if ( typeof self.onAudioEnd === 'function' && self.isPlaying === false ) {
                    self.onAudioEnd();
                }
            }, when, this.audioContext );
        }
    };

    /**
     * Pause the currently playing model at the current position.
     *
     * @method pause
     */
    this.pause = function () {
        if ( self.isPlaying ) {

            sourceBufferNodes_.forEach( function ( thisSource, index ) {
                thisSource.stop( 0 );
                lastStopPosition_[ index ] = thisSource.playbackPosition / thisSource.buffer.sampleRate;
            } );

            BaseSound.prototype.stop.call( this, 0 );
            webAudioDispatch( function () {
                if ( typeof self.onAudioEnd === 'function' ) {
                    self.onAudioEnd();
                }
            }, 0, this.audioContext );
        }
    };

    /**
     * Linearly ramp down the gain of the audio in time (seconds) to 0.
     *
     * @method release
     * @param {Number} [when] Time (in seconds) at which the Envelope will release.
     * @param {Number} [fadeTime] Amount of time (seconds) it takes for linear ramp down to happen.
     * @param {Boolean} [resetOnRelease] Boolean to define if release resets (stops) the playback or just pauses it.
     */
    this.release = function ( when, fadeTime, resetOnRelease ) {
        if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        var FADE_TIME = 0.5;
        fadeTime = fadeTime || FADE_TIME;

        BaseSound.prototype.release.call( this, when, fadeTime, resetOnRelease );
        // Pause the sound after currentTime + fadeTime + FADE_TIME_PAD

        if ( resetOnRelease ) {
            // Create new releaseGain Node
            this.releaseGainNode = this.audioContext.createGain();
            this.destinations.forEach( function ( dest ) {
                self.releaseGainNode.connect( dest.destination, dest.output, dest.input );
            } );

            // Disconnect and rewire each source
            sourceBufferNodes_.forEach( function ( thisSource, trackIndex ) {
                thisSource.stop( when + fadeTime );
                lastStopPosition_[ trackIndex ] = 0;

                thisSource.resetBufferSource( when, self.releaseGainNode );
                var multiChannelGainParam = new SPAudioParam( self, 'gain-' + trackIndex, 0.0, 1, 1, thisSource.gain, null, null );
                self.multiTrackGain.splice( trackIndex, 1, multiChannelGainParam );
            } );

            // Set playing to false and end audio after given time.
            this.isPlaying = false;
            webAudioDispatch( function () {
                if ( typeof self.onAudioEnd === 'function' && self.isPlaying === false ) {
                    self.onAudioEnd();
                }
            }, when + fadeTime, this.audioContext );
        }
    };

    // Initialize the sources.
    window.setTimeout( function () {
        init( sources );
    }, 0 );
}

Looper.prototype = Object.create( BaseSound.prototype );

module.exports = Looper;

},{"core/BaseSound":3,"core/Config":4,"core/SPAudioBufferSourceNode":8,"core/SPAudioParam":9,"core/multiFileLoader":12,"core/webAudioDispatch":13}]},{},[1])(1)
});