/**
 * @module Core
 */
define( [],
    function () {
        "use strict";

        function SPAudioBuffer( URL, options, endPoint ) {

            // new SPAudioBuffer("http://example.com", 0.8,1.0)
            // new SPAudioBuffer([object File], 0.8,1.0)
            // new SPAudioBuffer([object AudioBuffer], 0.8,1.0)
            // new SPAudioBuffer([object AudioBuffer], {startPoint, endPoint, url})
            //

            this.sourceURL = "";
            this.duration = null;

            var buffer_;
            Object.defineProperty( this, 'buffer', {
                set: function ( buffer ) {
                    buffer_ = buffer;
                    if ( startPoint_ === null ) {
                        this.startPoint = 0;
                    }
                    if ( endPoint_ === null ) {
                        this.endPoint = this.buffer.length;
                    }
                }.bind( this ),
                get: function () {
                    return buffer_;
                }
            } );

            var startPoint_;
            Object.defineProperty( this, 'startPoint', {
                set: function ( startPoint ) {
                    startPoint_ = startPoint;
                    if ( endPoint !== null ) {
                        this.duration = endPoint_ - startPoint_;
                    }
                }.bind( this ),
                get: function () {
                    return startPoint_;
                }
            } );

            var endPoint_;
            Object.defineProperty( this, 'endPoint', {
                set: function ( endPoint ) {
                    endPoint_ = endPoint;
                    if ( startPoint_ !== null ) {
                        this.duration = endPoint_ - startPoint_;
                    }
                }.bind( this ),
                get: function () {
                    return endPoint_;
                }
            } );

            Object.defineProperty( this, 'length', {
                get: function () {
                    return this.buffer.length || 0;
                }
            } );

            Object.defineProperty( this, 'numberOfChannels', {
                get: function () {
                    return this.buffer.numberOfChannels || 0;
                }
            } );

            Object.defineProperty( this, 'sampleRate', {
                get: function () {
                    return this.buffer.sampleRate || 0;
                }
            } );

            this.getChannelData = function ( channel ) {
                if ( !this.buffer ) {
                    return null;
                } else {
                    return this.buffer.getChannelData( channel );
                }
            };

            var urlType = Object.prototype.toString.call( URL );
            var optionsType = Object.prototype.toString.call( options );
            var endPointType = Object.prototype.toString.call( endPoint );

            if ( optionsType === "[object Object]" ) {
                for ( var prop in options ) {
                    if ( options.hasOwnProperty( prop ) && this.hasOwnProperty( prop ) ) {
                        this[ prop ] = options[ prop ];
                    }
                }
            } else if ( optionsType === "[object Number]" ) {
                this.startPoint = parseFloat( options );
                if ( endPointType === "[object Number]" ) {
                    this.endPoint = parseFloat( endPoint );
                }
            }

            if ( urlType === "[object String]" || urlType === "[object File]" ) {
                this.sourceURL = URL;
            } else if ( urlType === "[object AudioBuffer]" ) {
                this.buffer = URL;
            }
        }
        return SPAudioBuffer;
    } );
