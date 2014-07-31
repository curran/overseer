function StateMachine(emitTransition){

  // The configuration object containing the current state.
  // alias -> property -> value
  var configuration = {},

      // The current state of the state machine, an integer.
      currentState = 0,

      // The collection of transitions that have executed so far.
      history = [],
      
      // The public API object, having reactive properties:
      //
      //  * currentState
      //  * history
      //  * configuration
      model = Model();

  return {
    executeTransition: function (transition) {

      // Ignore the transition if it starts at a state other than the current state.
      // This is the bottom out condition of the distributed synchronization algorithm.
      if(currentState !== transition.u){
        return;
      }

      // Add the transition to the history of this state machine.
      history.push(transition);

      // Update the configuration
      transition.do.create.forEach(function (component) {
        configuration[component.alias] = {
          module: component.module;
        };
      });
      transition.do.set.forEach(function (component) {
        _.extend(configuration[component.alias], component.values);
      });
      transition.do.unset.forEach(function (component) {
        component.properties.forEach(function (property) {
          delete configuration[component.alias][property];
        });
      });
      transition.do.destroy.forEach(function (alias) {
        delete configuration[alias];
      });

      // Update the state id.
      currentState = transition.v;
    }
  };
}
