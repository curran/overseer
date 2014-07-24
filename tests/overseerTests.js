var requirejs = require("requirejs"),
    expect = require("chai").expect;

requirejs.config(require("./requireConfig.js"));

describe("Overseer", function() {
  var Overseer,
      Model,
      Action,
      loadModule = (function () {
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
      }());

  it("should load required AMD modules", function(done) {
    requirejs(["overseer", "model", "action"], function (_Overseer, _Model, _Action) {
      Overseer = _Overseer;
      Model = _Model;
      Action = _Action;
      done();
    });
  });

  it("should set a simple config", function (done) {
    var overseer = Overseer(loadModule);
    overseer.setConfig({
      myFoo: {
        module: "foo",
        model: { x: 5 }
      }
    });
    overseer.getModel("myFoo", function (model) {
      model.when("x", function (x) {
        expect(x).to.equal(5);
        done();
      });
    });
  });

  it("should emit actions from configuration changes", function (done) {
    var overseer = Overseer(loadModule, function (action) {
      if(action.method === "set") {
        expect(Action.toString(action)).to.equal("set(myFoo, x, 5)");
        done();
      }
    });
    overseer.setConfig({
      myFoo: {
        module: "foo",
        model: { x: 5 }
      }
    });
  });
  it("should emit actions from model changes", function (done) {
    var overseer = Overseer(loadModule, function (action) {
      if(action.method === "set") {
        // This first action is from configuration.
        if(Action.toString(action) === "set(myFoo, x, 5)"){
          // Trigger an action from a model change.
          overseer.getModel("myFoo", function (model) {
            model.x = 99;
          });
        } else {
          expect(Action.toString(action)).to.equal("set(myFoo, x, 99)");
          done();
        }
      }
    });
    overseer.setConfig({
      myFoo: {
        module: "foo",
        model: { x: 5 }
      }
    });
  });
});

// server -> actions -> overseer
// user interaction -> models -> overseer -> actions -> server
// set configuration          -> overseer -> actions -> server
