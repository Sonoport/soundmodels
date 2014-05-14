describe('MultiFileLoader.js', function() {
  
  var test1 = null; // Valid FileLoader
  var test2 = null; // Invalid FileLoader
  var FileLoader_ = null;
  var context = null;
  
  beforeEach(function(done) {
      
    if (test1 === null) {
      require(['src/lib/core/MultiFileLoader'], function (FileLoader) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        test1 = new FileLoader('audio/bullet.mp3', context, function(response){console.log(response);});
        test2 = new FileLoader('', context, function(response){});
        FileLoader_ = FileLoader;
        done();
      });
    } else {
      done();
    }
  });

  describe('#new FileLoader( URL, context, onloadCallback )', function() {
    
    it("should return true on callback function if url supplied is valid", function(done) {
      var a = new FileLoader_('audio/sineloopstereo.wav', context, function(response){
        expect(response).toEqual(true);
        done();
      });
    });
    
  });
  
});