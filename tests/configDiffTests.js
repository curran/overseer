var requirejs = require('requirejs'),
    expect = require('chai').expect;

requirejs.config(require('./requireConfig.js'));

describe('configDiff', function() {
  var configDiff;

  it('should load AMD module', function(done) {
    requirejs(['configDiff'], function (_configDiff) {
      configDiff = _configDiff;
      done();
    });
  });
});
