describe('BaseSound.js', function() {

  describe('new BaseSound', function() {

    var test = null;

    beforeEach(function(done) {
      if (test === null) {
        require(['src/lib/core/BaseSound'], function (BaseSound) {
          test = new BaseSound();
          done();
        });
      } else {
        done();
      }
    });
    
    it("should have audioContext available", function() {
      var b = Object.prototype.toString.call(test.audioContext);
      expect(b).toMatch("[object AudioContext]");
    });

    it("should have number of inputs default to 0", function() {
      expect(test.numberOfInputs).toBe(0);
    });

    it("should have a maximum number of sources default to 0", function() {
      expect(test.maxSources).toBe(0);
    });

    it("should have releaseGainNode property as a GainNode object", function() {
      var b = Object.prototype.toString.call(test.audioContext.createGain());
      expect(b).toMatch("[object GainNode]");
    });

    it("should have playing state default to false", function() {
      expect(test.isPlaying).toEqual(false);
    });

    it("should have input node default to null", function() {
      expect(test.inputNode).toEqual(null);
    });

  });
  
  describe('#numberOfInputs', function() {

    var test = null;

    beforeEach(function(done) {
      if (test === null) {
        require(['src/lib/core/BaseSound'], function (BaseSound) {
          test = new BaseSound();
          done();
        });
      } else {
        done();
      }
    });

    it("should default to 0 when given a negative value", function() {
      expect(test.numberOfInputs = -0.10).toBe(0);
      expect(test.numberOfInputs = -100).toBe(0);
    });

  });
  
  describe('#maxSources', function() {

    var test = null;

    beforeEach(function(done) {
      if (test === null) {
        require(['src/lib/core/BaseSound'], function (BaseSound) {
          test = new BaseSound();
          done();
        });
      } else {
        done();
      }
    });

    it("should default to 0 when given a negative value", function() {
      expect(test.maxSources = -0.10).toBe(0);
      expect(test.maxSources = -100).toBe(0);
    });

  });
  
  describe('#connect( destination, output, input )', function() {

    var test = null;

    beforeEach(function(done) {
      if (test === null) {
        require(['src/lib/core/BaseSound'], function (BaseSound) {
          test = new BaseSound();
          done();
        });
      } else {
        done();
      }
    });

    it("should throw an error if destination is null", function() {
      expect(function() {
        test.connect(null, null, null);
      }).toThrowError();
    });
    
    it("should throw an error if input or output exceeds number of inputs or outputs", function() {
      
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      
      var context = new AudioContext();
      var gainNode = context.createGain();
    
      expect(function() {
        test.connect(gainNode, 0, -100);
      }).toThrowError();
      
      expect(function() {
        test.connect(gainNode, 100, 100);
      }).toThrowError();
      
      expect(function() {
        test.connect(gainNode, -100, 0);
      }).toThrowError();
      
    });

  });

});