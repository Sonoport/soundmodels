require( [ 'core/MultiFileLoader' ], function ( multiFileLoader ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    validSounds = [ 'audio/sineloopstereo.wav', 'audio/sineloopstereo.wav', 'audio/sineloopmono.wav' ];
    invalidSounds = [ 'doesnotexist.wav', 'fakefile.mp3' ];
    describe( 'MultiFileLoader.js', function () {
        describe( '# multiFileLoader( sounds, audioContext, onAllLoad, onProgressCallback ) ', function () {
            it( "should return status true and an array of buffers on callback if urls supplied is valid", function ( done ) {
                multiFileLoader.call( {}, validSounds, context, function ( status, buffers ) {
                    expect( status )
                        .toBe( true );
                    expect( buffers.length )
                        .toBeDefined();
                    expect( buffers.length )
                        .toBeGreaterThan( 0 );
                    buffers.forEach( function ( thisBuffer ) {
                        var bufferType = Object.prototype.toString.call( thisBuffer );
                        expect( bufferType )
                            .toEqual( '[object AudioBuffer]' );
                    } );
                    done();
                } );
            } );

            it( "should return status false and empty array on callback if urls supplied is invalid", function ( done ) {
                multiFileLoader.call( {}, invalidSounds, context, function ( status, buffers ) {
                    expect( status )
                        .toBe( false );
                    expect( buffers.length )
                        .toBeDefined();
                    expect( buffers.length )
                        .toBe( 0 );
                    done();
                } );
            } );
        } );
    } );
} );
