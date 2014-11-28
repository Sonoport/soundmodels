/**
 * @module Core
 */
define( [],
    function () {
        "use strict";

        function SPAudioBuffer( audioContext, URL, options, endPoint ) {

            // new SPAudioBuffer("http://example.com", 0.8,1.0)
            // new SPAudioBuffer([object File], 0.8,1.0)
            // new SPAudioBuffer([object AudioBuffer], 0.8,1.0)
            // new SPAudioBuffer([object AudioBuffer], {startPoint, endPoint, url})
            //
            this.audioContext = audioContext;
            this.sourceURL = "";
            this.duration = null;

            var buffer_;
            var rawBuffer_;
            Object.defineProperty( this, 'buffer', {
                set: function ( buffer ) {
                    rawBuffer_ = buffer;
                    if ( startPoint_ === null ) {
                        this.startPoint = 0;
                    }
                    if ( endPoint_ === null ) {
                        this.endPoint = this.rawBuffer_.length;
                    }
                    this.updateBuffer();
                }.bind( this ),
                get: function () {
                    return buffer_;
                }
            } );

            var startPoint_;
            Object.defineProperty( this, 'startPoint', {
                set: function ( startPoint ) {
                    startPoint_ = startPoint;
                    this.updateBuffer();
                }.bind( this ),
                get: function () {
                    return startPoint_;
                }
            } );

            var endPoint_;
            Object.defineProperty( this, 'endPoint', {
                set: function ( endPoint ) {
                    endPoint_ = endPoint;
                    this.updateBuffer();
                }.bind( this ),
                get: function () {
                    return endPoint_;
                }
            } );

            Object.defineProperty( this, 'numberOfChannels', {
                get: function () {
                    return this.buffer ? this.buffer.numberOfChannels : 0;
                }
            } );

            Object.defineProperty( this, 'sampleRate', {
                get: function () {
                    return this.buffer ? this.buffer.sampleRate : 0;
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
                    this.length = rawBuffer_.sampleRate * this.duration;

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
