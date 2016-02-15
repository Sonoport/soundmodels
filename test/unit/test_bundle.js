// modules are defined as an array
// [ module function, map of requireuires ]
//
// map of requireuires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the requireuire for previous bundles

(function outer (modules, cache, entry) {
    // Save the require from previous bundle to this closure if any
    var previousRequire = typeof require == "function" && require;

    function findProxyquireifyName() {
        var deps = Object.keys(modules)
            .map(function (k) { return modules[k][1]; });

        for (var i = 0; i < deps.length; i++) {
            var pq = deps[i]['proxyquireify'];
            if (pq) return pq;
        }
    }

    var proxyquireifyName = findProxyquireifyName();

    function newRequire(name, jumped){
        // Find the proxyquireify module, if present
        var pqify = (proxyquireifyName != null) && cache[proxyquireifyName];

        // Proxyquireify provides a separate cache that is used when inside
        // a proxyquire call, and is set to null outside a proxyquire call.
        // This allows the regular caching semantics to work correctly both
        // inside and outside proxyquire calls while keeping the cached
        // modules isolated.
        // When switching from one proxyquire call to another, it clears
        // the cache to prevent contamination between different sets
        // of stubs.
        var currentCache = (pqify && pqify.exports._cache) || cache;

        if(!currentCache[name]) {
            if(!modules[name]) {
                // if we cannot find the the module within our internal map or
                // cache jump to the current global require ie. the last bundle
                // that was added to the page.
                var currentRequire = typeof require == "function" && require;
                if (!jumped && currentRequire) return currentRequire(name, true);

                // If there are other bundles on this page the require from the
                // previous one is saved to 'previousRequire'. Repeat this as
                // many times as there are bundles until the module is found or
                // we exhaust the require chain.
                if (previousRequire) return previousRequire(name, true);
                var err = new Error('Cannot find module \'' + name + '\'');
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
            var m = currentCache[name] = {exports:{}};

            // The normal browserify require function
            var req = function(x){
                var id = modules[name][1][x];
                return newRequire(id ? id : x);
            };

            // The require function substituted for proxyquireify
            var moduleRequire = function(x){
                var pqify = (proxyquireifyName != null) && cache[proxyquireifyName];
                // Only try to use the proxyquireify version if it has been `require`d
                if (pqify && pqify.exports._proxy) {
                    return pqify.exports._proxy(req, x);
                } else {
                    return req(x);
                }
            };

            modules[name][0].call(m.exports,moduleRequire,m,m.exports,outer,modules,currentCache,entry);
        }
        return currentCache[name].exports;
    }
    for(var i=0;i<entry.length;i++) newRequire(entry[i]);

    // Override the current require with this new one
    return newRequire;
})
({1:[function(require,module,exports){
'use strict'

var mergeDescriptors = require('merge-descriptors')
var isObject = require('is-object')
var hasOwnProperty = Object.prototype.hasOwnProperty

function fill (destination, source, merge) {
  if (destination && (isObject(source) || isFunction(source))) {
    merge(destination, source, false)
    if (isFunction(destination) && isFunction(source) && source.prototype) {
      merge(destination.prototype, source.prototype, false)
    }
  }
  return destination
}

exports = module.exports = function fillKeys (destination, source) {
  return fill(destination, source, mergeDescriptors)
}

exports.es3 = function fillKeysEs3 (destination, source) {
  return fill(destination, source, es3Merge)
}

function es3Merge (destination, source) {
  for (var key in source) {
    if (!hasOwnProperty.call(destination, key)) {
      destination[key] = source[key]
    }
  }
  return destination
}

function isFunction (value) {
  return typeof value === 'function'
}

},{"is-object":2,"merge-descriptors":4}],2:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],3:[function(require,module,exports){
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // these private functions always need `this` to be set properly

    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }
    }

    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public API
       *
       */

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
}));

},{}],4:[function(require,module,exports){
/*!
 * merge-descriptors
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module exports.
 * @public
 */

module.exports = merge

/**
 * Module variables.
 * @private
 */

var hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Merge the property descriptors of `src` into `dest`
 *
 * @param {object} dest Object to add descriptors to
 * @param {object} src Object to clone descriptors from
 * @param {boolean} [redefine=true] Redefine `dest` properties with `src` properties
 * @returns {object} Reference to dest
 * @public
 */

function merge(dest, src, redefine) {
  if (!dest) {
    throw new TypeError('argument dest is required')
  }

  if (!src) {
    throw new TypeError('argument src is required')
  }

  if (redefine === undefined) {
    // Default to true
    redefine = true
  }

  Object.getOwnPropertyNames(src).forEach(function forEachOwnPropertyName(name) {
    if (!redefine && hasOwnProperty.call(dest, name)) {
      // Skip desriptor
      return
    }

    // Copy descriptor
    var descriptor = Object.getOwnPropertyDescriptor(src, name)
    Object.defineProperty(dest, name, descriptor)
  })

  return dest
}

},{}],5:[function(require,module,exports){
'use strict'

module.exports = function createNotFoundError (path) {
  var err = new Error('Cannot find module \'' + path + '\'')
  err.code = 'MODULE_NOT_FOUND'
  return err
}

},{}],6:[function(require,module,exports){
'use strict';

var fillMissingKeys = require('fill-keys');
var moduleNotFoundError = require('module-not-found-error');

function ProxyquireifyError(msg) {
  this.name = 'ProxyquireifyError';
  Error.captureStackTrace(this, ProxyquireifyError);
  this.message = msg || 'An error occurred inside proxyquireify.';
}

function validateArguments(request, stubs) {
  var msg = (function getMessage() {
    if (!request)
      return 'Missing argument: "request". Need it to resolve desired module.';

    if (!stubs)
      return 'Missing argument: "stubs". If no stubbing is needed, use regular require instead.';

    if (typeof request != 'string')
      return 'Invalid argument: "request". Needs to be a requirable string that is the module to load.';

    if (typeof stubs != 'object')
      return 'Invalid argument: "stubs". Needs to be an object containing overrides e.g., {"path": { extname: function () { ... } } }.';
  })();

  if (msg) throw new ProxyquireifyError(msg);
}

var stubs;

function stub(stubs_) {
  stubs = stubs_;
  // This cache is used by the prelude as an alternative to the regular cache.
  // It is not read or written here, except to set it to an empty object when
  // adding stubs and to reset it to null when clearing stubs.
  module.exports._cache = {};
}

function reset() {
  stubs = undefined;
  module.exports._cache = null;
}

var proxyquire = module.exports = function (require_) {
  if (typeof require_ != 'function')
    throw new ProxyquireifyError(
        'It seems like you didn\'t initialize proxyquireify with the require in your test.\n'
      + 'Make sure to correct this, i.e.: "var proxyquire = require(\'proxyquireify\')(require);"'
    );

  reset();

  return function(request, stubs) {

    validateArguments(request, stubs);

    // set the stubs and require dependency
    // when stub require is invoked by the module under test it will find the stubs here
    stub(stubs);
    var dep = require_(request);
    reset();

    return dep;
  };
};

// Start with the default cache
proxyquire._cache = null;

proxyquire._proxy = function (require_, request) {
  function original() {
    return require_(request);
  }

  if (!stubs || !stubs.hasOwnProperty(request)) return original();

  var stub = stubs[request];

  if (stub === null) throw moduleNotFoundError(request)

  var stubWideNoCallThru = Boolean(stubs['@noCallThru']) && (stub == null || stub['@noCallThru'] !== false);
  var noCallThru = stubWideNoCallThru || (stub != null && Boolean(stub['@noCallThru']));
  return noCallThru ? stub : fillMissingKeys(stub, original());
};

if (require.cache) {
  // only used during build, so prevent browserify from including it
  var replacePreludePath = './lib/replace-prelude';
  var replacePrelude = require(replacePreludePath);
  proxyquire.browserify = replacePrelude.browserify;
  proxyquire.plugin = replacePrelude.plugin;
}

},{"fill-keys":1,"module-not-found-error":5}],7:[function(require,module,exports){
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

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
}

module.exports = AudioContextMonkeyPatch;

},{}],8:[function(require,module,exports){
/**
 * @module Core
 */
'use strict';
var SafeAudioContext = require( '../core/SafeAudioContext' );
var log = require( 'loglevel' );

/**
 * Pseudo AudioNode class the encapsulates basic functionality of an Audio Node. To be extended by all other Effects
 *
 * @class BaseEffect
 * @constructor
 * @requires AudioContextMonkeyPatch
 * @param {AudioContext} [context] AudioContext in which this Sound is defined.
 */
function BaseEffect( context ) {
    /**
     * Web Audio API's AudioContext. If the context passed to the constructor is an AudioContext, a new one is created here.
     *
     * @property audioContext
     * @type AudioContext
     */
    if ( context === undefined || context === null ) {
        log.debug( 'Making a new AudioContext' );
        this.audioContext = new SafeAudioContext();
    } else {
        this.audioContext = context;
    }

    bootAudioContext( this.audioContext );

    /**
     * The output node of this effect. This node will be connected to the next Effect or destination
     *
     * @property inputNode
     * @type AudioNode
     * @final
     */
    this.inputNode = null;

    /**
     * Number of inputs
     *
     * @property numberOfInputs
     * @type Number
     * @default 0
     */
    Object.defineProperty( this, 'numberOfInputs', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this.inputNode.numberOfOutputs || 0;
        }
    } );

    /**
     * The output node of this effect. This node will be connected to the next Effect or destination
     *
     * @property outputNode
     * @type AudioNode
     * @final
     */
    this.outputNode = null;

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
            return this.outputNode.numberOfOutputs || 0;
        }
    } );

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
     * Set of nodes the output of this effect is currently connected to.
     *
     * @property destinations
     * @type Array
     * @default
     **/
    this.destinations = [];

    /**
     * String name of the effect.
     *
     * @property modelName
     * @type String
     * @default "Model"
     **/
    this.effectName = 'Effect';

    this.isBaseEffect = true;

    this.parameterList_ = [];

    function bootAudioContext( context ) {

        var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
        var isSafari = /Safari/.test( navigator.userAgent ) && /Apple Computer/.test( navigator.vendor );
        var desiredSampleRate = typeof desiredSampleRate === 'number' ? desiredSampleRate : 44100;
        if ( isSafari ) {
            if ( context.state && context.state === 'suspended' ) {
                context.resume();
            }
        }

        function createDummyBuffer() {
            // actually this does nothing. support for older devices support iOS 8 and below
            var buffer = context.createBuffer( 1, 1, desiredSampleRate );
            var dummy = context.createBufferSource();
            dummy.buffer = buffer;
            dummy.connect( context.destination );
            dummy.start( 0 );
            dummy.disconnect();
            if ( context.state && context.state === 'suspended' ) {
                context.resume();
            }
            log.debug( 'currentTime & state ', context.currentTime, context.state );
            setTimeout( function () {
                if ( context.state && context.state === 'running' ) {
                    log.debug( 'context state', context.state );
                    document.body.removeEventListener( 'touchend', createDummyBuffer );
                }
            }, 0 );
        }
        if ( iOS ) {
            if ( !window.liveAudioContexts ) {
                window.liveAudioContexts = [];
            }
            if ( window.liveAudioContexts.indexOf( context ) < 0 ) {
                document.body.addEventListener( 'touchend', createDummyBuffer );
                window.liveAudioContexts.push( context );
            }
        }
    }
}

/**
 * If the parameter `output` is an AudioNode, it connects to the outputNode.
 * If the output is a BaseEffect, it will connect BaseEffect's outputNode to the output's inputNode.
 *
 * @method connect
 * @param {AudioNode} destination AudioNode to connect to.
 * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
 * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
 */
BaseEffect.prototype.connect = function ( destination, output, input ) {
    if ( destination instanceof AudioNode ) {
        this.outputNode.connect( destination, output, input );
        this.destinations.push( {
            'destination': destination,
            'output': output,
            'input': input
        } );
    } else if ( destination.inputNode instanceof AudioNode ) {
        this.outputNode.connect( destination.inputNode, output, input );
        this.destinations.push( {
            'destination': destination.inputNode,
            'output': output,
            'input': input
        } );
    } else {
        log.error( "No Input Connection - Attempts to connect " + ( typeof output ) + " to " + ( typeof this ) );
    }
};

/**
 * Disconnects the Sound from the AudioNode Chain.
 *
 * @method disconnect
 * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
 **/
BaseEffect.prototype.disconnect = function ( outputIndex ) {
    this.outputNode.disconnect( outputIndex );
    this.destinations = [];
};

/**
 * Registers a Parameter to the model. This ensures that the Parameter is unwritable and allows
 * to lock in the configurability of the object.
 *
 * @param  {SPAudioParam} audioParam
 */
BaseEffect.prototype.registerParameter = function ( audioParam, configurable ) {

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
BaseEffect.prototype.listParams = function () {
    return this.parameterList_;
};

// Return constructor function
module.exports = BaseEffect;

},{"../core/SafeAudioContext":19,"loglevel":3}],9:[function(require,module,exports){
/**
 * @module Core
 */

'use strict';
var SafeAudioContext = require( '../core/SafeAudioContext' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

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
        log.debug( 'Making a new AudioContext' );
        this.audioContext = new SafeAudioContext();
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
    this.releaseGainNode.gain.prevEndTime = 0;

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

    this.isBaseSound = true;

    this.dispatches_ = [];

    this.parameterList_ = [];

    this.connect( this.audioContext.destination );

    function bootAudioContext( context ) {

        var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
        var isSafari = /Safari/.test( navigator.userAgent ) && /Apple Computer/.test( navigator.vendor );
        var desiredSampleRate = typeof desiredSampleRate === 'number' ? desiredSampleRate : 44100;

        if ( isSafari ) {
            if ( context.state && context.state === 'suspended' ) {
                context.resume();
            }
        }

        function createDummyBuffer() {
            // actually this does nothing. support for older devices support iOS 8 and below
            var buffer = context.createBuffer( 1, 1, desiredSampleRate );
            var dummy = context.createBufferSource();
            dummy.buffer = buffer;
            dummy.connect( context.destination );
            dummy.start( 0 );
            dummy.disconnect();
            if ( context.state && context.state === 'suspended' ) {
                context.resume();
            }
            log.debug( 'currentTime & state ', context.currentTime, context.state );
            setTimeout( function () {
                if ( context.state && context.state === 'running' ) {
                    log.debug( 'context state', context.state );
                    document.body.removeEventListener( 'touchend', createDummyBuffer );
                }
            }, 0 );

        }
        if ( iOS || isSafari ) {
            if ( !window.liveAudioContexts ) {
                window.liveAudioContexts = [];
            }
            if ( window.liveAudioContexts.indexOf( context ) < 0 ) {
                log.debug( 'audio context created' );
                document.body.addEventListener( 'touchend', createDummyBuffer );
                window.liveAudioContexts.push( context );
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
        log.error( "No Input Connection - Attempts to connect " + ( typeof destination ) + " to " + ( typeof this ) );
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

    // Estimate the current value based on the previous ramp.
    var currentValue = 1;
    if ( this.releaseGainNode.gain.prevEndTime > when ) {
        currentValue = this.releaseGainNode.gain.prevStartValue + ( this.releaseGainNode.gain.prevTargetValue - this.releaseGainNode.gain.prevStartValue ) * ( ( when - this.releaseGainNode.gain.prevStartTime ) / ( this.releaseGainNode.gain.prevEndTime - this.releaseGainNode.gain.prevStartTime ) );
    }

    // Cancel all automation
    this.releaseGainNode.gain.cancelScheduledValues( when );
    if ( typeof attackDuration !== 'undefined' ) {
        log.debug( "Ramping from " + offset + "  in " + attackDuration );
        this.releaseGainNode.gain.setValueAtTime( currentValue, when );
        this.releaseGainNode.gain.linearRampToValueAtTime( 1, when + attackDuration );

        this.releaseGainNode.gain.prevStartTime = when;
        this.releaseGainNode.gain.prevStartValue = currentValue;
        this.releaseGainNode.gain.prevTargetValue = 1;
        this.releaseGainNode.gain.prevEndTime = when + attackDuration;

    } else {
        this.releaseGainNode.gain.setValueAtTime( 1, when );

        this.releaseGainNode.gain.prevStartTime = when;
        this.releaseGainNode.gain.prevStartValue = 1;
        this.releaseGainNode.gain.prevTargetValue = 1;
        this.releaseGainNode.gain.prevEndTime = when;
    }

    var self = this;
    this.dispatch( function () {
        self.isPlaying = true;
    }, when );
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
    this.dispatch( function () {
        self.isPlaying = false;
        self.clearDispatches();
    }, when );
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

        if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        fadeTime = fadeTime || FADE_TIME;

        // Estimate the current value based on the previous ramp.
        var currentValue = 1;
        if ( this.releaseGainNode.gain.prevEndTime > when ) {
            currentValue = this.releaseGainNode.gain.prevStartValue + ( this.releaseGainNode.gain.prevTargetValue - this.releaseGainNode.gain.prevStartValue ) * ( ( when - this.releaseGainNode.gain.prevStartTime ) / ( this.releaseGainNode.gain.prevEndTime - this.releaseGainNode.gain.prevStartTime ) );
        }

        // Set that value as static value (stop automation);
        this.releaseGainNode.gain.cancelScheduledValues( when );
        this.releaseGainNode.gain.setValueAtTime( currentValue, when );
        this.releaseGainNode.gain.linearRampToValueAtTime( 0, when + fadeTime );

        this.releaseGainNode.gain.prevStartTime = when;
        this.releaseGainNode.gain.prevStartValue = currentValue;
        this.releaseGainNode.gain.prevTargetValue = 0;
        this.releaseGainNode.gain.prevEndTime = when + fadeTime;

        // Pause the sound after currentTime + fadeTime
        if ( !resetOnRelease ) {
            var self = this;
            this.dispatch( function () {
                self.pause();
            }, when + fadeTime );
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

/**
 * Adds an sound effect to the output of this model, and connects the output of the effect to the Audio Destination
 *
 * @method setOutputEffect
 * @param {Object} effect An Sound Effect of type BaseEffect to be appended to the output of this Sound.
 */
BaseSound.prototype.setOutputEffect = function ( effect ) {
    this.disconnect();
    this.connect( effect );
    effect.connect( this.audioContext.destination );
};

BaseSound.prototype.dispatch = function ( functionCall, time ) {
    var dispatchID = webAudioDispatch( function () {
        if ( typeof dispatchID !== "undefined" ) {
            var idIndex = this.dispatches_.indexOf( dispatchID );
            if ( idIndex > -1 ) {
                this.dispatches_.splice( idIndex, 1 );
            } else {
                log.warn( "Can't find ID", dispatchID, "in the list of dispatches" );
            }
        }
        functionCall();
    }.bind( this ), time, this.audioContext );

    if ( dispatchID !== null ) {
        this.dispatches_.push( dispatchID );
    }
};

BaseSound.prototype.clearDispatches = function () {
    this.dispatches_.forEach( function ( thisId ) {
        log.debug( "Clearing timeout for", thisId );
        window.clearInterval( thisId );
    } );
    this.dispatches_ = [];
};

// Return constructor function
module.exports = BaseSound;

},{"../core/SafeAudioContext":19,"../core/WebAudioDispatch":21,"loglevel":3}],10:[function(require,module,exports){
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
Config.CHUNK_LENGTH = 2048;

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

},{}],11:[function(require,module,exports){
/**
 * @module Core
 */
"use strict";

/**
 * Helper class to convert between various ratios and musical values.
 *
 * @class Converter
 * @static
 */
function Converter() {}

/**
 * Helper method to convert a value in semitones to a value in ratio.
 *
 *
 * @method semitonesToRatio
 * @static
 * @param {Number} semiTones Value in semitones to be converted to ratio.
 *
 */
Converter.semitonesToRatio = function ( semiTones ) {
    return Math.pow( 2.0, semiTones / 12.0 );
};

/**
 * Helper method to convert a value in ratio to a value in decibel full scale dBFS.
 *
 *
 * @method ratioToDBFS
 * @static
 * @param {Number} value in ratio to be converted to dBFS.
 *
 */
Converter.ratioToDBFS = function ( ratio ) {
    return 20 * Math.log10( ratio );
};

/**
 * Helper method to convert a value in decibel full scale dBFS to a value in ratio.
 *
 *
 * @method dBFStoRatio
 * @static
 * @param {Number} value in dBFS to be converted a ratio.
 *
 */
Converter.dBFStoRatio = function ( dBFS ) {
    return Math.pow( 10.0, dBFS / 20 );
};

module.exports = Converter;

},{}],12:[function(require,module,exports){
/**
 * @module Core
 */
"use strict";
var log = require( 'loglevel' );

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
        log.debug( "Checking for loop marks at " + position );
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
            log.debug( "Found loop between " + nLoopStart_ + " - " + nLoopEnd_ );
            log.debug( "Spikes at  " + startSpikePos + " - " + endSpikePos );
            return true;
        } else {
            // Spikes not found!
            log.debug( "No loop found" );
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

},{"loglevel":3}],13:[function(require,module,exports){
/**
 * @module Core
 */
"use strict";
var detectLoopMarkers = require( '../core/DetectLoopMarkers' );
var log = require( 'loglevel' );

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
            log.debug( "Incorrect parameter Type - FileLoader getBuffer start parameter is not an integer. Coercing it to an Integer - start" );
        } else if ( !isInt_( end ) ) {
            log.debug( "Incorrect parameter Type - FileLoader getBuffer end parameter is not an integer" );
            end = Number.isNan( end ) ? 0 : Math.round( Number( end ) );
        }
        // Check if start is smaller than end
        if ( start > end ) {
            log.warn( "Incorrect parameter Type - FileLoader getBuffer start parameter " + start + " should be smaller than end parameter " + end + " . Setting them to the same value " + start );
            end = start;
        }
        // Check if start is within the buffer size
        if ( start > loopEnd_ || start < loopStart_ ) {
            log.warn( "Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-" + rawBuffer_.length + " . Setting start to " + loopStart_ );
            start = loopStart_;
        }

        // Check if end is within the buffer size
        if ( end > loopEnd_ || end < loopStart_ ) {
            log.warn( "Incorrect parameter Type - FileLoader getBuffer start parameter should be within the buffer size : 0-" + rawBuffer_.length + " . Setting start to " + loopEnd_ );
            end = loopEnd_;
        }

        var length = end - start;

        if ( !rawBuffer_ ) {
            log.error( "No Buffer Found - Buffer loading has not completed or has failed." );
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
            log.error( "Error Decoding " + URL );
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
            log.error( "No Buffer Found - Buffer loading has not completed or has failed." );
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

},{"../core/DetectLoopMarkers":12,"loglevel":3}],14:[function(require,module,exports){
 /**
  * @module Core
  *
  * @class MuliFileLoader
  * @static
  */

 "use strict";

 var FileLoader = require( '../core/FileLoader' );
 var SPAudioBuffer = require( '../core/SPAudioBuffer' );
 var log = require( 'loglevel' );

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
             log.debug( "Setting empty source. No sound may be heard" );
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
             log.error( "Unsupported number of Sources. " + self.modelName + " only supports a minimum of " + self.minSources + " and a maximum of " + self.maxSources + " sources. Trying to load " + sources.length + "." );
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
         } else if ( source && source.isSPAudioBuffer && source.buffer ) {
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
             log.error( "Incorrect Parameter Type - Source is not a URL, File or AudioBuffer or doesn't have sourceURL or buffer" );
             onSingleLoad( false, {} );
         }
     }

     function onSingleLoadAt( index ) {
         return function ( status, loadedSound ) {
             if ( status ) {
                 log.debug( "Loaded track", index, "successfully" );
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

},{"../core/FileLoader":13,"../core/SPAudioBuffer":15,"loglevel":3}],15:[function(require,module,exports){
/**
 * @module Core
 */

"use strict";
var log = require( 'loglevel' );

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
        log.error( 'First argument to SPAudioBuffer must be a valid AudioContext' );
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
                log.error( "SPAudioBuffer : startPoint cannot be greater than buffer length" );
                return;
            }
            if ( endPoint_ === null ) {
                this.endPoint = this.rawBuffer_.length;
            } else if ( endPoint_ > buffer.length / buffer.sampleRate ) {
                log.error( "SPAudioBuffer : endPoint cannot be greater than buffer length" );
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
                log.error( "SPAudioBuffer : startPoint cannot be greater than endPoint" );
                return;
            }

            if ( rawBuffer_ && ( startPoint * rawBuffer_.sampleRate ) >= rawBuffer_.length ) {
                log.error( "SPAudioBuffer : startPoint cannot be greater than or equal to buffer length" );
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
                log.error( "SPAudioBuffer : endPoint cannot be lesser than startPoint" );
                return;
            }

            if ( rawBuffer_ && ( endPoint * rawBuffer_.sampleRate ) >= rawBuffer_.length ) {
                log.error( "SPAudioBuffer : endPoint cannot be greater than buffer or equal to length" );
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
        log.error( "Incorrect Parameter Type. url can only be a String, File or an AudioBuffer" );
    }

    if ( startPointType === "[object Number]" ) {
        this.startPoint = parseFloat( startPoint );
    } else {
        if ( startPointType !== "[object Undefined]" ) {
            log.warn( "Incorrect Parameter Type. startPoint should be a Number. Setting startPoint to 0" );
        }
    }

    if ( endPointType === "[object Number]" ) {
        this.endPoint = parseFloat( endPoint );
    } else {
        if ( startPointType !== "[object Undefined]" ) {
            log.warn( "Incorrect Parameter Type. endPoint should be a Number. Setting endPoint to end of dile" );
        }
    }

    if ( bufferType === "[object AudioBuffer]" && !this.buffer ) {
        this.buffer = audioBuffer;
    }
}
module.exports = SPAudioBuffer;

},{"loglevel":3}],16:[function(require,module,exports){
/**
 * @module Core
 */

"use strict";
var SPPlaybackRateParam = require( '../core/SPPlaybackRateParam' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * A wrapper around the AudioBufferSourceNode to be able to track the current playPosition of a AudioBufferSourceNode.
 *
 * @class SPAudioBufferSourceNode
 * @constructor
 * @param {AudioContext} AudioContext to be used in timing the parameter automation events
 */
function SPAudioBufferSourceNode( audioContext ) {
    var bufferSourceNode_ = audioContext.createBufferSource();
    var counterNode_;

    var scopeNode_ = audioContext.createScriptProcessor( 256, 1, 1 );
    var trackGainNode_ = audioContext.createGain();
    var lastPos = 0;

    this.audioContext = audioContext;
    this.playbackState = 0;

    this.channelCount = null;
    this.channelCountMode = null;
    this.channelInterpretation = null;
    this.numberOfInputs = null;
    this.numberOfOutputs = null;

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
    this.playbackRate = null;

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
            if ( bufferSourceNode_ ) {
                bufferSourceNode_.disconnect();
            }

            if ( counterNode_ ) {
                counterNode_.disconnect();
            }

            bufferSourceNode_ = audioContext.createBufferSource();
            counterNode_ = audioContext.createBufferSource();
            if ( buffer.isSPAudioBuffer ) {
                bufferSourceNode_.buffer = buffer.buffer;
                counterNode_.buffer = createCounterBuffer( buffer.buffer );
            } else if ( buffer instanceof AudioBuffer ) {
                bufferSourceNode_.buffer = buffer;
                counterNode_.buffer = createCounterBuffer( buffer );
            }

            counterNode_.connect( scopeNode_ );
            bufferSourceNode_.connect( trackGainNode_ );

            this.channelCount = bufferSourceNode_.channelCount;
            this.channelCountMode = bufferSourceNode_.channelCountMode;
            this.channelInterpretation = bufferSourceNode_.channelInterpretation;
            this.numberOfInputs = bufferSourceNode_.numberOfInputs;
            this.numberOfOutputs = bufferSourceNode_.numberOfOutputs;

            this.playbackRate = new SPPlaybackRateParam( this, bufferSourceNode_.playbackRate, counterNode_.playbackRate );

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
        if ( this.playbackState === this.UNSCHEDULED_STATE ) {
            if ( duration === undefined || duration === null ) {
                bufferSourceNode_.start( when, offset );
                counterNode_.start( when, offset );
            } else {
                bufferSourceNode_.start( when, offset, duration );
                counterNode_.start( when, offset, duration );
            }

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
            log.debug( 'Resetting BufferSource', self.buffer.length );
            // Disconnect source(s) from output.

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

        audioBuf.getChannelData( 0 ).set( array );
        return audioBuf;
    }

    function init() {
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

},{"../core/SPPlaybackRateParam":18,"../core/WebAudioDispatch":21,"loglevel":3}],17:[function(require,module,exports){
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

},{"../core/Config":10,"../core/WebAudioDispatch":21,"loglevel":3}],18:[function(require,module,exports){
/**
 * @module Core
 */
"use strict";
var Config = require( '../core/Config' );

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
    this.isSPPlaybackRateParam = true;

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

},{"../core/Config":10}],19:[function(require,module,exports){
/**
 * @module Core
 *
 */
'use strict';
require( '../core/AudioContextMonkeyPatch' )();
var log = require( 'loglevel' );
/*
 *  Check for erroreous samplerate in iOS and re-creates a brand new AudioContext.
 *
 * @class SafeAudioContext
 */
function SafeAudioContext() {

    var desiredSampleRate = typeof desiredSampleRate === 'number' ? desiredSampleRate : 44100;
    log.debug( 'desiredSampleRate', desiredSampleRate );
    var context = new AudioContext();
    var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
    // In iOS devices sampleRate can sometimes report 48000
    if ( iOS && context.sampleRate !== desiredSampleRate ) {
        log.debug( 'bad sample rate', context.sampleRate );
        context.close(); // close the old one
        context = new AudioContext(); // Make a new one
    }

    return context;
}

module.exports = SafeAudioContext;

},{"../core/AudioContextMonkeyPatch":7,"loglevel":3}],20:[function(require,module,exports){
/**
 * @module Core
 */
"use strict";
var Config = require( '../core/Config' );
var Looper = require( '../models/Looper' );
var webaudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * A primitive which allows events on other Sound Models to be queued based on time of execution and executed at the appropriate time. Enables polyphony.
 *
 * Currently supports these types of events. </br>
 * ["QESTOP", "QESTART", "QESETPARAM", "QESETSRC", "QERELEASE" ]
 *
 * @class SoundQueue
 * @constructor
 * @param {AudioContext} context AudioContext to be used in running the queue.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 * @param {Number} [numberOfVoices] Number of polyphonic voices the Queue can have.
 *
 */
function SoundQueue( context, onAudioStart, onAudioEnd, numberOfVoices ) {
    if ( !( this instanceof SoundQueue ) ) {
        throw new TypeError( "SoundQueue constructor cannot be called as a function." );
    }

    if ( typeof numberOfVoices === 'undefined' ) {
        numberOfVoices = Config.MAX_VOICES;
    }

    // Private Variables
    var self = this;

    this.onAudioEnd = onAudioEnd;
    this.onAudioStart = onAudioStart;

    var eventQueue_ = [];
    var busyVoices_ = [];
    var freeVoices_ = [];

    var vIndex;

    // Private Functions

    function soundQueueCallback() {
        processEventsTill( context.currentTime + 1 / Config.NOMINAL_REFRESH_RATE );
        window.requestAnimationFrame( soundQueueCallback );
    }

    function init() {
        for ( var i = 0; i < numberOfVoices; i++ ) {
            freeVoices_[ i ] = new Looper( context, null, null, null, null, null, onVoiceEnded );
            freeVoices_[ i ].disconnect();
            freeVoices_[ i ].maxLoops.value = 1;
            freeVoices_[ i ].voiceIndex = i;
        }

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        window.requestAnimationFrame( soundQueueCallback );

    }

    function onVoiceEnded( endedVoice ) {
        log.debug( "freeing " + endedVoice.voiceIndex );
        freeVoices_.push( endedVoice );
        busyVoices_.splice( busyVoices_.indexOf( endedVoice ), 1 );

        var noPlayableEvents = eventQueue_.reduce( function ( prev, thisEvent ) {
            return prev || thisEvent.type !== 'QESTART';
        }, ( eventQueue_.length === 0 ) );

        if ( self.isPlaying && busyVoices_.length === 0 && noPlayableEvents ) {
            self.isPlaying = false;
            if ( typeof self.onAudioEnd === 'function' ) {
                self.onAudioEnd();
            }
        }
    }

    function findVoiceWithID( eventID ) {
        for ( vIndex = 0; vIndex < busyVoices_.length; vIndex++ ) {
            if ( busyVoices_[ vIndex ].eventID == eventID ) {
                return busyVoices_[ vIndex ];
            }
        }
        return null;
    }

    function dequeueEventsHavingID( eventID ) {
        for ( var eventIndex = 0; eventIndex < eventQueue_.length; eventIndex++ ) {
            var thisEvent = eventQueue_[ eventIndex ];
            if ( thisEvent.eventID === eventID ) {
                eventQueue_.splice( eventIndex, 1 );
                eventIndex--;
            }
        }
    }

    function getFreeVoice( eventID, eventTime ) {
        var newVoice;
        if ( freeVoices_.length < 1 ) {
            log.debug( "No free voices left. Stealing the oldest" );
            newVoice = busyVoices_.shift();
            dequeueEventsHavingID( newVoice.eventID );
            newVoice.eventID = eventID;
            newVoice.release( context.currentTime, eventTime - context.currentTime, true );
            busyVoices_.push( newVoice );
        } else {
            newVoice = freeVoices_.shift();
            newVoice.eventID = eventID;
            busyVoices_.push( newVoice );
        }

        return newVoice;
    }

    function processSingleEvent( thisEvent ) {
        var selectedVoice = findVoiceWithID( thisEvent.eventID );

        if ( ( thisEvent.type == 'QESTART' || thisEvent.type == 'QESETPARAM' || thisEvent.type == 'QESETSRC' ) && selectedVoice === null ) {
            selectedVoice = getFreeVoice( thisEvent.eventID, thisEvent.time );
        }

        // If voice is still null/defined, then skip the event
        if ( !selectedVoice ) {
            return;
        }

        log.debug( "Processing " + thisEvent.type + " : " + thisEvent.eventID + " at " + thisEvent.time + " on " + selectedVoice.voiceIndex );

        if ( thisEvent.type == 'QESTART' ) {
            log.info( "starting " + selectedVoice.voiceIndex );
            selectedVoice.start( thisEvent.time, thisEvent.offset, undefined, thisEvent.attackDuration );
            webaudioDispatch( function () {
                if ( !self.isPlaying ) {
                    self.isPlaying = true;
                    if ( typeof self.onAudioStart === 'function' ) {
                        self.onAudioStart();
                    }
                }
            }, thisEvent.time, context );
        } else if ( thisEvent.type == 'QESETPARAM' ) {
            if ( selectedVoice[ thisEvent.paramName ] ) {
                selectedVoice[ thisEvent.paramName ].setValueAtTime( thisEvent.paramValue, thisEvent.time );
            }
        } else if ( thisEvent.type == 'QESETSRC' ) {
            selectedVoice.setSources( thisEvent.sourceBuffer );
        } else if ( thisEvent.type == 'QERELEASE' ) {
            log.debug( "releasing " + selectedVoice.voiceIndex );
            selectedVoice.release( thisEvent.time, thisEvent.releaseDuration );
        } else if ( thisEvent.type == 'QESTOP' ) {
            selectedVoice.pause( thisEvent.time );
            webaudioDispatch( function () {
                freeVoices_.push( selectedVoice );
                busyVoices_.splice( busyVoices_.indexOf( selectedVoice ), 1 );
            }, thisEvent.time, context );
        } else {
            log.warn( "Unknown Event Type : " + thisEvent );
        }
    }

    function processEventsTill( maxTime ) {
        for ( var eventIndex = 0; eventIndex < eventQueue_.length; eventIndex++ ) {
            var thisEvent = eventQueue_[ eventIndex ];
            if ( thisEvent.time <= maxTime ) {
                processSingleEvent( thisEvent );
                eventQueue_.splice( eventIndex, 1 );
                eventIndex--;
            }
        }
    }

    // Public Properties
    this.isPlaying = false;

    // Public Functions

    /**
     * Enqueue a Start event.
     *
     * @method queueStart
     * @param {Number} time Time (in seconds) at which the voice will start.
     * @param {Number} eventID Arbitary ID which is common for all related events.
     * @param {Number} [offset] The starting in seconds position of the playhead.
     * @param {Number} [attackDuration] Attack Duration (in seconds) for attack envelope during start.
     */
    this.queueStart = function ( time, eventID, offset, attackDuration ) {
        eventQueue_.push( {
            'type': 'QESTART',
            'time': time,
            'eventID': eventID,
            'offset': offset,
            'attackDuration': attackDuration
        } );
    };

    /**
     * Enqueue a Release event.
     *
     * @method queueRelease
     * @param {Number} time Time (in seconds) at which the voice will release.
     * @param {Number} eventID Arbitary ID which is common for all related events.
     * @param {Number} releaseDuration Time (in seconds) on the length of the release
     */
    this.queueRelease = function ( time, eventID, releaseDuration ) {
        eventQueue_.push( {
            'type': 'QERELEASE',
            'time': time,
            'eventID': eventID,
            'releaseDuration': releaseDuration
        } );
    };

    /**
     * Enqueue a Stop event.
     *
     * @method queueStop
     * @param {Number} time Time (in seconds) at which the voice will stop.
     * @param {Number} eventID Arbitary ID which is common for all related events.
     */
    this.queueStop = function ( time, eventID ) {
        eventQueue_.push( {
            'type': 'QESTOP',
            'time': time,
            'eventID': eventID
        } );
    };

    /**
     * Enqueue a Set Parameter event.
     *
     * @method queueSetParameter
     * @param {Number} time Time (in seconds) at which the voice parameter will be set.
     * @param {Number} eventID Arbitary ID which is common for all related events.
     * @param {String} paramName Name of the parameter to be set.
     * @param {Boolean/Number} paramValue Value for the Parameter to be set.

     */
    this.queueSetParameter = function ( time, eventID, paramName, paramValue ) {
        eventQueue_.push( {
            'type': 'QESETPARAM',
            'time': time,
            'eventID': eventID,
            'paramName': paramName,
            'paramValue': paramValue
        } );
    };

    /**
     * Enqueue a Set Source event.
     *
     * @method queueSetSource
     * @param {Number} time Time (in seconds) at which the voice source will be set.
     * @param {Number} eventID Arbitary ID which is common for all related events.
     * @param {AudioBuffer} sourceBuffer AudioBuffer to be set as source for a voice.
     */
    this.queueSetSource = function ( time, eventID, sourceBuffer ) {
        eventQueue_.push( {
            'type': 'QESETSRC',
            'time': time,
            'eventID': eventID,
            'sourceBuffer': sourceBuffer
        } );
    };

    /**
     * Updates the Queued Event(s).
     *
     * @method queueUpdate
     * @param {String} Type of the event to be updated.
     * @param {Number} eventID ID of the event to be updated. Null for all events of this type.
     * @param {String} propertyName Name of the property to be updated.
     * @param {Boolean/Number} propertyValue Value for the property to be updated
     */
    this.queueUpdate = function ( eventType, eventID, propertyName, propertyValue ) {
        for ( var eventIndex = 0; eventIndex < eventQueue_.length; eventIndex++ ) {
            var thisEvent = eventQueue_[ eventIndex ];
            if ( thisEvent.type === eventType && ( !eventID || thisEvent.eventID == eventID ) ) {
                if ( thisEvent.hasOwnProperty( propertyName ) ) {
                    thisEvent[ propertyName ] = propertyValue;
                }
            }
        }
    };

    /**
     * Pauses the SoundQueue. All queued voices are stopped and released.
     *
     * @method clear
     */
    this.pause = function () {
        this.stop( 0 );
    };

    /**
     * Clears the SoundQueue. All queued voices are stopped and released.
     *
     * @method clear
     * @param {Number} [when] A timestamp describing when to clear the SoundQueue
     */
    this.stop = function ( when ) {
        processEventsTill( when );
        eventQueue_ = [];
        busyVoices_.forEach( function ( thisVoice ) {
            thisVoice.release( when );
        } );
        freeVoices_.forEach( function ( thisVoice ) {
            thisVoice.stop( when );
        } );
    };

    /**
     * Connect the SoundQueue to an output. Connects all the internal voices to the output.
     *
     * @method connect
     * @param {AudioNode} destination AudioNode to connect to.
     * @param {Number} [output] Index describing which output of the AudioNode from which to connect.
     * @param {Number} [input] Index describing which input of the destination AudioNode to connect to.
     */
    this.connect = function ( destination, output, input ) {
        freeVoices_.forEach( function ( thisVoice ) {
            thisVoice.connect( destination, output, input );
        } );

        busyVoices_.forEach( function ( thisVoice ) {
            thisVoice.connect( destination, output, input );
        } );
    };

    /**
     * Disconnects the Sound from the AudioNode Chain.
     *
     * @method disconnect
     * @param {Number} [outputIndex] Index describing which output of the AudioNode to disconnect.
     */
    this.disconnect = function ( outputIndex ) {
        freeVoices_.forEach( function ( thisVoice ) {
            thisVoice.disconnect( outputIndex );
        } );

        busyVoices_.forEach( function ( thisVoice ) {
            thisVoice.disconnect( outputIndex );
        } );
    };

    init();
}

module.exports = SoundQueue;

},{"../core/Config":10,"../core/WebAudioDispatch":21,"../models/Looper":29,"loglevel":3}],21:[function(require,module,exports){
/**
 * @module Core
 *
 * @class WebAudioDispatch
 * @static
 */
"use strict";
var log = require( 'loglevel' );

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
        log.error( "No AudioContext provided" );
        return;
    }
    var currentTime = audioContext.currentTime;
    // Dispatch anything that's scheduled for anything before current time, current time and the next 5 msecs
    if ( currentTime >= time || time - currentTime < 0.005 ) {
        log.debug( "Dispatching now" );
        functionCall();
        return null;
    } else {
        log.debug( "Dispatching in", ( time - currentTime ) * 1000, 'ms' );
        return window.setTimeout( function () {
            log.debug( "Diff at dispatch", ( time - audioContext.currentTime ) * 1000, 'ms' );
            functionCall();
        }, ( time - currentTime ) * 1000 );
    }
}

module.exports = WebAudioDispatch;

},{"loglevel":3}],22:[function(require,module,exports){
/**
 * @module Effects
 */

"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );

/**
 *
 * An effect changes the amplitude or volume of the audio that this effect is connected to.
 * @class Compressor
 * @constructor
 * @param {AudioContext} [context] AudioContext to be used.
 * @extends BaseEffect
 */
function Compressor( context ) {
    if ( !( this instanceof Compressor ) ) {
        throw new TypeError( "Compressor constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Compressor';

    var compressor_ = this.audioContext.createDynamicsCompressor();
    this.inputNode = compressor_;
    this.outputNode = compressor_;

    /**
     * The amount of time (in seconds) to reduce the gain by 10dB.
     *
     * @property attack
     * @type SPAudioParam
     * @default 0.003
     * @minvalue 0
     * @maxvalue 1
     */
    this.registerParameter( new SPAudioParam( this, 'attack', 0, 1, 0.003, compressor_.attack ), false );

    /**
     * A decibel value representing the range above the threshold where the curve * smoothly transitions to the "ratio" portion.
     *
     * @property knee
     * @type SPAudioParam
     * @default 30
     * @minvalue 0
     * @maxvalue 40
     */
    this.registerParameter( new SPAudioParam( this, 'knee', 0, 40, 30, compressor_.knee ), false );

    /**
     * The amount of dB change in input for a 1 dB change in output.
     *
     * @property ratio
     * @type SPAudioParam
     * @default 12
     * @minvalue 1
     * @maxvalue 20
     */
    this.registerParameter( new SPAudioParam( this, 'ratio', 0, 20, 12, compressor_.ratio ), false );

    /**
     * The amount of time (in seconds) to increase the gain by 10dB.
     *
     * @property release
     * @type SPAudioParam
     * @default 0.250
     * @minvalue 0
     * @maxvalue 1
     */
    this.registerParameter( new SPAudioParam( this, 'release', 0, 1, 0.250, compressor_.release ), false );

    /**
     * The decibel value above which the compression will start taking effect.
     *
     * @property threshold
     * @type SPAudioParam
     * @default -24
     * @minvalue -100
     * @maxvalue 0
     */
    this.registerParameter( new SPAudioParam( this, 'threshold', -100, 0, -24, compressor_.threshold ), false );

    this.isInitialized = true;
}

Compressor.prototype = Object.create( BaseEffect.prototype );

module.exports = Compressor;

},{"../core/BaseEffect":8,"../core/SPAudioParam":17}],23:[function(require,module,exports){
/**
 * @module Effects
 */

"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );

/**
 *
 * An effect changes the amplitude or volume of the audio that this effect is connected to.
 * @class Distorter
 * @constructor
 * @param {AudioContext} [context] AudioContext to be used.
 * @extends BaseEffect
 */
function Distorter( context ) {
    if ( !( this instanceof Distorter ) ) {
        throw new TypeError( "Distorter constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Distorter';

    var waveshaper_ = this.audioContext.createWaveShaper();
    var filter_ = this.audioContext.createBiquadFilter();
    this.inputNode = filter_;
    this.outputNode = waveshaper_;

    filter_.type = 'bandpass';
    filter_.connect( waveshaper_ );

    var curveLength_ = 22050;
    var curve_ = new Float32Array( curveLength_ );
    var deg_ = Math.PI / 180;

    function driveSetter_( param, value ) {
        var k = value * 100;

        for ( var i = 0; i < curveLength_; i++ ) {
            var x = i * 2 / curveLength_ - 1;
            curve_[ i ] = ( 3 + k ) * x * 20 * deg_ / ( Math.PI + k * Math.abs( x ) );
        }
        waveshaper_.curve = curve_;
    }

    /**
     * Fades or reduces the volume of the audio based on the value in percentage. 100% implies
     * no change in volume. 0% implies completely muted audio.
     *
     * @property volume
     * @type SPAudioParam
     * @default 100
     * @minvalue 0
     * @maxvalue 100
     */
    this.registerParameter( new SPAudioParam( this, 'drive', 0, 1.0, 0.5, null, null, driveSetter_ ), false );

    /**
     *
     *
     * @property volume
     * @type SPAudioParam
     * @default 100
     * @minvalue 0
     * @maxvalue 100
     */
    this.registerParameter( new SPAudioParam( this, 'color', 0, 22050, 800, filter_.frequency ), false );

    this.isInitialized = true;
}

Distorter.prototype = Object.create( BaseEffect.prototype );

module.exports = Distorter;

},{"../core/BaseEffect":8,"../core/SPAudioParam":17}],24:[function(require,module,exports){
/**
 * @module Effects
 */

"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );
var Converter = require( '../core/Converter' );
var log = require( 'loglevel' );

/**
 *
 * An effect changes the amplitude or volume of the audio that this effect is connected to.
 * @class Fader
 * @constructor
 * @param {AudioContext} [context] AudioContext to be used.
 * @extends BaseEffect
 */
function Fader( context ) {
    if ( !( this instanceof Fader ) ) {
        throw new TypeError( "Fader constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Fader';

    var faderGain_ = this.audioContext.createGain();
    this.inputNode = faderGain_;
    this.outputNode = faderGain_;

    function faderGainMap( volume ) {
        log.debug( "Setting volume to ", volume / 100.0 );
        return volume / 100.0;
    }

    function faderGainMapDB( volumeInDB ) {
        log.debug( "Setting volume (DB) to ", Converter.dBFStoRatio( volumeInDB ) );
        return Converter.dBFStoRatio( volumeInDB );
    }

    /**
     * Fades or reduces the volume of the audio based on the value in percentage. 100% implies
     * no change in volume. 0% implies completely muted audio.
     *
     * @property volume
     * @type SPAudioParam
     * @default 100
     * @minvalue 0
     * @maxvalue 100
     */
    this.registerParameter( new SPAudioParam( this, 'volume', 0, 100, 100, faderGain_.gain, faderGainMap, null ), false );

    /**
     * Fades or reduces the volume of the audio based on the value in decibles. 0 dB implies no
     * change in volume. -80 dB implies almost completely muted audio.
     *
     * @property volumeInDB
     * @type SPAudioParam
     * @default 0
     * @minvalue -80
     * @maxvalue 0
     */
    this.registerParameter( new SPAudioParam( this, 'volumeInDB', -80, 0, 0, faderGain_.gain, faderGainMapDB, null ), false );

    this.isInitialized = true;
}

Fader.prototype = Object.create( BaseEffect.prototype );

module.exports = Fader;

},{"../core/BaseEffect":8,"../core/Converter":11,"../core/SPAudioParam":17,"loglevel":3}],25:[function(require,module,exports){
/**
 * @module Effects
 */
"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );

/**
 *
 * A simple stereo fader which moves the stereophonic image of the source left or right.
 * @class Filter
 * @constructor
 * @extends BaseEffect
 */
function Filter( context ) {
    if ( !( this instanceof Filter ) ) {
        throw new TypeError( "Filter constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Filter';

    var filter_ = this.audioContext.createBiquadFilter();

    this.inputNode = filter_;
    this.outputNode = filter_;

    function typeSetter( aParams, value ) {
        if ( typeof value === 'string' ) {
            filter_.type = value;
        } else {
            console.warn( "Unknown filter type", value );
        }
    }

    /**
     *The frequency at which the BiquadFilterNode will operate, in Hz. Its nominal range is from 10Hz to half the Nyquist frequency.
     *
     * @property frequency
     * @type SPAudioParam
     * @default 350
     * @minvalue 10
     * @maxvalue (AudioContext.sampleRate)/2
     */
    this.registerParameter( new SPAudioParam( this, 'frequency', 10, this.audioContext.sampleRate / 2, 350, filter_.frequency ), false );

    /**
     *A detune value, in cents, for the frequency. Its default value is 0.
     *
     * @property detune
     * @type SPAudioParam
     * @default 0
     * @minvalue -1200
     * @maxvalue 1200
     */
    this.registerParameter( new SPAudioParam( this, 'detune', -1200, 1200, 0, filter_.detune ), false );

    /**
     *The Q factor has a default value of 1, with a nominal range of 0.0001 to 1000.
     *
     * @property Q
     * @type SPAudioParam
     * @default 1
     * @minvalue 0.0001
     * @maxvalue 1000
     */
    this.registerParameter( new SPAudioParam( this, 'Q', 0.0001, 1000, 1, filter_.Q ), false );

    /**
     *The type of this BiquadFilterNode, lowpass, highpass, etc. The exact meaning of the other parameters depend on the value of the type attribute. Possible values for this type are :
     * "lowpass"
     * "highpass"
     * "bandpass"
     * "lowshelf"
     * "highshelf"
     * "peaking"
     * "notch"
     * "allpass"
     *
     * @property type
     * @type SPAudioParam
     * @default "lowpass"
     * @minvalue "lowpass"
     * @maxvalue "allpass"
     */
    this.registerParameter( new SPAudioParam( this, 'type', 'lowpass', 'allpass', 'lowpass', null, null, typeSetter ), false );

    this.isInitialized = true;

}

Filter.prototype = Object.create( BaseEffect.prototype );

module.exports = Filter;

},{"../core/BaseEffect":8,"../core/SPAudioParam":17}],26:[function(require,module,exports){
/**
 * @module Effects
 */
"use strict";
var BaseEffect = require( '../core/BaseEffect' );
var SPAudioParam = require( '../core/SPAudioParam' );
var log = require( 'loglevel' );

/**
 *
 * A simple stereo fader which moves the stereophonic image of the source left or right.
 * @class Panner
 * @constructor
 * @extends BaseEffect
 */
function Panner( context ) {
    if ( !( this instanceof Panner ) ) {
        throw new TypeError( "Panner constructor cannot be called as a function." );
    }
    // Call superclass constructor
    BaseEffect.call( this, context );
    this.maxSources = 0;
    this.minSources = 0;
    this.effectName = 'Panner';

    var panner_;
    var usingNativePanner = typeof this.audioContext.createStereoPanner === 'function';

    if ( usingNativePanner ) {
        log.debug( "using native panner" );
        panner_ = this.audioContext.createStereoPanner();
    } else {
        log.debug( "using 3D panner" );
        panner_ = this.audioContext.createPanner();
    }

    this.inputNode = panner_;
    this.outputNode = panner_;

    function panMapper( value ) {
        return value / 90.0;
    }

    function panPositionSetter( aParams, panValue ) {
        var xDeg = parseInt( panValue );
        var zDeg = xDeg + 90;
        if ( zDeg > 90 ) {
            zDeg = 180 - zDeg;
        }
        var x = Math.sin( xDeg * ( Math.PI / 180 ) );
        var z = Math.sin( zDeg * ( Math.PI / 180 ) );
        panner_.setPosition( x, 0, z );
    }

    /**
     * Pans the audio to left or right stereo audio channels using a value in degrees of the angle
     * of the perceived audio source from the center. Positive value implies perceived source
     * being on the right of center. Negative value implies the perceived sources being on the left
     * of the center.
     *
     * @property pan
     * @type SPAudioParam
     * @default 0
     * @minvalue -90
     * @maxvalue 90
     */
    if ( usingNativePanner ) {
        this.registerParameter( new SPAudioParam( this, 'pan', -90, 90, 0, panner_.pan, panMapper ), false );
    } else {
        this.registerParameter( new SPAudioParam( this, 'pan', -90, 90, 0, null, null, panPositionSetter ), false );
    }

    this.isInitialized = true;

}

Panner.prototype = Object.create( BaseEffect.prototype );

module.exports = Panner;

},{"../core/BaseEffect":8,"../core/SPAudioParam":17,"loglevel":3}],27:[function(require,module,exports){
/**
 * @module Models
 *
 */
"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var Looper = require( '../models/Looper' );
var SPAudioParam = require( '../core/SPAudioParam' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

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
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, audioBufferArray );
                }
            }, 0 );
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

            log.debug( "delta time", deltaTime );

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
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
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
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
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
    init( source );
}

Activity.prototype = Object.create( BaseSound.prototype );

module.exports = Activity;

},{"../core/BaseSound":9,"../core/Config":10,"../core/SPAudioParam":17,"../core/WebAudioDispatch":21,"../models/Looper":29,"loglevel":3}],28:[function(require,module,exports){
/**
 * @module Models
 */
"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SoundQueue = require( '../core/SoundQueue' );
var SPAudioParam = require( '../core/SPAudioParam' );
var multiFileLoader = require( '../core/MultiFileLoader' );
var Converter = require( '../core/Converter' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * A model which extends the playing of a single source infinitely with windowed overlapping.
 *
 *
 * @class Extender
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [source] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when the source has finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function Extender( context, source, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd ) {
    if ( !( this instanceof Extender ) ) {
        throw new TypeError( "Extender constructor cannot be called as a function." );
    }

    // Call superclass constructor
    BaseSound.call( this, context );
    /*Support a single input only*/
    this.maxSources = 1;
    this.minSources = 1;
    this.modelName = 'Extender';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;

    var onAudioStart_ = onAudioStart;
    var onAudioEnd_ = onAudioEnd;

    Object.defineProperty( this, 'onAudioStart', {
        enumerable: true,
        configurable: false,
        set: function ( startCallback ) {
            if ( soundQueue_ ) {
                onAudioStart_ = startCallback;
                soundQueue_.onAudioStart = startCallback;
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
            if ( soundQueue_ ) {
                soundQueue_.onAudioEnd = endCallback;
            }
        },
        get: function () {
            return onAudioEnd_;
        }
    } );

    // Private Variables
    var self = this;
    var sourceBuffer_;
    var soundQueue_;

    var lastEventID_ = 0;
    var currentEventID_ = 1;

    var lastEventTime_ = 0;
    var lastEventReleaseTime_ = 0;
    var releaseDur_ = 0;

    // Constants
    var MAX_USE = 0.9;

    // Private Functions

    var onLoadAll = function ( status, audioBufferArray ) {
        sourceBuffer_ = audioBufferArray[ 0 ];
        soundQueue_.connect( self.releaseGainNode );

        if ( status ) {
            self.isInitialized = true;
        }
        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, audioBufferArray );
                }
            }, 0 );
        }
    };

    function init( source ) {
        multiFileLoader.call( self, source, self.audioContext, self.onLoadProgress, onLoadAll );
    }

    function extenderCallback() {
        var currentTime = self.audioContext.currentTime;
        var endTime = currentTime + 1 / Config.NOMINAL_REFRESH_RATE;
        var eventLen = self.eventPeriod.value;

        while ( lastEventReleaseTime_ < endTime || lastEventTime_ + eventLen < endTime ) {
            // This sligthly fiddly expression allows us to generate the next event earlier than the originally
            // scheduled release time of the previous event, but not later. This is crucial, as we never want
            // the event to run beyond the end of the available audio.
            var eventTime = Math.max( currentTime, Math.min( lastEventReleaseTime_, lastEventTime_ + eventLen ) );

            // Specify the playback speed (which depends on the pitch shift)
            var playSpeed = Converter.semitonesToRatio( self.pitchShift.value );

            // If the event length plus crossface exceeds the available audio duration
            // (taking pitch shift into account), scale both so we don't exceed the
            // available audio.
            // Never use more than this fraction of the audio for a single event

            var xFadeFrac = self.crossFadeDuration.value;
            var audioDur = sourceBuffer_.duration;
            var fadeDur = eventLen * xFadeFrac;
            var requiredDur = playSpeed * ( eventLen + fadeDur );

            if ( requiredDur > MAX_USE * audioDur ) {
                var scale = MAX_USE * audioDur / requiredDur;
                eventLen *= scale;
                fadeDur *= scale;
            }
            requiredDur = playSpeed * ( eventLen + fadeDur );

            // Find a suitable start point as a offset taking into account the required amount of audio
            var startOffset = Math.max( 0, audioDur - requiredDur ) * Math.random();

            log.debug( "Start Point : " + startOffset + " playSpeed : " + playSpeed + " fadeDur : " + fadeDur + " audioDur : " + audioDur + " eventTime : " + eventTime + " eventLen : " + eventLen );

            //  Stop/release the *previous* audio snippet
            if ( lastEventID_ > 0 ) {
                soundQueue_.queueRelease( eventTime, lastEventID_, releaseDur_ );
            }
            // Queue up an event to specify all the properties
            soundQueue_.queueSetSource( eventTime, currentEventID_, sourceBuffer_ );
            soundQueue_.queueSetParameter( eventTime, currentEventID_, 'playSpeed', playSpeed );
            //  Queue the start of the audio snippet
            soundQueue_.queueStart( eventTime, currentEventID_, startOffset, fadeDur );

            releaseDur_ = fadeDur;
            lastEventTime_ = eventTime;
            lastEventReleaseTime_ = eventTime + eventLen;
            lastEventID_ = currentEventID_;
            ++currentEventID_;
        }

        // Keep making callback request if source is still playing.
        if ( self.isPlaying ) {
            window.requestAnimationFrame( extenderCallback );
        }
    }

    // Public Properties

    /**
     * Amount of pitch shift of the source in the each window (in semitones).
     *
     * @property pitchShift
     * @type SPAudioParam
     * @default 0.0
     * @minvalue -60.0
     * @maxvalue 60.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchShift', -60.0, 60.0, 0 ) );

    /**
     * The length (in seconds) of each window used to overlap the source.
     *
     * @property eventPeriod
     * @type SPAudioParam
     * @default 2.0
     * @minvalue 0.1
     * @maxvalue 10.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'eventPeriod', 0.1, 10.0, 2.0 ) );

    /**
     * Fraction of each window of the source that is overlapped with the succeding window of the source.
     *
     * @property crossFadeDuration
     * @type SPAudioParam
     * @default 0.5
     * @minvalue 0.1
     * @maxvalue 0.99
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'crossFadeDuration', 0.1, 0.99, 0.5 ) );

    // Public Functions

    /**
     * Reinitializes a Extender and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} source Single or Array of either URLs or AudioBuffers of source.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( source, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, source, onLoadProgress, onLoadComplete );
        init( source );
    };

    /**
     * Starts playing the source
     *
     * @method stop
     * @param {Number} when The delay in seconds before playing the source
     * @param {Number} [offset] The starting position of the playhead
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     *
     */
    this.start = function ( when, offset, duration, attackDuration ) {
        if ( !this.isInitialized ) {
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }
        BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
        webAudioDispatch( extenderCallback, when, this.audioContext );
    };

    /**
     * Plays the model immediately
     *
     * @method play
     *
     */
    this.play = function () {
        this.start( 0 );
    };

    /**
     * Pauses the model immediately
     *
     * @method pause
     *
     */
    this.pause = function () {
        BaseSound.prototype.pause.call( this );
        soundQueue_.pause();
    };

    /**
     * Stops playing the model.
     *
     * @method stop
     * @param {Number} [when] At what time (in seconds) the model be stopped
     *
     */
    this.stop = function ( when ) {
        BaseSound.prototype.stop.call( this, when );
        soundQueue_.stop( when );
    };

    soundQueue_ = new SoundQueue( this.audioContext, this.onAudioStart, this.onAudioEnd );

    // Initialize the sources.
    init( source );
}

Extender.prototype = Object.create( BaseSound.prototype );

module.exports = Extender;

},{"../core/BaseSound":9,"../core/Config":10,"../core/Converter":11,"../core/MultiFileLoader":14,"../core/SPAudioParam":17,"../core/SoundQueue":20,"../core/WebAudioDispatch":21,"loglevel":3}],29:[function(require,module,exports){
/**
 * @module Models
 */

"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SPAudioParam = require( '../core/SPAudioParam' );
var SPAudioBufferSourceNode = require( '../core/SPAudioBufferSourceNode' );
var multiFileLoader = require( '../core/MultiFileLoader' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

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
    var rateArray_ = [];

    var onLoadAll = function ( status, arrayOfBuffers ) {
        self.multiTrackGain.length = arrayOfBuffers.length;
        arrayOfBuffers.forEach( function ( thisBuffer, trackIndex ) {
            insertBufferSource( thisBuffer, trackIndex, arrayOfBuffers.length );
        } );

        if ( rateArray_ && rateArray_.length > 0 ) {
            self.registerParameter( new SPAudioParam( self, 'playSpeed', 0.0, 10, 1, rateArray_, null, playSpeedSetter_ ), true );
        }

        if ( status ) {
            self.isInitialized = true;
        }

        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, arrayOfBuffers );
                }
            }, 0 );
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
        source.lastStopPosition_ = 0;
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
                log.debug( "easingIn/Out" );
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
                log.debug( "changing directly" );
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
            sourceBufferNodes_.forEach( function ( thisSource ) {
                var offset = thisSource.lastStopPosition_ || thisSource.loopStart;
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
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }

        if ( !this.isPlaying ) {
            sourceBufferNodes_.forEach( function ( thisSource ) {

                offset = thisSource.loopStart + parseFloat( offset ) || 0;
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
            sourceBufferNodes_.forEach( function ( thisSource ) {
                thisSource.stop( when );
                thisSource.lastStopPosition_ = 0;
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

            sourceBufferNodes_.forEach( function ( thisSource ) {
                thisSource.stop( 0 );
                thisSource.lastStopPosition_ = thisSource.playbackPosition / thisSource.buffer.sampleRate;
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
                thisSource.lastStopPosition_ = 0;

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
    init( sources );
}

Looper.prototype = Object.create( BaseSound.prototype );

module.exports = Looper;

},{"../core/BaseSound":9,"../core/Config":10,"../core/MultiFileLoader":14,"../core/SPAudioBufferSourceNode":16,"../core/SPAudioParam":17,"../core/WebAudioDispatch":21,"loglevel":3}],30:[function(require,module,exports){
/**
 * @module Models
 */

"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SoundQueue = require( '../core/SoundQueue' );
var SPAudioParam = require( '../core/SPAudioParam' );
var multiFileLoader = require( '../core/MultiFileLoader' );
var Converter = require( '../core/Converter' );
var webAudioDispatch = require( '../core/WebAudioDispatch' );
var log = require( 'loglevel' );

/**
 * A model which triggers a single or multiple sources with multiple voices (polyphony)
 * repeatedly.
 *
 *
 * @class MultiTrigger
 * @constructor
 * @extends BaseSound
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [sources] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function MultiTrigger( context, sources, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd ) {
    if ( !( this instanceof MultiTrigger ) ) {
        throw new TypeError( "MultiTrigger constructor cannot be called as a function." );
    }

    // Call superclass constructor
    BaseSound.call( this, context );

    var self = this;
    this.maxSources = Config.MAX_VOICES;
    this.minSources = 1;
    this.modelName = 'MultiTrigger';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;

    var onAudioStart_ = onAudioStart;
    var onAudioEnd_ = onAudioEnd;

    Object.defineProperty( this, 'onAudioStart', {
        enumerable: true,
        configurable: false,
        set: function ( startCallback ) {
            if ( soundQueue_ ) {
                onAudioStart_ = startCallback;
                soundQueue_.onAudioStart = startCallback;
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
            if ( soundQueue_ ) {
                soundQueue_.onAudioEnd = endCallback;
            }
        },
        get: function () {
            return onAudioEnd_;
        }
    } );

    var lastEventTime_ = 0;
    var timeToNextEvent_ = 0;

    // Private Variables
    var sourceBuffers_ = [];
    var soundQueue_;
    var currentEventID_ = 0;
    var currentSourceID_ = 0;

    var wasPlaying_ = false;
    // Private Functions
    function init( sources ) {
        multiFileLoader.call( self, sources, self.audioContext, self.onLoadProgress, onLoadAll );
    }

    var onLoadAll = function ( status, audioBufferArray ) {
        sourceBuffers_ = audioBufferArray;
        timeToNextEvent_ = updateTimeToNextEvent( self.eventRate.value );
        soundQueue_.connect( self.releaseGainNode );

        if ( status ) {
            self.isInitialized = true;
        }
        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, audioBufferArray );
                }
            }, 0 );
        }
    };

    function triggerOnce( eventTime ) {

        // Release Older Sounds

        if ( currentEventID_ >= self.maxSources - 2 ) {
            var releaseID = currentEventID_ - ( self.maxSources - 2 );
            var releaseDur = eventTime - lastEventTime_;
            soundQueue_.queueRelease( eventTime, releaseID, releaseDur );
        }

        var length = sourceBuffers_.length;

        if ( self.eventRand.value ) {
            if ( length > 2 ) {
                currentSourceID_ = ( currentSourceID_ + Math.floor( Math.random() * length ) ) % length;
            } else {
                currentSourceID_ = Math.floor( Math.random() * length );
            }
        } else {
            currentSourceID_ = currentSourceID_ % length;
        }

        var timeStamp = eventTime;
        var playSpeed = Converter.semitonesToRatio( self.pitchShift.value + Math.random() * self.pitchRand.value );

        soundQueue_.queueSetSource( timeStamp, currentEventID_, sourceBuffers_[ currentSourceID_ ] );
        soundQueue_.queueSetParameter( timeStamp, currentEventID_, 'playSpeed', playSpeed );
        soundQueue_.queueStart( timeStamp, currentEventID_ );
        currentEventID_++;
        currentSourceID_++;

    }

    function multiTiggerCallback() {

        var currentTime = context.currentTime;
        var endTime = currentTime + 1 / Config.NOMINAL_REFRESH_RATE;

        while ( lastEventTime_ + timeToNextEvent_ < endTime ) {
            var eventTime = Math.max( currentTime, lastEventTime_ + timeToNextEvent_ );
            triggerOnce( eventTime );
            lastEventTime_ = eventTime;
            timeToNextEvent_ = updateTimeToNextEvent( self.eventRate.value );
        }

        // Keep making callback request if model is still playing.
        if ( self.isPlaying ) {
            window.requestAnimationFrame( multiTiggerCallback );
        }
    }

    function updateTimeToNextEvent( eventRate ) {
        var period = 1.0 / eventRate;
        var randomness = Math.random() - 0.5;
        var jitterRand = ( 1.0 + 2.0 * self.eventJitter.value * randomness );

        var updateTime = period * jitterRand;

        if ( isFinite( updateTime ) ) {
            //Update releaseDur of Loopers being released
            var releaseDur = Math.max( 0.99 * period * ( 1 - self.eventJitter.value ), 0.01 );
            soundQueue_.queueUpdate( 'QERELEASE', null, 'releaseDuration', releaseDur );
        } else {
            // 1  year in seconds.
            updateTime = 365 * 24 * 3600;
        }

        return updateTime;
    }

    function eventRateSetter_( aParam, value ) {
        if ( value === 0 ) {
            if ( self.isPlaying ) {
                wasPlaying_ = true;
                soundQueue_.pause();
                BaseSound.prototype.pause.call( self );
            }
        } else {
            if ( self.isInitialized && !self.isPlaying && wasPlaying_ ) {
                self.play();
            }
            if ( self.isInitialized ) {
                timeToNextEvent_ = updateTimeToNextEvent( value );
            }
        }

    }

    // Public Properties

    /**
     * Pitch shift of the triggered voices in semitones.
     *
     * @property pitchShift
     * @type SPAudioParam
     * @default 0
     * @minvalue -60.0
     * @maxvalue 60.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchShift', -60.0, 60.0, 0 ) );

    /**
     * Maximum value for random pitch shift of the triggered voices in semitones.
     *
     * @property pitchRand
     * @type SPAudioParam
     * @default 0.0
     * @minvalue 0.0
     * @maxvalue 24.0
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchRand', 0.0, 24.0, 0.0 ) );

    /**
     * Enable randomness in the order of sources which are triggered.
     *
     * @property eventRand
     * @type SPAudioParam
     * @default false
     * @minvalue true
     * @maxvalue false
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'eventRand', true, false, false ) );

    /**
     * Trigger rate for playing the model in Hz.
     *
     * @property eventRate
     * @type SPAudioParam
     * @default 10.0
     * @minvalue 0.0
     * @maxvalue 60.0
     */
    this.registerParameter( new SPAudioParam( this, 'eventRate', 0, 60.0, 10.0, null, null, eventRateSetter_ ) );
    /**
     * Maximum deviation from the regular trigger interval (as a factor of 1).
     *
     * @property eventJitter
     * @type SPAudioParam
     * @default 0.0
     * @minvalue 0.0
     * @maxvalue 0.99
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'eventJitter', 0, 0.99, 0 ) );

    // Public Functions

    /**
     * Start repeated triggering.
     *
     * @method start
     * @param {Number} when The delay in seconds before playing the model
     * @param {Number} [offset] The starting position of the playhead
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     *
     */
    this.start = function ( when, offset, duration, attackDuration ) {
        if ( !this.isInitialized ) {
            log.warn( this.modelName, " hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }
        BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
        webAudioDispatch( multiTiggerCallback, when, this.audioContext );
    };

    /**
     * Start repeated triggering immediately
     *
     * @method play
     *
     */
    this.play = function () {
        this.start( 0 );
    };

    /**
     * Stops playing all voices.
     *
     * @method stop
     *
     */
    this.stop = function ( when ) {
        soundQueue_.stop( when );
        wasPlaying_ = false;
        BaseSound.prototype.stop.call( this, when );
    };

    /**
     * Pauses playing all voices.
     *
     * @method pause
     *
     */
    this.pause = function () {
        soundQueue_.pause();
        wasPlaying_ = false;
        BaseSound.prototype.pause.call( this );
    };

    /**
     * Reinitializes a MultiTrigger and sets it's sources.
     *
     * @method setSources
     * @param {Array/AudioBuffer/String/File} sources Single or Array of either URLs or AudioBuffers or File Objects of audio sources.
     * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
     * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
     */
    this.setSources = function ( sources, onLoadProgress, onLoadComplete ) {
        BaseSound.prototype.setSources.call( this, sources, onLoadProgress, onLoadComplete );
        init( sources );
    };
    // SoundQueue based model.
    soundQueue_ = new SoundQueue( this.audioContext, this.onAudioStart, this.onAudioEnd );

    init( sources );

}

MultiTrigger.prototype = Object.create( BaseSound.prototype );

module.exports = MultiTrigger;

},{"../core/BaseSound":9,"../core/Config":10,"../core/Converter":11,"../core/MultiFileLoader":14,"../core/SPAudioParam":17,"../core/SoundQueue":20,"../core/WebAudioDispatch":21,"loglevel":3}],31:[function(require,module,exports){
/**
 * @module Models
 */

"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SPAudioParam = require( '../core/SPAudioParam' );
var multiFileLoader = require( '../core/MultiFileLoader' );
var log = require( 'loglevel' );

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
    var SPEED_THRESH = 0.1;
    var SPEED_ALPHA = 0.93;
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

            smoothPos_ = self.playPosition.value;
            self.isInitialized = true;
        }

        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, audioBufferArray );
                }
            }, 0 );
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
                var startPos = synthStep_ - numReady_;
                for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                    var source = synthBuf_[ cIndex ].subarray( startPos, startPos + numToCopy );
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

                var bufPeakPos_ = 0;
                var bufPeakVal = 0;
                for ( sIndex = synthStep_; sIndex < winLen_; sIndex++ ) {
                    var combinedPeakVal = 0;
                    for ( cIndex = 0; cIndex < numChannels_; cIndex++ ) {
                        combinedPeakVal += srcBuf_[ cIndex ][ sIndex ];
                    }
                    if ( combinedPeakVal > bufPeakVal ) {
                        bufPeakPos_ = sIndex - synthStep_;
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

                scale_ = ( SPEED_ALPHA * scale_ ) + ( ( 1.0 - SPEED_ALPHA ) * targetScale_ );

                var muteOnReverse = self.muteOnReverse.value;

                if ( speed < 0 && muteOnReverse ) {
                    scale_ = 0.0;
                }

                if ( audioPlaying && ( ( muteOnReverse && scale_ < AUDIOEVENT_TRESHOLD ) || Math.abs( scale_ ) < AUDIOEVENT_TRESHOLD ) ) {
                    log.debug( "stopping..." );
                    audioPlaying = false;
                    if ( typeof self.onAudioEnd === 'function' ) {
                        self.onAudioEnd();
                    }

                }

                if ( scale_ > AUDIOEVENT_TRESHOLD && !audioPlaying ) {
                    log.debug( "playing..." );
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
    init( source );

}

Scrubber.prototype = Object.create( BaseSound.prototype );

module.exports = Scrubber;

},{"../core/BaseSound":9,"../core/Config":10,"../core/MultiFileLoader":14,"../core/SPAudioParam":17,"loglevel":3}],32:[function(require,module,exports){
/**
 * @module Models
 */
"use strict";

var Config = require( '../core/Config' );
var BaseSound = require( '../core/BaseSound' );
var SoundQueue = require( '../core/SoundQueue' );
var SPAudioParam = require( '../core/SPAudioParam' );
var multiFileLoader = require( '../core/MultiFileLoader' );
var Converter = require( '../core/Converter' );
var log = require( 'loglevel' );

/**
 * A model which triggers a single or multiple audio sources with multiple voices (polyphony).
 *
 *
 * @class Trigger
 * @constructor
 * @extends BaseSound
 * @param {AudioContext} [context] AudioContext to be used.
 * @param {Array/String/AudioBuffer/File} [sources] Single or Array of either URLs or AudioBuffers or File Object of the audio source.
 * @param {Function} [onLoadProgress] Callback when the audio file is being downloaded.
 * @param {Function} [onLoadComplete] Callback when all sources have finished loading.
 * @param {Function} [onAudioStart] Callback when the audio is about to start playing.
 * @param {Function} [onAudioEnd] Callback when the audio has finished playing.
 */
function Trigger( context, sources, onLoadProgress, onLoadComplete, onAudioStart, onAudioEnd ) {
    if ( !( this instanceof Trigger ) ) {
        throw new TypeError( "Trigger constructor cannot be called as a function." );
    }

    // Call superclass constructor
    BaseSound.call( this, context );
    /*Support upto 8 seperate voices*/
    this.maxSources = Config.MAX_VOICES;
    this.minSources = 1;
    this.modelName = 'Trigger';

    this.onLoadProgress = onLoadProgress;
    this.onLoadComplete = onLoadComplete;

    var onAudioStart_ = onAudioStart;
    var onAudioEnd_ = onAudioEnd;

    Object.defineProperty( this, 'onAudioStart', {
        enumerable: true,
        configurable: false,
        set: function ( startCallback ) {
            if ( soundQueue_ ) {
                onAudioStart_ = startCallback;
                soundQueue_.onAudioStart = startCallback;
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
            if ( soundQueue_ ) {
                soundQueue_.onAudioEnd = endCallback;
            }
        },
        get: function () {
            return onAudioEnd_;
        }
    } );

    // Private vars
    var self = this;

    // Private Variables
    var sourceBuffers_ = [];
    var soundQueue_;
    var currentEventID_ = 0;
    var currentSourceID_ = 0;
    var allSounds;

    // Private Functions

    var onLoadAll = function ( status, audioBufferArray ) {
        sourceBuffers_ = audioBufferArray;
        soundQueue_.connect( self.releaseGainNode );
        if ( status ) {
            self.isInitialized = true;
        }
        if ( typeof self.onLoadComplete === 'function' ) {
            window.setTimeout( function () {
                if ( typeof self.onLoadComplete === 'function' ) {
                    self.onLoadComplete( status, audioBufferArray );
                }
            }, 0 );
        }
    };

    function init( sources ) {
        multiFileLoader.call( self, sources, self.audioContext, self.onLoadProgress, onLoadAll );
        allSounds = sources;
    }

    // Public Properties

    /**
     * Pitch shift of the triggered voices in semitones.
     *
     * @property pitchShift
     * @type SPAudioParam
     * @default 0.0
     * @minvalue -60
     * @maxvalue 60
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchShift', -60.0, 60.0, 0 ) );

    /**
     * Maximum value for random pitch shift of the triggered voices in semitones.
     *
     * @property pitchRand
     * @type SPAudioParam
     * @default 0.0
     * @minvalue 0.0
     * @maxvalue 24
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'pitchRand', 0.0, 24.0, 0 ) );

    /**
     * Enable randomness in the order of sources which are triggered.
     *
     * @property eventRand
     * @type SPAudioParam
     * @default false
     * @minvalue true
     * @maxvalue false
     */
    this.registerParameter( SPAudioParam.createPsuedoParam( this, 'eventRand', true, false, false ) );

    // Public Functions

    /**
     * Reinitializes the model and sets it's sources.
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
     * Stops playing all voices.
     *
     * @method stop
     *
     */
    this.stop = function ( when ) {
        soundQueue_.stop( when );
        BaseSound.prototype.stop.call( this, when );
    };

    /**
     * Pauses playing all voices.
     *
     * @method pause
     *
     */
    this.pause = function () {
        soundQueue_.pause();
        BaseSound.prototype.pause.call( this );
    };

    /**
     * Triggers a single voice immediately.
     *
     * @method play
     *
     */
    this.play = function () {
        this.start( 0 );
    };

    /**
     * Triggers a single voice at the given time
     *
     * @method start
     * @param {Number} when The delay in seconds before playing the model
     * @param {Number} [offset] The starting position of the playhead
     * @param {Number} [duration] Duration of the portion (in seconds) to be played
     * @param {Number} [attackDuration] Duration (in seconds) of attack ramp of the envelope.
     *
     */
    this.start = function ( when, offset, duration, attackDuration ) {
        if ( !this.isInitialized ) {
            log.warn( this.modelName, "hasn't finished Initializing yet. Please wait before calling start/play" );
            return;
        }

        if ( typeof when === 'undefined' || when < this.audioContext.currentTime ) {
            when = this.audioContext.currentTime;
        }

        var length = 1;
        if ( Object.prototype.toString.call( allSounds ) === '[object Array]' ) {
            length = allSounds.length;
        }

        if ( this.eventRand.value ) {
            if ( length > 2 ) {
                currentSourceID_ = ( currentSourceID_ + Math.floor( Math.random() * length - 1 ) ) % length;
            } else {
                currentSourceID_ = Math.floor( Math.random() * length );
            }
        } else {
            currentSourceID_ = currentSourceID_ % length;
        }

        var timeStamp = when;
        var playSpeed = Converter.semitonesToRatio( this.pitchShift.value + Math.random() * this.pitchRand.value );

        soundQueue_.queueSetSource( timeStamp, currentEventID_, sourceBuffers_[ currentSourceID_ ] );
        soundQueue_.queueSetParameter( timeStamp, currentEventID_, 'playSpeed', playSpeed );
        soundQueue_.queueStart( timeStamp, currentEventID_ );
        currentEventID_++;
        currentSourceID_++;

        BaseSound.prototype.start.call( this, when, offset, duration, attackDuration );
    };

    // SoundQueue based model.
    soundQueue_ = new SoundQueue( this.audioContext, this.onAudioStart, this.onAudioEnd );

    init( sources );
}

Trigger.prototype = Object.create( BaseSound.prototype );

module.exports = Trigger;

},{"../core/BaseSound":9,"../core/Config":10,"../core/Converter":11,"../core/MultiFileLoader":14,"../core/SPAudioParam":17,"../core/SoundQueue":20,"loglevel":3}],33:[function(require,module,exports){
"use strict";
var BaseSound = require( 'core/BaseSound' );
console.log( "Running BaseSound Test... " );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}

describe( 'BaseSound.js', function () {
    var baseSound;

    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        baseSound = new BaseSound( context );
        done();
    } );

    describe( '#new BaseSound( context )', function () {

        it( "should have audioContext available", function () {
            expect( baseSound.audioContext )
                .toBeInstanceOf( AudioContext );
        } );

        it( "should have number of inputs default to 0", function () {
            expect( baseSound.numberOfInputs )
                .toBe( 0 );
        } );

        it( "should have a maximum number of sources default to 0", function () {
            expect( baseSound.maxSources )
                .toBe( 0 );
        } );

        it( "should have releaseGainNode property as a GainNode object", function () {
            expect( baseSound.releaseGainNode )
                .toBeInstanceOf( GainNode );
        } );

        it( "should have playing state default to false", function () {
            expect( baseSound.isPlaying )
                .toEqual( false );
        } );

        it( "should have input node default to null", function () {
            expect( baseSound.inputNode )
                .toBeNull();
        } );

        it( "should not throw an error if context is undefined", function () {
            expect( function () {
                    var a = new BaseSound();
                } )
                .not.toThrowError();
        } );

    } );

    describe( '#maxSources', function () {

        it( "should default to 0 when given a negative value", function () {
            baseSound.maxSources = -1;
            expect( baseSound.maxSources )
                .toBe( 0 );

            baseSound.maxSources = -100;
            expect( baseSound.maxSources )
                .toBe( 0 );
        } );

        it( "should accept only integers and round off to nearest integer if float number placed", function () {
            baseSound.maxSources = 0.01;
            expect( baseSound.maxSources )
                .toBe( 0 );

            baseSound.maxSources = 1.20;
            expect( baseSound.maxSources )
                .toBe( 1 );

            baseSound.maxSources = 1.80;
            expect( baseSound.maxSources )
                .toBe( 2 );
        } );

    } );

    describe( '#connect( destination, output, input )', function () {

        it( "should throw an error if destination is null", function () {
            expect( function () {
                    baseSound.connect( null, null, null );
                } )
                .toThrow();
        } );

        it( "should throw an error if input or output exceeds number of inputs or outputs", function () {

            var gainNode = context.createGain();

            expect( function () {
                    baseSound.connect( gainNode, 0, -100 );
                } )
                .toThrow();

            expect( function () {
                    baseSound.connect( gainNode, 100, 100 );
                } )
                .toThrow();

            expect( function () {
                    baseSound.connect( gainNode, -100, 0 );
                } )
                .toThrow();

        } );

    } );

    describe( '#start( when, offset, duration )', function () {

        it( "should start playing when called", function () {
            baseSound.start( 0, 0, 0 );
            expect( baseSound.isPlaying )
                .toEqual( true );
        } );
    } );

    describe( '#play( )', function () {

        it( "should playing when called", function () {
            baseSound.play();
            expect( baseSound.isPlaying )
                .toEqual( true );
        } );
    } );

    describe( '#pause( )', function () {

        it( "should pause when called", function () {
            baseSound.start( 0, 0, 0 );
            baseSound.pause();
            expect( baseSound.isPlaying )
                .toEqual( false );
        } );
    } );

    describe( '#stop( when )', function () {

        it( "should stop playing when called", function () {
            baseSound.start( 0, 0, 0 );
            baseSound.stop( 0 );
            expect( baseSound.isPlaying )
                .toEqual( false );
        } );
    } );
} );

},{"core/BaseSound":9}],34:[function(require,module,exports){
"use strict";
var Config = require( 'core/Config' );
console.log( "Running Config Test... " );
describe( 'Config.js', function () {
    describe( '#Class{}', function () {
        it( "should have maximum number of voices supported default to 8", function () {
            expect( Config.MAX_VOICES )
                .toBe( 8 );
        } );

        it( "should have default nominal refresh rate (Hz) for SoundQueue to 60", function () {
            expect( Config.NOMINAL_REFRESH_RATE )
                .toBe( 60 );
        } );
    } );
} );

},{"core/Config":10}],35:[function(require,module,exports){
"use strict";
var Converter = require( 'core/Converter' );
console.log( "Running Converter Test... " );
describe( 'Converter.js', function () {
    describe( '#Class{}', function () {
        it( "should be able to convert semitones to ratio correctly", function () {
            expect( Converter.semitonesToRatio( 12 ) )
                .toBe( 2 );
            expect( Converter.semitonesToRatio( -60 ) )
                .toBe( 1 / 32 );
            expect( Converter.semitonesToRatio( 60 ) )
                .toBe( 32 );
            expect( Converter.semitonesToRatio( 36 ) )
                .toBe( 8 );
            expect( Converter.semitonesToRatio( -36 ) )
                .toBe( 1 / 8 );
            expect( Converter.semitonesToRatio( 0 ) )
                .toBe( 1 );
        } );
    } );
} );

},{"core/Converter":11}],36:[function(require,module,exports){
    "use strict";
    var detectLoopMarkers = require( 'core/DetectLoopMarkers' )
    console.log( "Running DetectLoopMarker Test... " );
    if ( !window.context ) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        window.context = new AudioContext();
    }
    var rampMarkedMp3 = 'audio/ramp_marked.mp3';
    var rampMarkedWav = 'audio/ramp_marked.wav';
    var mp3File = 'audio/bullet.mp3';
    var markedWavFile = 'audio/sineloopstereomarked.wav';
    var markedStereoMp3File = 'audio/sineloopstereomarked.mp3';
    var markedMonoMp3File = 'audio/sineloopmonomarked.mp3';
    var unmarkedMonoWavFile = 'audio/sineloopmono.wav';
    var unmarkedStereoWavFile = 'audio/sineloopstereo.wav';

    describe( 'DetectLoopMarkers.js', function () {

        function loadAndDecode( URL, ondecode ) {
            var request = new XMLHttpRequest();

            request.open( 'GET', URL, true );
            request.responseType = 'arraybuffer';

            request.onload = function () {
                context.decodeAudioData( request.response, function ( buffer ) {
                    //console.log( URL, " : ", buffer.length, buffer.sampleRate );
                    ondecode( buffer );
                } );
            };
            request.send();
        }

        var customMatchers = {
            toBeApproximatelyEqualTo: function () {
                return {
                    compare: function ( actual, expected ) {
                        var result = {};
                        result.pass = Math.abs( Number( actual ) - Number( expected ) ) < 0.03;
                        if ( result.pass ) {
                            result.message = 'Expected ' + actual + ' to be approximately equal to ' + expected;
                        } else {
                            result.message = 'Expected ' + actual + ' to be approximately equal to ' + expected + ', but it is not';
                        }
                        return result;
                    }
                };
            }
        };

        function printNFrom( name, data, start, num ) {
            console.log( "--------------Data for ", name, "from ", start, " ---------------" );
            for ( var i = 0; i < num; ++i ) {
                console.log( start + i, ":", ( data[ start + i ] )
                    .toFixed( 6 ) );
            }
        }

        beforeEach( function () {
            jasmine.addMatchers( customMatchers );
        } );

        describe( '#detectLoopMarkers( buffer )', function () {

            it( "should throw an error if buffer is null", function () {
                expect( function () {
                        var a = detectLoopMarkers();
                    } )
                    .toThrowError();
            } );

            it( "should not throw an error if loading from a buffer programatically created", function () {

                expect( function () {
                        var audio = context.createBuffer( 1, 2048, 44100 );
                        detectLoopMarkers( audio );
                    } )
                    .not.toThrowError();

                expect( function () {
                        var audio = context.createBuffer( 2, 1024, 44100 );
                        detectLoopMarkers( audio );
                    } )
                    .not.toThrowError();
            } );

            it( "should not have problem loading MP3 files", function ( done ) {
                loadAndDecode( mp3File, function ( buffer ) {
                    expect( function () {
                            detectLoopMarkers( buffer );
                        } )
                        .not.toThrowError();
                    done();
                } );
            } );
        } );

        describe( '#marked sound - start', function () {
            it( "should detect start marker on a marked ramp file", function ( done ) {
                loadAndDecode( rampMarkedWav, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( rampMarkedWav, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.22049623727798462 );
                    done();
                } );
            } );

            it( "should detect start marker on a marked ramp MP3 file", function ( done ) {
                loadAndDecode( rampMarkedMp3, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( rampMarkedMp3, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.22049623727798462 );
                    done();
                } );
            } );

            it( "should detect start marker if available", function ( done ) {
                loadAndDecode( markedWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( markedWavFile, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0 );
                    done();
                } );
            } );

            it( "should detect start marker if available in a Mono file", function ( done ) {
                loadAndDecode( markedMonoMp3File, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( markedMonoMp3File, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0 );
                    done();
                } );
            } );

            it( "should detect start marker if available in a Stereo file", function ( done ) {
                loadAndDecode( markedStereoMp3File, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( markedStereoMp3File, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.0013794986298307776 );
                    done();
                } );
            } );
        } );

        describe( '#unmarked sound - sound', function () {
            it( "should detect start of sound if marker is not available", function ( done ) {
                loadAndDecode( unmarkedStereoWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( unmarkedStereoWavFile, lCh, markers.start, 10 );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.050048828125 );
                    done();
                } );
            } );

            it( "should detect start of sound if marker is not available", function ( done ) {
                loadAndDecode( unmarkedMonoWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    //printNFrom( unmarkedMonoWavFile, lCh, markers.start, 10 );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( lCh[ markers.start ] )
                        .toBeApproximatelyEqualTo( 0.05010986328125 );
                    done();
                } );
            } );
        } );

        describe( '#marked sound - end', function () {
            it( "should detect end marker on a marked ramp file", function ( done ) {
                loadAndDecode( rampMarkedWav, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( rampMarkedWav, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0.22049623727798462 );
                    done();
                } );
            } );

            it( "should detect end marker on a marked ramp MP3 file", function ( done ) {
                loadAndDecode( rampMarkedMp3, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    //printNFrom( rampMarkedMp3, lCh, markers.start - 5, 10 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0.22049623727798462 );
                    done();
                } );
            } );

            it( "should detect end marker if available", function ( done ) {
                loadAndDecode( markedWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0 );
                    done();
                } );
            } );

            it( "should detect end marker if available in a Stereo file", function ( done ) {
                loadAndDecode( markedStereoMp3File, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0.0014140927232801914 );
                    done();
                } );
            } );

            it( "should detect end marker if available in a Mono file", function ( done ) {
                loadAndDecode( markedMonoMp3File, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( true );
                    expect( lCh[ markers.end ] )
                        .toBeApproximatelyEqualTo( 0.0012327437289059162 );
                    done();
                } );
            } );
        } );

        describe( 'unmarked sound - end', function () {
            it( "should detect end of sound in a stereo file if marker is not available", function ( done ) {
                loadAndDecode( unmarkedStereoWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( lCh[ markers.end - 1 ] )
                        .toBeApproximatelyEqualTo( -0.038787841796875 );
                    done();
                } );
            } );

            it( "should detect end of sound in a mono file if marker is not available", function ( done ) {
                loadAndDecode( unmarkedMonoWavFile, function ( buffer ) {
                    var markers = detectLoopMarkers( buffer );
                    var lCh = buffer.getChannelData( 0 );
                    expect( markers.marked )
                        .toEqual( false );
                    expect( lCh[ markers.end - 1 ] )
                        .toBeApproximatelyEqualTo( -0.050201416015625 );
                    done();
                } );
            } );
        } );
    } );

},{"core/DetectLoopMarkers":12}],37:[function(require,module,exports){
"use strict";
var FileLoader = require( 'core/FileLoader' );
console.log( "Running FileLoader Test... " );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
var mp3File = 'audio/bullet.mp3';

describe( 'FileLoader.js', function () {

    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function () {
        jasmine.addMatchers( customMatchers );
    } );

    describe( '#new FileLoader( URL, context, onloadCallback )', function () {

        it( "should return true on callback function if url supplied is valid", function ( done ) {
            var fileLoader = new FileLoader( 'audio/sineloopstereo.wav', context, function ( response ) {
                expect( response )
                    .toEqual( true );
                done();
            } );
        } );

        it( "should return false on callback function if url supplied is blank", function ( done ) {
            var fileLoader = new FileLoader( '', context, function ( response ) {
                expect( response )
                    .toEqual( false );
                done();
            } );
        } );

        it( "should return false on callback function if url supplied is not a url", function ( done ) {
            var fileLoader = new FileLoader( 'abcdef', context, function ( response ) {
                expect( response )
                    .toEqual( false );
                done();
            } );
        } );

        it( "should return false on callback function if url supplied is broken", function ( done ) {
            var fileLoader = new FileLoader( 'audio/doesnotexist.wav', context, function ( response ) {
                expect( response )
                    .toEqual( false );
                done()
            } );
        } );

        it( "should be able to accept a file/blob object", function ( done ) {

            var context = new AudioContext();
            var request = new XMLHttpRequest();

            request.open( 'GET', 'audio/sineloopstereo.wav', true );
            request.responseType = 'blob';

            request.onload = function () {
                var fileloader = new FileLoader( request.response, context, function ( response ) {
                    expect( response )
                        .toEqual( true );
                    done();
                } );
            };
            request.send();
        } );
    } );

    describe( '#getBuffer', function () {

        it( "should return a buffer if file is loaded", function ( done ) {
            var fileLoader = new FileLoader( mp3File, context, function ( response ) {
                expect( fileLoader.getBuffer() )
                    .toBeInstanceOf( AudioBuffer );
                done();
            } );

        } );

        it( "should throw an error if no buffer is available", function ( done ) {
            var fileLoader = new FileLoader( '', context, function ( response ) {
                expect( fileLoader.getBuffer() )
                    .toBeNull();
                done();
            } );
        } );
    } );

    describe( '#getRawBuffer', function () {

        it( "should return the original unsliced buffer", function ( done ) {
            var fileLoader = new FileLoader( mp3File, context, function () {
                expect( fileLoader.getBuffer()
                        .length )
                    .not.toEqual( fileLoader.getRawBuffer()
                        .length );
                expect( fileLoader.getRawBuffer() )
                    .toBeInstanceOf( AudioBuffer );
                done();
            } );
        } );

        it( "should have a buffer length greater than the sliced buffer", function ( done ) {
            var fileLoader = new FileLoader( mp3File, context, function () {
                var buffer = fileLoader.getBuffer();
                var rawBuffer = fileLoader.getRawBuffer();
                expect( buffer.length )
                    .not.toBeGreaterThan( rawBuffer.length );
                done();
            } );

        } );

        it( "should throw an error if no buffer is available", function ( done ) {
            var fileLoader = new FileLoader( '', context, function ( response ) {
                expect( fileLoader.getBuffer() )
                    .toBeNull();
                done();
            } );
        } );
    } );

    describe( '#isLoaded', function () {
        it( "should return true if buffer is loaded", function ( done ) {
            var fileLoader = new FileLoader( mp3File, context, function ( response ) {
                expect( response )
                    .toEqual( true );
                expect( fileLoader.isLoaded() )
                    .toEqual( true );
                done();
            } );
        } );
    } );
} );

},{"core/FileLoader":13}],38:[function(require,module,exports){
"use strict";
var multiFileLoader = require( 'core/MultiFileLoader' );
var SPAudioBuffer = require( 'core/SPAudioBuffer' );
console.log( "Running MultiFileLoader Test... " );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
var validSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav' ];
var invalidSounds = [ 'doesnotexist.wav', 'fakefile.mp3' ];
describe( 'MultiFileLoader.js', function () {

    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function () {
        jasmine.addMatchers( customMatchers );
    } );

    describe( '# multiFileLoader( sounds, audioContext, onAllLoad, onProgressCallback ) ', function () {
        it( "should return status true and an array of buffers on callback if urls supplied is valid", function ( done ) {
            multiFileLoader.call( {
                maxSources: 8,
                minSources: 1
            }, validSounds, context, null, function ( status, buffers ) {
                expect( status )
                    .toBe( true );
                expect( buffers.length )
                    .toBeDefined();
                expect( buffers.length )
                    .toBeGreaterThan( 0 );
                buffers.forEach( function ( thisBuffer ) {
                    expect( thisBuffer.isSPAudioBuffer ).toBe( true );
                } );
                expect( buffers[ 0 ].numberOfChannels )
                    .toBe( 2 );
                expect( buffers[ 1 ].numberOfChannels )
                    .toBe( 2 );
                expect( buffers[ 2 ].numberOfChannels )
                    .toBe( 1 );
                done();
            } );
        } );

        it( "should return status false and array of undefined on callback if urls supplied is invalid", function ( done ) {
            multiFileLoader.call( {
                maxSources: 8,
                minSources: 1
            }, invalidSounds, context, null, function ( status, buffers ) {
                expect( status )
                    .toBe( false );
                expect( buffers.length )
                    .toBeDefined();
                expect( buffers.length )
                    .toBe( invalidSounds.length );
                done();
            } );
        } );
    } );
} );

},{"core/MultiFileLoader":14,"core/SPAudioBuffer":15}],39:[function(require,module,exports){
"use strict";
var SPAudioBuffer = require( 'core/SPAudioBuffer' );
console.log( "Running SPAudioBuffer Test... " );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}

describe( 'SPAudioBuffer.js', function () {

    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function () {
        jasmine.addMatchers( customMatchers );
    } );

    describe( '#new ', function () {
        it( "should be able to create a new SPAudioBuffer", function () {
            var buffer;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBeDefined();
        } );

        it( "should be able to create a new SPAudioBuffer", function () {
            var buffer;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, new File( [ "" ], "filename" ), 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBeDefined();
        } );

        it( "should be able to create a new SPAudioBuffer", function () {
            var buffer;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, window.context.createBuffer( 1, length, window.context.sampleRate ), startPoint, endPoint );
                } )
                .not.toThrowError();

            expect( buffer.buffer )
                .toBeDefined();
        } );

        it( "should be able to create a new SPAudioBuffer", function () {
            var buffer;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBeDefined();
            expect( buffer.buffer )
                .toBeDefined();
        } );
    } );

    describe( 'numberOfChannels property ', function () {
        it( "should return 0 if no buffer is set", function () {
            var buffer;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sampleRate )
                .toBe( 0 );
        } );

        it( "should store and return the numberOfChannels property based on the buffer", function () {
            var buffer;
            var numCh = 2;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", startPoint, endPoint, window.context.createBuffer( numCh, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            expect( buffer.numberOfChannels )
                .toBe( numCh );
        } );

    } );

    describe( 'sampleRate property ', function () {
        it( "should return 0 if no buffer is set", function () {
            var buffer;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sampleRate )
                .toBe( 0 );
        } );

        it( "should store and return the sampleRate property based on the buffer", function () {
            var buffer;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, "audio/sineloopstereo.wav", startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            expect( buffer.sampleRate )
                .toBe( window.context.sampleRate );
        } );

    } );

    describe( 'source url property', function () {
        it( "should store and return a string sourceURL property", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav";
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBe( sourceURL );
        } );

        it( "should store and return a buffer sourceURL property", function () {
            var buffer;
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            var sourceURL = window.context.createBuffer( 1, length, window.context.sampleRate );
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, startPoint, endPoint );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBeNull();
        } );

        it( "should store and return a file sourceURL property", function () {
            var buffer;
            var sourceURL = new File( [ "" ], "filename" );
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, 0, 1 );
                } )
                .not.toThrowError();

            expect( buffer.sourceURL )
                .toBe( sourceURL );
        } );
    } );

    describe( 'startPoint property', function () {
        it( "should allow setting of startPoint", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav";
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            var newStart = Math.random();
            expect( function () {
                    buffer.startPoint = newStart
                } )
                .not.toThrowError();
            expect( buffer.startPoint ).toBe( newStart );
        } );

    } );

    describe( 'endPoint property', function () {
        it( "should allow setting of endPoint", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav";
            var startPoint = 0;
            var endPoint = 1;
            var length = ( ( endPoint - startPoint ) * window.context.sampleRate ) + 1;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL, startPoint, endPoint, window.context.createBuffer( 1, length, window.context.sampleRate ) );
                } )
                .not.toThrowError();

            var newEnd = Math.random();
            expect( function () {
                    buffer.endPoint = newEnd
                } )
                .not.toThrowError();
            expect( buffer.endPoint ).toBe( newEnd );
        } );
    } );

    describe( 'buffer property', function () {
        it( "should allow setting of buffer property", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav";
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL );
                } )
                .not.toThrowError();

            var newBuffer = window.context.createBuffer( 1, 44100, window.context.sampleRate )
            expect( function () {
                    buffer.buffer = newBuffer
                } )
                .not.toThrowError();
            expect( buffer.buffer ).toBeInstanceOf( AudioBuffer );
        } );

        it( "should clip to start and end points", function () {
            var buffer;
            var sourceURL = "audio/sineloopstereo.wav"
            var samplingRate = window.context.sampleRate;
            expect( function () {
                    buffer = new SPAudioBuffer( window.context, sourceURL );
                } )
                .not.toThrowError();

            var newBuffer = window.context.createBuffer( 1, samplingRate + 1, samplingRate )
            var startPoint = Math.random();
            //startPoint = 0.6139716017059982;
            var endPoint = Math.min( startPoint + Math.random(), 1 );
            //endPoint = 0.9019752161111683;
            console.log( 'clip', startPoint, endPoint );
            var length = Math.ceil( ( endPoint - startPoint ) * samplingRate ) + 1;
            expect( function () {
                    buffer.buffer = newBuffer
                    buffer.startPoint = startPoint;
                    buffer.endPoint = endPoint;
                } )
                .not.toThrowError();
            expect( buffer.buffer ).toBeInstanceOf( AudioBuffer );
            expect( buffer.buffer.length ).toBe( Math.ceil( length ) )
        } );
    } );
} );

},{"core/SPAudioBuffer":15}],40:[function(require,module,exports){
"use strict";
var SPAudioBufferSourceNode = require( 'core/SPAudioBufferSourceNode' );
var SPPlaybackRateParam = require( 'core/SPPlaybackRateParam' );
console.log( "Running SPAudioBufferSourceNode Test... " );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}

describe( 'SPAudioBufferSourceNode.js', function () {

    var toneBuffer = createToneBuffer( 11025 );

    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function () {
        jasmine.addMatchers( customMatchers );
    } );

    function createToneBuffer( length ) {
        var array = new Float32Array( length );
        var audioBuf = context.createBuffer( 1, length, 44100 );

        for ( var index = 0; index < length; index++ ) {
            array[ index ] = Math.sin( 440 * 2 * Math.PI * index / context.sampleRate );
        }

        audioBuf.getChannelData( 0 )
            .set( array );
        return audioBuf;
    }

    describe( '#new ', function () {
        it( "should be able to create a new SPAudioBufferSourceNode", function () {
            expect( function () {
                    var sourceNode = new SPAudioBufferSourceNode( context );
                } )
                .not.toThrowError();
        } );
    } );

    describe( '#playbackRate ', function () {
        it( "should be have a parameter called playbackRate", function () {
            var sourceNode = new SPAudioBufferSourceNode( context );
            sourceNode.buffer = toneBuffer;
            expect( sourceNode.playbackRate )
                .toBeDefined();
            expect( sourceNode.playbackRate.isSPPlaybackRateParam )
                .toBe( true );
        } );
    } );

    describe( '#playbackPosition ', function () {
        it( "should be have a parameter called playbackPosition", function () {
            var sourceNode = new SPAudioBufferSourceNode( context );
            expect( sourceNode.playbackPosition )
                .toBeDefined();
        } );
    } );

    describe( '#playbackPosition ', function () {
        it( "playbackPosition should change when a Source is played", function ( done ) {
            var sourceNode = new SPAudioBufferSourceNode( context );
            expect( sourceNode.playbackPosition )
                .toBeDefined();
            sourceNode.connect( context.destination );
            sourceNode.buffer = toneBuffer;
            sourceNode.loop = true;
            expect( sourceNode.playbackPosition )
                .toBe( 0 );
            sourceNode.start( context.currentTime, 0, toneBuffer.duration );
            setTimeout( function () {
                sourceNode.stop( 0 );
                console.log( sourceNode.playbackPosition );
                expect( sourceNode.playbackPosition )
                    .not.toBe( 0 );
                done();
            }, 200 );
        } );
    } );

    describe( '#connect / #disconnect should', function () {
        it( "should be able to connect to and disconnect from destination", function () {
            var sourceNode = new SPAudioBufferSourceNode( context );
            expect( function () {
                    sourceNode.connect( context.destination );
                } )
                .not.toThrowError();
            expect( function () {
                    sourceNode.disconnect();
                } )
                .not.toThrowError();
        } );
    } );

    describe( '#start/#stop', function () {
        it( "should be able to start/stop sounds without errors", function ( done ) {
            var sourceNode = new SPAudioBufferSourceNode( context );
            sourceNode.connect( context.destination );
            sourceNode.buffer = toneBuffer;
            sourceNode.loop = true;
            expect( function () {
                    sourceNode.start( context.currentTime, 0, toneBuffer.duration );
                    setTimeout( function () {
                        sourceNode.stop( 0 );
                        done();
                    }, 500 );
                } )
                .not.toThrowError();
        } );
    } );

    describe( '#reset ', function () {
        it( "should be reset it's buffer when resetBufferSource is called", function ( done ) {
            var sourceNode = new SPAudioBufferSourceNode( context );
            sourceNode.connect( context.destination );
            sourceNode.buffer = toneBuffer;
            expect( function () {
                    sourceNode.start( context.currentTime, 0, toneBuffer.duration );
                    sourceNode.stop( context.currentTime + 1 );
                    sourceNode.resetBufferSource( 0, context.destination );
                    sourceNode.start( context.currentTime + 1.5, 0, toneBuffer.duration );
                    sourceNode.stop( context.currentTime + 2 );
                } )
                .not.toThrowError();
            done();
        } );
    } );
} );

},{"core/SPAudioBufferSourceNode":16,"core/SPPlaybackRateParam":18}],41:[function(require,module,exports){
"use strict";
var SPAudioParam = require( 'core/SPAudioParam' );
console.log( "Running SPAudioParam Test... " );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}

describe( 'SPAudioParam.js', function () {

    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function () {
        jasmine.addMatchers( customMatchers );
    } );

    describe( '#new ', function () {
        it( "should be able to create a new SPAudioParam", function () {
            var param;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', 0.0, 10, 1, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.name )
                .toBeDefined();
            expect( param.defaultValue )
                .toBeDefined();
        } );
    } );

    describe( 'value property ', function () {
        it( "should be able accept a value property between max and min", function () {
            var param;
            var max = 10;
            var min = 1;
            var value = ( Math.random() * ( max - min ) ) + min;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', min, max, value, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.value )
                .toBe( value );
        } );

        it( "should be clamped if the value is below min", function () {
            var param;
            var max = 10;
            var min = 1;
            var value = min - Math.random() * max;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', min, max, value, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.value )
                .toBe( min );
        } );

        it( "should be clamped if the value is above max", function () {
            var param;
            var max = 10;
            var min = 1;
            var value = Math.random() * max + max;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', min, max, value, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.value )
                .toBe( max );
        } );
    } );

    describe( 'mappingFunction', function () {
        it( "should be called on the set value", function () {
            var param;
            var max = 10;
            var min = 1;
            var mappingFunction = jasmine.createSpy( 'mappingFunction' );
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', min, max, 1, null, mappingFunction, null, context );
                } )
                .not.toThrowError();

            var value = ( Math.random() * ( max - min ) ) + min;
            param.value = value;
            expect( mappingFunction )
                .toHaveBeenCalledWith( value );
        } );
    } );

    describe( 'setter', function () {
        it( "should be called on the set value", function () {
            var param;
            var max = 10;
            var min = 1;
            var setter = jasmine.createSpy( 'setter' );
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', 0.0, 10, 1, null, null, setter, context );
                    var value = ( Math.random() * ( max - min ) ) + min;
                    param.value = value;
                    expect( setter )
                        .toHaveBeenCalledWith( null, value, context );
                } )
                .not.toThrowError();
        } );
    } );

    describe( 'parameter automation', function () {
        it( " should be defined", function () {
            var param;
            expect( function () {
                    param = new SPAudioParam( {
                        audioContext: window.context
                    }, 'playSpeed', 0.0, 10, 1, null, null, null, context );
                } )
                .not.toThrowError();

            expect( param.setValueAtTime )
                .toBeDefined();
            expect( param.setTargetAtTime )
                .toBeDefined();
            expect( param.setValueCurveAtTime )
                .toBeDefined();
            expect( param.linearRampToValueAtTime )
                .toBeDefined();
            expect( param.exponentialRampToValueAtTime )
                .toBeDefined();
            expect( param.cancelScheduledValues )
                .toBeDefined();
        } );
    } );
} );

},{"core/SPAudioParam":17}],42:[function(require,module,exports){
/* proxyquireify injected requires to make browserify include dependencies in the bundle */ /* istanbul ignore next */; (function __makeBrowserifyIncludeModule__() { require('core/SoundQueue');});var looperSpies = {
    start: jasmine.createSpy( 'start' ),
    stop: jasmine.createSpy( 'stop' ),
    play: jasmine.createSpy( 'play' ),
    pause: jasmine.createSpy( 'pause' ),
    release: jasmine.createSpy( 'release' ),
    setSources: jasmine.createSpy( 'setSources' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    listParams: jasmine.createSpy( 'listParams' ),
    startPointObj: {},
    easeInObj: {
        setValueAtTime: jasmine.createSpy( 'setValueAtTime' )
    },
    maxLoopsObj: {},
    easeOutObj: {
        setValueAtTime: jasmine.createSpy( 'easeOut' )
    },
    playSpeedObj: {
        setValueAtTime: jasmine.createSpy( 'playSpeed' )
    }
};

var looperStub = {
    '../models/Looper': function () {
        return {
            isInitialized: true,
            playSpeed: looperSpies.playSpeedObj,
            easeIn: looperSpies.easeInObj,
            easeOut: looperSpies.easeOutObj,
            startPoint: looperSpies.startPointObj,
            maxLoops: looperSpies.maxLoopsObj,
            start: looperSpies.start,
            stop: looperSpies.stop,
            play: looperSpies.play,
            pause: looperSpies.pause,
            release: looperSpies.release,
            setSources: looperSpies.setSources,
            connect: looperSpies.connect,
            disconnect: looperSpies.disconnect,
            listParams: looperSpies.listParams
        }
    }
};

"use strict";
var proxyquire = require( 'proxyquireify' )( require );
var SoundQueue = proxyquire( 'core/SoundQueue', looperStub );
console.log( "Running SoundQueue Test... " );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
// makeContextRun( context );
var queue;

describe( 'SoundQueue.js', function () {

    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    function loadAndDecode( URL, ondecode ) {
        var request = new XMLHttpRequest();

        request.open( 'GET', URL, true );
        request.responseType = 'arraybuffer';

        request.onload = function () {
            context.decodeAudioData( request.response, function ( buffer ) {
                ondecode( buffer );
            } );
        };
        request.send();
    }

    function resetAlllooperSpies() {
        for ( var key in looperSpies ) {
            if ( looperSpies.hasOwnProperty( key ) && looperSpies[ key ].calls ) {
                looperSpies[ key ].calls.reset();
            }
        }
    }

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        queue = new SoundQueue( context );
        queue.connect( context.destination );
        resetAlllooperSpies();
        done();
    } );

    describe( '#new ', function () {
        it( ' should be able to construct a new SoundQueue with various number of voices', function ( done ) {
            expect( function () {
                    var queue = new SoundQueue( context );
                } )
                .not.toThrowError();

            expect( function () {
                    var queue = new SoundQueue( context, 4 );
                } )
                .not.toThrowError();

            done();
        } );
    } );

    //  this.queueStart = function ( time, eventID, offset, attackDuration ) {
    describe( '#queueStart ', function () {
        it( ' should be able to enqueue a start event without an error', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = Math.random() * 10000;
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 10;

            expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                } )
                .not.toThrowError();

            window.setTimeout( function () {
                expect( looperSpies.start )
                    .toHaveBeenCalledWith( jasmine.any( Number ), offset, undefined, attackDuration );
                done();
            }, 500 );
        } );
    } );

    //  this.queueStop = function ( time, eventID ) {
    describe( '#queueStop ', function () {
        it( ' should be able to enqueue a stop event without an error', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 10;
            expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueStop( time + 0.001, eventID, offset, attackDuration );
                } )
                .not.toThrowError();
            window.setTimeout( function () {
                expect( looperSpies.pause )
                    .toHaveBeenCalled();
                done();
            }, 400 );
        } );

        it( ' an enqued stop event a corresponding start event should be dropped', function ( done ) {
            var time = context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 10;
            expect( function () {
                    queue.queueStop( time, eventID, offset, attackDuration );
                } )
                .not.toThrowError();
            window.setTimeout( function () {
                expect( looperSpies.pause )
                    .not.toHaveBeenCalled();
                done();
            }, 400 );
        } );
    } );

    // this.queueRelease = function ( time, eventID, releaseDuration ) {
    describe( '#queueRelease ', function () {
        it( ' should be able to enqueue a stop event without an error', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 1;
            expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueRelease( time + 0.001, eventID, attackDuration );
                } )
                .not.toThrowError();
            window.setTimeout( function () {
                expect( looperSpies.release )
                    .toHaveBeenCalledWith( jasmine.any( Number ), attackDuration );
                done();
            }, 400 );
        } );

        it( ' an enqued stop event a corresponding start event should be dropped', function ( done ) {
            var time = context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 10;
            expect( function () {
                    queue.queueRelease( time, eventID, offset, attackDuration );
                } )
                .not.toThrowError();
            window.setTimeout( function () {
                expect( looperSpies.release )
                    .not.toHaveBeenCalled();
                done();
            }, 400 );
        } );
    } );

    // this.queueSetParameter = function ( time, eventID, paramName, paramValue ) {
    describe( '#queueSetParameter ', function () {
        it( ' should be able to enqueue a setParameter event without an error of playSpeed', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var paramValue = Math.random() * 10;
            expect( function () {
                    queue.queueStart( time, eventID );
                    queue.queueSetParameter( time + 0.001, eventID, 'playSpeed', paramValue );
                } )
                .not.toThrowError();
            window.setTimeout( function () {
                expect( looperSpies.playSpeedObj.setValueAtTime )
                    .toHaveBeenCalled();
                done();
            }, 400 );
        } );

        it( ' should be able to enqueue a setParameter event without an error on easeOut', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var paramValue = Math.random() * 10;
            expect( function () {
                    queue.queueStart( time, eventID );
                    queue.queueSetParameter( time + 0.001, eventID, 'easeOut', paramValue );
                } )
                .not.toThrowError();
            window.setTimeout( function () {
                expect( looperSpies.easeOutObj.setValueAtTime )
                    .toHaveBeenCalled();
                done();
            }, 400 );
        } );

        it( ' should not call the setValueAtTime if parameter doesn\'t exists', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var paramValue = Math.random() * 10;
            expect( function () {
                    queue.queueStart( time, eventID );
                    queue.queueSetParameter( time + 0.001, eventID, 'randomParameter', paramValue );
                } )
                .not.toThrowError();
            done();
        } );
    } );

    // this.queueSetSource = function ( time, eventID, sourceBuffer ) {
    describe( '#queueSetSource ', function () {
        it( ' should be able to enqueue a setSource event without an error', function ( done ) {

            loadAndDecode( 'audio/sineloopstereomarked.wav', function ( buffer ) {
                var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
                var eventID = parseInt( Math.random() * 10000 );
                expect( function () {
                        queue.queueSetSource( time, eventID, buffer );
                    } )
                    .not.toThrowError();

                window.setTimeout( function () {
                    expect( looperSpies.setSources )
                        .toHaveBeenCalled();
                    done();
                }, 400 );
            } );
        } );

        it( ' should be able to throw an error if the source is bad', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 10;
            expect( function () {
                    queue.queueStart( time, eventID, null );
                } )
                .not.toThrowError();

            window.setTimeout( function () {
                expect( looperSpies.setSources )
                    .not.toHaveBeenCalled();
                done();
            }, 400 );
        } );
    } );

    // this.queueUpdate = function ( eventType, eventID, propertyName, propertyValue ) {
    describe( '#queueUpdate ', function () {
        it( ' should be able to update an event without an error', function ( done ) {
            var time = context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 10;
            expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueSetParameter( time + 0.2, eventID, 'easeIn', attackDuration );
                } )
                .not.toThrowError();

            expect( function () {
                    queue.queueUpdate( 'QESETPARAM', eventID, 'paramValue', attackDuration + 1 );
                } )
                .not.toThrowError();

            window.setTimeout( function () {
                expect( looperSpies.easeInObj.setValueAtTime )
                    .toHaveBeenCalledWith( attackDuration + 1, time + 0.2 );
                done();
            }, 600 );
        } );
    } );

    // this.stop = function ( when ) {
    describe( '#pause/stop ', function () {
        it( ' should be able to pause an empty queue', function ( done ) {
            expect( function () {
                    queue.pause();
                } )
                .not.toThrowError();
            done();
        } );

        it( ' should be able to pause a running queue', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 10;
            expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueSetParameter( time, eventID, 'easeIn', attackDuration );
                } )
                .not.toThrowError();

            window.setTimeout( function () {
                expect( function () {
                        queue.pause();
                        //looperSpies.start.calls.reset();
                    } )
                    .not.toThrowError();
            }, 400 );

            window.setTimeout( function () {
                expect( looperSpies.release )
                    .toHaveBeenCalled();

                expect( looperSpies.start )
                    .toHaveBeenCalled();
                expect( looperSpies.easeInObj.setValueAtTime )
                    .toHaveBeenCalled();
                done();
            }, 1000 );

        } );

        it( ' should be able to gracefully not stop the queue if had been already started', function ( done ) {
            var time = ( Math.random() - 0.1 ) * 0.2 + context.currentTime;
            var eventID = parseInt( Math.random() * 10000 );
            var offset = Math.random() * 100;
            var attackDuration = Math.random() * 10;
            expect( function () {
                    queue.queueStart( time, eventID, offset, attackDuration );
                    queue.queueStart( time + 0.5, eventID, offset, attackDuration );
                    queue.queueSetParameter( time + 0.5, eventID, 'easeIn', attackDuration );
                } )
                .not.toThrowError();

            window.setTimeout( function () {
                expect( function () {
                        queue.pause();
                        looperSpies.start.calls.reset();
                        looperSpies.easeInObj.setValueAtTime.calls.reset();
                    } )
                    .not.toThrowError();
            }, 200 );

            window.setTimeout( function () {
                expect( looperSpies.release )
                    .toHaveBeenCalled();

                expect( looperSpies.start )
                    .not.toHaveBeenCalled();
                expect( looperSpies.easeInObj.setValueAtTime )
                    .not.toHaveBeenCalled();

                done();
            }, 1000 );

        } );

    } );

    // this.connect = function ( destination, output, input ) {
    // this.disconnect = function ( outputIndex ) {
    describe( '#connect/disconnect ', function () {
        it( ' should be able to connect to an AudioNode', function ( done ) {
            expect( function () {
                    queue.connect( context.destination );
                } )
                .not.toThrowError();
            done();
        } );
        it( ' should be able to disconnect from an AudioNode', function ( done ) {
            expect( function () {
                    queue.connect( context.destination );
                    queue.connect();
                } )
                .not.toThrowError();
            done();
        } );
    } );
} );

},{"core/SoundQueue":20,"proxyquireify":6}],43:[function(require,module,exports){
"use strict";
var Compressor = require( 'effects/Compressor' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
describe( 'Compressor.js', function () {
    var filter;
    var internalSpies = {};
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };
    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        if ( !filter ) {
            console.log( "Initing Compressor.." );
            filter = new Compressor( window.context );
        }
        done();
    } );

    describe( '#new Compressor( context )', function () {

        it( "should have audioContext available", function () {
            expect( filter.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 0", function () {
            expect( filter.minSources ).toBe( 0 );
        } );

        it( "should have a maximum number of sources as 0", function () {
            expect( filter.maxSources ).toBe( 0 );
        } );

        it( "should have atleast 1 input", function () {
            expect( filter.numberOfInputs ).toBeGreaterThan( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( filter.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Compressor", function () {
            expect( filter.effectName ).toBe( 'Compressor' );
        } );

        it( "should be a BaseEffect", function () {
            expect( filter.isBaseEffect ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( filter.isInitialized ).toBe( true );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter attack", function () {

            expect( filter.attack.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.attack = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.attack;
            } ).toThrowError();

            expect( filter.attack.name ).toBe( 'attack' );
            expect( filter.attack.value ).toBe( 0.003 );
            expect( filter.attack.minValue ).toBe( 0 );
            expect( filter.attack.maxValue ).toBe( 1 );

        } );

        it( "should have a valid parameter knee", function () {

            expect( filter.knee.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.knee = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.knee;
            } ).toThrowError();

            expect( filter.knee.name ).toBe( 'knee' );
            expect( filter.knee.value ).toBe( 30 );
            expect( filter.knee.minValue ).toBe( 0 );
            expect( filter.knee.maxValue ).toBe( 40 );

        } );

        it( "should have a valid parameter ratio", function () {

            expect( filter.ratio.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.ratio = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.ratio;
            } ).toThrowError();

            expect( filter.ratio.name ).toBe( 'ratio' );
            expect( filter.ratio.value ).toBe( 12 );
            expect( filter.ratio.minValue ).toBe( 0 );
            expect( filter.ratio.maxValue ).toBe( 20 );

        } );

        it( "should have a valid parameter release", function () {

            expect( filter.release.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.release = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.release;
            } ).toThrowError();

            expect( filter.release.name ).toBe( 'release' );
            expect( filter.release.value ).toBe( 0.25 );
            expect( filter.release.minValue ).toBe( 0 );
            expect( filter.release.maxValue ).toBe( 1 );

        } );

        it( "should have a valid parameter threshold", function () {

            expect( filter.threshold.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.threshold = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.threshold;
            } ).toThrowError();

            expect( filter.threshold.name ).toBe( 'threshold' );
            expect( filter.threshold.value ).toBe( -24 );
            expect( filter.threshold.minValue ).toBe( -100 );
            expect( filter.threshold.maxValue ).toBe( 0 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( filter.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( filter.disconnect ).toBeInstanceOf( Function );
        } );

    } );
} );

},{"effects/Compressor":22}],44:[function(require,module,exports){
"use strict";
var Distorter = require( 'effects/Distorter' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
describe( 'Distorter.js', function () {
    var distorter;
    var internalSpies = {};
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };
    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        if ( !distorter ) {
            console.log( "Initing Distorter.." );
            distorter = new Distorter( window.context );
        }
        done();
    } );

    describe( '#new Distorter( context )', function () {

        it( "should have audioContext available", function () {
            expect( distorter.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 0", function () {
            expect( distorter.minSources ).toBe( 0 );
        } );

        it( "should have a maximum number of sources as 0", function () {
            expect( distorter.maxSources ).toBe( 0 );
        } );

        it( "should have atleast 1 input", function () {
            expect( distorter.numberOfInputs ).toBeGreaterThan( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( distorter.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Distorter", function () {
            expect( distorter.effectName ).toBe( 'Distorter' );
        } );

        it( "should be a BaseEffect", function () {
            expect( distorter.isBaseEffect ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( distorter.isInitialized ).toBe( true );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter drive", function () {

            expect( distorter.drive.isSPAudioParam ).toBe( true );

            expect( function () {
                distorter.drive = 0;
            } ).toThrowError();

            expect( function () {
                delete distorter.drive;
            } ).toThrowError();

            expect( distorter.drive.name ).toBe( 'drive' );
            expect( distorter.drive.value ).toBe( 0.5 );
            expect( distorter.drive.minValue ).toBe( 0 );
            expect( distorter.drive.maxValue ).toBe( 1.0 );

        } );

        it( "should have a valid parameter color", function () {

            expect( distorter.color.isSPAudioParam ).toBe( true );

            expect( function () {
                distorter.color = 0;
            } ).toThrowError();

            expect( function () {
                delete distorter.color;
            } ).toThrowError();

            expect( distorter.color.name ).toBe( 'color' );
            expect( distorter.color.value ).toBe( 800 );
            expect( distorter.color.minValue ).toBe( 0 );
            expect( distorter.color.maxValue ).toBe( 22050 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( distorter.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( distorter.disconnect ).toBeInstanceOf( Function );
        } );

    } );
} );

},{"effects/Distorter":23}],45:[function(require,module,exports){
"use strict";
var Fader = require( 'effects/Fader' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
describe( 'Fader.js', function () {
    var fader;
    var internalSpies = {};
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };
    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        if ( !fader ) {
            console.log( "Initing Fader.." );
            fader = new Fader( window.context );
        }
        done();
    } );

    describe( '#new Fader( context )', function () {

        it( "should have audioContext available", function () {
            expect( fader.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 0", function () {
            expect( fader.minSources ).toBe( 0 );
        } );

        it( "should have a maximum number of sources as 0", function () {
            expect( fader.maxSources ).toBe( 0 );
        } );

        it( "should have atleast 1 input", function () {
            expect( fader.numberOfInputs ).toBeGreaterThan( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( fader.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Fader", function () {
            expect( fader.effectName ).toBe( 'Fader' );
        } );

        it( "should be a BaseEffect", function () {
            expect( fader.isBaseEffect ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( fader.isInitialized ).toBe( true );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter volume", function () {

            expect( fader.volume.isSPAudioParam ).toBe( true );

            expect( function () {
                fader.volume = 0;
            } ).toThrowError();

            expect( function () {
                delete fader.volume;
            } ).toThrowError();

            expect( fader.volume.name ).toBe( 'volume' );
            expect( fader.volume.value ).toBe( 100 );
            expect( fader.volume.minValue ).toBe( 0 );
            expect( fader.volume.maxValue ).toBe( 100 );

        } );

        it( "should have a valid parameter volumeInDB", function () {

            expect( fader.volumeInDB.isSPAudioParam ).toBe( true );

            expect( function () {
                fader.volumeInDB = 0;
            } ).toThrowError();

            expect( function () {
                delete fader.volumeInDB;
            } ).toThrowError();

            expect( fader.volumeInDB.name ).toBe( 'volumeInDB' );
            expect( fader.volumeInDB.value ).toBe( 0 );
            expect( fader.volumeInDB.minValue ).toBe( -80 );
            expect( fader.volumeInDB.maxValue ).toBe( 0 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( fader.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( fader.disconnect ).toBeInstanceOf( Function );
        } );

    } );
} );

},{"effects/Fader":24}],46:[function(require,module,exports){
"use strict";
var Filter = require( 'effects/Filter' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
describe( 'Filter.js', function () {
    var filter;
    var internalSpies = {};
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };
    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        if ( !filter ) {
            console.log( "Initing Filter.." );
            filter = new Filter( window.context );
        }
        done();
    } );

    describe( '#new Filter( context )', function () {

        it( "should have audioContext available", function () {
            expect( filter.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 0", function () {
            expect( filter.minSources ).toBe( 0 );
        } );

        it( "should have a maximum number of sources as 0", function () {
            expect( filter.maxSources ).toBe( 0 );
        } );

        it( "should have atleast 1 input", function () {
            expect( filter.numberOfInputs ).toBeGreaterThan( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( filter.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Filter", function () {
            expect( filter.effectName ).toBe( 'Filter' );
        } );

        it( "should be a BaseEffect", function () {
            expect( filter.isBaseEffect ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( filter.isInitialized ).toBe( true );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter frequency", function () {

            expect( filter.frequency.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.frequency = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.frequency;
            } ).toThrowError();

            expect( filter.frequency.name ).toBe( 'frequency' );
            expect( filter.frequency.value ).toBe( 350 );
            expect( filter.frequency.minValue ).toBe( 10 );
            expect( filter.frequency.maxValue ).toBe( filter.audioContext.sampleRate / 2 );

        } );

        it( "should have a valid parameter detune", function () {

            expect( filter.detune.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.detune = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.detune;
            } ).toThrowError();

            expect( filter.detune.name ).toBe( 'detune' );
            expect( filter.detune.value ).toBe( 0 );
            expect( filter.detune.minValue ).toBe( -1200 );
            expect( filter.detune.maxValue ).toBe( 1200 );

        } );

        it( "should have a valid parameter Q", function () {

            expect( filter.Q.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.Q = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.Q;
            } ).toThrowError();

            expect( filter.Q.name ).toBe( 'Q' );
            expect( filter.Q.value ).toBe( 1 );
            expect( filter.Q.minValue ).toBe( 0.0001 );
            expect( filter.Q.maxValue ).toBe( 1000 );

        } );

        it( "should have a valid parameter type", function () {

            expect( filter.type.isSPAudioParam ).toBe( true );

            expect( function () {
                filter.type = 0;
            } ).toThrowError();

            expect( function () {
                delete filter.type;
            } ).toThrowError();

            expect( filter.type.name ).toBe( 'type' );
            expect( filter.type.value ).toBe( 'lowpass' );
            expect( filter.type.minValue ).toBe( 'lowpass' );
            expect( filter.type.maxValue ).toBe( 'allpass' );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( filter.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( filter.disconnect ).toBeInstanceOf( Function );
        } );

    } );
} );

},{"effects/Filter":25}],47:[function(require,module,exports){
"use strict";
var Panner = require( 'effects/Panner' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
describe( 'Panner.js', function () {
    var panner;
    var internalSpies = {};
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };
    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        if ( !panner ) {
            console.log( "Initing Panner.." );
            panner = new Panner( window.context );
        }
        done();
    } );

    describe( '#new Panner( context )', function () {

        it( "should have audioContext available", function () {
            expect( panner.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 0", function () {
            expect( panner.minSources ).toBe( 0 );
        } );

        it( "should have a maximum number of sources as 0", function () {
            expect( panner.maxSources ).toBe( 0 );
        } );

        it( "should have atleast 1 input", function () {
            expect( panner.numberOfInputs ).toBeGreaterThan( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( panner.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Panner", function () {
            expect( panner.effectName ).toBe( 'Panner' );
        } );

        it( "should be a BaseSound", function () {
            expect( panner.isBaseEffect ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( panner.isInitialized ).toBe( true );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter pan", function () {

            expect( panner.pan.isSPAudioParam ).toBe( true );

            expect( function () {
                panner.pan = 0;
            } ).toThrowError();

            expect( function () {
                delete panner.pan;
            } ).toThrowError();

            expect( panner.pan.name ).toBe( 'pan' );
            expect( panner.pan.value ).toBe( 0 );
            expect( panner.pan.minValue ).toBe( -90 );
            expect( panner.pan.maxValue ).toBe( 90 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( panner.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( panner.disconnect ).toBeInstanceOf( Function );
        } );

    } );
} );

},{"effects/Panner":26}],48:[function(require,module,exports){
/* proxyquireify injected requires to make browserify include dependencies in the bundle */ /* istanbul ignore next */; (function __makeBrowserifyIncludeModule__() { require('models/Activity');});"use strict";
var Activity = require( 'models/Activity' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
describe( 'Activity.js', function () {
    var activity;
    var internalSpies = {
        onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
        onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
        onAudioStart: jasmine.createSpy( 'onAudioStart' ),
        onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
    };
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };
    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllInternalSpies();
        if ( !activity ) {
            console.log( "Initing Activity.." );
            activity = new Activity( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } else {
            done();
        }
    } );

    function resetAllInternalSpies() {
        for ( var key in internalSpies ) {
            if ( internalSpies.hasOwnProperty( key ) && internalSpies[ key ].calls ) {
                internalSpies[ key ].calls.reset();
            }
        }
    }

    describe( '#new Activity( context )', function () {

        it( "should have audioContext available", function () {
            expect( activity.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( activity.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( activity.maxSources ).toBeGreaterThan( 1 );
        } );

        it( "should have no inputs", function () {
            expect( activity.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( activity.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Activity", function () {
            expect( activity.modelName ).toBe( 'Activity' );
        } );

        it( "should be a BaseSound", function () {
            expect( activity.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( activity.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            activity = new Activity( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            activity = new Activity( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( activity.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            activity.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            activity.setSources( listofSounds[ 0 ], progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            activity.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter maxSpeed", function () {

            expect( activity.maxSpeed.isSPAudioParam ).toBe( true );
            expect( activity.maxSpeed.name ).toBe( 'maxSpeed' );
            expect( activity.maxSpeed.value ).toBe( 1.0 );
            expect( activity.maxSpeed.minValue ).toBe( 0.05 );
            expect( activity.maxSpeed.maxValue ).toBe( 8 );

        } );

        it( "should have a valid parameter easeIn", function () {

            "use strict";
            expect( activity.easeIn.isSPAudioParam ).toBe( true );

            expect( function () {
                activity.easeIn = 0;
            } ).toThrowError();

            expect( function () {
                delete activity.easeIn;
            } ).toThrowError();

            expect( activity.easeIn.name ).toBe( 'easeIn' );
            expect( activity.easeIn.value ).toBe( 1 );
            expect( activity.easeIn.minValue ).toBe( 0.05 );
            expect( activity.easeIn.maxValue ).toBe( 10.0 );

        } );

        it( "should have a valid parameter easeOut", function () {
            "use strict";
            expect( activity.easeOut.isSPAudioParam ).toBe( true );
            expect( function () {
                activity.easeOut = 0;
            } ).toThrowError();

            expect( function () {
                delete activity.easeOut;
            } ).toThrowError();

            expect( activity.easeOut.name ).toBe( 'easeOut' );
            expect( activity.easeOut.value ).toBe( 1 );
            expect( activity.easeOut.minValue ).toBe( 0.05 );
            expect( activity.easeOut.maxValue ).toBe( 10.0 );

        } );

        it( "should have a valid parameter action", function () {
            "use strict";
            expect( activity.action.isSPAudioParam ).toBe( true );

            expect( function () {
                activity.action = 0;
            } ).toThrowError();
            expect( function () {
                delete activity.action;
            } ).toThrowError();

            expect( activity.action.name ).toBe( 'action' );
            expect( activity.action.value ).toBe( 0 );
            expect( activity.action.minValue ).toBe( 0 );
            expect( activity.action.maxValue ).toBe( 1 );

        } );

        it( "should have a valid parameter sensitivity", function () {
            "use strict";
            expect( activity.sensitivity.isSPAudioParam ).toBe( true );

            expect( function () {
                activity.sensitivity = 0;
            } ).toThrowError();
            expect( function () {
                delete activity.sensitivity;
            } ).toThrowError();

            expect( activity.sensitivity.name ).toBe( 'sensitivity' );
            expect( activity.sensitivity.value ).toBe( 0.5 );
            expect( activity.sensitivity.minValue ).toBe( 0 );
            expect( activity.sensitivity.maxValue ).toBe( 1 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( activity.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( activity.disconnect ).toBeInstanceOf( Function );
        } );

    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( activity.start ).toBeInstanceOf( Function );
            expect( activity.stop ).toBeInstanceOf( Function );
            expect( activity.play ).toBeInstanceOf( Function );
            expect( activity.pause ).toBeInstanceOf( Function );
            expect( activity.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                activity.start( 0 );
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    activity.stop( 0 );
                } ).not.toThrowError();

                expect( activity.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                activity.play();
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    activity.pause();
                } ).not.toThrowError();

                expect( activity.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    activity.onAudioStart = internalSpies.onAudioStart;
                    activity.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        activity.play();
                    } ).not.toThrowError();

                    expect( activity.isPlaying ).toBe( true );

                    setTimeout( function () {
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                        expect( function () {
                            activity.pause();
                        } ).not.toThrowError();

                        expect( activity.isPlaying ).toBe( false );
                        setTimeout( function () {
                            expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                activity.play();
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    activity.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( activity.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1500 );
            }, 1000 );
        } );
    } );
} );

var sourceSpies = {
    start: jasmine.createSpy( 'start' ),
    stop: jasmine.createSpy( 'stop' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    resetBufferSource: jasmine.createSpy( 'resetBuffer' )
};
var sourceStub = {
    "../core/SPAudioBufferSourceNode": function () {
        return {
            playbackRate: {
                value: 1.0,
                defaultValue: 0,
                setValueAtTime: function () {}
            },
            connect: sourceSpies.connect,
            disconnect: sourceSpies.disconnect,
            start: sourceSpies.start,
            loopStart: 0,
            loopEnd: 1,
            stop: function ( when ) {
                this.onended();
                sourceSpies.stop( when );
            },
            resetBufferSource: sourceSpies.resetBufferSource,
        };
    }
};

var proxyquire = require( 'proxyquireify' )( require );
var sActivity = proxyquire( 'models/Activity', sourceStub );
describe( 'Activity.js with stubbed Source', function () {
    var activity;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };
    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllSourceSpies();
        if ( !activity ) {
            console.log( "Initing Stubbed Activity.." );
            activity = new sActivity( window.context, listofSounds, null, function () {
                done();
            } );
        } else {
            done();
        }
    } );

    function resetAllSourceSpies() {
        for ( var key in sourceSpies ) {
            if ( sourceSpies.hasOwnProperty( key ) && sourceSpies[ key ].calls ) {
                sourceSpies[ key ].calls.reset();
            }
        }
    }
    describe( '#new Activity( context ) ', function () {
        it( "should have audioContext available", function () {
            expect( activity.audioContext ).toBeInstanceOf( AudioContext );
        } );
    } );
    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( activity.start ).toBeInstanceOf( Function );
            expect( activity.stop ).toBeInstanceOf( Function );
            expect( activity.play ).toBeInstanceOf( Function );
            expect( activity.pause ).toBeInstanceOf( Function );
            expect( activity.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                activity.start( 0 );
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            expect( sourceSpies.start ).toHaveBeenCalled();

            expect( function () {
                activity.stop( 0 );
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( false );
            expect( sourceSpies.stop ).toHaveBeenCalled();
            done();
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                activity.play();
            } ).not.toThrowError();

            expect( sourceSpies.start ).toHaveBeenCalled();
            expect( activity.isPlaying ).toBe( true );

            expect( function () {
                activity.pause();
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( false );
            expect( sourceSpies.stop ).toHaveBeenCalled();
            setTimeout( function () {
                expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
            }, 1000 );

            sourceSpies.start.calls.reset();
            sourceSpies.stop.calls.reset();
            sourceSpies.resetBufferSource.calls.reset();

            expect( function () {
                activity.play();
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            expect( sourceSpies.start ).toHaveBeenCalled();

            expect( function () {
                activity.pause();
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( false );
            expect( sourceSpies.stop ).toHaveBeenCalled();
            setTimeout( function () {
                expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                done();
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                activity.play();
            } ).not.toThrowError();

            expect( activity.isPlaying ).toBe( true );
            expect( sourceSpies.start ).toHaveBeenCalled();

            expect( function () {
                activity.release();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( activity.isPlaying ).toBe( false );
                expect( sourceSpies.stop ).toHaveBeenCalled();
                expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );

        it( "should be pass parameters from start to source", function ( done ) {
            var when = Math.random();
            var offset = Math.random() / 2;
            var duration = Math.random() * 2;
            expect( function () {
                activity.start( when, offset, duration, 0.5 );
            } ).not.toThrowError();

            expect( sourceSpies.start ).toHaveBeenCalledWith( when, offset, duration );
            done();
        } );

        it( "should be pass parameters from stop to source", function ( done ) {
            var duration = Math.random() * 2;
            expect( function () {
                activity.start( 0 );
            } ).not.toThrowError();

            expect( function () {
                activity.stop( duration );
            } ).not.toThrowError();

            expect( sourceSpies.stop ).toHaveBeenCalledWith( duration );
            done();
        } );
    } );
} );

},{"models/Activity":27,"proxyquireify":6}],49:[function(require,module,exports){
/* proxyquireify injected requires to make browserify include dependencies in the bundle */ /* istanbul ignore next */; (function __makeBrowserifyIncludeModule__() { require('models/Extender');});"use strict";
var Extender = require( 'models/Extender' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
var internalSpies = {
    onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
    onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
    onAudioStart: jasmine.createSpy( 'onAudioStart' ),
    onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
};
var listofSounds = [ 'audio/surf.mp3' ];
describe( 'Extender.js', function () {
    var extender;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllInternalSpies();
        if ( !extender ) {
            console.log( "Initing Extender.." );
            extender = new Extender( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } else {
            done();
        }
    } );

    function resetAllInternalSpies() {
        for ( var key in internalSpies ) {
            if ( internalSpies.hasOwnProperty( key ) && internalSpies[ key ].calls ) {
                internalSpies[ key ].calls.reset();
            }
        }
    }

    describe( '#new Extender( context )', function () {

        it( "should have audioContext available", function () {
            expect( extender.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( extender.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( extender.maxSources ).toBe( 1 );
        } );

        it( "should have no inputs", function () {
            expect( extender.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( extender.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Extender", function () {
            expect( extender.modelName ).toBe( "Extender" );
        } );

        it( "should be a BaseSound", function () {
            expect( extender.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( extender.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            extender = new Extender( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            extender = new Extender( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( extender.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            extender.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            extender.setSources( listofSounds[ 0 ], progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            extender.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {

        it( "should have a valid parameter pitchShift", function () {
            "use strict";
            expect( extender.pitchShift.isSPAudioParam ).toBe( true );

            expect( function () {
                extender.pitchShift = 0;
            } ).toThrowError();

            expect( function () {
                delete extender.pitchShift;
            } ).toThrowError();

            expect( extender.pitchShift.name ).toBe( 'pitchShift' );
            expect( extender.pitchShift.value ).toBe( 0 );
            expect( extender.pitchShift.minValue ).toBe( -60 );
            expect( extender.pitchShift.maxValue ).toBe( 60 );

        } );

        it( "should have a valid parameter eventPeriod", function () {
            "use strict";
            expect( extender.eventPeriod.isSPAudioParam ).toBe( true );
            expect( function () {
                extender.eventPeriod = 0;
            } ).toThrowError();

            expect( function () {
                delete extender.eventPeriod;
            } ).toThrowError();

            expect( extender.eventPeriod.name ).toBe( 'eventPeriod' );
            expect( extender.eventPeriod.value ).toBe( 2.0 );
            expect( extender.eventPeriod.minValue ).toBe( 0.1 );
            expect( extender.eventPeriod.maxValue ).toBe( 10 );

        } );

        it( "should have a valid parameter crossFadeDuration", function () {
            "use strict";
            expect( extender.crossFadeDuration.isSPAudioParam ).toBe( true );

            expect( function () {
                extender.crossFadeDuration = 0;
            } ).toThrowError();
            expect( function () {
                delete extender.crossFadeDuration;
            } ).toThrowError();

            expect( extender.crossFadeDuration.name ).toBe( 'crossFadeDuration' );
            expect( extender.crossFadeDuration.value ).toBe( 0.5 );
            expect( extender.crossFadeDuration.minValue ).toBe( 0.1 );
            expect( extender.crossFadeDuration.maxValue ).toBe( 0.99 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( extender.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( extender.disconnect ).toBeInstanceOf( Function );
        } );

    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( extender.start ).toBeInstanceOf( Function );
            expect( extender.stop ).toBeInstanceOf( Function );
            expect( extender.play ).toBeInstanceOf( Function );
            expect( extender.pause ).toBeInstanceOf( Function );
            expect( extender.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                extender.start();
            } ).not.toThrowError();

            expect( extender.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    extender.stop();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                extender.play();
            } ).not.toThrowError();

            expect( extender.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    extender.pause();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    extender.onAudioStart = internalSpies.onAudioStart;
                    extender.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        extender.play();
                    } ).not.toThrowError();

                    expect( extender.isPlaying ).toBe( true );

                    setTimeout( function () {
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                        expect( function () {
                            extender.pause();
                        } ).not.toThrowError();

                        expect( extender.isPlaying ).toBe( false );
                        setTimeout( function () {
                            expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                extender.play();
            } ).not.toThrowError();

            expect( extender.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    extender.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( extender.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1500 );
            }, 1000 );
        } );
    } );
} );

var queueSpies = {
    queueStart: jasmine.createSpy( 'queueStart' ),
    queueRelease: jasmine.createSpy( 'queueRelease' ),
    queueSetParameter: jasmine.createSpy( 'queueSetParameter' ),
    queueSetSource: jasmine.createSpy( 'queueSetSource' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    pause: jasmine.createSpy( 'pause' ),
    stop: jasmine.createSpy( 'stop' )
};

var queueStub = {
    "../core/SoundQueue": function () {
        return {
            connect: queueSpies.connect,
            disconnect: queueSpies.disconnect,
            pause: queueSpies.pause,
            stop: queueSpies.stop,
            queueStart: queueSpies.queueStart,
            queueRelease: queueSpies.queueRelease,
            queueSetSource: queueSpies.queueSetSource,
            queueSetParameter: queueSpies.queueSetParameter
        };
    }
};

var proxyquire = require( 'proxyquireify' )( require );
var sExtender = proxyquire( 'models/Extender', queueStub );
describe( 'Extender.js with stubbed Queue', function () {
    var extender;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllSourceSpies();
        if ( !extender ) {
            console.log( "Initing Stubbed Extender.." );
            extender = new sExtender( window.context, listofSounds, null, function () {
                done();
            } );
        } else {
            done();
        }
    } );

    function resetAllSourceSpies() {
        for ( var key in queueSpies ) {
            if ( queueSpies.hasOwnProperty( key ) && queueSpies[ key ].calls ) {
                queueSpies[ key ].calls.reset();
            }
        }
    }
    describe( '#new Extender( context ) ', function () {
        it( "should have audioContext available", function () {
            expect( extender.audioContext ).toBeInstanceOf( AudioContext );
        } );
    } );
    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( extender.start ).toBeInstanceOf( Function );
            expect( extender.stop ).toBeInstanceOf( Function );
            expect( extender.play ).toBeInstanceOf( Function );
            expect( extender.pause ).toBeInstanceOf( Function );
            expect( extender.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                extender.start();
            } ).not.toThrowError();

            expect( extender.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
            }, 2000 );

            expect( function () {
                extender.stop();
            } ).not.toThrowError();

            expect( extender.isPlaying ).toBe( false );
            setTimeout( function () {
                expect( queueSpies.pause ).toHaveBeenCalled();
            }, 2000 );
            done();
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                extender.play();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
                expect( extender.isPlaying ).toBe( true );

                expect( function () {
                    extender.pause();
                } ).not.toThrowError();

                expect( extender.isPlaying ).toBe( false );

                setTimeout( function () {
                    expect( queueSpies.pause ).toHaveBeenCalled();

                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.queueSetParameter.calls.reset();
                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.pause.calls.reset();

                    expect( function () {
                        extender.play();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                        expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                        expect( queueSpies.queueStart ).toHaveBeenCalled();
                        expect( extender.isPlaying ).toBe( true );

                        expect( function () {
                            extender.pause();
                        } ).not.toThrowError();

                        expect( extender.isPlaying ).toBe( false );
                        setTimeout( function () {
                            expect( queueSpies.pause ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                extender.play();
            } ).not.toThrowError();

            expect( extender.isPlaying ).toBe( true );
            expect( queueSpies.queueSetSource ).toHaveBeenCalled();
            expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
            expect( queueSpies.queueStart ).toHaveBeenCalled();

            expect( function () {
                extender.release();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( extender.isPlaying ).toBe( false );
                expect( queueSpies.pause ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );
} );

},{"models/Extender":28,"proxyquireify":6}],50:[function(require,module,exports){
/* proxyquireify injected requires to make browserify include dependencies in the bundle */ /* istanbul ignore next */; (function __makeBrowserifyIncludeModule__() { require('models/Looper');});"use strict";
var Looper = require( 'models/Looper' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
var listofSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav', 'audio/sineloopmonomarked.mp3', 'audio/sineloopstereomarked.mp3', 'audio/sineloopstereomarked.wav' ];
describe( 'Looper.js', function () {
    var originalTimeout;
    var looper;
    var internalSpies = {
        onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
        onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
        onAudioStart: jasmine.createSpy( 'onAudioStart' ),
        onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
    };
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        jasmine.addMatchers( customMatchers );
        resetAllInternalSpies();
        if ( !looper ) {
            console.log( "Initing Looper.." );
            looper = new Looper( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } else {
            done();
        }
    } );

    afterEach( function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    } );

    function resetAllInternalSpies() {
        for ( var key in internalSpies ) {
            if ( internalSpies.hasOwnProperty( key ) && internalSpies[ key ].calls ) {
                internalSpies[ key ].calls.reset();
            }
        }
    }

    describe( '#new Looper( context )', function () {

        it( "should have audioContext available", function () {
            expect( looper.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( looper.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( looper.maxSources ).toBeGreaterThan( 1 );
        } );

        it( "should have no inputs", function () {
            expect( looper.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( looper.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Looper", function () {
            expect( looper.modelName ).toBe( 'Looper' );
        } );

        it( "should be a BaseSound", function () {
            expect( looper.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( looper.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            looper = new Looper( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            looper = new Looper( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( looper.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            looper.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            looper.setSources( listofSounds[ 0 ], progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            looper.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {
        it( "should have a valid parameter playspeed", function () {

            expect( looper.playSpeed.isSPAudioParam ).toBe( true );
            expect( looper.playSpeed.name ).toBe( 'playSpeed' );
            expect( looper.playSpeed.value ).toBe( 1.0 );
            expect( looper.playSpeed.minValue ).toBe( 0.0 );
            expect( looper.playSpeed.maxValue ).toBe( 10.0 );

        } );

        it( "should have a valid parameter easeIn", function () {
            "use strict";
            expect( looper.easeIn.isSPAudioParam ).toBe( true );

            expect( function () {
                looper.easeIn = 0;
            } ).toThrowError();

            expect( function () {
                delete looper.easeIn;
            } ).toThrowError();

            expect( looper.easeIn.name ).toBe( 'easeIn' );
            expect( looper.easeIn.value ).toBe( 0.05 );
            expect( looper.easeIn.minValue ).toBe( 0.05 );
            expect( looper.easeIn.maxValue ).toBe( 10.0 );

        } );

        it( "should have a valid parameter easeOut", function () {
            "use strict";
            expect( looper.easeOut.isSPAudioParam ).toBe( true );
            expect( function () {
                looper.easeOut = 0;
            } ).toThrowError();

            expect( function () {
                delete looper.easeOut;
            } ).toThrowError();

            expect( looper.easeOut.name ).toBe( "easeOut" );
            expect( looper.easeOut.value ).toBe( 0.05 );
            expect( looper.easeOut.minValue ).toBe( 0.05 );
            expect( looper.easeOut.maxValue ).toBe( 10.0 );

        } );

        it( "should have a valid parameter maxLoops", function () {
            "use strict";
            expect( looper.maxLoops.isSPAudioParam ).toBe( true );

            expect( function () {
                looper.maxLoops = 0;
            } ).toThrowError();
            expect( function () {
                delete looper.maxLoops;
            } ).toThrowError();

            expect( looper.maxLoops.name ).toBe( "maxLoops" );
            expect( looper.maxLoops.value ).toBe( -1 );
            expect( looper.maxLoops.minValue ).toBe( -1 );
            expect( looper.maxLoops.maxValue ).toBe( 1 );

        } );

        it( "should have a valid parameter multiTrackGain", function () {
            "use strict";
            expect( looper.multiTrackGain ).toBeInstanceOf( Array );
            expect( looper.multiTrackGain.length ).toBe( listofSounds.length );
            expect( looper.multiTrackGain[ 0 ].isSPAudioParam ).toBe( true );

            expect( function () {
                looper.multiTrackGain = 0;
            } ).toThrowError();
            expect( function () {
                delete looper.multiTrackGain;
            } ).toThrowError();

            expect( looper.multiTrackGain[ 0 ].name ).toBe( 'track-0-gain' );
            expect( looper.multiTrackGain[ 0 ].value ).toBe( 1 );
            expect( looper.multiTrackGain[ 0 ].minValue ).toBe( 0 );
            expect( looper.multiTrackGain[ 0 ].maxValue ).toBe( 1 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( looper.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( looper.disconnect ).toBeInstanceOf( Function );
        } );

    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( looper.start ).toBeInstanceOf( Function );
            expect( looper.stop ).toBeInstanceOf( Function );
            expect( looper.play ).toBeInstanceOf( Function );
            expect( looper.pause ).toBeInstanceOf( Function );
            expect( looper.release ).toBeInstanceOf( Function );
        } );

        it( "should be able to start/stop audio", function ( done ) {
            expect( function () {
                looper.start( 0 );
            } ).not.toThrowError();

            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( looper.isPlaying ).toBe( true );

                expect( function () {
                    looper.stop( 0 );
                } ).not.toThrowError();

                expect( looper.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should able to be play/pause audio", function ( done ) {
            expect( function () {
                looper.play();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( looper.isPlaying ).toBe( true );
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    looper.pause();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    expect( looper.isPlaying ).toBe( false );

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    looper.onAudioStart = internalSpies.onAudioStart;
                    looper.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        looper.play();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                        expect( looper.isPlaying ).toBe( true );

                        expect( function () {
                            looper.pause();
                        } ).not.toThrowError();

                        expect( looper.isPlaying ).toBe( false );
                        setTimeout( function () {
                            expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );
        } );

        it( "should be able to play/release audio", function ( done ) {
            expect( function () {
                looper.play();
            } ).not.toThrowError();

            expect( looper.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    looper.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( looper.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be able to play/release audio with reset", function ( done ) {
            expect( function () {
                looper.play();
            } ).not.toThrowError();

            expect( looper.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    looper.release( null, null, true );
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( looper.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    setTimeout( function () {
                        expect( function () {
                            looper.start( 0 );
                        } ).not.toThrowError();
                        setTimeout( function () {
                            expect( function () {
                                looper.release();
                            } ).not.toThrowError();
                            setTimeout( function () {
                                expect( looper.isPlaying ).toBe( false );
                                done();
                            }, 800 );
                        }, 800 );
                    }, 800 );
                }, 800 );
            }, 800 );
        } );
    } );
} );

var sourceSpies = {
    start: jasmine.createSpy( 'start' ),
    stop: jasmine.createSpy( 'stop' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    resetBufferSource: jasmine.createSpy( 'resetBuffer' )
};

var sourceStub = {
    "../core/SPAudioBufferSourceNode": function () {
        return {
            playbackRate: {
                value: 1.0,
                defaultValue: 0
            },
            connect: sourceSpies.connect,
            disconnect: sourceSpies.disconnect,
            start: sourceSpies.start,
            loopStart: 0,
            loopEnd: 1,
            stop: function ( when ) {
                this.onended();
                sourceSpies.stop( when );
            },
            resetBufferSource: sourceSpies.resetBufferSource,
        };
    }
};

var proxyquire = require( 'proxyquireify' )( require );
var sLooper = proxyquire( 'models/Looper', sourceStub );
describe( 'Looper.js with stubbed Source', function () {
    var looper;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllSourceSpies();
        if ( !looper ) {
            console.log( "Initing Stubbed Looper.." );
            looper = new sLooper( window.context, listofSounds, null, function () {
                done();
            } );
        } else {
            done();
        }
    } );

    function resetAllSourceSpies() {
        for ( var key in sourceSpies ) {
            if ( sourceSpies.hasOwnProperty( key ) && sourceSpies[ key ].calls ) {
                sourceSpies[ key ].calls.reset();
            }
        }
    }

    describe( '#new Looper( context ) ', function () {
        it( "should have audioContext available", function () {
            expect( looper.audioContext ).toBeInstanceOf( AudioContext );
        } );
    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( looper.start ).toBeInstanceOf( Function );
            expect( looper.stop ).toBeInstanceOf( Function );
            expect( looper.play ).toBeInstanceOf( Function );
            expect( looper.pause ).toBeInstanceOf( Function );
            expect( looper.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                looper.start( 0 );
            } ).not.toThrowError();

            expect( looper.isPlaying ).toBe( true );
            expect( sourceSpies.start ).toHaveBeenCalled();

            expect( function () {
                looper.stop( 0 );
            } ).not.toThrowError();

            expect( looper.isPlaying ).toBe( false );
            expect( sourceSpies.stop ).toHaveBeenCalled();
            done();
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                looper.play();
            } ).not.toThrowError();

            expect( sourceSpies.start ).toHaveBeenCalled();
            expect( looper.isPlaying ).toBe( true );

            expect( function () {
                looper.pause();
            } ).not.toThrowError();

            expect( looper.isPlaying ).toBe( false );
            expect( sourceSpies.stop ).toHaveBeenCalled();
            setTimeout( function () {
                expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
            }, 1000 );

            sourceSpies.start.calls.reset();
            sourceSpies.stop.calls.reset();
            sourceSpies.resetBufferSource.calls.reset();

            expect( function () {
                looper.play();
            } ).not.toThrowError();

            expect( looper.isPlaying ).toBe( true );
            expect( sourceSpies.start ).toHaveBeenCalled();

            expect( function () {
                looper.pause();
            } ).not.toThrowError();

            expect( looper.isPlaying ).toBe( false );
            expect( sourceSpies.stop ).toHaveBeenCalled();
            setTimeout( function () {
                expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                done();
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                looper.play();
            } ).not.toThrowError();

            expect( looper.isPlaying ).toBe( true );
            expect( sourceSpies.start ).toHaveBeenCalled();

            expect( function () {
                looper.release();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( looper.isPlaying ).toBe( false );
                expect( sourceSpies.stop ).toHaveBeenCalled();
                expect( sourceSpies.resetBufferSource ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );

        it( "should be pass parameters from start to source", function ( done ) {
            var when = Math.random();
            var offset = Math.random() / 2;
            var duration = Math.random() * 2;
            expect( function () {
                looper.start( when, offset, duration, 0.5 );
            } ).not.toThrowError();

            expect( sourceSpies.start ).toHaveBeenCalledWith( when, offset, duration );
            done();
        } );

        it( "should be pass parameters from stop to source", function ( done ) {
            var duration = Math.random() * 2;
            expect( function () {
                looper.start( 0 );
            } ).not.toThrowError();

            expect( function () {
                looper.stop( duration );
            } ).not.toThrowError();

            expect( sourceSpies.stop ).toHaveBeenCalledWith( duration );
            done();
        } );
    } );
} );

},{"models/Looper":29,"proxyquireify":6}],51:[function(require,module,exports){
/* proxyquireify injected requires to make browserify include dependencies in the bundle */ /* istanbul ignore next */; (function __makeBrowserifyIncludeModule__() { require('models/MultiTrigger');});"use strict";
var MultiTrigger = require( 'models/MultiTrigger' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
var internalSpies = {
    onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
    onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
    onAudioStart: jasmine.createSpy( 'onAudioStart' ),
    onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
};
var listofSounds = [ 'audio/Hit5.mp3', 'audio/Hit6.mp3', 'audio/Hit7.mp3', 'audio/Hit8.mp3' ];
describe( 'MultiTrigger.js', function () {
    var multiTrigger;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllInternalSpies();
        if ( !multiTrigger ) {
            console.log( "Initing MultiTrigger.." );
            multiTrigger = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } else {
            done();
        }
    } );

    function resetAllInternalSpies() {
        for ( var key in internalSpies ) {
            if ( internalSpies.hasOwnProperty( key ) && internalSpies[ key ].calls ) {
                internalSpies[ key ].calls.reset();
            }
        }
    }

    describe( '#new MultiTrigger( context )', function () {

        it( "should have audioContext available", function () {
            expect( multiTrigger.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( multiTrigger.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( multiTrigger.maxSources ).toBe( 8 );
        } );

        it( "should have no inputs", function () {
            expect( multiTrigger.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( multiTrigger.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as MultiTrigger", function () {
            expect( multiTrigger.modelName ).toBe( 'MultiTrigger' );
        } );

        it( "should be a BaseSound", function () {
            expect( multiTrigger.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( multiTrigger.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            multiTrigger = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            multiTrigger = new MultiTrigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( multiTrigger.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            multiTrigger.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            multiTrigger.setSources( 'audio/bullet.mp3', progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            multiTrigger.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {

        it( "should have a valid parameter pitchShift", function () {
            "use strict";

            expect( multiTrigger.pitchShift.isSPAudioParam ).toBe( true );

            expect( function () {
                multiTrigger.pitchShift = 0;
            } ).toThrowError();

            expect( function () {
                delete multiTrigger.pitchShift;
            } ).toThrowError();

            expect( multiTrigger.pitchShift.name ).toBe( 'pitchShift' );
            expect( multiTrigger.pitchShift.value ).toBe( 0 );
            expect( multiTrigger.pitchShift.minValue ).toBe( -60 );
            expect( multiTrigger.pitchShift.maxValue ).toBe( 60 );

        } );

        it( "should have a valid parameter pitchRand", function () {
            "use strict";
            expect( multiTrigger.pitchRand.isSPAudioParam ).toBe( true );
            expect( function () {
                multiTrigger.pitchRand = 0;
            } ).toThrowError();

            expect( function () {
                delete multiTrigger.pitchRand;
            } ).toThrowError();

            expect( multiTrigger.pitchRand.name ).toBe( 'pitchRand' );
            expect( multiTrigger.pitchRand.value ).toBe( 0 );
            expect( multiTrigger.pitchRand.minValue ).toBe( 0 );
            expect( multiTrigger.pitchRand.maxValue ).toBe( 24 );

        } );

        it( "should have a valid parameter eventRand", function () {
            "use strict";
            expect( multiTrigger.eventRand.isSPAudioParam ).toBe( true );

            expect( function () {
                multiTrigger.eventRand = 0;
            } ).toThrowError();
            expect( function () {
                delete multiTrigger.eventRand;
            } ).toThrowError();

            expect( multiTrigger.eventRand.name ).toBe( 'eventRand' );
            expect( multiTrigger.eventRand.value ).toBe( false );
            expect( multiTrigger.eventRand.minValue ).toBe( true );
            expect( multiTrigger.eventRand.maxValue ).toBe( false );

        } );

        it( "should have a valid parameter eventRate", function () {
            "use strict";
            expect( multiTrigger.eventRate.isSPAudioParam ).toBe( true );

            expect( function () {
                multiTrigger.eventRate = 0;
            } ).toThrowError();
            expect( function () {
                delete multiTrigger.eventRate;
            } ).toThrowError();

            expect( multiTrigger.eventRate.name ).toBe( 'eventRate' );
            expect( multiTrigger.eventRate.value ).toBe( 10.0 );
            expect( multiTrigger.eventRate.minValue ).toBe( 0.0 );
            expect( multiTrigger.eventRate.maxValue ).toBe( 60.0 );

        } );

        it( "should have a valid parameter eventJitter", function () {
            "use strict";
            expect( multiTrigger.eventJitter.isSPAudioParam ).toBe( true );

            expect( function () {
                multiTrigger.eventJitter = 0;
            } ).toThrowError();
            expect( function () {
                delete multiTrigger.eventJitter;
            } ).toThrowError();

            expect( multiTrigger.eventJitter.name ).toBe( 'eventJitter' );
            expect( multiTrigger.eventJitter.value ).toBe( 0.0 );
            expect( multiTrigger.eventJitter.minValue ).toBe( 0.0 );
            expect( multiTrigger.eventJitter.maxValue ).toBe( 0.99 );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( multiTrigger.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( multiTrigger.disconnect ).toBeInstanceOf( Function );
        } );

    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( multiTrigger.start ).toBeInstanceOf( Function );
            expect( multiTrigger.stop ).toBeInstanceOf( Function );
            expect( multiTrigger.play ).toBeInstanceOf( Function );
            expect( multiTrigger.pause ).toBeInstanceOf( Function );
            expect( multiTrigger.release ).toBeInstanceOf( Function );
        } );

        it( "should be able to start/stop audio", function ( done ) {
            expect( function () {
                multiTrigger.start();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    multiTrigger.stop();
                } ).not.toThrowError();

                expect( multiTrigger.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be able to play/pause audio", function ( done ) {
            expect( function () {
                multiTrigger.play();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    multiTrigger.pause();
                } ).not.toThrowError();

                expect( multiTrigger.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    multiTrigger.onAudioStart = internalSpies.onAudioStart;
                    multiTrigger.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        multiTrigger.play();
                    } ).not.toThrowError();

                    expect( multiTrigger.isPlaying ).toBe( true );

                    setTimeout( function () {
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                        expect( function () {
                            multiTrigger.pause();
                        } ).not.toThrowError();

                        expect( multiTrigger.isPlaying ).toBe( false );
                        setTimeout( function () {
                            expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                multiTrigger.play();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    multiTrigger.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( multiTrigger.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1500 );
            }, 1000 );
        } );
    } );
} );

var queueSpies = {
    queueStart: jasmine.createSpy( 'queueStart' ),
    queueRelease: jasmine.createSpy( 'queueRelease' ),
    queueSetParameter: jasmine.createSpy( 'queueSetParameter' ),
    queueSetSource: jasmine.createSpy( 'queueSetSource' ),
    queueUpdate: jasmine.createSpy( 'queueUpdate' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    pause: jasmine.createSpy( 'pause' ),
    stop: jasmine.createSpy( 'stop' )
};

var queueStub = {
    "../core/SoundQueue": function () {
        return {
            connect: queueSpies.connect,
            disconnect: queueSpies.disconnect,
            pause: queueSpies.pause,
            stop: queueSpies.stop,
            queueStart: queueSpies.queueStart,
            queueUpdate: queueSpies.queueUpdate,
            queueRelease: queueSpies.queueRelease,
            queueSetSource: queueSpies.queueSetSource,
            queueSetParameter: queueSpies.queueSetParameter
        };
    }
};

var proxyquire = require( 'proxyquireify' )( require );
var sMultiTrigger = proxyquire( 'models/MultiTrigger', queueStub );

describe( 'MultiTrigger.js with stubbed Queue', function () {
    var multiTrigger;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllSourceSpies();
        if ( !multiTrigger ) {
            multiTrigger = new sMultiTrigger( window.context, listofSounds, null, function () {
                done();
            } );
        } else {
            done();
        }
    } );

    function resetAllSourceSpies() {
        for ( var key in queueSpies ) {
            if ( queueSpies.hasOwnProperty( key ) && queueSpies[ key ].calls ) {
                queueSpies[ key ].calls.reset();
            }
        }
    }
    describe( '#new MultiTrigger( context ) ', function () {
        it( "should have audioContext available", function () {
            expect( multiTrigger.audioContext ).toBeInstanceOf( AudioContext );
        } );
    } );
    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( multiTrigger.start ).toBeInstanceOf( Function );
            expect( multiTrigger.stop ).toBeInstanceOf( Function );
            expect( multiTrigger.play ).toBeInstanceOf( Function );
            expect( multiTrigger.pause ).toBeInstanceOf( Function );
            expect( multiTrigger.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                multiTrigger.start();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
            }, 2000 );

            expect( function () {
                multiTrigger.stop();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( false );
            setTimeout( function () {
                expect( queueSpies.pause ).toHaveBeenCalled();
            }, 2000 );
            done();
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                multiTrigger.play();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
                expect( multiTrigger.isPlaying ).toBe( true );

                expect( function () {
                    multiTrigger.pause();
                } ).not.toThrowError();

                expect( multiTrigger.isPlaying ).toBe( false );

                setTimeout( function () {
                    expect( queueSpies.pause ).toHaveBeenCalled();

                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.queueSetParameter.calls.reset();
                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.pause.calls.reset();

                    expect( function () {
                        multiTrigger.play();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                        expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                        expect( queueSpies.queueStart ).toHaveBeenCalled();
                        expect( multiTrigger.isPlaying ).toBe( true );

                        expect( function () {
                            multiTrigger.pause();
                        } ).not.toThrowError();

                        expect( multiTrigger.isPlaying ).toBe( false );
                        setTimeout( function () {
                            expect( queueSpies.pause ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                multiTrigger.play();
            } ).not.toThrowError();

            expect( multiTrigger.isPlaying ).toBe( true );
            expect( queueSpies.queueSetSource ).toHaveBeenCalled();
            expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
            expect( queueSpies.queueStart ).toHaveBeenCalled();

            expect( function () {
                multiTrigger.release();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( multiTrigger.isPlaying ).toBe( false );
                expect( queueSpies.pause ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );
} );

},{"models/MultiTrigger":30,"proxyquireify":6}],52:[function(require,module,exports){
"use strict";
var Scrubber = require( 'models/Scrubber' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
var internalSpies = {
    onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
    onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
    onAudioStart: jasmine.createSpy( 'onAudioStart' ),
    onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
};
var listofSounds = [ 'audio/surf.mp3' ];

describe( 'Scrubber.js', function () {
    var scrubber;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllInternalSpies();
        if ( !scrubber ) {
            console.log( "Initing Scrubber.." );
            scrubber = new Scrubber( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } else {
            scrubber.stop();
            done();
        }
    } );

    function resetAllInternalSpies() {
        for ( var key in internalSpies ) {
            if ( internalSpies.hasOwnProperty( key ) && internalSpies[ key ].calls ) {
                internalSpies[ key ].calls.reset();
            }
        }
    }

    describe( '#new Scrubber( context )', function () {

        it( "should have audioContext available", function () {
            expect( scrubber.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( scrubber.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( scrubber.maxSources ).toBe( 1 );
        } );

        it( "should have no inputs", function () {
            expect( scrubber.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( scrubber.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Scrubber", function () {
            expect( scrubber.modelName ).toBe( 'Scrubber' );
        } );

        it( "should be a BaseSound", function () {
            expect( scrubber.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( scrubber.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            scrubber = new Scrubber( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            scrubber = new Scrubber( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( scrubber.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            scrubber.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            scrubber.setSources( listofSounds[ 0 ], progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            scrubber.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {

        it( "should have a valid parameter playPosition", function () {

            expect( scrubber.playPosition.isSPAudioParam ).toBe( true );

            expect( function () {
                scrubber.playPosition = 0;
            } ).toThrowError();

            expect( function () {
                delete scrubber.playPosition;
            } ).toThrowError();

            expect( scrubber.playPosition.name ).toBe( 'playPosition' );
            expect( scrubber.playPosition.value ).toBe( 0.0 );
            expect( scrubber.playPosition.minValue ).toBe( 0.0 );
            expect( scrubber.playPosition.maxValue ).toBe( 1.0 );

        } );

        it( "should have a valid parameter noMotionFade", function () {
            expect( scrubber.noMotionFade.isSPAudioParam ).toBe( true );

            expect( function () {
                scrubber.noMotionFade = 0;
            } ).toThrowError();
            expect( function () {
                delete scrubber.noMotionFade;
            } ).toThrowError();

            expect( scrubber.noMotionFade.name ).toBe( 'noMotionFade' );
            expect( scrubber.noMotionFade.value ).toBe( true );
            expect( scrubber.noMotionFade.minValue ).toBe( true );
            expect( scrubber.noMotionFade.maxValue ).toBe( false );

        } );

        it( "should have a valid parameter muteOnReverse", function () {
            expect( scrubber.muteOnReverse.isSPAudioParam ).toBe( true );
            expect( function () {
                scrubber.muteOnReverse = 0;
            } ).toThrowError();

            expect( function () {
                delete scrubber.muteOnReverse;
            } ).toThrowError();

            expect( scrubber.muteOnReverse.name ).toBe( 'muteOnReverse' );
            expect( scrubber.muteOnReverse.value ).toBe( true );
            expect( scrubber.muteOnReverse.minValue ).toBe( true );
            expect( scrubber.muteOnReverse.maxValue ).toBe( false );
        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( scrubber.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( scrubber.disconnect ).toBeInstanceOf( Function );
        } );
    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( scrubber.start ).toBeInstanceOf( Function );
            expect( scrubber.stop ).toBeInstanceOf( Function );
            expect( scrubber.play ).toBeInstanceOf( Function );
            expect( scrubber.pause ).toBeInstanceOf( Function );
            expect( scrubber.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                scrubber.start();
                scrubber.playPosition.value = 0.1;
            } ).not.toThrowError();

            setTimeout( function () {
                expect( scrubber.isPlaying ).toBe( true );
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    scrubber.stop();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( scrubber.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be play/pause audio", function ( done ) {
            var randomPlay;
            expect( function () {
                scrubber.play();
                scrubber.playPosition.value = 0;
                randomPlay = window.setInterval( function () {
                    scrubber.playPosition.value += Math.random() / 10;
                }, 100 );
            } ).not.toThrowError();

            setTimeout( function () {
                expect( scrubber.isPlaying ).toBe( true );
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    window.clearInterval( randomPlay );
                    scrubber.pause();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( scrubber.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    scrubber.onAudioStart = internalSpies.onAudioStart;
                    scrubber.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        scrubber.play();
                        scrubber.playPosition.value = 0;
                        randomPlay = window.setInterval( function () {
                            scrubber.playPosition.value += Math.random() / 10;
                        }, 100 );
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( scrubber.isPlaying ).toBe( true );
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                        expect( function () {
                            window.clearInterval( randomPlay );
                            scrubber.pause();
                        } ).not.toThrowError();

                        setTimeout( function () {
                            expect( scrubber.isPlaying ).toBe( false );
                            expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            var randomPlay;

            expect( function () {
                scrubber.play();
                scrubber.playPosition.value = 0;
                randomPlay = window.setInterval( function () {
                    scrubber.playPosition.value += Math.random() / 10;
                }, 100 );
            } ).not.toThrowError();

            setTimeout( function () {
                expect( scrubber.isPlaying ).toBe( true );
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    window.clearInterval( randomPlay );
                    scrubber.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( scrubber.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );
    } );
} );

},{"models/Scrubber":31}],53:[function(require,module,exports){
/* proxyquireify injected requires to make browserify include dependencies in the bundle */ /* istanbul ignore next */; (function __makeBrowserifyIncludeModule__() { require('models/Trigger');});"use strict";
var Trigger = require( 'models/Trigger' );
if ( !window.context ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.context = new AudioContext();
}
var internalSpies = {
    onLoadProgress: jasmine.createSpy( 'onLoadProgress' ),
    onLoadComplete: jasmine.createSpy( 'onLoadComplete' ),
    onAudioStart: jasmine.createSpy( 'onAudioStart' ),
    onAudioEnd: jasmine.createSpy( 'onAudioEnd' )
};
var listofSounds = [ 'audio/Hit5.mp3', 'audio/Hit6.mp3', 'audio/Hit7.mp3', 'audio/Hit8.mp3' ];
describe( 'Trigger.js', function () {
    var trigger;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllInternalSpies();
        if ( !trigger ) {
            console.log( "Initing Trigger.." );

            trigger = new Trigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } else {
            done();
        }
    } );

    function resetAllInternalSpies() {
        for ( var key in internalSpies ) {
            if ( internalSpies.hasOwnProperty( key ) && internalSpies[ key ].calls ) {
                internalSpies[ key ].calls.reset();
            }
        }
    }

    describe( '#new Trigger( context )', function () {

        it( "should have audioContext available", function () {
            expect( trigger.audioContext ).toBeInstanceOf( AudioContext );
        } );

        it( "should have a minimum number of sources as 1", function () {
            expect( trigger.minSources ).toBe( 1 );
        } );

        it( "should have a maximum number of sources as 1", function () {
            expect( trigger.maxSources ).toBe( 8 );
        } );

        it( "should have no inputs", function () {
            expect( trigger.numberOfInputs ).toBe( 0 );
        } );

        it( "should have atleast 1 output", function () {
            expect( trigger.numberOfOutputs ).toBeGreaterThan( 0 );
        } );

        it( "should have a model name as Trigger", function () {
            expect( trigger.modelName ).toBe( 'Trigger' );
        } );

        it( "should be a BaseSound", function () {
            expect( trigger.isBaseSound ).toBe( true );
        } );

        it( "should be have been initialized", function () {
            expect( trigger.isInitialized ).toBe( true );
        } );

        it( "should have called progress events", function ( done ) {
            trigger = new Trigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadProgress ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );

        it( "should have called load events", function ( done ) {
            trigger = new Trigger( window.context, listofSounds, internalSpies.onLoadProgress, function () {
                internalSpies.onLoadComplete();
                expect( internalSpies.onLoadComplete ).toHaveBeenCalled();
                done();
            }, internalSpies.onAudioStart, internalSpies.onAudioEnd );
        } );
    } );

    describe( '#setSources()', function () {
        it( "should have method setSources defined", function () {
            expect( trigger.setSources ).toBeInstanceOf( Function );
        } );

        it( "should be able to change sources", function ( done ) {
            trigger.setSources( listofSounds[ 0 ], null, function ( status, audioBufferArray ) {
                expect( audioBufferArray.length ).toBe( 1 );
                done();
            } );
        } );

        it( "should call onprogress events", function ( done ) {
            var progressSpy = jasmine.createSpy( 'progressSpy' );
            trigger.setSources( listofSounds[ 0 ], progressSpy, function () {
                expect( progressSpy ).toHaveBeenCalled();
                done();
            } );
        } );

        it( "should call onload event", function ( done ) {
            var loadSpy = jasmine.createSpy( 'loadSpy' );
            trigger.setSources( listofSounds, null, loadSpy );
            window.setTimeout( function () {
                expect( loadSpy ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );

    describe( '#properties', function () {

        it( "should have a valid parameter pitchShift", function () {
            "use strict";
            expect( trigger.pitchShift.isSPAudioParam ).toBe( true );

            expect( function () {
                trigger.pitchShift = 0;
            } ).toThrowError();

            expect( function () {
                delete trigger.pitchShift;
            } ).toThrowError();

            expect( trigger.pitchShift.name ).toBe( 'pitchShift' );
            expect( trigger.pitchShift.value ).toBe( 0 );
            expect( trigger.pitchShift.minValue ).toBe( -60 );
            expect( trigger.pitchShift.maxValue ).toBe( 60 );

        } );

        it( "should have a valid parameter pitchRand", function () {
            "use strict";
            expect( trigger.pitchRand.isSPAudioParam ).toBe( true );
            expect( function () {
                trigger.pitchRand = 0;
            } ).toThrowError();

            expect( function () {
                delete trigger.pitchRand;
            } ).toThrowError();

            expect( trigger.pitchRand.name ).toBe( 'pitchRand' );
            expect( trigger.pitchRand.value ).toBe( 0 );
            expect( trigger.pitchRand.minValue ).toBe( 0 );
            expect( trigger.pitchRand.maxValue ).toBe( 24 );

        } );

        it( "should have a valid parameter eventRand", function () {
            "use strict";
            expect( trigger.eventRand.isSPAudioParam ).toBe( true );

            expect( function () {
                trigger.eventRand = 0;
            } ).toThrowError();
            expect( function () {
                delete trigger.eventRand;
            } ).toThrowError();

            expect( trigger.eventRand.name ).toBe( 'eventRand' );
            expect( trigger.eventRand.value ).toBe( false );
            expect( trigger.eventRand.minValue ).toBe( true );
            expect( trigger.eventRand.maxValue ).toBe( false );

        } );
    } );

    describe( '#connect/disconnect', function () {

        it( "have connect function defined", function () {
            expect( trigger.connect ).toBeInstanceOf( Function );
        } );
        it( "have disconnect function defined", function () {
            expect( trigger.disconnect ).toBeInstanceOf( Function );
        } );

    } );

    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( trigger.start ).toBeInstanceOf( Function );
            expect( trigger.stop ).toBeInstanceOf( Function );
            expect( trigger.play ).toBeInstanceOf( Function );
            expect( trigger.pause ).toBeInstanceOf( Function );
            expect( trigger.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                trigger.start();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                expect( function () {
                    trigger.stop();
                } ).not.toThrowError();

                expect( trigger.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1000 );
            }, 1000 );
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                trigger.play();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    trigger.pause();
                } ).not.toThrowError();

                expect( trigger.isPlaying ).toBe( false );
                setTimeout( function () {
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();

                    internalSpies.onAudioStart = jasmine.createSpy( 'onAudioStart2' );
                    internalSpies.onAudioEnd = jasmine.createSpy( 'onAudioEnd2' );
                    trigger.onAudioStart = internalSpies.onAudioStart;
                    trigger.onAudioEnd = internalSpies.onAudioEnd;

                    expect( function () {
                        trigger.play();
                    } ).not.toThrowError();

                    expect( trigger.isPlaying ).toBe( true );

                    setTimeout( function () {
                        expect( internalSpies.onAudioStart ).toHaveBeenCalled();
                        expect( function () {
                            trigger.pause();
                        } ).not.toThrowError();

                        expect( trigger.isPlaying ).toBe( false );
                        setTimeout( function () {
                            expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                trigger.play();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( internalSpies.onAudioStart ).toHaveBeenCalled();

                expect( function () {
                    trigger.release();
                } ).not.toThrowError();

                setTimeout( function () {
                    expect( trigger.isPlaying ).toBe( false );
                    expect( internalSpies.onAudioEnd ).toHaveBeenCalled();
                    done();
                }, 1500 );
            }, 1000 );
        } );
    } );
} );

var queueSpies = {
    queueStart: jasmine.createSpy( 'queueStart' ),
    queueRelease: jasmine.createSpy( 'queueRelease' ),
    queueSetParameter: jasmine.createSpy( 'queueSetParameter' ),
    queueSetSource: jasmine.createSpy( 'queueSetSource' ),
    connect: jasmine.createSpy( 'connect' ),
    disconnect: jasmine.createSpy( 'disconnect' ),
    pause: jasmine.createSpy( 'pause' ),
    stop: jasmine.createSpy( 'stop' )
};

var queueStub = {
    "../core/SoundQueue": function () {
        return {
            connect: queueSpies.connect,
            disconnect: queueSpies.disconnect,
            pause: queueSpies.pause,
            stop: queueSpies.stop,
            queueStart: queueSpies.queueStart,
            queueRelease: queueSpies.queueRelease,
            queueSetSource: queueSpies.queueSetSource,
            queueSetParameter: queueSpies.queueSetParameter
        };
    }
};

var proxyquire = require( 'proxyquireify' )( require );
var sTrigger = proxyquire( 'models/Trigger', queueStub );
describe( 'Trigger.js with stubbed Queue', function () {
    var trigger;
    var customMatchers = {
        toBeInstanceOf: function () {
            return {
                compare: function ( actual, expected ) {
                    var result = {};
                    result.pass = actual instanceof expected;
                    if ( result.pass ) {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected;
                    } else {
                        result.message = 'Expected ' + actual + ' to be an instance of ' + expected + ', but it is not';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach( function ( done ) {
        jasmine.addMatchers( customMatchers );
        resetAllSourceSpies();
        if ( !trigger ) {
            trigger = new sTrigger( window.context, listofSounds, null, function () {
                done();
            } );
        } else {
            done();
        }
    } );

    function resetAllSourceSpies() {
        for ( var key in queueSpies ) {
            if ( queueSpies.hasOwnProperty( key ) && queueSpies[ key ].calls ) {
                queueSpies[ key ].calls.reset();
            }
        }
    }
    describe( '#new Trigger( context ) ', function () {
        it( "should have audioContext available", function () {
            expect( trigger.audioContext ).toBeInstanceOf( AudioContext );
        } );
    } );
    describe( '#actions', function () {
        it( "should have start/stop/play/pause/release defined", function () {
            expect( trigger.start ).toBeInstanceOf( Function );
            expect( trigger.stop ).toBeInstanceOf( Function );
            expect( trigger.play ).toBeInstanceOf( Function );
            expect( trigger.pause ).toBeInstanceOf( Function );
            expect( trigger.release ).toBeInstanceOf( Function );
        } );

        it( "should be start/stop audio", function ( done ) {
            expect( function () {
                trigger.start();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
            }, 2000 );

            expect( function () {
                trigger.stop();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( false );
            setTimeout( function () {
                expect( queueSpies.pause ).toHaveBeenCalled();
            }, 2000 );
            done();
        } );

        it( "should be play/pause audio", function ( done ) {
            expect( function () {
                trigger.play();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                expect( queueSpies.queueStart ).toHaveBeenCalled();
                expect( trigger.isPlaying ).toBe( true );

                expect( function () {
                    trigger.pause();
                } ).not.toThrowError();

                expect( trigger.isPlaying ).toBe( false );

                setTimeout( function () {
                    expect( queueSpies.pause ).toHaveBeenCalled();

                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.queueSetParameter.calls.reset();
                    queueSpies.queueSetSource.calls.reset();
                    queueSpies.pause.calls.reset();

                    expect( function () {
                        trigger.play();
                    } ).not.toThrowError();

                    setTimeout( function () {
                        expect( queueSpies.queueSetSource ).toHaveBeenCalled();
                        expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
                        expect( queueSpies.queueStart ).toHaveBeenCalled();
                        expect( trigger.isPlaying ).toBe( true );

                        expect( function () {
                            trigger.pause();
                        } ).not.toThrowError();

                        expect( trigger.isPlaying ).toBe( false );
                        setTimeout( function () {
                            expect( queueSpies.pause ).toHaveBeenCalled();
                            done();
                        }, 1000 );
                    }, 1000 );
                }, 1000 );
            }, 1000 );

        } );

        it( "should be play/release audio", function ( done ) {
            expect( function () {
                trigger.play();
            } ).not.toThrowError();

            expect( trigger.isPlaying ).toBe( true );
            expect( queueSpies.queueSetSource ).toHaveBeenCalled();
            expect( queueSpies.queueSetParameter ).toHaveBeenCalled();
            expect( queueSpies.queueStart ).toHaveBeenCalled();

            expect( function () {
                trigger.release();
            } ).not.toThrowError();

            setTimeout( function () {
                expect( trigger.isPlaying ).toBe( false );
                expect( queueSpies.pause ).toHaveBeenCalled();
                done();
            }, 1000 );
        } );
    } );
} );

},{"models/Trigger":32,"proxyquireify":6}],54:[function(require,module,exports){
/* Core Tests */
require( './cases/lib/core/test.BaseSound.js' );
require( './cases/lib/core/test.Config.js' );
require( './cases/lib/core/test.Converter.js' );
require( './cases/lib/core/test.DetectLoopMarkers.js' );
require( './cases/lib/core/test.FileLoader.js' );
require( './cases/lib/core/test.MultiFileLoader.js' );
require( './cases/lib/core/test.SoundQueue.js' );
require( './cases/lib/core/test.SPAudioBuffer.js' );
require( './cases/lib/core/test.SPAudioBufferSourceNode.js' );
require( './cases/lib/core/test.SPAudioParam.js' );

/*Effects Tests*/
require( './cases/lib/effects/test.Fader.js' );
require( './cases/lib/effects/test.Panner.js' );
require( './cases/lib/effects/test.Filter.js' );
require( './cases/lib/effects/test.Compressor.js' );
require( './cases/lib/effects/test.Distorter.js' );

/*Models Tests*/
require( './cases/lib/models/test.Activity.js' );
require( './cases/lib/models/test.Extender.js' );
require( './cases/lib/models/test.Looper.js' );
require( './cases/lib/models/test.MultiTrigger.js' );
require( './cases/lib/models/test.Scrubber.js' );
require( './cases/lib/models/test.Trigger.js' );

},{"./cases/lib/core/test.BaseSound.js":33,"./cases/lib/core/test.Config.js":34,"./cases/lib/core/test.Converter.js":35,"./cases/lib/core/test.DetectLoopMarkers.js":36,"./cases/lib/core/test.FileLoader.js":37,"./cases/lib/core/test.MultiFileLoader.js":38,"./cases/lib/core/test.SPAudioBuffer.js":39,"./cases/lib/core/test.SPAudioBufferSourceNode.js":40,"./cases/lib/core/test.SPAudioParam.js":41,"./cases/lib/core/test.SoundQueue.js":42,"./cases/lib/effects/test.Compressor.js":43,"./cases/lib/effects/test.Distorter.js":44,"./cases/lib/effects/test.Fader.js":45,"./cases/lib/effects/test.Filter.js":46,"./cases/lib/effects/test.Panner.js":47,"./cases/lib/models/test.Activity.js":48,"./cases/lib/models/test.Extender.js":49,"./cases/lib/models/test.Looper.js":50,"./cases/lib/models/test.MultiTrigger.js":51,"./cases/lib/models/test.Scrubber.js":52,"./cases/lib/models/test.Trigger.js":53}]},{},[54]);
