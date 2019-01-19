'use strict';
/**
 * Eemter
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Emeter {
  constructor(device, apiModuleName, childId = null) {
    this.device = device;
    this.apiModuleName = apiModuleName;
    this.childId = childId;
    this._realtime = {};
  }
  /**
   * Returns cached results from last retrieval of `emeter.get_realtime`.
   * @return {Object}
   */


  get realtime() {
    return this._realtime;
  }
  /**
   * @private
   */


  set realtime(realtime) {
    const normalize = function normalize(propName, propName2, multiplier) {
      if (realtime[propName] != null && realtime[propName2] == null) {
        realtime[propName2] = Math.floor(realtime[propName] * multiplier);
      } else if (realtime[propName] == null && realtime[propName2] != null) {
        realtime[propName] = realtime[propName2] / multiplier;
      }
    };

    if (realtime != null) {
      normalize('current', 'current_ma', 1000);
      normalize('power', 'power_mw', 1000);
      normalize('total', 'total_wh', 1000);
      normalize('voltage', 'voltage_mv', 1000);
    }

    this._realtime = realtime;
    this.device.emit('emeter-realtime-update', this._realtime);
  }
  /**
   * Gets device's current energy stats.
   *
   * Requests `emeter.get_realtime`. Older devices return `current`, `voltage`, etc,
   * while newer devices return `current_ma`, `voltage_mv` etc
   * This will return a normalized response including both old and new style properies for backwards compatibility.
   * Supports childId.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getRealtime(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.realtime = yield _this.device.sendCommand({
        [_this.apiModuleName]: {
          get_realtime: {}
        }
      }, _this.childId, sendOptions);
      return _this.realtime;
    })();
  }
  /**
   * Get Daily Emeter Statisics.
   *
   * Sends `emeter.get_daystat` command. Supports childId.
   * @param  {number}       year
   * @param  {number}       month
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getDayStats(year, month, sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.device.sendCommand({
        [_this2.apiModuleName]: {
          get_daystat: {
            year,
            month
          }
        }
      }, _this2.childId, sendOptions);
    })();
  }
  /**
   * Get Monthly Emeter Statisics.
   *
   * Sends `emeter.get_monthstat` command. Supports childId.
   * @param  {number}       year
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getMonthStats(year, sendOptions) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return _this3.device.sendCommand({
        [_this3.apiModuleName]: {
          get_monthstat: {
            year
          }
        }
      }, _this3.childId, sendOptions);
    })();
  }
  /**
   * Erase Emeter Statistics.
   *
   * Sends `emeter.erase_runtime_stat` command. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  eraseStats(sendOptions) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      return _this4.device.sendCommand({
        [_this4.apiModuleName]: {
          erase_emeter_stat: {}
        }
      }, _this4.childId, sendOptions);
    })();
  }

}

module.exports = Emeter;