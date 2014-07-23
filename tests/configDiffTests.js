var requirejs = require('requirejs'),
    expect = require('chai').expect;

requirejs.config(require('./requireConfig.js'));

describe('configDiff', function() {
  var configDiff;

  // Converts an action into a string
  // for convenient testing.
  function str(action) {
    return action.method + '(' + [
      action.alias,
      action.property ? ', ' + action.property : '',
      action.value ? ', ' + action.value : '',
      action.module ? ', ' + action.module : ''
    ].join('') + ')';
  }

  // A function that calls configDiff
  // and maps the returned actions to strings.
  function diff(oldConfig, newConfig){
    return configDiff(oldConfig, newConfig).map(str);
  }

  // A convenience function that writes part of the unit test,
  // for use only while developing tests.
  function writeTest(actions){
    actions.forEach(function (action) {
      console.log("expect(actions).to.contain('" + action + "');");
    });
  }

  it('should load AMD module', function(done) {
    requirejs(['configDiff'], function (_configDiff) {
      configDiff = _configDiff;
      done();
    });
  });

  it('should handle one added alias', function() {
    var actions = diff({}, {
      myFoo: {
        module: 'foo',
        model: {
          x: 50,
          y: 40
        }
      }
    });
    expect(actions).to.contain('set(myFoo, x, 50)');
    expect(actions).to.contain('set(myFoo, y, 40)');
    expect(actions.length).to.equal(3);
  });

  it('should handle one added property', function() {
    var actions = diff({
      myFoo: {
        module: 'foo',
        model: {
          y: 40
        }
      }
    }, {
      myFoo: {
        module: 'foo',
        model: {
          x: 50,
          y: 40
        }
      }
    });
    expect(actions).to.contain('set(myFoo, x, 50)');
    expect(actions.length).to.equal(1);
  });

  it('should handle two added properties', function() {
    var actions = diff({
      myFoo: {
        module: 'foo',
        model: {
          y: 40
        }
      }
    }, {
      myFoo: {
        module: 'foo',
        model: {
          x: 50,
          y: 40,
          z: 70
        }
      }
    });
    expect(actions).to.contain('set(myFoo, x, 50)');
    expect(actions).to.contain('set(myFoo, z, 70)');
    expect(actions.length).to.equal(2);
  });
});
