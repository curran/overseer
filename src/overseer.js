define(['_', 'model', 'configDiff'], function(_, Model, configDiff){
  return function Overseer (loadModule) {
    var models = {};
    return {
      setConfig: (function () {
        var oldConfig = {};
        return function (newConfig) {
          var diff = configDiff(oldConfig, newConfig);
          console.log(diff);
        }
      }())
    };
  };
});
