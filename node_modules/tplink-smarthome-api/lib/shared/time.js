'use strict';
/**
 * Time
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Time {
  constructor(device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }
  /**
   * Gets device's time.
   *
   * Requests `timesetting.get_time`. Does not support ChildId.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getTime(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this.device.sendCommand({
        [_this.apiModuleName]: {
          get_time: {}
        }
      }, null, sendOptions);
    })();
  }
  /**
   * Gets device's timezone.
   *
   * Requests `timesetting.get_timezone`. Does not support ChildId.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getTimezone(sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.device.sendCommand({
        [_this2.apiModuleName]: {
          get_timezone: {}
        }
      }, null, sendOptions);
    })();
  }

}

module.exports = Time;