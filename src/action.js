// Convenience methods for generation action objects.
// Curran Kelleher July 2014
define([], function () {
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
    }
  };
});
