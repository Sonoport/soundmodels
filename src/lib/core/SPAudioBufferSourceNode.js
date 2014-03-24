define( [ 'core/SPPlaybackRateParam' ],
    function ( SPPlaybackRateParam ) {
        "use strict";

        function SPAudioBufferSourceNode( audioContext ) {
            var bufferSourceNode = audioContext.createBufferSource();
            var lastPos = 0;
            var lastEventTime = 0;
            var lastEventValue = bufferSourceNode.playbackRate.defaultValue;
            var pendingEvents = [];
            this.channelCount = bufferSourceNode.channelCount;
            this.channelCountMode = bufferSourceNode.channelCountMode;
            this.channelInterpretation = bufferSourceNode.channelInterpretation;
            this.numberOfInputs = bufferSourceNode.numberOfInputs;
            this.numberOfOutputs = bufferSourceNode.numberOfOutputs;
            this.playbackState = bufferSourceNode.playbackState;
            this.playbackRate = new SPPlaybackRateParam( bufferSourceNode.playbackRate, this );

            Object.defineProperty( this, 'loopEnd', {
                enumerable: true,
                set: function ( loopEnd ) {
                    bufferSourceNode.loopEnd = loopEnd;
                },
                get: function () {
                    return bufferSourceNode.loopEnd;
                }
            } );

            Object.defineProperty( this, 'loopStart', {
                enumerable: true,
                set: function ( loopStart ) {
                    bufferSourceNode.loopStart = loopStart;
                },
                get: function () {
                    return bufferSourceNode.loopStart;
                }
            } );

            Object.defineProperty( this, 'onended', {
                enumerable: true,
                set: function ( onended ) {
                    bufferSourceNode.onended = onended;
                },
                get: function () {
                    return bufferSourceNode.onended;
                }
            } );

            Object.defineProperty( this, 'gain', {
                enumerable: true,
                set: function ( gain ) {
                    bufferSourceNode.gain = gain;
                },
                get: function () {
                    return bufferSourceNode.gain;
                }
            } );

            Object.defineProperty( this, 'loop', {
                enumerable: true,
                set: function ( loop ) {
                    bufferSourceNode.loop = loop;
                },
                get: function () {
                    return bufferSourceNode.loop;
                }
            } );

            Object.defineProperty( this, 'playbackPosition', {
                enumerable: true,
                get: function () {
                    //console.log(lastPos);
                    if ( bufferSourceNode.playbackState === bufferSourceNode.FINISHED_STATE ) {
                        processCompletedEvents();
                        return lastPos % bufferSourceNode.buffer.length;
                    } else if ( bufferSourceNode.playbackState === bufferSourceNode.PLAYING_STATE ) {
                        processCompletedEvents();
                        return indexSinceLastEventToTime( audioContext.currentTime );
                    } else {
                        return 0;
                    }
                }
            } );

            Object.defineProperty( this, 'buffer', {
                enumerable: true,
                set: function ( buffer ) {
                    bufferSourceNode.buffer = buffer;
                },
                get: function () {
                    return bufferSourceNode.buffer;
                }
            } );

            this.addNewEvent = function ( nEvent ) {
                for ( var index = 0; index < pendingEvents.length; index++ ) {
                    var cEvent = pendingEvents[ index ];
                    if ( cEvent.type === nEvent.type && cEvent.time === nEvent.time ) {
                        pendingEvents.splice( index, 1, nEvent );
                        return;
                    } else if ( pendingEvents[ index ].time > nEvent.time ) {
                        break;
                    }
                }
                pendingEvents.splice( index, 0, nEvent );
            };

            this.cancelScheduledValues = function ( time ) {
                processCompletedEvents();
                for ( var index = 0; index < pendingEvents.length; index++ ) {
                    if ( pendingEvents[ index ].time >= time ) {
                        pendingEvents.splice( index, 1 );
                        index--;
                    }
                }
            };

            this.connect = function ( audioNode ) {
                bufferSourceNode.connect( audioNode );
            };

            this.disconnect = function ( output ) {
                bufferSourceNode.disconnect( output );
            };

            this.start = function ( time, offset ) {
                bufferSourceNode.start( time, offset );
                if ( time > audioContext.currentTime ) {
                    lastEventTime = time;
                } else {
                    lastEventTime = audioContext.currentTime;
                }
                lastPos = ( offset || 0 ) * bufferSourceNode.buffer.sampleRate;
            };

            this.stop = function ( time ) {
                if ( time < audioContext.currentTime ) {
                    time = audioContext.currentTime;
                }

                bufferSourceNode.stop( time );
                this.addNewEvent( {
                    type: "stop",
                    time: time,
                    value: 0
                } );
            };

            var processCompletedEvents = function () {
                var cTime = audioContext.currentTime;
                //console.log( "Processing at " + cTime + " - " + pendingEvents.length );
                for ( var index = 0; index < pendingEvents.length; index++ ) {
                    var thisEvent = pendingEvents[ index ];
                    var nextEvent = index < ( pendingEvents.length - 1 ) ? pendingEvents[ index + 1 ] : null;
                    var endTime = getEndTime( thisEvent, nextEvent );
                    //console.log( "Considering " + thisEvent.type + " - " + endTime );
                    if ( endTime <= cTime ) {
                        // Event that have ended can be processed till the end
                        var timeIncrease = calculateTimeIncrease( thisEvent, endTime );
                        lastPos += ( timeIncrease * bufferSourceNode.buffer.sampleRate ) % bufferSourceNode.buffer.length;
                        //console.log( "Processed " + thisEvent.type + "  (" + lastEventTime + ") " + thisEvent.time + "-" + endTime + " @ " + thisEvent.value + " = " + timeIncrease + " => " + lastPos );
                        lastEventTime = endTime;
                        lastEventValue = thisEvent.value || ( thisEvent.curve ? thisEvent.curve[ thisEvent.curve.length - 1 ] : lastEventValue );
                        // remove event;
                        pendingEvents.splice( index, 1 );
                        index--;
                    }
                }
            };

            var getEndTime = function ( tEvent, nEvent ) {
                var endTime = 0;
                if ( tEvent.type === "linear" || tEvent.type === "exponential" ) {
                    endTime = tEvent.time;
                } else if ( tEvent.type === "curve" ) {
                    endTime = tEvent.duration;
                } else if ( nEvent && nEvent.type !== "linear" && nEvent.type !== "exponential" ) {
                    endTime = nEvent.time;
                } else if ( tEvent.type === "target" ) {
                    endTime = tEvent.timeConstant * 6.90776;
                } else {
                    endTime = tEvent.time;
                }
                return endTime;
            };

            var indexSinceLastEventToTime = function ( time ) {
                var increase = 0;
                var rEvent = runningEvent();
                if ( rEvent ) {
                    //console.log(rEvent.type + " is running.");
                    increase = calculateTimeIncrease( rEvent, time );
                    //console.log("increase for " + rEvent.type + " till " + time + " is " + increase);
                } else {
                    increase = ( time - lastEventTime ) * bufferSourceNode.playbackRate.value;
                }
                var newPos = lastPos + increase * bufferSourceNode.buffer.sampleRate;
                return newPos % bufferSourceNode.buffer.length;
            };

            var calculateTimeIncrease = function ( event, endTime ) {
                var timeIncrease = 0;
                //console.log(event.type + " till ");
                if ( event.type === "linear" ) {
                    var dtime = endTime - lastEventTime;
                    timeIncrease = ( ( event.value - lastEventValue ) * dtime / 2 ) + ( lastEventValue * dtime );
                } else if ( event.type === "exponential" ) {
                    timeIncrease = ( endTime - lastEventTime ) * ( event.value - lastEventValue ) / Math.log( event.value / lastEventValue );
                } else if ( event.type === "set" || event.type === "stop" ) {
                    timeIncrease += ( event.time - lastEventTime ) * lastEventValue;
                    timeIncrease += ( endTime - event.time ) * event.value;
                } else if ( event.type === "target" ) {
                    timeIncrease += ( event.time - lastEventTime ) * lastEventValue;
                    var multiplier = event.timeConstant * ( event.value - lastEventValue );
                    var exponent = Math.exp( ( event.time - endTime ) / event.timeConstant );
                    timeIncrease += multiplier * ( exponent - 1 ) + event.value * ( endTime - event.time );
                } else if ( event.type === "curve" ) {
                    timeIncrease += ( event.time - lastEventTime ) * lastEventValue;
                    var length = event.duration / event.curve.length;
                    var elapsed = 0;
                    for ( var index = 0; index < event.curve.length; index++ ) {
                        if ( event.time + elapsed + length <= endTime ) {
                            timeIncrease += event.curve[ index ] * length;
                            elapsed += length;
                        }
                    }
                    timeIncrease += endTime - ( event.time + elapsed ) * event.curve[ index ];
                }
                return timeIncrease;
            };

            var runningEvent = function () {
                var cTime = audioContext.currentTime;
                for ( var index = 0; index < pendingEvents.length; index++ ) {
                    var thisEvent = pendingEvents[ index ];
                    var nextEvent = index < ( pendingEvents.length - 1 ) ? pendingEvents[ index + 1 ] : null;
                    var endTime = getEndTime( thisEvent, nextEvent );
                    if ( endTime > cTime && ( thisEvent.time <= cTime || thisEvent.type === 'linear' || thisEvent.type === 'exponential' ) ) {
                        return thisEvent;
                    }
                }
                return null;
            };
        }
        return SPAudioBufferSourceNode;
    } );
