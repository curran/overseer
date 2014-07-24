
// Convenience methods for generation action objects.
// Curran Kelleher July 2014
define('action',[], function () {
  return {
    create: function (alias, module) {
      return { method: "create", alias: alias, module: module };
    },
    destroy: function (alias) {
      return { method: "destroy", alias: alias };
    },
    set: function (alias, property, value) {
      return { method: "set", alias: alias, property: property, value: value };
    },
    unset: function (alias, property) {
      return { method: "unset", alias: alias, property: property};
    },
    toString: function (action) {
      return action.method + "(" + [
        action.alias,
        action.property ? ", " + action.property : "",
        action.value ? ", " + action.value : "",
        action.module ? ", " + action.module : ""
      ].join("") + ")";
    }
  };
});

define('configDiff',["_", "action"], function (_, Action) {

  // Computes the difference between two configuration objects,
  // returns the difference as a sequence of actions to be executed.
  return function configDiff(oldConfig, newConfig){
    var actions = [],
        newAliases = _.keys(newConfig),
        oldAliases = _.keys(oldConfig);

    // Handle removed aliases.
    _.difference(oldAliases, newAliases).forEach(function (alias) {
      actions.push(Action.destroy(alias));
    });

    // Handle updated aliases.
    newAliases.forEach(function (alias) {
      var oldModel = oldConfig[alias] ? oldConfig[alias].model : null,
          newModel = newConfig[alias].model,
          oldProperties = _.keys(oldModel),
          newProperties = _.keys(newModel);

      // Handle added aliases.
      if(!oldModel){
        actions.push(Action.create(alias, newConfig[alias].module));
        newProperties.forEach(function (property) {
          actions.push(Action.set(alias, property, newModel[property]));
        });
      } else {

        // Handle added properties.
        _.difference(newProperties, oldProperties).forEach(function (property) {
          actions.push(Action.set(alias, property, newModel[property]));
        });

        // Handle removed properties.
        _.difference(oldProperties, newProperties).forEach(function (property) {
          actions.push(Action.unset(alias, property));
        });

        // Handle updated properties.
        _.intersection(newProperties, oldProperties).forEach(function (property) {
          if(!_.isEqual(oldModel[property], newModel[property])){
            actions.push(Action.set(alias, property, newModel[property]));
          }
        });
      }
    });
    return actions;
  };
});

define('overseer',["model", "configDiff", "action"], function(Model, configDiff, Action){
  return function Overseer (loadModule, emitAction) {

    // The returned public API object.
    var overseer = {
          setConfig: setConfig,
          getModel: getModel
        },

        // The configuration object, updated when actions execute.
        //
        //  * Keys are aliases
        //  * Values are objects with:
        //    * module - The name of the module used for constructing the model
        //    * model - A plain JavaScript object containing the serialized model state,
        //      always updated synchronously as actions are executed.
        config = {},

        // The runtime data structure mirroring the configuration with live models.
        //
        //  * Keys are aliases
        //  * Values are objects with:
        //    * module - the name of the module used for constructing the model
        //    * model - the model constructed by the loaded module. May be set asynchronously
        //      after actions are executed due to dynamic module loading.
        runtime = {};

        // These methods unpack actions and invoke the corresponding functions.
        methods = {
          "create": function (action) { create(action.alias, action.module); },
          "destroy": function (action) { destroy(action.alias); },
          "set": function (action) { set(action.alias, action.property, action.value); },
          "unset": function (action) { unset(action.alias, action.property); }
        };

    // Sets the configuration.
    function setConfig(newConfig) {
      configDiff(config, newConfig).forEach(function (action) {
        methods[action.method](action);
        if(emitAction) {
          emitAction(action);
        }
      });
    }

    // Gets a model by alias. May be asynchronous
    // if the model has not yet been constructed.
    function getModel(alias, callback) {
      var model = runtime[alias] ? runtime[alias].model : null;

      // If the model is already loaded,
      if(model){
        // call the callback immediately,
        callback(model);
      } else {
        // otherwise, wait until the model has loaded by polling.
        setTimeout(function () {
          getModel(alias, callback);
        }, 0);
      }
    }

    function create(alias, module){
      config[alias] = { module: module, model: {} };

      // The module must be stored in the runtime for later comparison with new configurations.
      runtime[alias] = { module: module };

      loadModule(module, function (constructor) {
        var model = constructor(overseer);
        runtime[alias].model = model;

        // Broadcast changes in configurable properties.
        if(emitAction) {
          Object.keys(model.defaults).forEach(function (property) {
            model.when(property, function (value) {
              var configuredValue = config[alias].model[property] || model.defaults[property];
              if(value !== configuredValue) {
                emitAction(Action.set(alias, property, value));
              }
            });
          });
        }
      });
    }

    function destroy(alias){
      delete config[alias];

      getModel(alias, function (model) {
        model.destroy();
        delete runtime[alias];
      });
    }

    function set(alias, property, value){
      config[alias].model[property] = value;

      getModel(alias, function (model) {
        model[property] = value;
      });
    }

    function unset(alias, property){
      delete config[alias].model[property];

      getModel(alias, function (model) {
        model[property] = model.defaults[property];
      });
    }

    return overseer;
  };
});
