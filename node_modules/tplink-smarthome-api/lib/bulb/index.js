'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const Device = require('../device');

const Cloud = require('../shared/cloud');

const Emeter = require('../shared/emeter');

const Lighting = require('./lighting');

const Schedule = require('./schedule');

const Time = require('../shared/time');
/**
 * Bulb Device.
 *
 * TP-Link models: LB100, LB110, LB120, LB130.
 * @extends Device
 * @extends EventEmitter
 * @emits  Bulb#lightstate-on
 * @emits  Bulb#lightstate-off
 * @emits  Bulb#lightstate-change
 * @emits  Bulb#lightstate-update
 * @emits  Bulb#emeter-realtime-update
 */


class Bulb extends Device {
  /**
   * Created by {@link Client} - Do not instantiate directly.
   *
   * See [Device constructor]{@link Device} for common options.
   * @see Device
   * @param  {Object} options
   */
  constructor({
    client,
    sysInfo,
    host,
    port,
    logger,
    defaultSendOptions
  }) {
    super({
      client,
      host,
      port,
      logger,
      defaultSendOptions
    }); // sysInfo omitted

    this.supportsEmeter = true;
    this.apiModuleNamespace = {
      'system': 'smartlife.iot.common.system',
      'cloud': 'smartlife.iot.common.cloud',
      'schedule': 'smartlife.iot.common.schedule',
      'timesetting': 'smartlife.iot.common.timesetting',
      'emeter': 'smartlife.iot.common.emeter',
      'netif': 'netif',
      'lightingservice': 'smartlife.iot.smartbulb.lightingservice'
    };
    /**
     * @borrows Cloud#getInfo as Bulb.cloud#getInfo
     * @borrows Cloud#bind as Bulb.cloud#bind
     * @borrows Cloud#unbind as Bulb.cloud#unbind
     * @borrows Cloud#getFirmwareList as Bulb.cloud#getFirmwareList
     * @borrows Cloud#setServerUrl as Bulb.cloud#setServerUrl
     */

    this.cloud = new Cloud(this, 'smartlife.iot.common.cloud');
    /**
     * Bulb's Energy Monitoring Details were updated from device. Fired regardless if status was changed.
     * @event Bulb#emeter-realtime-update
     * @property {Object} value emeterRealtime
     */

    /**
     * @borrows Emeter#realtime as Bulb.emeter#realtime
     * @borrows Emeter#getRealtime as Bulb.emeter#getRealtime
     * @borrows Emeter#getDayStats as Bulb.emeter#getDayStats
     * @borrows Emeter#getMonthStats as Bulb.emeter#getMonthStats
     * @borrows Emeter#eraseStats as Bulb.emeter#eraseStats
     */

    this.emeter = new Emeter(this, 'smartlife.iot.common.emeter');
    /**
     * @borrows Lighting#lightState as Bulb.lighting#lightState
     * @borrows Lighting#getLightState as Bulb.lighting#getLightState
     * @borrows Lighting#setLightState as Bulb.lighting#setLightState
     */

    this.lighting = new Lighting(this, 'smartlife.iot.smartbulb.lightingservice');
    /**
     * @borrows Schedule#getNextAction as Bulb.schedule#getNextAction
     * @borrows Schedule#getRules as Bulb.schedule#getRules
     * @borrows Schedule#getRule as Bulb.schedule#getRule
     * @borrows BulbSchedule#addRule as Bulb.schedule#addRule
     * @borrows BulbSchedule#editRule as Bulb.schedule#editRule
     * @borrows Schedule#deleteAllRules as Bulb.schedule#deleteAllRules
     * @borrows Schedule#deleteRule as Bulb.schedule#deleteRule
     * @borrows Schedule#setOverallEnable as Bulb.schedule#setOverallEnable
     * @borrows Schedule#getDayStats as Bulb.schedule#getDayStats
     * @borrows Schedule#getMonthStats as Bulb.schedule#getMonthStats
     * @borrows Schedule#eraseStats as Bulb.schedule#eraseStats
     */

    this.schedule = new Schedule(this, 'smartlife.iot.common.schedule');
    /**
     * @borrows Time#getTime as Bulb.time#getTime
     * @borrows Time#getTimezone as Bulb.time#getTimezone
     */

    this.time = new Time(this, 'smartlife.iot.common.timesetting');
    this.lastState = Object.assign(this.lastState, {
      powerOn: null,
      inUse: null
    });

    if (sysInfo) {
      this.sysInfo = sysInfo;
    }
  }
  /**
   * Returns cached results from last retrieval of `system.sys_info`.
   * @return {Object} system.sys_info
   */


  get sysInfo() {
    return super.sysInfo;
  }
  /**
   * @private
   */


  set sysInfo(sysInfo) {
    super.sysInfo = sysInfo; // TODO / XXX Verify that sysInfo.light_state can be set here to trigger events

    this.lighting.lightState = sysInfo.light_state;
  }
  /**
   * Cached value of `sys_info.is_dimmable === 1`
   * @return {boolean}
   */


  get supportsBrightness() {
    return this.sysInfo.is_dimmable === 1;
  }
  /**
   * Cached value of `sys_info.is_color === 1`
   * @return {boolean}
   */


  get supportsColor() {
    return this.sysInfo.is_color === 1;
  }
  /**
   * Cached value of `sys_info.is_variable_color_temp === 1`
   * @return {boolean}
   */


  get supportsColorTemperature() {
    return this.sysInfo.is_variable_color_temp === 1;
  }
  /**
   * Returns array with min and max supported color temperatures
   * @return {?{min: Number, max: Number}} range
   */


  get getColorTemperatureRange() {
    if (!this.supportsColorTemperature) return;

    switch (true) {
      case /LB130/i.test(this.sysInfo.model):
        return {
          min: 2500,
          max: 9000
        };

      default:
        return {
          min: 2700,
          max: 6500
        };
    }
  }
  /**
   * Requests common Bulb status details in a single request.
   * - `system.get_sysinfo`
   * - `cloud.get_sysinfo`
   * - `emeter.get_realtime`
   * - `schedule.get_next_action`
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, Error>} parsed JSON response
   */


  getInfo(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      // TODO switch to sendCommand, but need to handle error for devices that don't support emeter
      const data = yield _this.send(`{"${_this.apiModuleNamespace.emeter}":{"get_realtime":{}},"${_this.apiModuleNamespace.lightingservice}":{"get_light_state":{}},"${_this.apiModuleNamespace.schedule}":{"get_next_action":{}},"system":{"get_sysinfo":{}},"${_this.apiModuleNamespace.cloud}":{"get_info":{}}}`, sendOptions);
      _this.sysInfo = data.system.get_sysinfo;
      _this.cloud.info = data[_this.apiModuleNamespace.cloud].get_info;
      _this.emeter.realtime = data[_this.apiModuleNamespace.emeter].get_realtime;
      _this.schedule.nextAction = data[_this.apiModuleNamespace.schedule].get_next_action;
      _this.lighting.lightState = data[_this.apiModuleNamespace.lightingservice].get_light_state;
      return {
        sysInfo: _this.sysInfo,
        cloud: {
          info: _this.cloud.info
        },
        emeter: {
          realtime: _this.emeter.realtime
        },
        schedule: {
          nextAction: _this.schedule.nextAction
        },
        lighting: {
          lightState: _this.lighting.lightState
        }
      };
    })();
  }
  /**
   * Gets on/off state of Bulb.
   *
   * Requests `lightingservice.get_light_state` and returns true if `on_off === 1`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */


  getPowerState(sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const lightState = yield _this2.lighting.getLightState(sendOptions);
      return lightState.on_off === 1;
    })();
  }
  /**
   * Sets on/off state of Bulb.
   *
   * Sends `lightingservice.transition_light_state` command with on_off `value`.
   * @param  {boolean}     value          true: on, false: off
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */


  setPowerState(value, sendOptions) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return _this3.lighting.setLightState({
        on_off: value ? 1 : 0
      }, sendOptions);
    })();
  }
  /**
   * Toggles state of Bulb.
   *
   * Requests `lightingservice.get_light_state` sets the power state to the opposite of `on_off === 1` and returns the new power state.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */


  togglePowerState(sendOptions) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const powerState = yield _this4.getPowerState(sendOptions);
      yield _this4.setPowerState(!powerState, sendOptions);
      return !powerState;
    })();
  }

}

module.exports = Bulb;