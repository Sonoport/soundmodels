/**
 * @module Core
 */
 define( [],
    function ( ) {
        "use strict";
        function SPAudioBuffer( URL, options, endPoint ) {

            // new SPAudioBuffer("http://example.com", 0.8,1.0)
            // new SPAudioBuffer([object File], 0.8,1.0)
            // new SPAudioBuffer([object AudioBuffer], 0.8,1.0)
            // new SPAudioBuffer([object AudioBuffer], {startPoint, endPoint, url})
            //

            this.sourceURL = "";
            this.length = 0;
            this.buffer = null;
            this.startPoint = 0;
            this.endPoint = 1;

            var urlType = Object.prototype.toString.call(URL);
            var optionsType = Object.prototype.toString.call(options);
            var endPointType = Object.prototype.toString.call(endPoint);

            if (optionsType === "[object Object]"){
                for (var prop in options) {
                    if( options.hasOwnProperty( prop ) && this.hasOwnProperty(prop) ) {
                        this[prop] = options[prop];
                    }
                }
            }else if (optionsType === "[object Number]"){
                this.startPoint = parseFloat(options);
                if (endPointType === "[object Number]"){
                    this.endPoint = parseFloat(endPoint)
                }
            }

            if (urlType === "[object String]" || urlType === "[object File]"){
                this.sourceURL = URL;
            }else if (urlType === "[object AudioBuffer]"){
                this.buffer = URL;
            }
        }
        return SPAudioBufferSourceNode;
    } );
