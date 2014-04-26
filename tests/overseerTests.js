// Unit tests / user guide for overseer.js.
var requirejs = require('requirejs'),
    expect = require('chai').expect;

requirejs.config({
  baseUrl: ".",
  paths: {
    overseer: 'dist/overseer',
    _: 'lib/lodash/dist/lodash.min',
    model: 'lib/model/dist/model.min'
  }
});

describe('Overseer', function() {
  var Overseer,
      Model;

  // Use require.js to fetch the module.
  it('should load the AMD module', function(done) {
    requirejs(['overseer', 'model'], function (OverseerModule, ModelModule) {
      Overseer = OverseerModule;
      Model = ModelModule;
      done();
    });
  });

  it('should set a simple config', function (done) {
    var xValue,
        loadModule = (function () {
          var modules = {
            foo: function () {
              var model = new Model();
              model.set('x', 0);
              model.publicProperties = ['x'];
              model.when('x', function (x) {
                xValue = x;
              });
              return model;
            }
          };
          return function (moduleName){
            return modules[moduleName];
          };
        }()),
        overseer = Overseer(loadModule);
    overseer.setConfig({
      myFoo: {
        module: 'foo',
        x: 5
      }
    });
    setTimeout(function () {
      //expect(xValue).to.equal(5);
      done();
    }, 0);
  });
});
