 require( [ 'core/BaseSound' ], function ( BaseSound ) {
     window.AudioContext = window.AudioContext || window.webkitAudioContext;
     var context = new AudioContext();

     describe( 'BaseSound.js', function () {

         beforeEach( function ( done ) {
             baseSound = new BaseSound( context );
             done();
         } );

         describe( '#new BaseSound( context )', function () {

             it( "should have audioContext available", function () {
                 var b = Object.prototype.toString.call( baseSound.audioContext );
                 expect( b )
                     .toMatch( "[object AudioContext]" );
             } );

             it( "should have number of inputs default to 0", function () {
                 expect( baseSound.numberOfInputs )
                     .toBe( 0 );
             } );

             it( "should have a maximum number of sources default to 0", function () {
                 expect( baseSound.maxSources )
                     .toBe( 0 );
             } );

             it( "should have releaseGainNode property as a GainNode object", function () {
                 var b = Object.prototype.toString.call( baseSound.audioContext.createGain() );
                 expect( b )
                     .toMatch( "[object GainNode]" );
             } );

             it( "should have playing state default to false", function () {
                 expect( baseSound.isPlaying )
                     .toEqual( false );
             } );

             it( "should have input node default to null", function () {
                 expect( baseSound.inputNode )
                     .toBeNull();
             } );

             it( "should not throw an error if context is undefined", function () {
                 expect( function () {
                     var a = new BaseSound();
                 } )
                     .not.toThrowError();
             } );

         } );

         describe( '#maxSources', function () {

             it( "should default to 0 when given a negative value", function () {
                 baseSound.maxSources = -1;
                 expect( baseSound.maxSources )
                     .toBe( 0 );

                 baseSound.maxSources = -100;
                 expect( baseSound.maxSources )
                     .toBe( 0 );
             } );

             it( "should accept only integers and round off to nearest integer if float number placed", function () {
                 baseSound.maxSources = 0.01;
                 expect( baseSound.maxSources )
                     .toBe( 0 );

                 baseSound.maxSources = 1.20;
                 expect( baseSound.maxSources )
                     .toBe( 1 );

                 baseSound.maxSources = 1.80;
                 expect( baseSound.maxSources )
                     .toBe( 2 );
             } );

         } );

         describe( '#connect( destination, output, input )', function () {

             it( "should throw an error if destination is null", function () {
                 expect( function () {
                     baseSound.connect( null, null, null );
                 } )
                     .toThrowError();
             } );

             it( "should throw an error if input or output exceeds number of inputs or outputs", function () {

                 var gainNode = context.createGain();

                 expect( function () {
                     baseSound.connect( gainNode, 0, -100 );
                 } )
                     .toThrowError();

                 expect( function () {
                     baseSound.connect( gainNode, 100, 100 );
                 } )
                     .toThrowError();

                 expect( function () {
                     baseSound.connect( gainNode, -100, 0 );
                 } )
                     .toThrowError();

             } );

         } );

         describe( '#start( when, offset, duration )', function () {

             it( "should start playing when called", function () {
                 baseSound.start( 0, 0, 0 );
                 expect( baseSound.isPlaying )
                     .toEqual( true );
             } );
         } );

         describe( '#play( )', function () {

             it( "should playing when called", function () {
                 baseSound.play();
                 expect( baseSound.isPlaying )
                     .toEqual( true );
             } );
         } );

         describe( '#pause( )', function () {

             it( "should pause when called", function () {
                 baseSound.start( 0, 0, 0 );
                 baseSound.pause();
                 expect( baseSound.isPlaying )
                     .toEqual( false );
             } );
         } );

         describe( '#stop( when )', function () {

             it( "should stop playing when called", function () {
                 baseSound.start( 0, 0, 0 );
                 baseSound.stop( 0 );
                 expect( baseSound.isPlaying )
                     .toEqual( false );
             } );
         } );
     } );
 } );
