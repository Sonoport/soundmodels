describe('Config.js', function() {

  describe('Class', function() {

    var test = null;

    beforeEach(function(done) {
      require(['src/lib/core/Config'], function (Config) {
        test = Config;
        done();
      });
    });

    it("should have maximum number of voices supported default to 8", function() {
      expect(test.MAX_VOICES).toBe(8);
    });
    
    it("should have default nominal refresh rate (Hz) for SoundQueue to 60", function() {
      expect(test.NOMINAL_REFRESH_RATE).toBe(60);
    });

  });

});