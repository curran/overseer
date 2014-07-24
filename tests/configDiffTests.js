var requirejs = require("requirejs"),
    expect = require("chai").expect;

requirejs.config(require("./requireConfig.js"));

describe("configDiff", function () {
  var configDiff, Action;

  // Converts an action into a string
  // for convenient testing.

  // A function that calls configDiff
  // and maps the returned actions to strings.
  function diff(oldConfig, newConfig){
    return configDiff(oldConfig, newConfig).map(Action.toString);
  }

  // A convenience function that writes part of the unit test,
  // for use only while developing tests.
  function writeTest(actions){
    actions.forEach(function (action) {
      console.log('expect(actions).to.contain("' + action + '");');
    });
  }

  it("should load AMD module", function (done) {
    requirejs(["configDiff", "action"], function (_configDiff, _Action) {
      configDiff = _configDiff;
      Action = _Action;
      done();
    });
  });

  it("should handle one added alias", function() {
    var actions = diff({}, {
      myFoo: {
        module: "foo",
        model: {
          x: 50,
          y: 40
        }
      }
    });
    expect(actions).to.contain("set(myFoo, x, 50)");
    expect(actions).to.contain("set(myFoo, y, 40)");
    expect(actions.length).to.equal(3);
  });

  it("should handle one added property", function() {
    var actions = diff({
      myFoo: {
        module: "foo",
        model: {
          y: 40
        }
      }
    }, {
      myFoo: {
        module: "foo",
        model: {
          x: 50,
          y: 40
        }
      }
    });
    expect(actions).to.contain("set(myFoo, x, 50)");
    expect(actions.length).to.equal(1);
  });

  it("should handle two added properties", function() {
    var actions = diff({
      myFoo: {
        module: "foo",
        model: {
          y: 40
        }
      }
    }, {
      myFoo: {
        module: "foo",
        model: {
          x: 50,
          y: 40,
          z: 70
        }
      }
    });
    expect(actions).to.contain("set(myFoo, x, 50)");
    expect(actions).to.contain("set(myFoo, z, 70)");
    expect(actions.length).to.equal(2);
  });

  it("should handle one removed property", function() {
    var actions = diff({
      myFoo: {
        module: "foo",
        model: {
          x: 50,
          y: 40
        }
      }
    }, {
      myFoo: {
        module: "foo",
        model: {
          y: 40
        }
      }
    });
    expect(actions).to.contain("unset(myFoo, x)");
    expect(actions.length).to.equal(1);
  });

  it("should handle two removed properties", function() {
    var actions = diff({
      myFoo: {
        module: "foo",
        model: {
          x: 50,
          y: 40
        }
      }
    }, {
      myFoo: {
        module: "foo",
        model: {
        }
      }
    });
    expect(actions).to.contain("unset(myFoo, x)");
    expect(actions).to.contain("unset(myFoo, y)");
    expect(actions.length).to.equal(2);
  });
  it("should handle one updated property", function() {
    var actions = diff({
      myFoo: {
        module: "foo",
        model: {
          x: 50,
          y: 40
        }
      }
    }, {
      myFoo: {
        module: "foo",
        model: {
          x: 60,
          y: 40
        }
      }
    });
    expect(actions).to.contain("set(myFoo, x, 60)");
    expect(actions.length).to.equal(1);
  });
  it("should handle two updated properties", function() {
    var actions = diff({
      myFoo: {
        module: "foo",
        model: {
          x: 50,
          y: 40
        }
      }
    }, {
      myFoo: {
        module: "foo",
        model: {
          x: 60,
          y: 50
        }
      }
    });
    expect(actions).to.contain("set(myFoo, x, 60)");
    expect(actions).to.contain("set(myFoo, y, 50)");
    expect(actions.length).to.equal(2);
  });
  it("should handle one removed alias", function() {
    var actions = diff({
      myFoo: {
        module: "foo",
        model: {
          x: 50,
          y: 40
        }
      }
    }, {});
    expect(actions).to.contain("destroy(myFoo)");
    expect(actions.length).to.equal(1);
  });
});
