
define('overseer',['_', 'model'], function(_, Model){
  return function Overseer (loadModule) {
    var models = {};
    return {
      setConfig: (function () {
        var oldConfig = {};
        return function (newConfig) {
          console.log(newConfig);
          var diff = configDiff(oldConfig, newConfig);
        }
      }())
    };
  };

  // Computes the difference between two configuration objects,
  // returns the difference as a sequence of actions to be executed.
  function configDiff(oldConfig, newConfig){
    var actions = [],
        newAliases = _.keys(newConfig),
        oldAliases = _.keys(oldConfig);

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
    function create(alias) {
      actions.push({
        method: 'create',
        alias: alias
      });
    }
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
  }
});
