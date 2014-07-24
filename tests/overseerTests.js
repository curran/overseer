var requirejs = require('requirejs'),
    expect = require('chai').expect;

requirejs.config(require('./requireConfig.js'));

describe('Overseer', function() {
  var Overseer, Model;

  it('should load required AMD modules', function(done) {
    requirejs(['overseer', 'model'], function (_Overseer, _Model) {
      Overseer = _Overseer;
      Model = _Model;
      done();
    });
  });

  it('should set a simple config', function (done) {
    var loadModule = (function () {
          var modules = {
            foo: function () {
              var model = new Model();
              model.set(model.defaults = { x: 0 });
              return model;
            }
          };
          return function (moduleName, callback){
            // Simulate async module loading
            setTimeout(function () {
              callback(modules[moduleName]);
            }, Math.random() * 100);
          };
        }()),
        overseer = Overseer(loadModule);
    overseer.setConfig({
      myFoo: {
        module: 'foo',
        model: {
          x: 5
        }
      }
    });
    overseer.getModel('myFoo', function (model) {
      model.when('x', function (x) {
        expect(x).to.equal(5);
        done();
      });
    });
  });
});
