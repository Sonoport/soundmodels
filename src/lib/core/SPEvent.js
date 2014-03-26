/**
 * @class Trigger
 * @description A sound model which triggers a specific sound file with multiple voices
 * @module Looper
 */
define( [],
    function () {
        "use strict";

        function SPEvent( type, timeStamp, eventID, paramName, paramValue, audioBuffer ) {
            if ( !( this instanceof SPEvent ) ) {
                throw new TypeError( "Looper constructor cannot be called as a function." );
            }

            var validEvents = [ "QENONE", "QESTOP", "QESTART", "QESETPARAM", "QESETSRC", "QERELEASE" ];

            if ( typeof timeStamp == "undefined" || timeStamp < 0 ) {
                throw {
                    name: "Incorrect Parameter Type Exception",
                    message: "SPEvent argument timeStamp is not a positive number",
                    toString: function () {
                        return this.name + ": " + this.message;
                    }
                };
            }

            if ( typeof eventID == "undefined" || eventID < 0 ) {
                throw {
                    name: "Incorrect Parameter Type Exception",
                    message: "SPEvent argument eventID is not a positive number",
                    toString: function () {
                        return this.name + ": " + this.message;
                    }
                };
            }

            if ( typeof paramName != "undefined" || typeof paramValue != "undefined" && typeof audioBuffer !== "undefined" ) {
                throw {
                    name: "Incorrect Parameter Type Exception",
                    message: "SPEvent can either have Parameter Information or AudioBuffer defined ",
                    toString: function () {
                        return this.name + ": " + this.message;
                    }
                };
            }

            if ( validEvents.indexOf( type ) < 0 ) {
                throw {
                    name: "Incorrect Parameter Type Exception",
                    message: "SPEvent has unknown type",
                    toString: function () {
                        return this.name + ": " + this.message;
                    }
                };
            }

            this.type = type;
            this.timeStamp = timeStamp;
            this.eventID = eventID;
            this.paramName = paramName;
            this.paramValue = paramValue;
            this.audioBuffer = audioBuffer;

        }

        return SPEvent;
    } );
