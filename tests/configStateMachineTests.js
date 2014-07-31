var requirejs = require("requirejs"),
    expect = require("chai").expect;

requirejs.config(require("./requireConfig.js"));

describe("ConfigStateMachine", function () {
  var StateMachine, ConfigStateMachine;

  it("should load AMD module", function (done) {
    requirejs(["stateMachine", "configStateMachine"], function (_StateMachine, _ConfigStateMachine) {
      StateMachine = _StateMachine;
      ConfigStateMachine = _ConfigStateMachine;
      done();
    });
  });

  it("should emit a valid transition", function(done) {
    var stateMachine = ConfigStateMachine(function (transition) {
      expect(transition.v).to.equal(1);
      done();
    });
    stateMachine.execute({
      u: 0,
      v: 1
    });
  });
  
  it("should execute a transition that creates a component", function() {
    var machine = ConfigStateMachine();

    machine.execute({
      u: 0,
      v: 1,
      do: {
        create: [{
          alias: "myFoo",
          module: "foo"
        }]
      }
    });

    expect(JSON.stringify(machine.config)).to.equal('{"myFoo":{"module":"foo"}}');
  });

  it("should execute a transition that creates and sets values on a component", function() {
    var machine = ConfigStateMachine();

    machine.execute({
      u: 0,
      v: 1,
      do: {
        create: [{
          alias: "myFoo",
          module: "foo"
        }],
        set: [{
          alias: "myFoo",
          values: {
            x: 5
          }
        }]
      }
    });

    expect(JSON.stringify(machine.config)).to.equal('{"myFoo":{"module":"foo","x":5}}');
  });

  it("should execute separate transitions that create and set values on a component", function() {
    var machine = ConfigStateMachine();

    machine.execute({
      u: 0,
      v: 1,
      do: {
        create: [{
          alias: "myFoo",
          module: "foo"
        }]
      }
    });

    expect(JSON.stringify(machine.config)).to.equal('{"myFoo":{"module":"foo"}}');

    machine.execute({
      u: 1,
      v: 2,
      do: {
        set: [{
          alias: "myFoo",
          values: {
            x: 5
          }
        }]
      }
    });

    expect(JSON.stringify(machine.config)).to.equal('{"myFoo":{"module":"foo","x":5}}');
  });
  it("should unset values on a component", function(done) {
    var machine = ConfigStateMachine();

    machine.execute({
      u: 0,
      v: 1,
      do: {
        create: [{
          alias: "myFoo",
          module: "foo"
        }],
        set: [{
          alias: "myFoo",
          values: {
            x: 5,
            y: 20
          }
        }],
        unset: [{
          alias: "myFoo",
          properties: ['x']
        }]
      }
    });

    // Also tests the model.js property.
    machine.when('config', function (config) {
      expect(JSON.stringify(config)).to.equal('{"myFoo":{"module":"foo","y":20}}');
      done();
    });

  });

  it("should execute a transition that destroys a component", function() {
    var machine = ConfigStateMachine();

    machine.execute({
      u: 0,
      v: 1,
      do: {
        create: [{
          alias: "myFoo",
          module: "foo"
        }],
        set: [{
          alias: "myFoo",
          values: {
            x: 5
          }
        }],
        destroy: ["myFoo"]
      }
    });

    expect(JSON.stringify(machine.config)).to.equal('{}');
  });

});
