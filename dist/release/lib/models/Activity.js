/*javascript-sound-models - v0.4.0 - 2014-05-06 */ 
console.log("   ____                           __ \n" + "  / _____  ___ ___  ___ ___  ____/ /_\n" + " _\\ \\/ _ \\/ _ / _ \\/ _ / _ \\/ __/ __/\n" + "/___/\\___/_//_\\___/ .__\\___/_/  \\__/ \n" + "                 /_/                 \n" + "Hello Developer!\n" + "Thanks for using Sonoport Dynamic Sound Library.");

define("core/Config",[],function(){function e(){}return e.MAX_VOICES=8,e.NOMINAL_REFRESH_RATE=60,e.WINDOW_LENGTH=512,e}),define("core/AudioContextMonkeyPatch",[],function(){function e(e){e&&(e.setTargetAtTime||(e.setTargetAtTime=e.setTargetValueAtTime))}window.hasOwnProperty("webkitAudioContext")&&!window.hasOwnProperty("AudioContext")&&(window.AudioContext=webkitAudioContext,AudioContext.prototype.hasOwnProperty("createGain")||(AudioContext.prototype.createGain=AudioContext.prototype.createGainNode),AudioContext.prototype.hasOwnProperty("createDelay")||(AudioContext.prototype.createDelay=AudioContext.prototype.createDelayNode),AudioContext.prototype.hasOwnProperty("createScriptProcessor")||(AudioContext.prototype.createScriptProcessor=AudioContext.prototype.createJavaScriptNode),AudioContext.prototype.internal_createGain=AudioContext.prototype.createGain,AudioContext.prototype.createGain=function(){var t=this.internal_createGain();return e(t.gain),t},AudioContext.prototype.internal_createDelay=AudioContext.prototype.createDelay,AudioContext.prototype.createDelay=function(t){var n=t?this.internal_createDelay(t):this.internal_createDelay();return e(n.delayTime),n},AudioContext.prototype.internal_createBufferSource=AudioContext.prototype.createBufferSource,AudioContext.prototype.createBufferSource=function(){var t=this.internal_createBufferSource();return t.start||(t.start=function(e,t,n){t||n?this.noteGrainOn(e,t,n):this.noteOn(e)}),t.stop||(t.stop=t.noteOff),e(t.playbackRate),t},AudioContext.prototype.internal_createDynamicsCompressor=AudioContext.prototype.createDynamicsCompressor,AudioContext.prototype.createDynamicsCompressor=function(){var t=this.internal_createDynamicsCompressor();return e(t.threshold),e(t.knee),e(t.ratio),e(t.reduction),e(t.attack),e(t.release),t},AudioContext.prototype.internal_createBiquadFilter=AudioContext.prototype.createBiquadFilter,AudioContext.prototype.createBiquadFilter=function(){var t=this.internal_createBiquadFilter();return e(t.frequency),e(t.detune),e(t.Q),e(t.gain),t},AudioContext.prototype.hasOwnProperty("createOscillator")&&(AudioContext.prototype.internal_createOscillator=AudioContext.prototype.createOscillator,AudioContext.prototype.createOscillator=function(){var t=this.internal_createOscillator();return t.start||(t.start=t.noteOn),t.stop||(t.stop=t.noteOff),e(t.frequency),e(t.detune),t}))}),define("core/BaseSound",["core/AudioContextMonkeyPatch"],function(){function e(e){void 0===e||null===e?(console.log("Making a new AudioContext"),this.audioContext=new AudioContext):this.audioContext=e,this.numberOfInputs=0,this.numberOfOutputs=0,this.maxSources=0,this.releaseGainNode=this.audioContext.createGain(),this.isPlaying=!1,this.isInitialized=!1,this.inputNode=null}return e.prototype.connect=function(e,t,n){if(e instanceof AudioNode)this.releaseGainNode.connect(e,t,n);else{if(!(e.inputNode instanceof AudioNode))throw{name:"No Input Connection Exception",message:"Attempts to connect "+typeof t+" to "+typeof this,toString:function(){return this.name+": "+this.message}};this.releaseGainNode.connect(e.inputNode,t,n)}},e.prototype.disconnect=function(e){this.releaseGainNode.disconnect(e)},e.prototype.start=function(){this.isPlaying=!0},e.prototype.stop=function(e){this.isPlaying=!1,"undefined"==typeof e&&(e=0),this.releaseGainNode.gain.cancelScheduledValues(e)},e.prototype.release=function(e,t){var n=.5,o=1/this.audioContext.sampleRate;"undefined"==typeof e&&(e=this.audioContext.currentTime),t=t||n,this.releaseGainNode.gain.setValueAtTime(this.releaseGainNode.gain.value,e),this.releaseGainNode.gain.linearRampToValueAtTime(0,e+t),this.stop(e+t+o)},e.prototype.play=function(){this.start(0)},e.prototype.pause=function(){this.isPlaying=!1},e}),define("core/SPAudioParam",[],function(){function e(e,t,n,o,i,a,r,u){var c,s=1e-4,l=500,f=0;if(this.defaultValue=null,this.maxValue=0,this.minValue=0,this.name="",Object.defineProperty(this,"value",{enumerable:!0,set:function(e){if(typeof e!=typeof o)throw{name:"Incorrect value type Exception",message:"Attempt to set a "+typeof o+" parameter to a "+typeof e+" value",toString:function(){return this.name+": "+this.message}};"number"==typeof e&&(e>n?(console.log(this.name+" clamping to max"),e=n):t>e&&(console.log(this.name+" clamping to min"),e=t)),"function"==typeof a&&(e=a(e)),"function"==typeof r&&u?r(i,e,u):i?i instanceof AudioParam?i.value=e:i instanceof Array&&i.forEach(function(t){t.value=e}):window.clearInterval(c),f=e},get:function(){if(i){if(i instanceof AudioParam)return i.value;if(i instanceof Array)return i[0].value}return f}}),i&&(i instanceof AudioParam||i instanceof Array)){var p=i[0]||i;this.defaultValue=p.defaultValue,this.minValue=p.minValue,this.maxValue=p.maxValue,this.value=p.defaultValue,this.name=p.name}e&&(this.name=e),"undefined"!=typeof o&&(this.defaultValue=o,this.value=o),"undefined"!=typeof t&&(this.minValue=t),"undefined"!=typeof n&&(this.maxValue=n),this.setValueAtTime=function(e,t){if("function"==typeof a&&(e=a(e)),i)i instanceof AudioParam?i.setValueAtTime(e,t):i instanceof Array&&i.forEach(function(n){n.setValueAtTime(e,t)});else{var n=this,o=t-u.currentTime;window.setTimeout(function(){n.value=e},1e3*o)}},this.setTargetAtTime=function(e,t,n){if("function"==typeof a&&(e=a(e)),i)i instanceof AudioParam?i.setTargetAtTime(e,t,n):i instanceof Array&&i.forEach(function(o){o.setTargetAtTime(e,t,n)});else{var o=this,r=o.value,f=u.currentTime;c=window.setInterval(function(){u.currentTime>=t&&(o.value=e+(r-e)*Math.exp(-(u.currentTime-f)/n),Math.abs(o.value-e)<s&&window.clearInterval(c))},l)}},this.setValueCurveAtTime=function(e,t,n){if("function"==typeof a)for(var o=0;o<e.length;o++)e[o]=a(e[o]);if(i)i instanceof AudioParam?i.setValueCurveAtTime(e,t,n):i instanceof Array&&i.forEach(function(o){o.setValueCurveAtTime(e,t,n)});else{var r=this,s=u.currentTime;c=window.setInterval(function(){if(u.currentTime>=t){var o=Math.floor(e.length*(u.currentTime-s)/n);o<e.length?r.value=e[o]:window.clearInterval(c)}},l)}},this.exponentialRampToValueAtTime=function(e,t){if("function"==typeof a&&(e=a(e)),i)i instanceof AudioParam?i.exponentialRampToValueAtTime(e,t):i instanceof Array&&i.forEach(function(n){n.exponentialRampToValueAtTime(e,t)});else{var n=this,o=n.value,r=u.currentTime;0===o&&(o=.001),c=window.setInterval(function(){var i=(u.currentTime-r)/(t-r);n.value=o*Math.pow(e/o,i),u.currentTime>=t&&window.clearInterval(c)},l)}},this.linearRampToValueAtTime=function(e,t){if("function"==typeof a&&(e=a(e)),i)i instanceof AudioParam?i.linearRampToValueAtTime(e,t):i instanceof Array&&i.forEach(function(n){n.linearRampToValueAtTime(e,t)});else{var n=this,o=n.value,r=u.currentTime;c=window.setInterval(function(){var i=(u.currentTime-r)/(t-r);n.value=o+(e-o)*i,u.currentTime>=t&&window.clearInterval(c)},l)}},this.cancelScheduledValues=function(e){i?i instanceof AudioParam?i.cancelScheduledValues(e):i instanceof Array&&i.forEach(function(t){t.cancelScheduledValues(e)}):window.clearInterval(c)}}return e.createPsuedoParam=function(t,n,o,i,a){return new e(t,n,o,i,null,null,null,a)},e}),define("core/SPPlaybackRateParam",[],function(){function e(e,t){this.defaultValue=e.defaultValue,this.maxValue=e.maxValue,this.minValue=e.minValue,this.name=e.name,this.units=e.units,Object.defineProperty(this,"value",{enumerable:!0,set:function(n){e.value=n,t.value=n},get:function(){return e.value}}),this.linearRampToValueAtTime=function(n,o){e.linearRampToValueAtTime(n,o),t.linearRampToValueAtTime(n,o)},this.exponentialRampToValueAtTime=function(n,o){e.exponentialRampToValueAtTime(n,o),t.exponentialRampToValueAtTime(n,o)},this.setValueCurveAtTime=function(n,o,i){e.setValueCurveAtTime(n,o,i),t.setValueCurveAtTime(n,o,i)},this.setTargetAtTime=function(n,o,i){e.setTargetAtTime(n,o,i),t.setTargetAtTime(n,o,i)},this.setValueAtTime=function(n,o){e.setValueAtTime(n,o),t.setValueAtTime(n,o)},this.cancelScheduledValues=function(n){e.cancelScheduledValues(n),t.cancelScheduledValues(n)}}return e}),define("core/SPAudioBufferSourceNode",["core/SPPlaybackRateParam"],function(e){function t(t){function n(e){for(var n=new Float32Array(e.length),o=t.createBuffer(1,e.length,44100),i=0;i<e.length;i++)n[i]=i;return o.getChannelData(0).set(n),o}function o(){r.connect(u),u.onaudioprocess=i}function i(e){var t=e.inputBuffer.getChannelData(0);c=t[t.length-1]||0}var a=t.createBufferSource(),r=t.createBufferSource(),u=t.createScriptProcessor(256,1,0),c=0;this.channelCount=a.channelCount,this.channelCountMode=a.channelCountMode,this.channelInterpretation=a.channelInterpretation,this.numberOfInputs=a.numberOfInputs,this.numberOfOutputs=a.numberOfOutputs,this.playbackState=a.playbackState,this.playbackRate=new e(a.playbackRate,r.playbackRate),Object.defineProperty(this,"loopEnd",{enumerable:!0,set:function(e){a.loopEnd=e,r.loopEnd=e},get:function(){return a.loopEnd}}),Object.defineProperty(this,"loopStart",{enumerable:!0,set:function(e){a.loopStart=e,r.loopStart=e},get:function(){return a.loopStart}}),Object.defineProperty(this,"onended",{enumerable:!0,set:function(e){a.onended=e},get:function(){return a.onended}}),Object.defineProperty(this,"loop",{enumerable:!0,set:function(e){a.loop=e,r.loop=e},get:function(){return a.loop}}),Object.defineProperty(this,"playbackPosition",{enumerable:!0,get:function(){return c}}),Object.defineProperty(this,"buffer",{enumerable:!0,set:function(e){a.buffer=e,r.buffer=n(e)},get:function(){return a.buffer}}),this.connect=function(e,t,n){a.connect(e,t,n),u.connect(e,t,n)},this.disconnect=function(e){a.disconnect(e),u.disconnect(e)},this.start=function(e,t,n){"undefined"==typeof n&&(n=a.buffer.duration),a.start(e,t,n),r.start(e,t,n)},this.stop=function(e){a.stop(e),r.stop(e)},o()}return t}),define("core/DetectLoopMarkers",[],function(){function e(e){var t=0,n=0,o=5e3,i=.5,a=2e4,r=.01,u=1024,c=16,s=[],l=0,f=function(e,t){for(var n=0,o=t+c;t+c+u>o;++o)n+=Math.abs(e[o]);return r>n/u},p=function(e){return function(t,n,o){var a;return a=o%2===0?n[e]>i:n[e]<-i,t&&a}},d=function(e){var i=null,r=null;t=0,n=l;for(var u=0;null===i&&l>u&&a>u;){if(e.reduce(p(u),!0)&&(1!==e.length||f(e[0],u))){i=u;break}u++}for(u=l;null===r&&u>0&&a>l-u;){if(e.reduce(p(u),!0)){r=u;break}u--}return null!==i&&null!==r&&r>i?(t=i+o/2,n=r-o/2,!0):!1},h=function(e){return function(t,n){return t&&Math.abs(n[e])<r}},m=function(e){var o=!0;for(t=0;a>t&&l>t&&(o=e.reduce(h(t),!0));)t++;for(n=l;a>l-n&&n>0&&(o=e.reduce(h(n),!0));)n--;t>n&&(t=0,nLoopLength_=l)};l=e.length;for(var y=0;y<e.numberOfChannels;y++)s.push(new Float32Array(e.getChannelData(y)));return d(s)||m(s),{start:t,end:n}}return e}),define("core/FileLoader",["core/DetectLoopMarkers"],function(e){function t(n,o,i){function a(){var e=Object.prototype.toString.call(n),t=/[^.]+$/.exec(n);if("[object String]"===e){var o=new XMLHttpRequest;o.open("GET",n,!0),o.responseType="arraybuffer",o.onload=function(){r(o.response,t)},o.send()}else if("[object File]"===e){var i=new FileReader;i.onload=function(){r(i.result,t)},i.readAsArrayBuffer(n)}}function r(t,a){o.decodeAudioData(t,function(t){if(l=!0,u=t,c=0,s=u.length,"wav"!==a[0]){var n=e(u);n&&(c=n.start,s=n.end)}i&&"function"==typeof i&&i(!0)},function(){console.log("Error Decoding "+n),i&&"function"==typeof i&&i(!1)})}if(!(this instanceof t))throw new TypeError("FileLoader constructor cannot be called as a function.");var u,c=0,s=0,l=!1,f=function(e){var t=/^[0-9]+$/;return t.test(e)?!0:!1},p=function(e,t){if("undefined"==typeof t&&(t=u.length),!f(e))throw{name:"Incorrect parameter type Exception",message:"FileLoader getBuffer start parameter is not an integer",toString:function(){return this.name+": "+this.message}};if(!f(t))throw{name:"Incorrect parameter type Exception",message:"FileLoader getBuffer end parameter is not an integer",toString:function(){return this.name+": "+this.message}};if(e>t)throw{name:"Incorrect parameter type Exception",message:"FileLoader getBuffer start parameter should be smaller than end parameter",toString:function(){return this.name+": "+this.message}};if(e>s||c>e)throw{name:"Incorrect parameter type Exception",message:"FileLoader getBuffer start parameter should be within the buffer size : 0-"+u.length,toString:function(){return this.name+": "+this.message}};if(t>s||c>t)throw{name:"Incorrect parameter type Exception",message:"FileLoader getBuffer end parameter should be within the buffer size : 0-"+u.length,toString:function(){return this.name+": "+this.message}};for(var n=t-e,i=o.createBuffer(u.numberOfChannels,n,u.sampleRate),a=0;a<u.numberOfChannels;a++){var r=new Float32Array(u.getChannelData(a));i.getChannelData(a).set(r.subarray(e,t))}return i};this.getBuffer=function(e,t){return"undefined"==typeof e&&(e=0),"undefined"==typeof t&&(t=s-c),p(c+e,c+t)},this.getRawBuffer=function(){return u},this.isLoaded=function(){return l},a()}return t}),define("core/MultiFileLoader",["core/FileLoader"],function(e){function t(t,n,o){function i(){var e=Object.prototype.toString.call(t);"[object Array]"===e?(c=t.length,t.forEach(function(e){a(e,r)})):void 0!==t&&null!==t&&(c=1,a(t,r))}function a(t,n){var o=Object.prototype.toString.call(t);if("[object String]"===o||"[object File]"===o)var i=new e(t,u.audioContext,function(e){e&&n(e,i.getBuffer())});else{if("[object AudioBuffer]"!==o)throw{name:"Incorrect Parameter type Exception",message:"Looper argument is not a URL or AudioBuffer",toString:function(){return this.name+": "+this.message}};n(!0,t)}}function r(e,t){c--,s.push(t),0===c&&o(e,s)}var u=this,c=0,s=[];i()}return t}),define("models/Looper",["core/Config","core/BaseSound","core/SPAudioParam","core/SPAudioBufferSourceNode","core/MultiFileLoader"],function(e,t,n,o,i){function a(r,u,c,s){function l(e){var t=Object.prototype.toString.call(e);if("[object Array]"===t&&e.length>f.maxSources)throw{name:"Unsupported number of sources",message:"This sound only supports a maximum of "+f.maxSources+" sources.",toString:function(){return this.name+": "+this.message}};m=[],p=[],d=[],f.multiTrackGain=[],i.call(f,e,u,y),f.releaseGainNode.connect(f.audioContext.destination)}if(!(this instanceof a))throw new TypeError("Looper constructor cannot be called as a function.");t.call(this,u),this.maxSources=e.MAX_VOICES,this.numberOfInputs=1,this.numberOfOutputs=1;var f=this,p=[],d=[],h=[],m=[],y=function(e,t){t.forEach(function(e,t){h.push(0),g(e,t)}),f.playSpeed=new n("playSpeed",0,10,1,m,null,v,f.audioContext),f.isInitialized=!0,"function"==typeof c&&c(e)},A=function(e,t){f.isPlaying=!1,"function"==typeof s&&s(f,t)},g=function(e,t){var i=new o(f.audioContext),a=f.audioContext.createGain();i.buffer=e,i.loopEnd=e.duration,i.onended=function(e){A(e,t)},i.connect(a),a.connect(f.releaseGainNode);var r=new n("gainNode",0,1,1,a.gain,null,null,f.audioContext);p.push(i),d.push(a),f.multiTrackGain.push(r),m.push(i.playbackRate)},v=function(e,t,n){if(f.isInitialized){var o=6.90776,i=p[0]?p[0].playbackRate.value:1;t>i?p.forEach(function(e){e.playbackRate.cancelScheduledValues(n.currentTime),e.playbackRate.setTargetAtTime(t,n.currentTime,f.riseTime.value/o)}):i>t&&p.forEach(function(e){e.playbackRate.cancelScheduledValues(n.currentTime),e.playbackRate.setTargetAtTime(t,n.currentTime,f.decayTime.value/o)})}},T=function(e,t){p.forEach(function(e){e.loopStart=t*e.buffer.duration})};this.riseTime=n.createPsuedoParam("riseTime",.05,10,1,this.audioContext),this.decayTime=n.createPsuedoParam("decayTime",.05,10,1,this.audioContext),this.startPoint=new n("startPoint",0,.99,0,null,null,T,this.audioContext),this.playSpeed=null,this.multiTrackGain=[],this.maxLoops=n.createPsuedoParam("maxLoops",-1,1,-1,this.audioContext),this.setSources=function(e){this.isInitialized=!1,l(e)},this.play=function(){this.isPlaying||p.forEach(function(e,t){var n=h&&h[t]?h[t]:f.startPoint.value*e.buffer.duration;e.loop=1!==f.maxLoops.value,e.start(0,n)}),t.prototype.start.call(this,0)},this.start=function(e,n,o,i){this.isPlaying||p.forEach(function(t){if(("undefined"==typeof n||null===n)&&(n=f.startPoint.value*t.buffer.duration),("undefined"==typeof o||null===o)&&(o=t.buffer.duration),t.loop=1!==f.maxLoops.value,"undefined"!=typeof i){var a=f.audioContext.currentTime;f.releaseGainNode.gain.cancelScheduledValues(a),f.releaseGainNode.gain.setValueAtTime(0,a),f.releaseGainNode.gain.linearRampToValueAtTime(1,a+i)}t.start(e,n,o)}),t.prototype.start.call(this,e,n,o)},this.stop=function(e){this.isPlaying&&(p=p.map(function(t,n){t.stop(e),h[n]=0;var i=new o(f.audioContext);return i.buffer=t.buffer,i.loopStart=i.buffer.duration*f.startPoint.value,i.loopEnd=i.buffer.duration,i.connect(d[n]),i.onended=function(e){A(e,n)},i})),t.prototype.stop.call(this,e)},this.pause=function(){this.isPlaying&&(p=p.map(function(e,t){e.stop(0),h[t]=e.playbackPosition/e.buffer.sampleRate,e.disconnect();var n=new o(f.audioContext);return n.buffer=e.buffer,n.loopStart=n.buffer.duration*f.startPoint.value,n.loopEnd=n.buffer.duration,n.connect(d[t]),n.onended=function(e){A(e,t)},n})),t.prototype.stop.call(this,0)},l(r)}return a.prototype=Object.create(t.prototype),a}),define("models/Activity",["core/Config","core/BaseSound","models/Looper","core/SPAudioParam"],function(e,t,n,o){function i(a,r,u){function c(e){h.playSpeed.setValueAtTime(0,g.audioContext.currentTime),g.isInitialized=!0,v=0,m=0,y=0,"function"==typeof u&&u(e)}function s(e){h=new n(e,r,c,null)}function l(e,t,n){if(g.isInitialized){var o=t,i=n.currentTime,a=Math.abs(o-v),r=i-m;if(r>0){var u=Math.log(T),c=Math.log(x),s=Math.exp(u+g.sensitivity.value*(c-u));y=y>w?.5*y+.5*r:r;var l=g.maxRate.value,f=l*s*a/y;f=Math.min(Math.abs(f),b*l),h.playSpeed.value=f,A&&window.clearTimeout(A),A=window.setTimeout(function(){h.playSpeed.value=0},1e3*Math.min(10*r,C))}v=o,m=i}}function f(e,t){g.isInitialized&&(h.riseTime.value=t)}function p(e,t){g.isInitialized&&(h.decayTime.value=t)}function d(e,t){g.isInitialized&&(h.startPoint.value=t)}if(!(this instanceof i))throw new TypeError("Activity constructor cannot be called as a function.");t.call(this,r),this.maxSources=e.MAX_VOICES,this.numberOfInputs=1,this.numberOfOutputs=1;var h,m,y,A,g=this,v=0,T=.1,x=100,b=1.2,C=.1,w=.001;this.maxRate=o.createPsuedoParam("maxRate",.05,10,1,this.audioContext),this.action=new o("action",0,60,10,null,null,l,this.audioContext),this.sensitivity=o.createPsuedoParam("sensitivity",0,1,.5,this.audioContext),this.riseTime=new o("riseTime",.05,10,1,null,null,f,this.audioContext),this.decayTime=new o("decayTime",.05,10,1,null,null,p,this.audioContext),this.startPoint=new o("startPoint",0,.99,0,null,null,d,this.audioContext),this.setSources=function(e,t){this.isInitialized=!1,h.setSources(e,t)},this.play=function(e){h.play(e)},this.start=function(e,t,n){h.start(e,t,n)},this.stop=function(e){h.stop(e)},this.pause=function(){h.pause()},this.release=function(e,t){h.release(e,t)},this.disconnect=function(e){h.disconnect(e)},this.connect=function(e,t,n){h.connect(e,t,n)},s(a)}return i});