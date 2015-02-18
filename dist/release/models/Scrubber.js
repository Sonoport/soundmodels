/*javascript-sound-models - v2.1.0 - Mon Feb 16 2015 14:53:21 GMT+0800 (SGT) */ 
console.log("   ____                           __ \n" + "  / _____  ___ ___  ___ ___  ____/ /_\n" + " _\\ \\/ _ \\/ _ / _ \\/ _ / _ \\/ __/ __/\n" + "/___/\\___/_//_\\___/ .__\\___/_/  \\__/ \n" + "                 /_/                 \n" + "Hello Developer!\n" + "Thanks for using Sonoport Dynamic Sound Library v2.1.0.");
define("core/Config",[],function(){function e(){}return e.LOG_ERRORS=!0,e.ZERO=parseFloat("1e-37"),e.MAX_VOICES=8,e.NOMINAL_REFRESH_RATE=60,e.WINDOW_LENGTH=512,e.CHUNK_LENGTH=256,e.DEFAULT_SMOOTHING_CONSTANT=.05,e}),define("core/WebAudioDispatch",[],function(){function e(e,t,n){if(!n)return void console.warn("No AudioContext provided");var o=n.currentTime;o>=t||.005>t-o?e():window.setTimeout(function(){e()},1e3*(t-o))}return e}),define("core/AudioContextMonkeyPatch",[],function(){function e(e){e&&(e.setTargetAtTime||(e.setTargetAtTime=e.setTargetValueAtTime))}window.hasOwnProperty("webkitAudioContext")&&!window.hasOwnProperty("AudioContext")&&(window.AudioContext=webkitAudioContext,AudioContext.prototype.hasOwnProperty("createGain")||(AudioContext.prototype.createGain=AudioContext.prototype.createGainNode),AudioContext.prototype.hasOwnProperty("createDelay")||(AudioContext.prototype.createDelay=AudioContext.prototype.createDelayNode),AudioContext.prototype.hasOwnProperty("createScriptProcessor")||(AudioContext.prototype.createScriptProcessor=AudioContext.prototype.createJavaScriptNode),AudioContext.prototype.internal_createGain=AudioContext.prototype.createGain,AudioContext.prototype.createGain=function(){var t=this.internal_createGain();return e(t.gain),t},AudioContext.prototype.internal_createDelay=AudioContext.prototype.createDelay,AudioContext.prototype.createDelay=function(t){var n=t?this.internal_createDelay(t):this.internal_createDelay();return e(n.delayTime),n},AudioContext.prototype.internal_createBufferSource=AudioContext.prototype.createBufferSource,AudioContext.prototype.createBufferSource=function(){var t=this.internal_createBufferSource();return t.start||(t.start=function(e,t,n){t||n?this.noteGrainOn(e,t,n):this.noteOn(e)}),t.stop||(t.stop=t.noteOff),e(t.playbackRate),t},AudioContext.prototype.internal_createDynamicsCompressor=AudioContext.prototype.createDynamicsCompressor,AudioContext.prototype.createDynamicsCompressor=function(){var t=this.internal_createDynamicsCompressor();return e(t.threshold),e(t.knee),e(t.ratio),e(t.reduction),e(t.attack),e(t.release),t},AudioContext.prototype.internal_createBiquadFilter=AudioContext.prototype.createBiquadFilter,AudioContext.prototype.createBiquadFilter=function(){var t=this.internal_createBiquadFilter();return e(t.frequency),e(t.detune),e(t.Q),e(t.gain),t},AudioContext.prototype.hasOwnProperty("createOscillator")&&(AudioContext.prototype.internal_createOscillator=AudioContext.prototype.createOscillator,AudioContext.prototype.createOscillator=function(){var t=this.internal_createOscillator();return t.start||(t.start=t.noteOn),t.stop||(t.stop=t.noteOff),e(t.frequency),e(t.detune),t}))}),define("core/BaseSound",["core/WebAudioDispatch","core/AudioContextMonkeyPatch"],function(e){function t(e){function t(e){function t(){o.start(0),o.stop(e.currentTime+1e-4),window.liveAudioContexts.push(e),window.removeEventListener("touchstart",t)}var n=/(iPad|iPhone|iPod)/g.test(navigator.userAgent);if(n&&(window.liveAudioContexts||(window.liveAudioContexts=[]),window.liveAudioContexts.indexOf(e)<0)){var o=e.createOscillator(),r=e.createGain();r.gain.value=0,o.connect(r),r.connect(e.destination),window.addEventListener("touchstart",t)}}void 0===e||null===e?(console.log("Making a new AudioContext"),this.audioContext=new AudioContext):this.audioContext=e,t(this.audioContext),this.numberOfInputs=0,Object.defineProperty(this,"numberOfOutputs",{enumerable:!0,configurable:!1,get:function(){return this.releaseGainNode.numberOfOutputs}});var n=0;Object.defineProperty(this,"maxSources",{enumerable:!0,configurable:!1,set:function(e){0>e&&(e=0),n=Math.round(e)},get:function(){return n}});var o=0;Object.defineProperty(this,"minSources",{enumerable:!0,configurable:!1,set:function(e){0>e&&(e=0),o=Math.round(e)},get:function(){return o}}),this.releaseGainNode=this.audioContext.createGain(),this.isPlaying=!1,this.isInitialized=!1,this.inputNode=null,this.destinations=[],this.modelName="Model",this.onLoadProgress=null,this.onLoadComplete=null,this.onAudioStart=null,this.onAudioEnd=null,this.parameterList_=[],this.connect(this.audioContext.destination)}return t.prototype.connect=function(e,t,n){e instanceof AudioNode?(this.releaseGainNode.connect(e,t,n),this.destinations.push({destination:e,output:t,input:n})):e.inputNode instanceof AudioNode?(this.releaseGainNode.connect(e.inputNode,t,n),this.destinations.push({destination:e.inputNode,output:t,input:n})):console.error("No Input Connection - Attempts to connect "+typeof e+" to "+typeof this)},t.prototype.disconnect=function(e){this.releaseGainNode.disconnect(e),this.destinations=[]},t.prototype.start=function(t,n,o,r){("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime),this.releaseGainNode.gain.cancelScheduledValues(t),"undefined"!=typeof r?(this.releaseGainNode.gain.setValueAtTime(0,t),this.releaseGainNode.gain.linearRampToValueAtTime(1,t+r)):this.releaseGainNode.gain.setValueAtTime(1,t);var i=this;e(function(){i.isPlaying=!0},t,this.audioContext)},t.prototype.stop=function(t){("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime);var n=this;e(function(){n.isPlaying=!1},t,this.audioContext),this.releaseGainNode.gain.cancelScheduledValues(t)},t.prototype.release=function(t,n,o){if(this.isPlaying){var r=.5;if(("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime),n=n||r,this.releaseGainNode.gain.setValueAtTime(this.releaseGainNode.gain.value,t),this.releaseGainNode.gain.linearRampToValueAtTime(0,t+n),!o){var i=this;e(function(){i.pause()},t+n,this.audioContext)}}},t.prototype.setSources=function(e,t,n){this.isInitialized=!1,"function"==typeof t&&(this.onLoadProgress=t),"function"==typeof n&&(this.onLoadComplete=n)},t.prototype.play=function(){this.start(0)},t.prototype.pause=function(){this.isPlaying=!1},t.prototype.registerParameter=function(e,t){(void 0===t||null===t)&&(t=!1),Object.defineProperty(this,e.name,{enumerable:!0,configurable:t,value:e});var n=this,o=!1;this.parameterList_.forEach(function(t,r){t.name===e.name&&(n.parameterList_.splice(r,1,e),o=!0)}),o||this.parameterList_.push(e)},t.prototype.listParams=function(){return this.parameterList_},t}),define("core/SPAudioParam",["core/WebAudioDispatch","core/Config"],function(e,t){function n(n,o,r,i,a,u,s,c){var f,l=1e-4,d=500,h=0,p=!1;if(this.defaultValue=null,this.maxValue=0,this.minValue=0,this.name="",Object.defineProperty(this,"value",{enumerable:!0,configurable:!1,set:function(e){if(typeof e!=typeof a)return void console.error("Attempt to set a "+typeof a+" parameter to a "+typeof e+" value");if("number"==typeof e&&(e>i?(console.warn(this.name+" clamping to max"),e=i):r>e&&(console.warn(this.name+" clamping to min"),e=r)),h=e,"function"==typeof s&&(e=s(e)),p||window.clearInterval(f),p=!1,"function"==typeof c&&n.audioContext)c(u,e,n.audioContext);else if(u){if(u instanceof AudioParam){var o=[];o.push(u),u=o}u.forEach(function(o){n.isPlaying?o.setTargetAtTime(e,n.audioContext.currentTime,t.DEFAULT_SMOOTHING_CONSTANT):o.setValueAtTime(e,n.audioContext.currentTime)})}},get:function(){return h}}),u&&(u instanceof AudioParam||u instanceof Array))var m=u[0]||u;o?this.name=o:m&&(this.name=m.name),"undefined"!=typeof a?(this.defaultValue=a,this.value=a):m&&(this.defaultValue=m.defaultValue,this.value=m.defaultValue),"undefined"!=typeof r?this.minValue=r:m&&(this.minValue=m.minValue),"undefined"!=typeof i?this.maxValue=i:m&&(this.maxValue=m.maxValue),this.setValueAtTime=function(t,o){if(u)"function"==typeof s&&(t=s(t)),u instanceof AudioParam?u.setValueAtTime(t,o):u instanceof Array&&u.forEach(function(e){e.setValueAtTime(t,o)});else{var r=this;e(function(){r.value=t},o,n.audioContext)}},this.setTargetAtTime=function(e,t,o){if(u)"function"==typeof s&&(e=s(e)),u instanceof AudioParam?u.setTargetAtTime(e,t,o):u instanceof Array&&u.forEach(function(n){n.setTargetAtTime(e,t,o)});else{var r=this,i=r.value,a=n.audioContext.currentTime;console.log("starting automation"),f=window.setInterval(function(){n.audioContext.currentTime>=t&&(p=!0,r.value=e+(i-e)*Math.exp(-(n.audioContext.currentTime-a)/o),Math.abs(r.value-e)<l&&window.clearInterval(f))},d)}},this.setValueCurveAtTime=function(e,t,o){if(u){if("function"==typeof s)for(var r=0;r<e.length;r++)e[r]=s(e[r]);u instanceof AudioParam?u.setValueCurveAtTime(e,t,o):u instanceof Array&&u.forEach(function(n){n.setValueCurveAtTime(e,t,o)})}else{var i=this,a=n.audioContext.currentTime;f=window.setInterval(function(){if(n.audioContext.currentTime>=t){var r=Math.floor(e.length*(n.audioContext.currentTime-a)/o);r<e.length?(p=!0,i.value=e[r]):window.clearInterval(f)}},d)}},this.exponentialRampToValueAtTime=function(e,t){if(u)"function"==typeof s&&(e=s(e)),u instanceof AudioParam?u.exponentialRampToValueAtTime(e,t):u instanceof Array&&u.forEach(function(n){n.exponentialRampToValueAtTime(e,t)});else{var o=this,r=o.value,i=n.audioContext.currentTime;0===r&&(r=.001),f=window.setInterval(function(){var a=(n.audioContext.currentTime-i)/(t-i);p=!0,o.value=r*Math.pow(e/r,a),n.audioContext.currentTime>=t&&window.clearInterval(f)},d)}},this.linearRampToValueAtTime=function(e,t){if(u)"function"==typeof s&&(e=s(e)),u instanceof AudioParam?u.linearRampToValueAtTime(e,t):u instanceof Array&&u.forEach(function(n){n.linearRampToValueAtTime(e,t)});else{var o=this,r=o.value,i=n.audioContext.currentTime;f=window.setInterval(function(){var a=(n.audioContext.currentTime-i)/(t-i);p=!0,o.value=r+(e-r)*a,n.audioContext.currentTime>=t&&window.clearInterval(f)},d)}},this.cancelScheduledValues=function(e){u?u instanceof AudioParam?u.cancelScheduledValues(e):u instanceof Array&&u.forEach(function(t){t.cancelScheduledValues(e)}):window.clearInterval(f)}}return n.createPsuedoParam=function(e,t,o,r,i){return new n(e,t,o,r,i,null,null,null)},n}),define("core/DetectLoopMarkers",[],function(){function e(e){var t=0,n=0,o=!0,r=5e3,i=44100,a=.5,u=2e4,s=.01,c=1024,f=16,l=[],d=0,h=function(e,t){for(var n=0,o=t+f;t+f+c>o;++o)n+=Math.abs(e[o]);return s>n/c},p=function(e){return function(t,n,o){var r;return r=o%2===0?n[e]>a:n[e]<-a,t&&r}},m=function(o){var a=null,s=null;t=0,n=d;for(var c=0;null===a&&d>c&&u>c;){if(o.reduce(p(c),!0)&&(1!==o.length||h(o[0],c))){a=c;break}c++}for(c=d;null===s&&c>0&&u>d-c;){if(o.reduce(p(c),!0)){s=c;break}c--}var f=Math.round(r/2*e.sampleRate/i);return null!==a&&null!==s&&s>a+f?(t=a+f,n=s-f,!0):!1},y=function(e){return function(t,n){return t&&Math.abs(n[e])<s}},v=function(e){var o=!0;for(t=0;u>t&&d>t&&(o=e.reduce(y(t),!0));)t++;for(n=d;u>d-n&&n>0&&(o=e.reduce(y(n),!0));)n--;t>n&&(t=0)};d=e.length;for(var g=0;g<e.numberOfChannels;g++)l.push(new Float32Array(e.getChannelData(g)));return m(l)||(v(l),o=!1),{marked:o,start:t,end:n}}return e}),define("core/FileLoader",["core/DetectLoopMarkers"],function(e){function t(n,o,r,i){function a(){var e=Object.prototype.toString.call(n),t=/[^.]+$/.exec(n);if("[object String]"===e){var o=new XMLHttpRequest;o.open("GET",n,!0),o.responseType="arraybuffer",o.addEventListener("progress",i,!1),o.onload=function(){u(o.response,t)},o.send()}else if("[object File]"===e||"[object Blob]"===e){var r=new FileReader;r.addEventListener("progress",i,!1),r.onload=function(){u(r.result,t)},r.readAsArrayBuffer(n)}}function u(t,i){o.decodeAudioData(t,function(t){if(l=!0,s=t,c=0,f=s.length,"wav"!==i[0]){var n=e(s);n&&(c=n.start,f=n.end)}r&&"function"==typeof r&&r(!0)},function(){console.warn("Error Decoding "+n),r&&"function"==typeof r&&r(!1)})}if(!(this instanceof t))throw new TypeError("FileLoader constructor cannot be called as a function.");var s,c=0,f=0,l=!1,d=function(e){var t=/^[0-9]+$/;return t.test(e)?!0:!1},h=function(e,t){"undefined"==typeof t&&(t=s.length),d(e)?d(t)||(console.warn("Incorrect parameter Type - FileLoader getBuffer end parameter is not an integer"),t=Number.isNan(t)?0:Math.round(Number(t))):(e=Number.isNan(e)?0:Math.round(Number(e)),console.warn("Incorrect parameter Type - FileLoader getBuffer start parameter is not an integer. Coercing it to an Integer - start")),e>t&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter "+e+" should be smaller than end parameter "+t+" . Setting them to the same value "+e),t=e),(e>f||c>e)&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-"+s.length+" . Setting start to "+c),e=c),(t>f||c>t)&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-"+s.length+" . Setting start to "+f),t=f);var n=t-e;if(!s)return console.error("No Buffer Found - Buffer loading has not completed or has failed."),null;for(var r=o.createBuffer(s.numberOfChannels,n,s.sampleRate),i=0;i<s.numberOfChannels;i++){var a=new Float32Array(s.getChannelData(i));r.getChannelData(i).set(a.subarray(e,t))}return r};this.getBuffer=function(e,t){return"undefined"==typeof e&&(e=0),"undefined"==typeof t&&(t=f-c),h(c+e,c+t)},this.getRawBuffer=function(){return l?s:(console.error("No Buffer Found - Buffer loading has not completed or has failed."),null)},this.isLoaded=function(){return l},a()}return t}),define("core/SPAudioBuffer",[],function(){function e(e,t,n,o,r){if(!(e instanceof AudioContext))return void console.error("First argument to SPAudioBuffer must be a valid AudioContext");var i,a,u,s;this.audioContext=e,this.duration=null,Object.defineProperty(this,"numberOfChannels",{get:function(){return this.buffer?this.buffer.numberOfChannels:0}}),Object.defineProperty(this,"sampleRate",{get:function(){return this.buffer?this.buffer.sampleRate:0}}),this.getChannelData=function(e){return this.buffer?this.buffer.getChannelData(e):null},Object.defineProperty(this,"buffer",{set:function(e){if(null===u)this.startPoint=0;else if(u>e.length/e.sampleRate)return void console.error("SPAudioBuffer : startPoint cannot be greater than buffer length");if(null===s)this.endPoint=this.rawBuffer_.length;else if(s>e.length/e.sampleRate)return void console.error("SPAudioBuffer : endPoint cannot be greater than buffer length");a=e,this.updateBuffer()}.bind(this),get:function(){return i}}),this.sourceURL=null,Object.defineProperty(this,"startPoint",{set:function(e){return void 0!==s&&e>=s?void console.error("SPAudioBuffer : startPoint cannot be greater than endPoint"):a&&e*a.sampleRate>=a.length?void console.error("SPAudioBuffer : startPoint cannot be greater than or equal to buffer length"):(u=e,void this.updateBuffer())}.bind(this),get:function(){return u}}),Object.defineProperty(this,"endPoint",{set:function(e){return void 0!==u&&u>=e?void console.error("SPAudioBuffer : endPoint cannot be lesser than startPoint"):a&&e*a.sampleRate>=a.length?void console.error("SPAudioBuffer : endPoint cannot be greater than buffer or equal to length"):(s=e,void this.updateBuffer())}.bind(this),get:function(){return s}}),this.updateBuffer=function(){if(a){if((null===u||void 0===u)&&(u=0),(null===s||void 0===s)&&(s=a.duration),this.duration=s-u,this.length=Math.ceil(a.sampleRate*this.duration)+1,this.length>0){i&&i.length==this.length&&i.numberOfChannels==a.numberOfChannels&&i.sampleRate==a.sampleRate||(i=this.audioContext.createBuffer(a.numberOfChannels,this.length,a.sampleRate));for(var e=Math.floor(u*a.sampleRate),t=Math.ceil(s*a.sampleRate),n=0;n<a.numberOfChannels;n++){var o=new Float32Array(a.getChannelData(n));i.getChannelData(n).set(o.subarray(e,t))}}}else this.duration=0};var c=Object.prototype.toString.call(t),f=Object.prototype.toString.call(n),l=Object.prototype.toString.call(o),d=Object.prototype.toString.call(r);"[object String]"===c||"[object File]"===c?this.sourceURL=t:"[object AudioBuffer]"===c?this.buffer=t:console.warn("Incorrect Parameter Type. url can only be a String, File or an AudioBuffer"),"[object Number]"===f?this.startPoint=parseFloat(n):"[object Undefined]"!==f&&console.warn("Incorrect Parameter Type. startPoint should be a Number"),"[object Number]"===l?this.endPoint=parseFloat(o):"[object Undefined]"!==f&&console.warn("Incorrect Parameter Type. endPoint should be a Number"),"[object AudioBuffer]"!==d||this.buffer||(this.buffer=r)}return e}),define("core/MultiFileLoader",["core/FileLoader","core/SPAudioBuffer"],function(e,t){function n(n,o,r,i){function a(){if(!n)return console.log("Setting empty source. No sound may be heard"),void i(!1,l);if(!(n instanceof Array)){var e=[];e.push(n),n=e}return n.length<c.minSources||n.length>c.maxSources?(console.error("Unsupported number of Sources. "+c.modelName+" only supports a minimum of "+c.minSources+" and a maximum of "+c.maxSources+" sources. Trying to load "+n.length+"."),void i(!1,l)):(f=n.length,l=new Array(f),void n.forEach(function(e,t){u(e,s(t))}))}function u(n,o){var i,a=Object.prototype.toString.call(n);if("[object AudioBuffer]"===a)i=new t(c.audioContext,n),o(!0,i);else if(n instanceof t&&n.buffer)o(!0,n);else if("[object String]"===a||"[object File]"===a||n instanceof t&&n.sourceURL){var u;n instanceof t&&n.sourceURL?(u=n.sourceURL,i=n):(u=n,i=new t(c.audioContext,u));var s=new e(u,c.audioContext,function(e){e?(i.buffer=s.getBuffer(),o(e,i)):o(e)},function(e){r&&"function"==typeof r&&r(e,i)})}else console.error("Incorrect Parameter Type - Source is not a URL, File or AudioBuffer or doesn't have sourceURL or buffer"),o(!1,{})}function s(e){return function(t,n){if(t&&(l[e]=n),f--,0===f){for(var o=!0,r=0;r<l.length;++r)if(!l[r]){o=!1;break}i(o,l)}}}var c=this;this.audioContext=o;var f=0,l=[];a()}return n}),define("models/Scrubber",["core/Config","core/BaseSound","core/SPAudioParam","core/MultiFileLoader"],function(e,t,n,o){function r(i,a,u,s,c,f){function l(t){x&&(x.disconnect(),x=null),o.call(P,t,P.audioContext,P.onLoadProgress,I),p=e.WINDOW_LENGTH,m=p/2,S=0,g=h(p,1);for(var n=0;p>n;n++)g[n]=.25*(1-Math.cos(2*Math.PI*(n+.5)/p));T=new Float32Array(e.CHUNK_LENGTH)}function d(e){if(!P.isPlaying||!P.isInitialized){for(n=0;b>n;n++)e.outputBuffer.getChannelData(n).set(T);return B=0,U=0,void(M&&("function"==typeof P.onAudioEnd&&P.onAudioEnd(),M=!1))}for(var t,n,o=e.outputBuffer.length;o>0;){if(S>0&&o>0){var r=Math.min(o,S);for(n=0;b>n;n++){var i=y[n].subarray(m-S,m-S+r);e.outputBuffer.getChannelData(n).set(i,e.outputBuffer.length-o)}o-=r,S-=r}if(o>0){var a,u=P.playPosition.value;if(Math.abs(O-u)*A>L*C)N=u,a=0;else{var s=R*N+(1-R)*u;a=(s-N)*A/m,N=s}for(O=u,t=0;p-m>t;t++)for(n=0;b>n;n++)y[n][t]=y[n][t+m];for(t=p-m;p>t;t++)for(n=0;b>n;n++)y[n][t]=0;for(t=0;p-m>t;t++)for(n=0;b>n;n++)v[n][t]=v[n][t+m];var c=0,f=0;for(t=0;p-m>t;t++){var l=0;for(n=0;b>n;n++)l+=v[n][t];l>f&&(c=t,f=l)}var d=parseInt(N*(A-p)),h=0,x=0;for(t=0;p>t;t++){var I=0,D=(d+t)%A;for(n=0;b>n;n++)I+=w[n][D];I>x&&(x=I,h=t)}var G=h-c;for(d+=G,t=0;p>t;t++){var _=(d+t)%A;for(0>_&&(_=0),n=0;b>n;n++)v[n][t]=w[n][_]}var j=P.noMotionFade.value,U=1;j&&Math.abs(a)<V&&(U=0),B=E*B+(1-E)*U;var k=P.muteOnReverse.value;for(0>a&&k&&(B=0),M&&(k&&F>B||Math.abs(B)<F)&&(M=!1,"function"==typeof P.onAudioEnd&&P.onAudioEnd()),B>F&&!M&&(M=!0,"function"==typeof P.onAudioStart&&P.onAudioStart()),t=0;p>t;t++)for(n=0;b>n;n++)y[n][t]+=B*g[t]*v[n][t];S=m}}}function h(e,t){var n=[];(void 0===t||null===t)&&(t=1);for(var o=0;t>o;o++)n.push(new Float32Array(e));return n}if(!(this instanceof r))throw new TypeError("Scrubber constructor cannot be called as a function.");t.call(this,i),this.maxSources=1,this.minSources=1,this.modelName="Scrubber",this.onLoadProgress=u,this.onLoadComplete=s,this.onAudioStart=c,this.onAudioEnd=f;var p,m,y,v,g,A,b,C,x,T,P=this,w=[],S=0,O=0,N=0,B=0,L=1,R=.95,V=.05,E=.8,F=1e-4,M=!1,I=function(t,n){if(t){var o=n[0];A=o.length,b=o.numberOfChannels,C=o.sampleRate,w=[];for(var r=0;b>r;r++)w.push(o.getChannelData(r));x=P.audioContext.createScriptProcessor(e.CHUNK_LENGTH,0,b),x.onaudioprocess=d,x.connect(P.releaseGainNode),y=h(p,b),v=h(p,b),P.isInitialized=!0}"function"==typeof P.onLoadComplete&&P.onLoadComplete(t,n)};this.setSources=function(e,n,o){t.prototype.setSources.call(this,e,n,o),l(e)},this.registerParameter(n.createPsuedoParam(this,"playPosition",0,1,0)),this.registerParameter(n.createPsuedoParam(this,"noMotionFade",!0,!1,!0)),this.registerParameter(n.createPsuedoParam(this,"muteOnReverse",!0,!1,!0)),window.setTimeout(function(){l(a)},0)}return r.prototype=Object.create(t.prototype),r});
/**
 * @module Models
 */

"use strict";

var Config = require( 'core/Config' );
var BaseSound = require( "core/BaseSound" );
var SPAudioParam = require( "core/SPAudioParam" );
var multiFileLoader = require( "core/multiFileLoader" );
/**
 *
 * A model which loads a source and allows it to be scrubbed using a position parameter.
 *
 * @class Scrubber
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [source] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when the source has finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function Scrubber( context, source, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd ) {
    if ( !( this instanceof Scrubber ) ) {
        throw new TypeError( "Scrubber constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseSound.call( this, context );
    this.maxSources = 1;
    this.minSources = 1;
    this.modelName = 'Scrubber';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;
    this.onAudioStart = onAudioStart;
    this.onAudioEnd = onAudioEnd;

    // Private Variables
    var self = this;

    var winLen_;

    var sampleData_ = [];
    var synthStep_;
    var synthBuf_;
    var srcBuf_;
    var win_;

    var numReady_ = 0;

    var numSamples_;
    var numChannels_;
    var sampleRate_;

    var lastTargetPos_ = 0;
    var smoothPos_ = 0;

    var scale_ = 0;

    var scriptNode_;
    // Constants
    var MAX_JUMP_SECS = 1.0;
    var ALPHA = 0.95;
    var SPEED_THRESH = 0.05;
    var SPEED_ALPHA = 0.8;
    var AUDIOEVENT_TRESHOLD = 0.0001;

    var audioPlaying = false;

    var zeroArray;

    var onLoadAll = function ( status, audioBufferArray ) {
        if ( status ) {
            var sourceBuffer_ = audioBufferArray[ 0 ];

            // store audiosource attributes
            numSamples_ = sourceBuffer_.length;
            numChannels_ = sourceBuffer_.numberOfChannels;
            sampleRate_ = sourceBuffer_.sampleRate;

            sampleData_ = [];
            for ( var cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                sampleData_.push( sourceBuffer_.getChannelData( cIndex ) );
            }

            scriptNode_ = self.audioContext.createScriptProcessor( Config.CHUNK_LENGTH, 0, numChannels_ );
            scriptNode_.onaudioprocess = scriptNodeCallback;
            scriptNode_.connect( self.releaseGainNode );

            // create buffers
            synthBuf_ = newBuffer( winLen_, numChannels_ );
            srcBuf_ = newBuffer( winLen_, numChannels_ );

            self.isInitialized = true;
        }

        if ( typeof self.onLoadComplete === 'function' ) {
            self.onLoadComplete( status, audioBufferArray );
        }
    };

    function init( source ) {
        if ( scriptNode_ ) {
            scriptNode_.disconnect();
            scriptNode_ = null;
        }

        multiFileLoader.call( self, source, self.audioContext, self.onLoadProgress, onLoadAll );

        winLen_ = Config.WINDOW_LENGTH;
        synthStep_ = winLen_ / 2;
        numReady_ = 0;

        win_ = newBuffer( winLen_, 1 );
        for ( var sIndex = 0; sIndex < winLen_; sIndex++ ) {
            win_[ sIndex ] = 0.25 * ( 1.0 - Math.cos( 2 * Math.PI * ( sIndex + 0.5 ) / winLen_ ) );
        }

        zeroArray = new Float32Array( Config.CHUNK_LENGTH );
    }

    function scriptNodeCallback( processingEvent ) {
        if ( !self.isPlaying || !self.isInitialized ) {
            for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                processingEvent.outputBuffer.getChannelData( cIndex )
                    .set( zeroArray );
            }
            scale_ = 0;
            targetScale_ = 0;
            if ( audioPlaying ) {
                if ( typeof self.onAudioEnd === 'function' ) {
                    self.onAudioEnd();
                }
                audioPlaying = false;
            }
            return;
        }

        var sIndex;
        var cIndex;

        var numToGo_ = processingEvent.outputBuffer.length;

        // While we still haven't sent enough samples to the output
        while ( numToGo_ > 0 ) {
            // The challenge: because of the K-rate update, numSamples will *not* be a multiple of the
            // step size.  So... we need some way to generate in steps, but if necessary output only
            // partial steps, the remainders of which need to be saved for the next call.  Ouch!
            // Send whatever previously generated left-over samples we might have

            if ( numReady_ > 0 && numToGo_ > 0 ) {
                var numToCopy = Math.min( numToGo_, numReady_ );

                for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                    var source = synthBuf_[ cIndex ].subarray( synthStep_ - numReady_, synthStep_ - numReady_ + numToCopy );
                    processingEvent.outputBuffer.getChannelData( cIndex )
                        .set( source, processingEvent.outputBuffer.length - numToGo_ );
                }

                numToGo_ -= numToCopy;
                numReady_ -= numToCopy;
            }

            // If we still need more
            if ( numToGo_ > 0 ) {
                // Get the current target position
                var targetPos = self.playPosition.value;

                var speed;

                // If the position has jumped very suddenly by a lot
                if ( Math.abs( lastTargetPos_ - targetPos ) * numSamples_ > MAX_JUMP_SECS * sampleRate_ ) {
                    // Go directly to the new position
                    smoothPos_ = targetPos;
                    speed = 0.0;
                } else {
                    // Otherwise, ease towards it
                    var newSmoothPos = ALPHA * smoothPos_ + ( 1.0 - ALPHA ) * targetPos;
                    speed = ( newSmoothPos - smoothPos_ ) * numSamples_ / synthStep_;
                    smoothPos_ = newSmoothPos;
                }
                lastTargetPos_ = targetPos;

                // Shift the oldest samples out of the synthesis buffer
                for ( sIndex = 0; sIndex < winLen_ - synthStep_; sIndex++ ) {
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        synthBuf_[ cIndex ][ sIndex ] = synthBuf_[ cIndex ][ sIndex + synthStep_ ];
                    }
                }

                for ( sIndex = winLen_ - synthStep_; sIndex < winLen_; sIndex++ ) {
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        synthBuf_[ cIndex ][ sIndex ] = 0.0;
                    }
                }

                // Find where the maximums in the *previous* source buffer (after
                // shifting by a half frame).
                for ( sIndex = 0; sIndex < winLen_ - synthStep_; sIndex++ ) {
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        srcBuf_[ cIndex ][ sIndex ] = srcBuf_[ cIndex ][ sIndex + synthStep_ ];
                    }
                }

                var bufPeakPos_ = 0;
                var bufPeakVal = 0;
                for ( sIndex = 0; sIndex < winLen_ - synthStep_; sIndex++ ) {
                    var combinedPeakVal = 0;
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        combinedPeakVal += srcBuf_[ cIndex ][ sIndex ];
                    }
                    if ( combinedPeakVal > bufPeakVal ) {
                        bufPeakPos_ = sIndex;
                        bufPeakVal = combinedPeakVal;
                    }
                }

                var intPos = parseInt( smoothPos_ * ( numSamples_ - winLen_ ) );

                // If we're still moving (or haven't been motionless for long)
                // Find a peak in the source near the current position
                var srcPeakPos = 0;
                var srcPeakVal = 0.0;
                for ( sIndex = 0; sIndex < winLen_; sIndex++ ) {
                    var val = 0;
                    var currentPos = ( intPos + sIndex ) % numSamples_;
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        val += sampleData_[ cIndex ][ currentPos ];
                    }
                    if ( val > srcPeakVal ) {
                        srcPeakVal = val;
                        srcPeakPos = sIndex;
                    }
                }

                // Compute offset into src such that peak will align well
                // with peak in most recent output
                var shift = srcPeakPos - bufPeakPos_;

                // Grab a window's worth of source audio
                intPos += shift;
                for ( sIndex = 0; sIndex < winLen_; sIndex++ ) {
                    var copyPos = ( intPos + sIndex ) % numSamples_;
                    if ( copyPos < 0 ) {
                        copyPos = 0;
                    } // << Hack for a rare boundary case
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        srcBuf_[ cIndex ][ sIndex ] = sampleData_[ cIndex ][ copyPos ];
                    }
                }

                // Drop the volume if the rate gets really low

                var noMotionFade = self.noMotionFade.value;
                var targetScale_ = 1.0;
                if ( noMotionFade && Math.abs( speed ) < SPEED_THRESH ) {
                    targetScale_ = 0.0;
                }

                scale_ = SPEED_ALPHA * scale_ + ( 1.0 - SPEED_ALPHA ) * targetScale_;

                var muteOnReverse = self.muteOnReverse.value;

                if ( speed < 0 && muteOnReverse ) {
                    scale_ = 0.0;
                }

                if ( audioPlaying && ( ( muteOnReverse && scale_ < AUDIOEVENT_TRESHOLD ) || Math.abs( scale_ ) < AUDIOEVENT_TRESHOLD ) ) {
                    //console.log( "stopping..." );
                    audioPlaying = false;
                    if ( typeof self.onAudioEnd === 'function' ) {
                        self.onAudioEnd();
                    }

                }

                if ( scale_ > AUDIOEVENT_TRESHOLD && !audioPlaying ) {
                    //console.log( "playing..." );
                    audioPlaying = true;
                    if ( typeof self.onAudioStart === 'function' ) {
                        self.onAudioStart();
                    }
                }

                // Add the new frame into the output summing buffer
                for ( sIndex = 0; sIndex < winLen_; sIndex++ ) {
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        synthBuf_[ cIndex ][ sIndex ] += scale_ * win_[ sIndex ] * srcBuf_[ cIndex ][ sIndex ];
                    }
                }

                numReady_ = synthStep_;
            }
        }
    }

    function newBuffer( length, channels ) {
        var buf = [];
        if ( channels === undefined || channels === null ) {
            channels = 1;
        }
        for ( var cIndex = 0; cIndex < channels; cIndex++ ) {
            buf.push( new Float32Array( length ) );
        }

        return buf;
    }

    /**
     * Reinitializes a Scrubber and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} source URL or AudioBuffer or File Object of the audio source.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( source, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, source, onLoadProgress, onLoadComplete );
        init( source );
    };

    // Public Parameters

    /**
     * Position of the audio to be played.
     *
     * @property playPosition
     * @type SPAudioParam
     * @default 0.0
     * @minvalue 0.0
     * @maxvalue 1.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'playPosition', 0, 1.0, 0 ) );

    /**
     * Sets if the audio should fade out when playPosition has not changed for a while.
     *
     * @property noMotionFade
     * @type SPAudioParam
     * @default false
     * @minvalue true
     * @maxvalue false
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'noMotionFade', true, false, true ) );

    /**
     * Sets if moving playPosition to backwards should mute the model.
     *
     * @property muteOnReverse
     * @type SPAudioParam
     * @default false
     * @minvalue true
     * @maxvalue false
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'muteOnReverse', true, false, true ) );

    // Initialize the sources.
    window.setTimeout( function () {
        init( source );
    }, 0 );

}

Scrubber.prototype = Object.create( BaseSound.prototype );

module.exports = Scrubber;

},{"core/BaseSound":3,"core/Config":4,"core/SPAudioParam":8,"core/multiFileLoader":10}],2:[function(require,module,exports){
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

},{"core/AudioContextMonkeyPatch":2,"core/WebAudioDispatch":9}],4:[function(require,module,exports){
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

},{"core/Config":4,"core/WebAudioDispatch":9}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"core/FileLoader":6,"core/SPAudioBuffer":7}]},{},[1])(1)
});