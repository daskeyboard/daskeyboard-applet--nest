const q = require('daskeyboard-applet');
const logger = q.logger;

const queryUrlBase = 'https://developer-api.nest.com/devices/thermostats';

  const hvacStateMap = {
    'heating': {
      label: 'heating',
      color: '#FF8000'
    },
    'cooling': {
      label: 'cooling',
      color: '#00FFFF',
    },
    'off': {
      label: 'off',
      color: '#FFFFFF'
    }
  }

class NestThermostat extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 60000;
  }

  async loadThermostats() {
    logger.info("Loading thermostats...");
    const proxyRequest = new q.Oauth2ProxyRequest({
      apiKey: this.authorization.apiKey,
      uri: queryUrlBase
    });

    return this.oauth2ProxyRequest(proxyRequest).then((json) => {
      return json;
    }).catch((error) => {
      logger.error("Error while getting list of thermostats: " + error);
      throw new Error("Error retrieving list of thermostats.");
    });
  }

  async options() {
    logger.info("Retrieving thermostats...");
    const options = [];
    return this.loadThermostats().then(thermostats => {
      for (let key of Object.keys(thermostats))
        options.push({
          key: key,
          value: thermostats[key].name_long || thermostats[key].name
        });
      return options;
    })
  }

  async readThermostat() {
    if (this.config.deviceId) {
      logger.info("Reading thermostat...");
      const proxyRequest = new q.Oauth2ProxyRequest({
        apiKey: this.authorization.apiKey,
        uri: `${queryUrlBase}/${this.config.deviceId}`
      });

      return this.oauth2ProxyRequest(proxyRequest).then((json) => {
        return json;
      }).catch((error) => {
        logger.error("Error while getting list of thermostats: " + error);
        throw new Error("Error retrieving list of thermostats.");
      });
    }
  }

  async run() {
    const apiKey = this.authorization.apiKey;
    const deviceId = this.config.deviceId;
    const units = this.config.units || 'metric';
    
    if (!apiKey) {
      throw new Error("No apiKey available.");
    }

    if (!deviceId) {
      throw new Error("No deviceId defined.");
    }

    return this.readThermostat().then(thermostat => {
      let color;
      const state = thermostat.hvac_state;

      if (!state) {
        throw new Error("No state defined for: " + hvac_state);
      }

      if (thermostat.is_online) {
        color = '#000000';
      } else {
        color = state.color;
      }

      const ambientTemperature = (units == 'metric') 
        ? `${thermostat.ambient_temperature_c}° C`
        : `${thermostat.ambient_temperature_f}° F`;

      const targetTemperature = (units == 'metric') 
        ? `${thermostat.target_temperature_c}° C`
        : `${thermostat.target_temperature_f}° F`;
        
      return new q.Signal({
        points: [[new q.Point(color)]],
        name: `${thermostat.name} is ${state.label}.`,
        message: `Your ${thermostat.name_long} is ${state.label}.`
          + ` The ambient temperature is ${ambientTemperature}.`
          + ` The target temperature is ${targetTemperature}`
      });
    });
  }
}

const applet = new NestThermostat();

module.exports = {
  NestThermostat: NestThermostat,
}