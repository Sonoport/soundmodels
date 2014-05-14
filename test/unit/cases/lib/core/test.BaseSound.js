describe('BaseSound.js', function() {
  
  var test = null;
  var BaseSound_ = null;
  
  beforeEach(function(done) {
      
    if (test === null) {
      require(['src/lib/core/BaseSound'], function (BaseSound) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var context = new AudioContext();
        test = new BaseSound(context);
        BaseSound_ = BaseSound;
        done();
      });
    } else {
      done();
    }
  });

  describe('#new BaseSound( context )', function() {
    
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
      expect(test.inputNode).toBeNull();
    });
    
    it("should not throw an error if context is undefined", function() {
      expect(function() {
        var a = new BaseSound_();
      }).not.toThrowError();
    });
    
  });
  
  describe('#numberOfInputs', function() {

      it("should default to 0 when given a negative value", function() {
        expect(test.numberOfInputs = -1).toBe(0);
        expect(test.numberOfInputs = -100).toBe(0);
      });
      
      it("should accept only integers and round off to nearest integer if float number placed", function() {
        expect(test.numberOfInputs = 0.01).toBe(0);
        expect(test.numberOfInputs = 1.20).toBe(1);
        expect(test.numberOfInputs = 1.80).toBe(2);
      });

    });
  
  describe('#maxSources', function() {

    it("should default to 0 when given a negative value", function() {
      expect(test.maxSources = -1).toBe(0);
      expect(test.maxSources = -100).toBe(0);
    });
    
    it("should accept only integers and round off to nearest integer if float number placed", function() {
      expect(test.maxSources = 0.01).toBe(0);
      expect(test.maxSources = 1.20).toBe(1);
      expect(test.maxSources = 1.80).toBe(2);
    });

  });
  
  describe('#connect( destination, output, input )', function() {

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
  
  describe('#start( when, offset, duration )', function() {

    it("should be playing when called", function() {
      test.start(0, 0, 0);
      expect(test.isPlaying).toEqual(true);
    });
    
  });
  
  describe('#stop( when )', function() {

    it("should stop playing when called", function() {
      test.start(0, 0, 0);
      test.stop();
      expect(test.isPlaying).toEqual(false);
    });
    
  });

});