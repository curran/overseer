define(["_"], function (_) {

  // Computes the difference between two configuration objects,
  // returns the difference as a sequence of actions to be executed.
  return function configDiff(oldConfig, newConfig){
    var actions = [],
        newAliases = _.keys(newConfig),
        oldAliases = _.keys(oldConfig);

    function create(alias, module){
      actions.push({ method: "create", alias: alias, module: module });
    }

    function destroy(alias){
      actions.push({ method: "destroy", alias: alias });
    }

    function set(alias, property, value){
      actions.push({ method: "set", alias: alias, property: property, value: value });
    }

    function unset(alias, property){
      actions.push({ method: "unset", alias: alias, property: property});
    }

    // Handle removed aliases.
    _.difference(oldAliases, newAliases).forEach(destroy);

    // Handle updated aliases.
    newAliases.forEach(function (alias) {
      var oldModel = oldConfig[alias] ? oldConfig[alias].model : null,
          newModel = newConfig[alias].model,
          oldProperties = _.keys(oldModel),
          newProperties = _.keys(newModel);

      // Handle added aliases.
      if(!oldModel){
        create(alias, newConfig[alias].module);
        newProperties.forEach(function (property) {
          set(alias, property, newModel[property]);
        });
      } else {

        // Handle added properties.
        _.difference(newProperties, oldProperties).forEach(function (property) {
          set(alias, property, newModel[property]);
        });

        // Handle removed properties.
        _.difference(oldProperties, newProperties).forEach(function (property) {
          unset(alias, property);
        });

        // Handle updated properties.
        _.intersection(newProperties, oldProperties).forEach(function (property) {
          if(!_.isEqual(oldModel[property], newModel[property])){
            set(alias, property, newModel[property]);
          }
        });
      }
    });
    return actions;
  };
});
