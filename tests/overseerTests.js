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
            return Model({ x: 0 });
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

  it("should use defaults when no model is provided", function (done) {
    var overseer = Overseer(loadModule);
    overseer.setConfig({
      myFoo: {
        module: "foo"
      }
    });
    overseer.getModel("myFoo", function (model) {
      model.when("x", function (x) {
        expect(x).to.equal(0);
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
    var actions = [],
        overseer = Overseer(loadModule, function (action) {
          actions.push(action);
          if(action.method === "set") {

            // This first action is from configuration.
            if(Action.toString(action) === "set(myFoo, x, 5)"){

              // Trigger an action from a model change.
              overseer.getModel("myFoo", function (model) {
                model.x = 99;
              });
            } else {
              expect(Action.toString(action)).to.equal("set(myFoo, x, 99)");
            }
          }
        });

    overseer.setConfig({
      myFoo: {
        module: "foo",
        model: { x: 5 }
      }
    });

    setTimeout(function () {
      var actionsStr = actions.map(Action.toString).join(" ");
      expect(actionsStr).to.equal("create(myFoo, foo) set(myFoo, x, 5) set(myFoo, x, 99)");
      done();
    }, 100);
  });

  it("should not emit actions to set default values", function (done) {
    var actions = [],
        overseer = Overseer(loadModule, function (action) {
          actions.push(action);
        });

    overseer.setConfig({
      myFoo: {
        module:"foo"
      }
    });

    setTimeout(function () {
      var actionsStr = actions.map(Action.toString).join(" ");
      expect(actionsStr).to.equal("create(myFoo, foo)");
      done();
    }, 100);
  });
});

// server -> actions -> overseer
// user interaction -> models -> overseer -> actions -> server
// set configuration          -> overseer -> actions -> server
