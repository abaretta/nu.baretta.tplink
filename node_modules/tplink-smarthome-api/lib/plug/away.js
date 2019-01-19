'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('../utils'),
      createScheduleRule = _require.createScheduleRule;
/**
 * Away
 */


class Away {
  constructor(device, apiModuleName, childId = null) {
    this.device = device;
    this.apiModuleName = apiModuleName;
    this.childId = childId;
  }
  /**
   * Gets Away Rules.
   *
   * Requests `anti_theft.get_rules`. Support childId.
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
   * Gets Away Rule.
   *
   * Requests `anti_theft.get_rules` and return rule matching Id. Support childId.
   * @param  {string}       id
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response of rule
   */


  getRule(id, sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const rules = yield _this2.getRules(sendOptions);
      const rule = rules.rule_list.find(r => r.id === id);

      if (rule) {
        rule.err_code = rules.err_code;
      }

      return rule;
    })();
  }
  /**
   * Adds Away Rule.
   *
   * Sends `anti_theft.add_rule` command and returns rule id. Support childId.
   * @param  {Object}        options
   * @param  {(Date|number)} options.start   Date or number of minutes
   * @param  {(Date|number)} options.end     Date or number of minutes (only time component of date is used)
   * @param  {number[]}      options.daysOfWeek  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {number}       [options.frequency=5]
   * @param  {string}       [options.name]
   * @param  {boolean}      [options.enable=true]
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  addRule({
    start,
    end,
    daysOfWeek,
    frequency = 5,
    name = '',
    enable = true
  }, sendOptions) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const rule = Object.assign({
        frequency,
        name,
        enable: enable ? 1 : 0
      }, createScheduleRule({
        start,
        end,
        daysOfWeek
      }));
      return _this3.device.sendCommand({
        [_this3.apiModuleName]: {
          add_rule: rule
        }
      }, _this3.childId, sendOptions);
    })();
  }
  /**
   * Edits Away rule.
   *
   * Sends `anti_theft.edit_rule` command and returns rule id. Support childId.
   * @param  {Object}        options
   * @param  {string}        options.id
   * @param  {(Date|number)} options.start   Date or number of minutes
   * @param  {(Date|number)} options.end     Date or number of minutes (only time component of date is used)
   * @param  {number[]}      options.daysOfWeek  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {number}       [options.frequency=5]
   * @param  {string}       [options.name]
   * @param  {boolean}      [options.enable=true]
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  editRule({
    id,
    start,
    end,
    daysOfWeek,
    frequency = 5,
    name = '',
    enable = true
  }, sendOptions) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const rule = Object.assign({
        id,
        frequency,
        name,
        enable: enable ? 1 : 0
      }, createScheduleRule({
        start,
        end,
        daysOfWeek
      }));
      return _this4.device.sendCommand({
        [_this4.apiModuleName]: {
          edit_rule: rule
        }
      }, _this4.childId, sendOptions);
    })();
  }
  /**
   * Deletes All Away Rules.
   *
   * Sends `anti_theft.delete_all_rules` command. Support childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  deleteAllRules(sendOptions) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return _this5.device.sendCommand({
        [_this5.apiModuleName]: {
          delete_all_rules: {}
        }
      }, _this5.childId, sendOptions);
    })();
  }
  /**
   * Deletes Away Rule.
   *
   * Sends `anti_theft.delete_rule` command. Support childId.
   * @param  {string}       id
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  deleteRule(id, sendOptions) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      return _this6.device.sendCommand({
        [_this6.apiModuleName]: {
          delete_rule: {
            id
          }
        }
      }, _this6.childId, sendOptions);
    })();
  }
  /**
   * Enables or Disables Away Rules.
   *
   * Sends `anti_theft.set_overall_enable` command. Support childId.
   * @param  {boolean}      enable
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  setOverallEnable(enable, sendOptions) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      return _this7.device.sendCommand({
        [_this7.apiModuleName]: {
          set_overall_enable: {
            enable: enable ? 1 : 0
          }
        }
      }, _this7.childId, sendOptions);
    })();
  }

}

module.exports = Away;