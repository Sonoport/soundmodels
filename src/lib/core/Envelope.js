/**

Envelope class that implements EnvelopeNode
@class Envelope
@constructor
**/
define( [ 'core/BaseSound' ], function ( BaseSound ) {
    'use strict';

    function Envelope() {
        // This first guard ensures that the callee has invoked our Class' constructor function
        // with the `new` keyword - failure to do this will result in the `this` keyword referring
        // to the callee's scope (typically the window global) which will result in the following fields
        // (name and _age) leaking into the global namespace and not being set on this object.
        // source: https://gist.github.com/jonnyreeves/2474026
        if ( !( this instanceof Envelope ) ) {
            throw new TypeError( "Envelope constructor cannot be called as a function." );
        }

        BaseSound.call( this );
        console.log( "EnvelopeNode" );

    }
    // Inherits from BaseSound
    // Use Object.create() to setup inheritance but does not invoke any constructor
    // Using new ChildClass(); will invoke the constructor and create a senario which it is being called twice.
    Envelope.prototype = Object.create( BaseSound.prototype );
    Envelope.prototype.constructor = Envelope;

    // Envelope class methods
    Envelope.prototype.start = function start() {
        BaseSound.prototype.start.call( this );
    };
    Envelope.prototype.stop = function stop() {
        BaseSound.prototype.stop.call( this );
    };
    Envelope.prototype.play = function play() {
        BaseSound.prototype.play.call( this );
    };
    Envelope.prototype.pause = function pause() {
        BaseSound.prototype.play.call( this );
    };
    // Return constructor function
    return Envelope;
} );
