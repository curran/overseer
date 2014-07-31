// A state machine that implements a distributed state
// synchronization algorithm.
define([], function () {

  return function StateMachine(emit){

    // The current state of the state machine, an integer.
    var currentState = 0;

    return {
      executeTransition: function (transition) {

        // Ignore the transition if it starts at a state other than the current state.
        // This is the bottom out condition of the distributed synchronization algorithm.
        if(currentState === transition.u){

          // Update the current state id.
          currentState = transition.v;

          // Emit the transition.
          emit(transition);
        }
      },
      currentState: function () { return currentState; }
    };
  };
});
