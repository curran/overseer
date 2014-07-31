var requirejs = require("requirejs"),
    expect = require("chai").expect;

requirejs.config(require("./requireConfig.js"));

describe("StateMachine", function () {
  var StateMachine, Action;

  it("should load AMD module", function (done) {
    requirejs(["StateMachine", "action"], function (_StateMachine, _Action) {
      StateMachine = _StateMachine;
      Action = _Action;
      done();
    });
  });

  it("should emit a valid transition", function() {
    var stateMachine = StateMachine(function (transition) {
      expect(transition.v).to.equal(1);
    });

    // This transition should be emitted,
    // because it starts at the default state, 0.
    stateMachine.executeTransition({
      u: 0,
      v: 1
    });
  });

  it("should emit two subsequent valid transitions, updating the current state", function() {
    var v,
        stateMachine = StateMachine(function (transition) {
          v = transition.v;
        });

    // This transition should be emitted,
    // because it starts at the default state, 0.
    stateMachine.executeTransition({ u: 0, v: 1 });
    expect(v).to.equal(1);
    stateMachine.executeTransition({ u: 1, v: 8 });
    expect(v).to.equal(8);
  });
  
  it("should not emit an invalid transition", function(done) {
    done();
    var stateMachine = StateMachine(function (transition) {
      // This should never get invoked.
      done();
    });

    // This transition should not be emitted,
    // because it does not start at the default state, 0.
    stateMachine.executeTransition({
      u: 5,
      v: 6
    });
  });

  it("should synchronize two state machines", function() {
    var a = StateMachine(broadcast),
        b = StateMachine(broadcast);

    function broadcast(transition){
      a.executeTransition(transition);
      b.executeTransition(transition);
    }

    a.executeTransition({
      u: 0,
      v: 1
    });

    expect(a.currentState()).to.equal(1);
    expect(b.currentState()).to.equal(1);

    b.executeTransition({
      u: 1,
      v: 2
    });

    expect(a.currentState()).to.equal(2);
    expect(b.currentState()).to.equal(2);

  });

  it("should synchronize four state machines", function() {
    var a = StateMachine(broadcast),
        b = StateMachine(broadcast),
        c = StateMachine(broadcast),
        d = StateMachine(broadcast),
        machines = [a, b, c, d];

    function broadcast(transition){
      machines.forEach(function (machine) {
        machine.executeTransition(transition);
      });
    }

    a.executeTransition({
      u: 0,
      v: 1
    });

    expect(a.currentState()).to.equal(1);
    expect(b.currentState()).to.equal(1);
    expect(c.currentState()).to.equal(1);
    expect(d.currentState()).to.equal(1);

    b.executeTransition({
      u: 1,
      v: 2
    });

    expect(a.currentState()).to.equal(2);
    expect(b.currentState()).to.equal(2);
    expect(c.currentState()).to.equal(2);
    expect(d.currentState()).to.equal(2);

  });
});
