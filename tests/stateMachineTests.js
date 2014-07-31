var requirejs = require("requirejs"),
    expect = require("chai").expect;

requirejs.config(require("./requireConfig.js"));

describe("StateMachine", function () {
  var StateMachine;

  it("should load AMD module", function (done) {
    requirejs(["stateMachine"], function (_StateMachine) {
      StateMachine = _StateMachine;
      done();
    });
  });

  it("should emit a valid transition", function() {
    var stateMachine = StateMachine(function (transition) {
      expect(transition.v).to.equal(1);
    });

    // This transition should be emitted,
    // because it starts at the default state, 0.
    stateMachine.execute({
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
    stateMachine.execute({ u: 0, v: 1 });
    expect(v).to.equal(1);
    stateMachine.execute({ u: 1, v: 8 });
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
    stateMachine.execute({
      u: 5,
      v: 6
    });
  });

  it("should synchronize two state machines", function() {
    var a = StateMachine(broadcast),
        b = StateMachine(broadcast);

    function broadcast(transition){
      a.execute(transition);
      b.execute(transition);
    }

    a.execute({
      u: 0,
      v: 1
    });

    expect(a.state).to.equal(1);
    expect(b.state).to.equal(1);

    b.execute({
      u: 1,
      v: 2
    });

    expect(a.state).to.equal(2);
    expect(b.state).to.equal(2);

  });

  it("should synchronize four state machines", function() {
    var a = StateMachine(broadcast),
        b = StateMachine(broadcast),
        c = StateMachine(broadcast),
        d = StateMachine(broadcast),
        machines = [a, b, c, d];

    function broadcast(transition){
      machines.forEach(function (machine) {
        machine.execute(transition);
      });
    }

    a.execute({
      u: 0,
      v: 1
    });

    expect(a.state).to.equal(1);
    expect(b.state).to.equal(1);
    expect(c.state).to.equal(1);
    expect(d.state).to.equal(1);

    b.execute({
      u: 1,
      v: 2
    });

    expect(a.state).to.equal(2);
    expect(b.state).to.equal(2);
    expect(c.state).to.equal(2);
    expect(d.state).to.equal(2);

  });
  it("should synchronize state machines with async communication", function(done) {
    var clientA = StateMachine(function (transition) {
          // simulate network latency.
          setTimeout(function () {
            server.execute(transition);
          }, Math.random() * 10);
        }),
        server = StateMachine(function (transition) {
          expect(server.state).to.equal(1);

          // simulate network latency.
          setTimeout(function () {

            // Simple sync algorithm broadcasts transition to all clients.
            clientA.execute(transition);
            clientB.execute(transition);

          }, Math.random() * 10);
        });
        clientB = StateMachine(function (transition) {
          expect(clientA.state).to.equal(1);
          expect(clientB.state).to.equal(1);
          done();
        });

    clientA.execute({
      u: 0,
      v: 1
    });
  });
  // TODO simulate conflicting async transitions from different sources
});
