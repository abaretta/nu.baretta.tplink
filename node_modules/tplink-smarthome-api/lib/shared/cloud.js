'use strict';
/**
 * Cloud
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Cloud {
  constructor(device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }
  /**
   * Gets device's TP-Link cloud info.
   *
   * Requests `cloud.get_info`. Does not support childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getInfo(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.info = yield _this.device.sendCommand({
        [_this.apiModuleName]: {
          get_info: {}
        }
      }, null, sendOptions);
      return _this.info;
    })();
  }
  /**
   * Add device to TP-Link cloud.
   *
   * Sends `cloud.bind` command. Does not support childId.
   * @param  {string}       username
   * @param  {string}       password
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  bind(username, password, sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.device.sendCommand({
        [_this2.apiModuleName]: {
          bind: {
            username,
            password
          }
        }
      }, null, sendOptions);
    })();
  }
  /**
   * Remove device from TP-Link cloud.
   *
   * Sends `cloud.unbind` command. Does not support childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  unbind(sendOptions) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return _this3.device.sendCommand({
        [_this3.apiModuleName]: {
          unbind: {}
        }
      }, null, sendOptions);
    })();
  }
  /**
   * Get device's TP-Link cloud firmware list.
   *
   * Sends `cloud.get_intl_fw_list` command. Does not support childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getFirmwareList(sendOptions) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      return _this4.device.sendCommand({
        [_this4.apiModuleName]: {
          get_intl_fw_list: {}
        }
      }, null, sendOptions);
    })();
  }
  /**
   * Sets device's TP-Link cloud server URL.
   *
   * Sends `cloud.set_server_url` command. Does not support childId.
   * @param  {string}       server URL
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  setServerUrl(server, sendOptions) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return _this5.device.sendCommand({
        [_this5.apiModuleName]: {
          set_server_url: {
            server
          }
        }
      }, null, sendOptions);
    })();
  }

}

module.exports = Cloud;