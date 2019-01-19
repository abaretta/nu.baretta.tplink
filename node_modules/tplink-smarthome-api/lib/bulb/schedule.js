/* eslint camelcase: ["off"] */
'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const Schedule = require('../shared/schedule');

const _require = require('../utils'),
      createScheduleRule = _require.createScheduleRule;
/**
 * BulbSchedule
 */


class BulbSchedule extends Schedule {
  /**
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id.
   * @param  {Object}         options
   * @param  {Object}         options.lightState
   * @param  {(Date|number)}  options.start  Date or number of minutes
   * @param  {number[]}      [options.daysOfWeek]  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {string}        [options.name]
   * @param  {boolean}       [options.enable=true]
   * @param  {SendOptions}   [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  addRule({
    lightState,
    start,
    daysOfWeek,
    name = '',
    enable = true
  }, sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const rule = Object.assign({
        s_light: lightState,
        name,
        enable: enable ? 1 : 0,
        sact: 2,
        emin: -1,
        etime_opt: -1
      }, createScheduleRule({
        start,
        daysOfWeek
      }));
      return Schedule.prototype.addRule.call(_this, rule, null, sendOptions); // super.addRule(rule); // workaround babel bug
    })();
  }
  /**
   * Edits Schedule rule.
   *
   * Sends `schedule.edit_rule` command and returns rule id.
   * @param  {string}         options.id
   * @param  {Object}         options.lightState
   * @param  {(Date|number)}  options.start  Date or number of minutes
   * @param  {number[]}      [options.daysOfWeek]  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {string}        [options.name]    [description]
   * @param  {boolean}       [options.enable=true]
   * @param  {SendOptions}   [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  editRule({
    id,
    lightState,
    start,
    daysOfWeek,
    name = '',
    enable = true
  }, sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const rule = Object.assign({
        id,
        s_light: lightState,
        name,
        enable: enable ? 1 : 0,
        sact: 2,
        emin: -1,
        etime_opt: -1
      }, createScheduleRule({
        start,
        daysOfWeek
      }));
      return Schedule.prototype.editRule.call(_this2, rule, null, sendOptions); // super.addRule(rule); // workaround babel bug
    })();
  }

}

module.exports = BulbSchedule;