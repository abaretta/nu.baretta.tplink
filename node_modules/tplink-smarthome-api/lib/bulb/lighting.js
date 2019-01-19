/* eslint camelcase: ["off"] */
'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const isEqual = require('lodash.isequal');

let _lightState = {};
/**
 * Lighting
 */

class Lighting {
  constructor(device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
    this._lastState = {
      powerOn: null,
      lightState: null
    };
  }
  /**
   * Returns cached results from last retrieval of `lightingservice.get_light_state`.
   * @return {Object}
   */


  get lightState() {
    return _lightState;
  }
  /**
   * @private
   */


  set lightState(lightState) {
    _lightState = lightState;
    this.emitEvents();
  }
  /**
   * Bulb was turned on (`lightstate.on_off`).
   * @event Bulb#lightstate-on
   * @property {Object} value lightstate
   */

  /**
   * Bulb was turned off (`lightstate.on_off`).
   * @event Bulb#lightstate-off
   * @property {Object} value lightstate
   */

  /**
   * Bulb's lightstate was changed.
   * @event Bulb#lightstate-change
   * @property {Object} value lightstate
   */

  /**
   * Bulb's lightstate state was updated from device. Fired regardless if status was changed.
   * @event Bulb#lightstate-update
   * @property {Object} value lightstate
   */

  /**
   * @private
   */


  emitEvents() {
    if (!_lightState) return;
    const powerOn = _lightState.on_off === 1;

    if (this._lastState.powerOn !== powerOn) {
      this._lastState.powerOn = powerOn;

      if (powerOn) {
        this.device.emit('lightstate-on', _lightState);
      } else {
        this.device.emit('lightstate-off', _lightState);
      }
    }

    if (!isEqual(this._lastState.lightState, _lightState)) {
      this._lastState.lightState = _lightState;
      this.device.emit('lightstate-change', _lightState);
    }

    this.device.emit('lightstate-update', _lightState);
  }
  /**
   * Get Bulb light state.
   *
   * Requests `lightingservice.get_light_state`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getLightState(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.lightState = yield _this.device.sendCommand({
        [_this.apiModuleName]: {
          get_light_state: {}
        }
      }, null, sendOptions);
      return _this.lightState;
    })();
  }
  /**
   * Sets Bulb light state (on/off, brightness, color, etc).
   *
   * Sends `lightingservice.transition_light_state` command.
   * @param  {Object}       options
   * @param  {number}      [options.transition_period] (ms)
   * @param  {boolean}     [options.on_off]
   * @param  {string}      [options.mode]
   * @param  {number}      [options.hue]               0-360
   * @param  {number}      [options.saturation]        0-100
   * @param  {number}      [options.brightness]        0-100
   * @param  {number}      [options.color_temp]        Kelvin (LB120:2700-6500 LB130:2500-9000)
   * @param  {boolean}     [options.ignore_default=true]
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */


  setLightState({
    transition_period,
    on_off,
    mode,
    hue,
    saturation,
    brightness,
    color_temp,
    ignore_default = true
  }, sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const state = {};
      if (ignore_default !== undefined) state.ignore_default = ignore_default ? 1 : 0;
      if (transition_period !== undefined) state.transition_period = transition_period;
      if (on_off !== undefined) state.on_off = on_off ? 1 : 0;
      if (mode !== undefined) state.mode = mode;
      if (hue !== undefined) state.hue = hue;
      if (saturation !== undefined) state.saturation = saturation;
      if (brightness !== undefined) state.brightness = brightness;
      if (color_temp !== undefined) state.color_temp = color_temp;
      _this2.lightState = yield _this2.device.sendCommand({
        [_this2.apiModuleName]: {
          transition_light_state: state
        }
      }, null, sendOptions);
      return true;
    })();
  }

}

module.exports = Lighting;