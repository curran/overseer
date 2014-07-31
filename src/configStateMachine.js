define(["_", "stateMachine"], function (_, StateMachine) {

  return function (emit){

    // The parent state machine.
    var machine = StateMachine(process);
  
    // The object containing the current config.
    machine.config = {};

    // Updates machine.config when transitions are processed.
    function process(transition) {

      // Update the config
      if(transition.do){
        if(transition.do.create){
          transition.do.create.forEach(function (component) {
            machine.config[component.alias] = {
              module: component.module
            };
          });
        }
        if(transition.do.set){
          transition.do.set.forEach(function (component) {
            _.extend(machine.config[component.alias], component.values);
          });
        }
        if(transition.do.unset){
          transition.do.unset.forEach(function (component) {
            component.properties.forEach(function (property) {
              delete machine.config[component.alias][property];
            });
          });
        }
        // TODO test this
        if(transition.do.destroy){
          transition.do.destroy.forEach(function (alias) {
            delete machine.config[alias];
          });
        }

        // Trigger Model.js listeners
        machine.config = machine.config;
      }

      // Pass on the transition
      // TODO test this
      if(emit) {
        emit(transition);
      }
    }
    return machine;
  };
});
