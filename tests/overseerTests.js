// Unit tests / user guide for overseer.js.
var requirejs = require('requirejs'),
    expect = require('chai').expect;

requirejs.config({
  baseUrl: ".",
  paths: {
    overseer: 'dist/overseer',
    configDiff: 'dist/overseer',
    _: 'lib/lodash/dist/lodash.min',
    model: 'lib/model/dist/model.min'
  }
});

describe('Overseer', function() {
  var configDiff, Overseer, Model;

  it('should load required AMD modules', function(done) {
    requirejs(['configDiff', 'overseer', 'model'],
        function (_configDiff, _Overseer, _Model) {
      configDiff = _configDiff,
      Overseer = _Overseer;
      Model = _Model;
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
