const assert = require('assert');
const {
  NestThermostat
} = require('../index.js');
const auth = require('./auth.json');

describe('NestThermostat', function () {
  describe('#constructor()', function () {
    it('should return a valid instance', function () {
      let test = new NestThermostat();
      assert.ok(test);
    })
  });

  describe('#loadThermostats()', function () {
    it('should load thermostats', async function () {
      return buildApp()
        .then(app => {
          return app.loadThermostats();
        })
        .then(thermostats => {
          console.log("#########################");
          console.log(thermostats);
          console.log("#########################");

          assert.ok(thermostats);
          assert(Object.keys(thermostats).length > 0);
          const thermostat = thermostats[Object.keys(thermostats)[0]];
          assert.ok(thermostat);
          assert.ok(thermostat.where_name);
        })
        .catch(error => {
          assert.fail(error);
        })
    });
  });

  describe('#options()', function () {
    it('should load options', async function () {
      return buildApp()
        .then(app => {
          return app.options()
        })
        .then(options => {
          assert.ok(options, "Options was falsy.");
          assert(options.length > 0);
          assert(options[0].key);
          assert(options[0].value);
        });
    });
  });

  describe('#readThermostat()', function () {
    it('should read a thermostat', async function () {
      return buildApp(configWithDevice).then(async (app) => {
        return app.readThermostat().then(thermostat => {
          assert(thermostat);
          assert(thermostat.ambient_temperature_c);
          assert(thermostat.ambient_temperature_f);
          assert(thermostat.target_temperature_c);
          assert(thermostat.target_temperature_f);
          assert(thermostat.is_online);
          assert(thermostat.hvac_state);
        });
      });
    })
  });

  describe('#run()', function () {
    it('should produce a signal', async function () {
      return buildApp(configWithDevice).then(async (app) => {
        return app.run().then(signal => {
          console.log(JSON.stringify(signal));
          assert(signal);
          assert(signal.name);
          assert(signal.message.includes('ambient temperature'));
          assert(signal.message.includes('target temperature'));
          assert(!signal.message.includes('undefined'));
        });
      });
    });
  });
});

const baseConfig = {
  extensionId: 777,
  geometry: {
    width: 1,
    height: 1,
  },
  authorization: auth,
  applet: {}
};

const configWithDevice = {
  ...baseConfig,
  applet: {
    user: {
      deviceId: 'dgMl-pxI_b8MjNbHQmyx280QGxSBAsDF',
      units: 'metric'
    }
  }
}
async function buildApp(config) {
  const app = new NestThermostat();
  return app.processConfig(config || baseConfig).then(() => {
    return app;
  });
}