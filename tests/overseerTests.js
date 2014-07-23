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
