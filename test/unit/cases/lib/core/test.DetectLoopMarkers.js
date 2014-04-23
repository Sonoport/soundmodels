describe('DetectLoopMarkers.js', function() {
  
  var test1 = null; // With marker
  var test2 = null; // Without marker
  var test3 = null; // Mono channel
  
  var DetectLoopMarkers_ = null;
  
  beforeEach(function(done) {
      
    if (test1 === null) {
      require(['src/lib/core/DetectLoopMarkers'], function (DetectLoopMarkers) {
        
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
      
        var context1 = new AudioContext();
        var context2 = new AudioContext();
        var context3 = new AudioContext();
        var request1 = new XMLHttpRequest();
        var request2 = new XMLHttpRequest();
        var request3 = new XMLHttpRequest();
        var audio1 = null;
        var audio2 = null;
        var audio3 = null;
        
        request1.open('GET', 'audio/sineloopstereomarked.wav', true);
        request1.responseType = 'arraybuffer';
 
        request1.onload = function() {
          context1.decodeAudioData(request1.response, function(buffer) {
            audio1 = buffer;
            test1 = new DetectLoopMarkers(audio1);
            end();
          }, function(){});
        };
        
        request2.open('GET', 'audio/sineloopstereo.wav', true);
        request2.responseType = 'arraybuffer';
 
        request2.onload = function() {
          context2.decodeAudioData(request2.response, function(buffer) {
            audio2 = buffer;
            test2 = new DetectLoopMarkers(audio2);
            end();
          }, function(){});
        };
        
        request3.open('GET', 'audio/sineloopmono.wav', true);
        request3.responseType = 'arraybuffer';
 
        request3.onload = function() {
          context3.decodeAudioData(request3.response, function(buffer) {
            audio3 = buffer;
            test3 = new DetectLoopMarkers(audio3);
            end();
          }, function(){});
        };
        
        DetectLoopMarkers_ = DetectLoopMarkers;
        request1.send();
        request2.send();
        request3.send();
        
        function end() {
          if (test1 !== null && test2 !== null && test3 !== null) {
            done();
          }
        }
        
      });
    } else {
      done();
    }
  });

  describe('#new DetectLoopMarkers( buffer )', function() {
    
    it("should throw an error if buffer is null", function() {
      expect(function() {
        var a = DetectLoopMarkers_();
      }).toThrowError();
    });
    
    it("should not throw an error if loading from a buffer programatically created", function() {
      
      expect(function() {
        var context = new AudioContext();
        var audio = context.createBuffer(1, 2048, 44100);
        var b = DetectLoopMarkers_(audio);
      }).not.toThrowError();
      
      expect(function() {
        var context = new AudioContext();
        var audio = context.createBuffer(2, 1024, 44100);
        var b = DetectLoopMarkers_(audio);
      }).not.toThrowError();
      
    });

  });
  
  describe('#start', function() {

    it("should detect start marker if available", function() {
      expect(test1.start).toEqual(5221);
    });
    
    it("should create a start marker if not available", function() {
      expect(test2.start).toEqual(1);
      expect(test3.start).toEqual(1);
    });

  });
  
  describe('#end', function() {

    it("should detect end marker if available", function() {
      expect(test1.end).toEqual(53555);
    });
    
    it("should create a end marker if not available", function() {
      expect(test2.end).toEqual(47890);
      expect(test3.end).toEqual(239999);
    });

  });
  
});