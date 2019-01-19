'use strict';
/**
 * Timer
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Timer {
  constructor(device, apiModuleName, childId = null) {
    this.device = device;
    this.apiModuleName = apiModuleName;
    this.childId = childId;
  }
  /**
   * Get Countdown Timer Rule (only one allowed).
   *
   * Requests `count_down.get_rules`. Supports childId.
   * @param  {string[]|string|number[]|number} [childIds] for multi-outlet devices, which outlet(s) to target
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getRules(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this.device.sendCommand({
        [_this.apiModuleName]: {
          get_rules: {}
        }
      }, _this.childId, sendOptions);
    })();
  }
  /**
   * Add Countdown Timer Rule (only one allowed).
   *
   * Sends count_down.add_rule command. Supports childId.
   * @param  {Object}       options
   * @param  {number}       options.delay                delay in seconds
   * @param  {boolean}      options.powerState           turn on or off device
   * @param  {string}      [options.name='timer']        rule name
   * @param  {boolean}     [options.enable=true]         rule enabled
   * @param  {boolean}     [options.deleteExisting=true] send `delete_all_rules` command before adding
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  addRule({
    delay,
    powerState,
    name = 'timer',
    enable = true,
    deleteExisting = true
  }, sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (deleteExisting) yield _this2.deleteAllRules(sendOptions);
      return _this2.device.sendCommand({
        [_this2.apiModuleName]: {
          add_rule: {
            enable: enable ? 1 : 0,
            delay,
            act: powerState ? 1 : 0,
            name
          }
        }
      }, _this2.childId, sendOptions);
    })();
  }
  /**
   * Edit Countdown Timer Rule (only one allowed).
   *
   * Sends count_down.edit_rule command. Supports childId.
   * @param  {Object}       options
   * @param  {string}       options.id               rule id
   * @param  {number}       options.delay            delay in seconds
   * @param  {number}       options.powerState       turn on or off device
   * @param  {string}      [options.name='timer']    rule name
   * @param  {Boolean}     [options.enable=true]     rule enabled
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  editRule({
    id,
    delay,
    powerState,
    name = 'timer',
    enable = true
  }, sendOptions) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return _this3.device.sendCommand({
        [_this3.apiModuleName]: {
          edit_rule: {
            id,
            enable: enable ? 1 : 0,
            delay,
            act: powerState ? 1 : 0,
            name
          }
        }
      }, _this3.childId, sendOptions);
    })();
  }
  /**
   * Delete Countdown Timer Rule (only one allowed).
   *
   * Sends count_down.delete_all_rules command. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  deleteAllRules(sendOptions) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      return _this4.device.sendCommand({
        [_this4.apiModuleName]: {
          delete_all_rules: {}
        }
      }, _this4.childId, sendOptions);
    })();
  }

}

module.exports = Timer;