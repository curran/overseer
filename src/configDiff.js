define(['_'], function (_) {

  // Computes the difference between two configuration objects,
  // returns the difference as a sequence of actions to be executed.
  return function configDiff(oldConfig, newConfig){
    var actions = [],
        newAliases = _.keys(newConfig),
        oldAliases = _.keys(oldConfig);

    function create(alias, module){
      actions.push({ method:'create', alias: alias, module: module });
    }

    function destroy(alias){
      actions.push({ method:'destroy', alias: alias });
    }

    function set(alias, property, value){
      actions.push({ method:'set', alias: alias, property: property, value: value });
    }

    function unset(alias, property){
      actions.push({ method:'unset', alias: alias, property: property});
    }

    // Handle removed aliases.
    // TODO test this
    _.difference(oldAliases, newAliases).forEach(destroy);

    // Handle updated aliases.
    newAliases.forEach(function (alias) {
      // TODO use consistent naming:
      //  - choose between "model" and "options"
      //  - choose between "key" and "peoperty"
      var oldOptions = oldConfig[alias] ? oldConfig[alias].model : null,
          newOptions = newConfig[alias].model,
          oldKeys = _.keys(oldOptions),
          newKeys = _.keys(newOptions);

      // Handle added aliases.
      if(!oldOptions){
        create(alias, newConfig[alias].module);
        newKeys.forEach(function (property) {
          set(alias, property, newOptions[property]);
        });
      } else {

        // Handle added properties.
        _.difference(newKeys, oldKeys).forEach(function (property) {
          set(alias, property, newOptions[property]);
        });

        // Handle removed properties.
        // TODO test this
        _.difference(oldKeys, newKeys).forEach(function (property) {
          // TODO use only set, track defaults using model.publicProperties
          unset(alias, property);
        });

        // Handle updated properties.
        // TODO test this
        _.intersection(newKeys, oldKeys).forEach(function (property) {
          if(!_.isEqual(oldOptions[property], newOptions[property])){
            set(alias, property, newOptions[property]);
          }
        });
      }
    });
    return actions;
  };
});
