// An example entry point for the application.
require(['myModule', '_', 'model'], function (myModule, _, Model) {
  var model = Model();
  model.set('x', 50);
  console.log(model.get('x'));
  console.log(myModule.speak());
  _.each([1, 2, 3], _.bind(console.log, console));
});
