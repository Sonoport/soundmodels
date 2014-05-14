describe('Config.js', function() {

  describe('#Class{}', function() {

    var Config_ = null;

    beforeEach(function(done) {
      require(['src/lib/core/Config'], function (Config) {
        Config_ = Config;
        done();
      });
    });

    it("should have maximum number of voices supported default to 8", function() {
      expect(Config_.MAX_VOICES).toBe(8);
    });
    
    it("should have default nominal refresh rate (Hz) for SoundQueue to 60", function() {
      expect(Config_.NOMINAL_REFRESH_RATE).toBe(60);
    });

  });

});