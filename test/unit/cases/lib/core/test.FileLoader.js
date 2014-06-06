require( [ 'core/FileLoader' ], function ( FileLoader ) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();

    describe( 'FileLoader.js', function () {

        describe( '#new FileLoader( URL, context, onloadCallback )', function () {

            it( "should return true on callback function if url supplied is valid", function () {
                var fileLoader = new FileLoader( 'audio/sineloopstereo.wav', context, function ( response ) {
                    expect( response )
                        .toEqual( true );
                } );
            } );

            it( "should return false on callback function if url supplied is blank", function () {
                var fileLoader = new FileLoader( '', context, function ( response ) {
                    expect( response )
                        .toEqual( false );
                } );
            } );

            it( "should return false on callback function if url supplied is not a url", function () {
                var fileLoader = new FileLoader( 'abcdef', context, function ( response ) {
                    expect( response )
                        .toEqual( false );
                } );
            } );

            it( "should return false on callback function if url supplied is broken", function () {
                var fileLoader = new FileLoader( 'audio/doesnotexist.wav', context, function ( response ) {
                    expect( response )
                        .toEqual( false );
                } );
            } );

            it( "should be able to accept a file/blob object", function () {

                var context = new AudioContext();
                var request = new XMLHttpRequest();

                request.open( 'GET', 'audio/sineloopstereo.wav', true );
                request.responseType = 'blob';

                request.onload = function () {
                    var fileloader = new FileLoader( request.response, context, function ( response ) {
                        expect( response )
                            .toEqual( true );
                    } );
                };
                request.send();
            } );
        } );

        describe( '#getBuffer', function () {

            it( "should return a buffer if file is loaded", function ( done ) {
                var fileLoader = new FileLoader( 'audio/bullet.mp3', context, function ( response ) {
                    var bufferType = Object.prototype.toString.call( fileLoader.getBuffer() );
                    expect( bufferType )
                        .toEqual( '[object AudioBuffer]' );
                    done();
                } );

            } );

            it( "should throw an error if no buffer is available", function ( done ) {
                var fileLoader = new FileLoader( '', context, function ( response ) {
                    expect( function () {
                        fileLoader.getBuffer();
                    } )
                        .toThrowError();
                    done();
                } );
            } );

        } );

        describe( '#getRawBuffer', function () {

            it( "should return the original unsliced buffer", function ( done ) {
                var fileLoader = new FileLoader( 'audio/bullet.mp3', context, function ( response ) {
                    var bufferType = Object.prototype.toString.call( fileLoader.getRawBuffer() );
                    expect( fileLoader.getBuffer()
                        .length )
                        .not.toEqual( fileLoader.getRawBuffer()
                            .length );
                    expect( bufferType )
                        .toEqual( '[object AudioBuffer]' );
                    done();
                } );
            } );

            it( "should have a buffer length greater than the sliced buffer", function ( done ) {
                var fileLoader = new FileLoader( 'audio/bullet.mp3', context, function ( response ) {
                    var buffer = fileLoader.getBuffer();
                    var rawBuffer = fileLoader.getRawBuffer();
                    expect( buffer.length )
                        .not.toBeGreaterThan( rawBuffer.length );
                    done();
                } );

            } );

            it( "should throw an error if no buffer is available", function ( done ) {
                var fileLoader = new FileLoader( '', context, function ( response ) {
                    expect( function () {
                        fileLoader.getBuffer();
                    } )
                        .toThrowError();
                    done();
                } );
            } );
        } );

        describe( '#isLoaded', function () {
            it( "should return true if buffer is loaded", function ( done ) {
                var fileLoader = new FileLoader( 'audio/bullet.mp3', context, function ( response ) {
                    expect( response )
                        .toEqual( true );
                    expect( fileLoader.isLoaded() )
                        .toEqual( true );
                    done();
                } );
            } );
        } );

    } );
} );
