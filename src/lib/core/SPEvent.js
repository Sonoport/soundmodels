/**
 * @module Core
 */
define( [],
    function () {
        "use strict";

        /**
         * Defines a Queued event on Sound Models. Currently supports these types of events. </br>
         * [ "QENONE", "QESTOP", "QESTART", "QESETPARAM", "QESETSRC", "QERELEASE" ]
         *
         * @class SPEvent
         * @constructor
         * @param {String} type The type of event to be created.
         * @param {String} timeStamp The time (in seconds) when this event will be triggered.
         * @param {String} eventID An arbitary number used to keep track of related events.
         * @param {String} [paramName] Name of the parameter to be changed in this event.
         * @param {String} [paramValue] The value of parameter to be changed in this event.
         * @param {String} [audioBuffer] The AudioBuffer source to be set in this event.
         */
        function SPEvent( type, timeStamp, eventID, paramName, paramValue, audioBuffer ) {
            if ( !( this instanceof SPEvent ) ) {
                throw new TypeError( "SPEvents constructor cannot be called as a function." );
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

            if ( paramName !== undefined && paramName !== null && audioBuffer !== undefined ) {
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
            this.time = timeStamp;
            this.eventID = eventID;
            this.paramName = paramName;
            this.paramValue = paramValue;
            this.audioBuffer = audioBuffer;

        }

        return SPEvent;
    } );
