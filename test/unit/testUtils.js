function stubbedRequire( stubs ) {
    "use strict";
    /**
     * create a new map which will override the path to a given dependencies
     * so if we have a module in m1, requiresjs will look now unter
     * stub_m1
     **/
    var map = {};
    var stubname;

    for ( var key in stubs ) {
        if ( stubs.hasOwnProperty( key ) ) {
            stubname = 'stub_' + key;
            map[ key ] = stubname;
        }
    }

    /**
     * create a new context with the new dependency paths
     **/
    var context = require.config( {
        context: Math.floor( Math.random() * 1000000 ),
        map: {
            "*": map
        }
    } );

    /**
     * create new definitions that will return our passed stubs or mocks
     **/
    function returnStubFor( key ) {
        return function () {
            return stubs[ key ];
        };
    }

    for ( key in stubs ) {
        if ( stubs.hasOwnProperty( key ) ) {
            stubname = 'stub_' + key;
            define( stubname, returnStubFor( key ) );
        }
    }

    return context;

}

function makeContextRun( context ) {
    "use strict";

    var gain = context.createGain();
    gain.gain.value = 0.0;
    var osc = context.createOscillator();

    osc.connect( gain );
    gain.connect( context.destination );

}
