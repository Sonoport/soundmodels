describe('FileLoader.js', function() {
  
  var test1 = null; // Valid FileLoader
  var test2 = null; // Invalid FileLoader
  var FileLoader_ = null;
  var context = null;
  
  beforeEach(function(done) {
      
    if (test1 === null) {
      require(['src/lib/core/FileLoader'], function (FileLoader) {
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
    
    it("should return false on callback function if url supplied is blank", function(done) {
      var a = new FileLoader_('', context, function(response){
        expect(response).toEqual(false);
        done();
      });
    });
    
    it("should return false on callback function if url supplied is not a url", function(done) {
      var a = new FileLoader_('abcdef', context, function(response){
        expect(response).toEqual(false);
        done();
      });
    });
     
    it("should return false on callback function if url supplied is broken", function(done) {
      var a = new FileLoader_('audio/doesnotexist.wav', context, function(response){
        expect(response).toEqual(false);
        done();
      });
    });
    
    xit("should be able to accept a file object", function(done) {
      
      var context = new AudioContext();
      var request = new XMLHttpRequest();
      
      request.open('GET', 'audio/sineloopstereo.wav', true);
      request.responseType = 'arraybuffer';

      request.onload = function() {
          
        var a = new FileLoader_(request.response, context, function(response){
          expect(response).toEqual(true);
          done();
        });

      };
      
      request.send();
      
    });
    
  });
  
  describe('#getBuffer', function() {

    it("should return a buffer if file is loaded", function() {
      var a = test1.getBuffer();
      var b = Object.prototype.toString.call(a);
      expect(a).not.toBeNull();
      expect(b).toEqual('[object AudioBuffer]');
    });

    it("should throw an error if no buffer is available", function() {
      expect(function() {
        test2.getBuffer();
      }).toThrowError();
    });

  });
  
  describe('#getRawBuffer', function() {

    it("should return the original unsliced buffer", function() {
      var a = test1.getBuffer();
      var b = Object.prototype.toString.call(a);
      expect(a.length).not.toEqual(b.length);
      expect(b).toEqual('[object AudioBuffer]');
    });
    
    it("should have a buffer length greater than the sliced buffer", function() {
      var a = test1.getBuffer();
      var b = test1.getRawBuffer();
      expect(a.length).not.toBeGreaterThan(b.length);
    });
    
  });
  
  describe('#isLoaded', function() {

    it("should return true if buffer is loaded", function(done) {
      
      var test = new FileLoader_('audio/bullet.mp3', context, function(response){
        console.log(response);
        expect(test.isLoaded).toEqual(true);
        done();
      });
      
    });
    
  });
  
});