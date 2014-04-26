// Unit tests / user guide for overseer.js.
var requirejs = require('requirejs'),
    expect = require('chai').expect;

requirejs.config({
  baseUrl: ".",
  paths: {
    model: 'lib/model/dist/model.min',
    overseer: 'dist/overseer'
  }
});

describe('A suite', function() {
  var Overseer;

  // Use require.js to fetch the module.
  it('should load the AMD module', function(done) {
    requirejs(['overseer'], function (OverseerModule) {
      console.log('module:');
      console.log(OverseerModule);

      Overseer = OverseerModule;
      done();
    });
  });

  it('can access the AMD module', function() {
    var overseer = Overseer();
    expect(overseer.config()).to.equal('test');
  });
});
