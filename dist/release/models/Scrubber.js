/*javascript-sound-models - v2.0.0 - Thu Dec 04 2014 16:22:04 GMT+0800 (SGT) */ 
console.log("   ____                           __ \n" + "  / _____  ___ ___  ___ ___  ____/ /_\n" + " _\\ \\/ _ \\/ _ / _ \\/ _ / _ \\/ __/ __/\n" + "/___/\\___/_//_\\___/ .__\\___/_/  \\__/ \n" + "                 /_/                 \n" + "Hello Developer!\n" + "Thanks for using Sonoport Dynamic Sound Library v2.0.0.");
define("core/Config",[],function(){function e(){}return e.LOG_ERRORS=!0,e.ZERO=parseFloat("1e-37"),e.MAX_VOICES=8,e.NOMINAL_REFRESH_RATE=60,e.WINDOW_LENGTH=512,e.CHUNK_LENGTH=256,e.DEFAULT_SMOOTHING_CONSTANT=.05,e}),define("core/WebAudioDispatch",[],function(){function e(e,t,n){if(!n)return void console.warn("No AudioContext provided");var o=n.currentTime;o>=t||.005>t-o?e():window.setTimeout(function(){e()},1e3*(t-o))}return e}),define("core/AudioContextMonkeyPatch",[],function(){function e(e){e&&(e.setTargetAtTime||(e.setTargetAtTime=e.setTargetValueAtTime))}window.hasOwnProperty("webkitAudioContext")&&!window.hasOwnProperty("AudioContext")&&(window.AudioContext=webkitAudioContext,AudioContext.prototype.hasOwnProperty("createGain")||(AudioContext.prototype.createGain=AudioContext.prototype.createGainNode),AudioContext.prototype.hasOwnProperty("createDelay")||(AudioContext.prototype.createDelay=AudioContext.prototype.createDelayNode),AudioContext.prototype.hasOwnProperty("createScriptProcessor")||(AudioContext.prototype.createScriptProcessor=AudioContext.prototype.createJavaScriptNode),AudioContext.prototype.internal_createGain=AudioContext.prototype.createGain,AudioContext.prototype.createGain=function(){var t=this.internal_createGain();return e(t.gain),t},AudioContext.prototype.internal_createDelay=AudioContext.prototype.createDelay,AudioContext.prototype.createDelay=function(t){var n=t?this.internal_createDelay(t):this.internal_createDelay();return e(n.delayTime),n},AudioContext.prototype.internal_createBufferSource=AudioContext.prototype.createBufferSource,AudioContext.prototype.createBufferSource=function(){var t=this.internal_createBufferSource();return t.start||(t.start=function(e,t,n){t||n?this.noteGrainOn(e,t,n):this.noteOn(e)}),t.stop||(t.stop=t.noteOff),e(t.playbackRate),t},AudioContext.prototype.internal_createDynamicsCompressor=AudioContext.prototype.createDynamicsCompressor,AudioContext.prototype.createDynamicsCompressor=function(){var t=this.internal_createDynamicsCompressor();return e(t.threshold),e(t.knee),e(t.ratio),e(t.reduction),e(t.attack),e(t.release),t},AudioContext.prototype.internal_createBiquadFilter=AudioContext.prototype.createBiquadFilter,AudioContext.prototype.createBiquadFilter=function(){var t=this.internal_createBiquadFilter();return e(t.frequency),e(t.detune),e(t.Q),e(t.gain),t},AudioContext.prototype.hasOwnProperty("createOscillator")&&(AudioContext.prototype.internal_createOscillator=AudioContext.prototype.createOscillator,AudioContext.prototype.createOscillator=function(){var t=this.internal_createOscillator();return t.start||(t.start=t.noteOn),t.stop||(t.stop=t.noteOff),e(t.frequency),e(t.detune),t}))}),define("core/BaseSound",["core/WebAudioDispatch","core/AudioContextMonkeyPatch"],function(e){function t(e){function t(e){function t(){o.start(0),o.stop(e.currentTime+1e-4),window.liveAudioContexts.push(e),window.removeEventListener("touchstart",t)}var n=/(iPad|iPhone|iPod)/g.test(navigator.userAgent);if(n&&(window.liveAudioContexts||(window.liveAudioContexts=[]),window.liveAudioContexts.indexOf(e)<0)){var o=e.createOscillator(),r=e.createGain();r.gain.value=0,o.connect(r),r.connect(e.destination),window.addEventListener("touchstart",t)}}void 0===e||null===e?(console.log("Making a new AudioContext"),this.audioContext=new AudioContext):this.audioContext=e,t(this.audioContext),this.numberOfInputs=0,Object.defineProperty(this,"numberOfOutputs",{enumerable:!0,configurable:!1,get:function(){return this.releaseGainNode.numberOfOutputs}});var n=0;Object.defineProperty(this,"maxSources",{enumerable:!0,configurable:!1,set:function(e){0>e&&(e=0),n=Math.round(e)},get:function(){return n}});var o=0;Object.defineProperty(this,"minSources",{enumerable:!0,configurable:!1,set:function(e){0>e&&(e=0),o=Math.round(e)},get:function(){return o}}),this.releaseGainNode=this.audioContext.createGain(),this.isPlaying=!1,this.isInitialized=!1,this.inputNode=null,this.destinations=[],this.modelName="Model",this.onLoadProgress=null,this.onLoadComplete=null,this.onAudioStart=null,this.onAudioEnd=null,this.parameterList_=[],this.connect(this.audioContext.destination)}return t.prototype.connect=function(e,t,n){e instanceof AudioNode?(this.releaseGainNode.connect(e,t,n),this.destinations.push({destination:e,output:t,input:n})):e.inputNode instanceof AudioNode?(this.releaseGainNode.connect(e.inputNode,t,n),this.destinations.push({destination:e.inputNode,output:t,input:n})):console.error("No Input Connection - Attempts to connect "+typeof t+" to "+typeof this)},t.prototype.disconnect=function(e){this.releaseGainNode.disconnect(e),this.destinations=[]},t.prototype.start=function(t,n,o,r){("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime),this.releaseGainNode.gain.cancelScheduledValues(t),"undefined"!=typeof r?(this.releaseGainNode.gain.setValueAtTime(0,t),this.releaseGainNode.gain.linearRampToValueAtTime(1,t+r)):this.releaseGainNode.gain.setValueAtTime(1,t);var i=this;e(function(){i.isPlaying=!0},t,this.audioContext)},t.prototype.stop=function(t){("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime);var n=this;e(function(){n.isPlaying=!1},t,this.audioContext),this.releaseGainNode.gain.cancelScheduledValues(t)},t.prototype.release=function(t,n,o){if(this.isPlaying){var r=.5;if(("undefined"==typeof t||t<this.audioContext.currentTime)&&(t=this.audioContext.currentTime),n=n||r,this.releaseGainNode.gain.setValueAtTime(this.releaseGainNode.gain.value,t),this.releaseGainNode.gain.linearRampToValueAtTime(0,t+n),!o){var i=this;e(function(){i.pause()},t+n,this.audioContext)}}},t.prototype.setSources=function(e,t,n){this.isInitialized=!1,"function"==typeof t&&(this.onLoadProgress=t),"function"==typeof n&&(this.onLoadComplete=n)},t.prototype.play=function(){this.start(0)},t.prototype.pause=function(){this.isPlaying=!1},t.prototype.registerParameter=function(e,t){(void 0===t||null===t)&&(t=!1),Object.defineProperty(this,e.name,{enumerable:!0,configurable:t,value:e});var n=this,o=!1;this.parameterList_.forEach(function(t,r){t.name===e.name&&(n.parameterList_.splice(r,1,e),o=!0)}),o||this.parameterList_.push(e)},t.prototype.listParams=function(){return this.parameterList_},t}),define("core/SPAudioParam",["core/WebAudioDispatch","core/Config"],function(e,t){function n(n,o,r,i,a,u,s,c){var f,l=1e-4,d=500,h=0;if(this.defaultValue=null,this.maxValue=0,this.minValue=0,this.name="",Object.defineProperty(this,"value",{enumerable:!0,configurable:!1,set:function(e){if(typeof e!=typeof a)return void console.error("Attempt to set a "+typeof a+" parameter to a "+typeof e+" value");if("number"==typeof e&&(e>i?(console.warn(this.name+" clamping to max"),e=i):r>e&&(console.warn(this.name+" clamping to min"),e=r)),"function"==typeof s&&(e=s(e)),"function"==typeof c&&n.audioContext)c(u,e,n.audioContext);else if(u){if(u instanceof AudioParam){var o=[];o.push(u),u=o}u.forEach(function(o){n.isPlaying?o.setTargetAtTime(e,n.audioContext.currentTime,t.DEFAULT_SMOOTHING_CONSTANT):o.setValueAtTime(e,n.audioContext.currentTime)})}else window.clearInterval(f);h=e},get:function(){return u?u instanceof AudioParam?u.value:u instanceof Array?u[0].value:h:h}}),u&&(u instanceof AudioParam||u instanceof Array)){var p=u[0]||u;this.defaultValue=p.defaultValue,this.minValue=p.minValue,this.maxValue=p.maxValue,this.value=p.defaultValue,this.name=p.name}o&&(this.name=o),"undefined"!=typeof a&&(this.defaultValue=a,this.value=a),"undefined"!=typeof r&&(this.minValue=r),"undefined"!=typeof i&&(this.maxValue=i),this.setValueAtTime=function(t,o){if("function"==typeof s&&(t=s(t)),u)u instanceof AudioParam?u.setValueAtTime(t,o):u instanceof Array&&u.forEach(function(e){e.setValueAtTime(t,o)});else{var r=this;e(function(){r.value=t},o,n.audioContext)}},this.setTargetAtTime=function(e,t,o){if("function"==typeof s&&(e=s(e)),u)u instanceof AudioParam?u.setTargetAtTime(e,t,o):u instanceof Array&&u.forEach(function(n){n.setTargetAtTime(e,t,o)});else{var r=this,i=r.value,a=n.audioContext.currentTime;f=window.setInterval(function(){n.audioContext.currentTime>=t&&(r.value=e+(i-e)*Math.exp(-(n.audioContext.currentTime-a)/o),Math.abs(r.value-e)<l&&window.clearInterval(f))},d)}},this.setValueCurveAtTime=function(e,t,o){if("function"==typeof s)for(var r=0;r<e.length;r++)e[r]=s(e[r]);if(u)u instanceof AudioParam?u.setValueCurveAtTime(e,t,o):u instanceof Array&&u.forEach(function(n){n.setValueCurveAtTime(e,t,o)});else{var i=this,a=n.audioContext.currentTime;f=window.setInterval(function(){if(n.audioContext.currentTime>=t){var r=Math.floor(e.length*(n.audioContext.currentTime-a)/o);r<e.length?i.value=e[r]:window.clearInterval(f)}},d)}},this.exponentialRampToValueAtTime=function(e,t){if("function"==typeof s&&(e=s(e)),u)u instanceof AudioParam?u.exponentialRampToValueAtTime(e,t):u instanceof Array&&u.forEach(function(n){n.exponentialRampToValueAtTime(e,t)});else{var o=this,r=o.value,i=n.audioContext.currentTime;0===r&&(r=.001),f=window.setInterval(function(){var a=(n.audioContext.currentTime-i)/(t-i);o.value=r*Math.pow(e/r,a),n.audioContext.currentTime>=t&&window.clearInterval(f)},d)}},this.linearRampToValueAtTime=function(e,t){if("function"==typeof s&&(e=s(e)),u)u instanceof AudioParam?u.linearRampToValueAtTime(e,t):u instanceof Array&&u.forEach(function(n){n.linearRampToValueAtTime(e,t)});else{var o=this,r=o.value,i=n.audioContext.currentTime;f=window.setInterval(function(){var a=(n.audioContext.currentTime-i)/(t-i);o.value=r+(e-r)*a,n.audioContext.currentTime>=t&&window.clearInterval(f)},d)}},this.cancelScheduledValues=function(e){u?u instanceof AudioParam?u.cancelScheduledValues(e):u instanceof Array&&u.forEach(function(t){t.cancelScheduledValues(e)}):window.clearInterval(f)}}return n.createPsuedoParam=function(e,t,o,r,i){return new n(e,t,o,r,i,null,null,null)},n}),define("core/DetectLoopMarkers",[],function(){function e(e){var t=0,n=0,o=!0,r=5e3,i=44100,a=.5,u=2e4,s=.01,c=1024,f=16,l=[],d=0,h=function(e,t){for(var n=0,o=t+f;t+f+c>o;++o)n+=Math.abs(e[o]);return s>n/c},p=function(e){return function(t,n,o){var r;return r=o%2===0?n[e]>a:n[e]<-a,t&&r}},m=function(o){var a=null,s=null;t=0,n=d;for(var c=0;null===a&&d>c&&u>c;){if(o.reduce(p(c),!0)&&(1!==o.length||h(o[0],c))){a=c;break}c++}for(c=d;null===s&&c>0&&u>d-c;){if(o.reduce(p(c),!0)){s=c;break}c--}var f=Math.round(r/2*e.sampleRate/i);return null!==a&&null!==s&&s>a+f?(t=a+f,n=s-f,!0):!1},y=function(e){return function(t,n){return t&&Math.abs(n[e])<s}},v=function(e){var o=!0;for(t=0;u>t&&d>t&&(o=e.reduce(y(t),!0));)t++;for(n=d;u>d-n&&n>0&&(o=e.reduce(y(n),!0));)n--;t>n&&(t=0)};d=e.length;for(var g=0;g<e.numberOfChannels;g++)l.push(new Float32Array(e.getChannelData(g)));return m(l)||(v(l),o=!1),{marked:o,start:t,end:n}}return e}),define("core/FileLoader",["core/DetectLoopMarkers"],function(e){function t(n,o,r,i){function a(){var e=Object.prototype.toString.call(n),t=/[^.]+$/.exec(n);if("[object String]"===e){var o=new XMLHttpRequest;o.open("GET",n,!0),o.responseType="arraybuffer",o.addEventListener("progress",i,!1),o.onload=function(){u(o.response,t)},o.send()}else if("[object File]"===e||"[object Blob]"===e){var r=new FileReader;r.addEventListener("progress",i,!1),r.onload=function(){u(r.result,t)},r.readAsArrayBuffer(n)}}function u(t,i){o.decodeAudioData(t,function(t){if(l=!0,s=t,c=0,f=s.length,"wav"!==i[0]){var n=e(s);n&&(c=n.start,f=n.end)}r&&"function"==typeof r&&r(!0)},function(){console.warn("Error Decoding "+n),r&&"function"==typeof r&&r(!1)})}if(!(this instanceof t))throw new TypeError("FileLoader constructor cannot be called as a function.");var s,c=0,f=0,l=!1,d=function(e){var t=/^[0-9]+$/;return t.test(e)?!0:!1},h=function(e,t){"undefined"==typeof t&&(t=s.length),d(e)?d(t)||(console.warn("Incorrect parameter Type - FileLoader getBuffer end parameter is not an integer"),t=Number.isNan(t)?0:Math.round(Number(t))):(e=Number.isNan(e)?0:Math.round(Number(e)),console.warn("Incorrect parameter Type - FileLoader getBuffer start parameter is not an integer. Coercing it to an Integer - start")),e>t&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter "+e+" should be smaller than end parameter "+t+" . Setting them to the same value "+e),t=e),(e>f||c>e)&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-"+s.length+" . Setting start to "+c),e=c),(t>f||c>t)&&(console.error("Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-"+s.length+" . Setting start to "+f),t=f);var n=t-e;if(!s)return console.error("No Buffer Found - Buffer loading has not completed or has failed."),null;for(var r=o.createBuffer(s.numberOfChannels,n,s.sampleRate),i=0;i<s.numberOfChannels;i++){var a=new Float32Array(s.getChannelData(i));r.getChannelData(i).set(a.subarray(e,t))}return r};this.getBuffer=function(e,t){return"undefined"==typeof e&&(e=0),"undefined"==typeof t&&(t=f-c),h(c+e,c+t)},this.getRawBuffer=function(){return l?s:(console.error("No Buffer Found - Buffer loading has not completed or has failed."),null)},this.isLoaded=function(){return l},a()}return t}),define("core/SPAudioBuffer",[],function(){function e(e,t,n,o,r){if(!(e instanceof AudioContext))return void console.error("First argument to SPAudioBuffer must be a valid AudioContext");var i,a,u,s;this.audioContext=e,this.duration=null,Object.defineProperty(this,"numberOfChannels",{get:function(){return this.buffer?this.buffer.numberOfChannels:0}}),Object.defineProperty(this,"sampleRate",{get:function(){return this.buffer?this.buffer.sampleRate:0}}),this.getChannelData=function(e){return this.buffer?this.buffer.getChannelData(e):null},Object.defineProperty(this,"buffer",{set:function(e){if(null===u)this.startPoint=0;else if(u>e.length/e.sampleRate)return void console.error("SPAudioBuffer : startPoint cannot be greater than buffer length");if(null===s)this.endPoint=this.rawBuffer_.length;else if(s>e.length/e.sampleRate)return void console.error("SPAudioBuffer : endPoint cannot be greater than buffer length");a=e,this.updateBuffer()}.bind(this),get:function(){return i}}),this.sourceURL=null,Object.defineProperty(this,"startPoint",{set:function(e){return void 0!==s&&e>=s?void console.error("SPAudioBuffer : startPoint cannot be greater than endPoint"):a&&e*a.sampleRate>=a.length?void console.error("SPAudioBuffer : startPoint cannot be greater than or equal to buffer length"):(u=e,void this.updateBuffer())}.bind(this),get:function(){return u}}),Object.defineProperty(this,"endPoint",{set:function(e){return void 0!==u&&u>=e?void console.error("SPAudioBuffer : endPoint cannot be lesser than startPoint"):a&&e*a.sampleRate>=a.length?void console.error("SPAudioBuffer : endPoint cannot be greater than buffer or equal to length"):(s=e,void this.updateBuffer())}.bind(this),get:function(){return s}}),this.updateBuffer=function(){if(a){if((null===u||void 0===u)&&(u=0),(null===s||void 0===s)&&(s=a.duration),this.duration=s-u,this.length=Math.ceil(a.sampleRate*this.duration)+1,this.length>0){i&&i.length==this.length&&i.numberOfChannels==a.numberOfChannels&&i.sampleRate==a.sampleRate||(i=this.audioContext.createBuffer(a.numberOfChannels,this.length,a.sampleRate));for(var e=Math.floor(u*a.sampleRate),t=Math.ceil(s*a.sampleRate),n=0;n<a.numberOfChannels;n++){var o=new Float32Array(a.getChannelData(n));i.getChannelData(n).set(o.subarray(e,t))}}}else this.duration=0};var c=Object.prototype.toString.call(t),f=Object.prototype.toString.call(n),l=Object.prototype.toString.call(o),d=Object.prototype.toString.call(r);"[object String]"===c||"[object File]"===c?this.sourceURL=t:"[object AudioBuffer]"===c?this.buffer=t:console.warn("Incorrect Parameter Type. url can only be a String, File or an AudioBuffer"),"[object Number]"===f?this.startPoint=parseFloat(n):"[object Undefined]"!==f&&console.warn("Incorrect Parameter Type. startPoint should be a Number"),"[object Number]"===l?this.endPoint=parseFloat(o):"[object Undefined]"!==f&&console.warn("Incorrect Parameter Type. endPoint should be a Number"),"[object AudioBuffer]"!==d||this.buffer||(this.buffer=r)}return e}),define("core/MultiFileLoader",["core/FileLoader","core/SPAudioBuffer"],function(e,t){function n(n,o,r,i){function a(){if(!n)return console.log("Setting empty source. No sound may be heard"),void i(!1,l);if(!(n instanceof Array)){var e=[];e.push(n),n=e}return n.length<c.minSources||n.length>c.maxSources?(console.error("Unsupported number of Sources. "+c.modelName+" only supports a minimum of "+c.minSources+" and a maximum of "+c.maxSources+" sources. Trying to load "+n.length+"."),void i(!1,l)):(f=n.length,l=new Array(f),void n.forEach(function(e,t){u(e,s(t))}))}function u(n,o){var i,a=Object.prototype.toString.call(n);if("[object AudioBuffer]"===a)i=new t(c.audioContext,n),o(!0,i);else if(n instanceof t&&n.buffer)o(!0,n);else if("[object String]"===a||"[object File]"===a||n instanceof t&&n.sourceURL){var u;n instanceof t&&n.sourceURL?(u=n.sourceURL,i=n):(u=n,i=new t(c.audioContext,u));var s=new e(u,c.audioContext,function(e){e?(i.buffer=s.getBuffer(),o(e,i)):o(e)},function(e){r&&"function"==typeof r&&r(e,i)})}else console.error("Incorrect Parameter Type - Source is not a URL, File or AudioBuffer or doesn't have sourceURL or buffer"),o(!1,{})}function s(e){return function(t,n){if(t&&(l[e]=n),f--,0===f){for(var o=!0,r=0;r<l.length;++r)if(!l[r]){o=!1;break}i(o,l)}}}var c=this;this.audioContext=o;var f=0,l=[];a()}return n}),define("models/Scrubber",["core/Config","core/BaseSound","core/SPAudioParam","core/MultiFileLoader"],function(e,t,n,o){function r(i,a,u,s,c,f){function l(t){x&&(x.disconnect(),x=null),o.call(T,t,T.audioContext,T.onLoadProgress,I),p=e.WINDOW_LENGTH,m=p/2,S=0,g=h(p,1);for(var n=0;p>n;n++)g[n]=.25*(1-Math.cos(2*Math.PI*(n+.5)/p));P=new Float32Array(e.CHUNK_LENGTH)}function d(e){if(!T.isPlaying||!T.isInitialized){for(n=0;b>n;n++)e.outputBuffer.getChannelData(n).set(P);return B=0,U=0,void(M&&("function"==typeof T.onAudioEnd&&T.onAudioEnd(),M=!1))}for(var t,n,o=e.outputBuffer.length;o>0;){if(S>0&&o>0){var r=Math.min(o,S);for(n=0;b>n;n++){var i=y[n].subarray(m-S,m-S+r);e.outputBuffer.getChannelData(n).set(i,e.outputBuffer.length-o)}o-=r,S-=r}if(o>0){var a,u=T.playPosition.value;if(Math.abs(O-u)*A>L*C)N=u,a=0;else{var s=R*N+(1-R)*u;a=(s-N)*A/m,N=s}for(O=u,t=0;p-m>t;t++)for(n=0;b>n;n++)y[n][t]=y[n][t+m];for(t=p-m;p>t;t++)for(n=0;b>n;n++)y[n][t]=0;for(t=0;p-m>t;t++)for(n=0;b>n;n++)v[n][t]=v[n][t+m];var c=0,f=0;for(t=0;p-m>t;t++){var l=0;for(n=0;b>n;n++)l+=v[n][t];l>f&&(c=t,f=l)}var d=parseInt(N*(A-p)),h=0,x=0;for(t=0;p>t;t++){var I=0,D=(d+t)%A;for(n=0;b>n;n++)I+=w[n][D];I>x&&(x=I,h=t)}var G=h-c;for(d+=G,t=0;p>t;t++){var _=(d+t)%A;for(0>_&&(_=0),n=0;b>n;n++)v[n][t]=w[n][_]}var j=T.noMotionFade.value,U=1;j&&Math.abs(a)<V&&(U=0),B=E*B+(1-E)*U;var k=T.muteOnReverse.value;for(0>a&&k&&(B=0),M&&(k&&F>B||Math.abs(B)<F)&&(M=!1,"function"==typeof T.onAudioEnd&&T.onAudioEnd()),B>F&&!M&&(M=!0,"function"==typeof T.onAudioStart&&T.onAudioStart()),t=0;p>t;t++)for(n=0;b>n;n++)y[n][t]+=B*g[t]*v[n][t];S=m}}}function h(e,t){var n=[];(void 0===t||null===t)&&(t=1);for(var o=0;t>o;o++)n.push(new Float32Array(e));return n}if(!(this instanceof r))throw new TypeError("Scrubber constructor cannot be called as a function.");t.call(this,i),this.maxSources=1,this.minSources=1,this.modelName="Scrubber",this.onLoadProgress=u,this.onLoadComplete=s,this.onAudioStart=c,this.onAudioEnd=f;var p,m,y,v,g,A,b,C,x,P,T=this,w=[],S=0,O=0,N=0,B=0,L=1,R=.95,V=.05,E=.8,F=1e-4,M=!1,I=function(t,n){if(t){var o=n[0];A=o.length,b=o.numberOfChannels,C=o.sampleRate,w=[];for(var r=0;b>r;r++)w.push(o.getChannelData(r));x=T.audioContext.createScriptProcessor(e.CHUNK_LENGTH,0,b),x.onaudioprocess=d,x.connect(T.releaseGainNode),y=h(p,b),v=h(p,b),T.isInitialized=!0}"function"==typeof T.onLoadComplete&&T.onLoadComplete(t,n)};this.setSources=function(e,n,o){t.prototype.setSources.call(this,e,n,o),l(e)},this.registerParameter(n.createPsuedoParam(this,"playPosition",0,1,0)),this.registerParameter(n.createPsuedoParam(this,"noMotionFade",!0,!1,!0)),this.registerParameter(n.createPsuedoParam(this,"muteOnReverse",!0,!1,!0)),window.setTimeout(function(){l(a)},0)}return r.prototype=Object.create(t.prototype),r});