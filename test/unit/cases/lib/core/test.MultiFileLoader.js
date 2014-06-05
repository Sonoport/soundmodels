describe('MultiFileLoader.js', function() {

  var test1 = null; // Valid FileLoader
  var test2 = null; // Invalid FileLoader
  var FileLoader_ = null;
  var context = null;

  beforeEach(function(done) {

    if (test1 === null) {
      require(['core/MultiFileLoader'], function (multiFileLoader) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        done();
    });
  } else {
      done();
  }
});
