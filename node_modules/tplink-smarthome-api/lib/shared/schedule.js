/* eslint camelcase: ["off"] */
'use strict';
/**
 * Schedule
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Schedule {
  constructor(device, apiModuleName, childId = null) {
    this.device = device;
    this.apiModuleName = apiModuleName;
    this.childId = childId;
  }
  /**
   * Gets Next Schedule Rule Action.
   *
   * Requests `schedule.get_next_action`. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getNextAction(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.nextaction = _this.device.sendCommand({
        [_this.apiModuleName]: {
          get_next_action: {}
        }
      }, _this.childId, sendOptions);
      return _this.nextaction;
    })();
  }
  /**
   * Gets Schedule Rules.
   *
   * Requests `schedule.get_rules`. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getRules(sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.device.sendCommand({
        [_this2.apiModuleName]: {
          get_rules: {}
        }
      }, _this2.childId, sendOptions);
    })();
  }
  /**
   * Gets Schedule Rule.
   *
   * Requests `schedule.get_rules` and return rule matching Id. Supports childId.
   * @param  {string}       id
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response of rule
   */


  getRule(id, sendOptions) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const rules = yield _this3.getRules(sendOptions);
      const rule = rules.rule_list.find(r => r.id === id);

      if (rule) {
        rule.err_code = rules.err_code;
      }

      return rule;
    })();
  }
  /**
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id. Supports childId.
   * @param  {Object}       rule
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  addRule(rule, sendOptions) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      return _this4.device.sendCommand({
        [_this4.apiModuleName]: {
          add_rule: rule
        }
      }, _this4.childId, sendOptions);
    })();
  }
  /**
   * Edits Schedule Rule.
   *
   * Sends `schedule.edit_rule` command. Supports childId.
   * @param  {Object}       rule
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  editRule(rule, sendOptions) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return _this5.device.sendCommand({
        [_this5.apiModuleName]: {
          edit_rule: rule
        }
      }, _this5.childId, sendOptions);
    })();
  }
  /**
   * Deletes All Schedule Rules.
   *
   * Sends `schedule.delete_all_rules` command. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  deleteAllRules(sendOptions) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      return _this6.device.sendCommand({
        [_this6.apiModuleName]: {
          delete_all_rules: {}
        }
      }, _this6.childId, sendOptions);
    })();
  }
  /**
   * Deletes Schedule Rule.
   *
   * Sends `schedule.delete_rule` command. Supports childId.
   * @param  {string}       id
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  deleteRule(id, sendOptions) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      return _this7.device.sendCommand({
        [_this7.apiModuleName]: {
          delete_rule: {
            id
          }
        }
      }, _this7.childId, sendOptions);
    })();
  }
  /**
   * Enables or Disables Schedule Rules.
   *
   * Sends `schedule.set_overall_enable` command. Supports childId.
   * @param  {boolean}     enable
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  setOverallEnable(enable, sendOptions) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      return _this8.device.sendCommand({
        [_this8.apiModuleName]: {
          set_overall_enable: {
            enable: enable ? 1 : 0
          }
        }
      }, _this8.childId, sendOptions);
    })();
  }
  /**
   * Get Daily Usage Statisics.
   *
   * Sends `schedule.get_daystat` command. Supports childId.
   * @param  {number}       year
   * @param  {number}       month
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getDayStats(year, month, sendOptions) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      return _this9.device.sendCommand({
        [_this9.apiModuleName]: {
          get_daystat: {
            year,
            month
          }
        }
      }, _this9.childId, sendOptions);
    })();
  }
  /**
   * Get Monthly Usage Statisics.
   *
   * Sends `schedule.get_monthstat` command. Supports childId.
   * @param  {number}       year
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getMonthStats(year, sendOptions) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      return _this10.device.sendCommand({
        [_this10.apiModuleName]: {
          get_monthstat: {
            year
          }
        }
      }, _this10.childId, sendOptions);
    })();
  }
  /**
   * Erase Usage Statistics.
   *
   * Sends `schedule.erase_runtime_stat` command. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  eraseStats(sendOptions) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      return _this11.device.sendCommand({
        [_this11.apiModuleName]: {
          erase_runtime_stat: {}
        }
      }, _this11.childId, sendOptions);
    })();
  }

}

module.exports = Schedule;