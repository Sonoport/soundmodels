describe('DetectLoopMarkers.js', function() {

  var test1 = null; // WAV File with marker
  var test2 = null; // WAV File without marker
  var test3 = null; // WAV File with mono channel

  var detectLoopMarkers_ = null;

  beforeEach(function(done) {

    if (test1 === null) {
      require(['core/DetectLoopMarkers'], function (detectLoopMarkers) {

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
            test1 = detectLoopMarkers(audio1);
            end();
          }, function(){});
        };

        request2.open('GET', 'audio/sineloopstereo.wav', true);
        request2.responseType = 'arraybuffer';

        request2.onload = function() {
          context2.decodeAudioData(request2.response, function(buffer) {
            audio2 = buffer;
            test2 = detectLoopMarkers(audio2);
            end();
          }, function(){});
        };

        request3.open('GET', 'audio/sineloopmono.wav', true);
        request3.responseType = 'arraybuffer';

        request3.onload = function() {
          context3.decodeAudioData(request3.response, function(buffer) {
            audio3 = buffer;
            test3 = detectLoopMarkers(audio3);
            end();
          }, function(){});
        };

        detectLoopMarkers_ = detectLoopMarkers;
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

  describe('#detectLoopMarkers( buffer )', function() {

    it("should throw an error if buffer is null", function() {
      expect(function() {
        var a = detectLoopMarkers_();
      }).toThrowError();
    });

    it("should not throw an error if loading from a buffer programatically created", function() {

      expect(function() {
        var context = new AudioContext();
        var audio = context.createBuffer(1, 2048, 44100);
        var b = detectLoopMarkers_(audio);
      }).not.toThrowError();

      expect(function() {
        var context = new AudioContext();
        var audio = context.createBuffer(2, 1024, 44100);
        var b = detectLoopMarkers_(audio);
      }).not.toThrowError();

    });

    it("should not have problem loading MP3 files", function(done) {

      var context = new AudioContext();
      var request = new XMLHttpRequest();
      var audio = null;
      var test = null;

      request.open('GET', 'audio/bullet.mp3', true);
      request.responseType = 'arraybuffer';

      request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
          audio = buffer;
          expect(function() {
            test = detectLoopMarkers_(audio);
          }).not.toThrowError();
          done();
        }, function(){});
      };

      request.send();

    });

  });

  describe('#marked sound - start', function() {
    it("should detect start marker if available", function() {
      expect(test1.start).toEqual(5000);
    });
  });

  describe('#unmarked sound - sound', function(){
    it("should detect start of sound if marker is not available", function() {
      expect(test2.start).toEqual(1);
      expect(test3.start).toEqual(1);
    });
  });

  describe('#marked sound - end', function() {
    it("should detect end marker if available", function() {
      expect(test1.end).toEqual(49000);
    });
  });

  describe('unmarked sound - end', function(){
     it("should detect start of sound if marker is not available", function() {
      expect(test2.end).toEqual(44000);
      expect(test3.end).toEqual(220500);
    });
  })

});
