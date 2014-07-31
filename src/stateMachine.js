// A state machine that implements a distributed state
// synchronization algorithm.
define(['model'], function (Model) {

  return function StateMachine(emit){

    var machine = Model({
      // The current state of the state machine, an integer.
      state: 0,
      execute: function (transition) {

        // Ignore the transition if it starts at a state other than the current state.
        // This is the bottom out condition of the distributed synchronization algorithm.
        if(machine.state === transition.u){

          // Update the current state id.
          machine.state = transition.v;

          // Emit the transition.
          emit(transition);
        }
      }
    });
    return machine;
  };
});
