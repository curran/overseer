define(['_'], function (_) {
  // Computes the difference between two configuration objects,
  // returns the difference as a sequence of actions to be executed.
  return function configDiff(oldConfig, newConfig){
    var actions = [],
        newAliases = _.keys(newConfig),
        oldAliases = _.keys(oldConfig),
        create = _.partial(addAction, 'create');

    function addAction(method, alias){
      actions.push({
        method: method,
        alias: alias
      });
    }

    // Handle removed aliases.
    // TODO test this
    _.difference(oldAliases, newAliases).forEach(destroy);

    newAliases.forEach(function (alias) {
      var oldOptions = oldConfig[alias],
          newOptions = newConfig[alias],
          oldKeys = _.keys(oldOptions),
          newKeys = _.keys(newOptions);

      // Handle added aliases.
      // TODO test this
      if(!oldOptions){
        create(alias);
        newKeys.forEach(function (property) {
          set(alias, property, newOptions[property]);
        });
      } else {

        // Handle added properties.
        // TODO test this
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
    // TODO clean up this code
    function destroy(alias) {
      actions.push({
        method: 'destroy',
        alias: alias
      });
    }
    function set(alias, property, value) {
      actions.push({
        method: 'set',
        alias: alias,
        property: property,
        value: value
      });
    }
    function unset(alias, property, value) {
      actions.push({
        method: 'unset',
        alias: alias,
        property: property
      });
    }
    return actions;
  };
});
