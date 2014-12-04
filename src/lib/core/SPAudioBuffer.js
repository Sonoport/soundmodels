/**
 * @module Core
 */
define( [],
    function () {
        "use strict";

        function SPAudioBuffer( audioContext, URL, startPoint, endPoint, audioBuffer ) {

            // new SPAudioBuffer("http://example.com", 0.8,1.0)
            // new SPAudioBuffer("http://example.com", 0.8,1.0, [object AudioBuffer])
            // new SPAudioBuffer([object File], 0.8,1.0)
            // new SPAudioBuffer([object AudioBuffer], 0.8,1.0)

            if ( !( audioContext instanceof AudioContext ) ) {
                console.error( 'First argument to SPAudioBuffer must be a valid AudioContext' );
                return;
            }
            this.audioContext = audioContext;
            this.sourceURL = null;
            this.duration = null;

            var buffer_;
            var rawBuffer_;
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

            var startPoint_;
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

            var endPoint_;
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

            this.getChannelData = function ( channel ) {
                if ( !this.buffer ) {
                    return null;
                } else {
                    return this.buffer.getChannelData( channel );
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
        return SPAudioBuffer;
    } );