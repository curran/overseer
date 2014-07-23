
define('configDiff',['_'], function (_) {

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
    _.difference(oldAliases, newAliases).forEach(destroy);

    // Handle updated aliases.
    newAliases.forEach(function (alias) {
      var oldModel = oldConfig[alias] ? oldConfig[alias].model : null,
          newModel = newConfig[alias].model,
          oldPropertys = _.keys(oldModel),
          newPropertys = _.keys(newModel);

      // Handle added aliases.
      if(!oldModel){
        create(alias, newConfig[alias].module);
        newPropertys.forEach(function (property) {
          set(alias, property, newModel[property]);
        });
      } else {

        // Handle added properties.
        _.difference(newPropertys, oldPropertys).forEach(function (property) {
          set(alias, property, newModel[property]);
        });

        // Handle removed properties.
        _.difference(oldPropertys, newPropertys).forEach(function (property) {
          unset(alias, property);
        });

        // Handle updated properties.
        _.intersection(newPropertys, oldPropertys).forEach(function (property) {
          if(!_.isEqual(oldModel[property], newModel[property])){
            set(alias, property, newModel[property]);
          }
        });
      }
    });
    return actions;
  };
});

define('overseer',['_', 'model', 'configDiff'], function(_, Model, configDiff){
  return function Overseer (loadModule) {
    var models = {};
    return {
      setConfig: (function () {
        var oldConfig = {};
        return function (newConfig) {
          var diff = configDiff(oldConfig, newConfig);
          console.log(diff);
        };
      }())
    };
  };
});
