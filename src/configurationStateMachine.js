define(["model", "stateMachine"], function (Model, StateMachine) {

  return function (emit){

    var stateMachine = StateMachine(process),
        model = Model({
          configuration: {},
          executeTransition: stateMachine.executeTransition
        });

    // Updates model.configuration when transitions are processed.
    function process(transition) {

      // Update the configuration
      transition.do.create.forEach(function (component) {
        model.configuration[component.alias] = {
          module: component.module
        };
      });
      transition.do.set.forEach(function (component) {
        _.extend(model.configuration[component.alias], component.values);
      });
      transition.do.unset.forEach(function (component) {
        component.properties.forEach(function (property) {
          delete model.configuration[component.alias][property];
        });
      });
      transition.do.destroy.forEach(function (alias) {
        delete model.configuration[alias];
      });

      // Trigger Model.js listeners
      model.configuration = model.configuration;

      // Pass on the transition
      emit(transition);
    }
    return model;
  };
});
