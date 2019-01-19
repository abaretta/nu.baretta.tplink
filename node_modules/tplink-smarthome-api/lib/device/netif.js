'use strict';
/**
 * Netif
 */

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Netif {
  constructor(device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }
  /**
   * Requests `netif.get_scaninfo` (list of WiFi networks).
   *
   * Note that `timeoutInSeconds` is sent in the request and is not the actual network timeout.
   * The network timeout for the request is calculated by adding the
   * default network timeout to `timeoutInSeconds`.
   * @param  {Boolean}     [refresh=false]       request device's cached results
   * @param  {number}      [timeoutInSeconds=10] timeout for scan in seconds
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */


  getScanInfo(refresh = false, timeoutInSeconds = 10, sendOptions = {}) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (sendOptions.timeout == null) {
        sendOptions.timeout = timeoutInSeconds * 1000 * 2 + (_this.device.defaultSendOptions.timeout || 5000);
      }

      return _this.device.sendCommand({
        [_this.apiModuleName]: {
          get_scaninfo: {
            refresh: refresh ? 1 : 0,
            timeout: timeoutInSeconds
          }
        }
      }, null, sendOptions);
    })();
  }

}

module.exports = Netif;