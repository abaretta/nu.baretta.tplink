#! /usr/bin/env node
'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const castArray = require('lodash.castarray');

const program = require('commander');

const tplinkCrypto = require('tplink-smarthome-crypto');

const util = require('util');

const _require = require('./'),
      Client = _require.Client,
      ResponseError = _require.ResponseError;

let logLevel;
let client;

const outputError = function outputError(err) {
  if (err instanceof ResponseError) {
    console.log('Response Error:');
    console.log(err.response);
  } else {
    console.error('Error:');
    console.error(err);
  }
};

const search = function search(sysInfo, breakoutChildren, timeout, params) {
  try {
    console.log('Searching...');
    const commandParams = Object.assign({}, {
      discoveryInterval: 2000,
      discoveryTimeout: timeout,
      breakoutChildren
    }, params); // {discoveryInterval: 2000, discoveryTimeout: timeout, ...params};

    console.log(`startDiscovery(${util.inspect(commandParams)})`);
    client.startDiscovery(commandParams).on('device-new', device => {
      console.log(`${device.model} ${device.deviceType} ${device.type} ${device.host} ${device.port} ${device.macNormalized} ${device.deviceId} ${device.alias}`);

      if (sysInfo) {
        console.dir(device.sysInfo, {
          colors: program.color === 'on',
          depth: 10
        });
      }
    });
  } catch (err) {
    outputError(err);
  }
};

const send =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (host, port, payload) {
    try {
      console.log(`Sending to ${host}:${port}...`);
      const data = yield client.send(payload, host, port);
      console.log('response:');
      console.dir(data, {
        colors: program.color === 'on',
        depth: 10
      });
    } catch (err) {
      outputError(err);
    }
  });

  return function send(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

const sendCommand =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (host, port, childId, payload) {
    try {
      console.log(`Sending to ${host}:${port}...`);
      const device = yield client.getDevice({
        host,
        port
      });
      const results = yield device.sendCommand(payload);
      console.log('response:');
      console.dir(results, {
        colors: program.color === 'on',
        depth: 10
      });
    } catch (err) {
      outputError(err);
    }
  });

  return function sendCommand(_x4, _x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();

const sendCommandDynamic =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (host, port, command, commandParams = [], childId = null) {
    try {
      console.log(`Sending ${command} command to ${host}:${port} ${childId ? 'childId: ' + childId : ''}...`);
      const device = yield client.getDevice({
        host,
        port,
        childId
      });
      const results = yield device[command](...commandParams);
      console.log('response:');
      console.dir(results, {
        colors: program.color === 'on',
        depth: 10
      });
    } catch (err) {
      outputError(err);
    }
  });

  return function sendCommandDynamic(_x8, _x9, _x10) {
    return _ref3.apply(this, arguments);
  };
}();

const details =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (host, port, timeout) {
    try {
      console.log(`Getting details from ${host}:${port}...`);
      const device = yield client.getDevice({
        host,
        port
      });
      console.dir({
        alias: device.alias,
        deviceId: device.deviceId,
        description: device.description,
        model: device.model,
        deviceType: device.deviceType,
        type: device.type,
        softwareVersion: device.softwareVersion,
        hardwareVersion: device.hardwareVersion,
        mac: device.mac
      }, {
        colors: program.color === 'on',
        depth: 10
      });
    } catch (err) {
      outputError(err);
    }
  });

  return function details(_x11, _x12, _x13) {
    return _ref4.apply(this, arguments);
  };
}();

const blink = function blink(host, port, times, rate, timeout) {
  console.log(`Sending blink commands to ${host}:${port}...`);
  client.getDevice({
    host,
    port
  }).then(device => {
    return device.blink(times, rate).then(() => {
      console.log('Blinking complete');
    });
  }).catch(reason => {
    outputError(reason);
  });
};

const toInt = s => {
  return parseInt(s, 10);
};

const setupClient = function setupClient() {
  const defaultSendOptions = {};
  if (program.udp) defaultSendOptions.transport = 'udp';
  if (program.timeout) defaultSendOptions.timeout = program.timeout;
  return new Client({
    logLevel,
    defaultSendOptions
  });
};

const setParamTypes = function setParamTypes(params, types) {
  if (params && params.length > 0 && types && types.length > 0) {
    return castArray(params).map((el, i) => {
      switch (types[i]) {
        case 'number':
          return +el;

        case 'boolean':
          return el === 'true' || el === '1';
      }

      return el;
    });
  }

  return params;
};

program.option('-D, --debug', 'turn on debug level logging', () => {
  logLevel = 'debug';
}).option('-t, --timeout <ms>', 'timeout (ms)', toInt, 10000).option('-u, --udp', 'send via UDP').option('-c, --color [on]', 'output will be styled with ANSI color codes', 'on');
program.command('search [params]').description('Search for devices').option('-s, --sysinfo', 'output sysInfo').option('-b, --breakout-children', 'output children (multi-outlet plugs)', true).action(function (params, options) {
  client = setupClient();

  if (params) {
    console.dir(params);
    params = JSON.parse(params);
  }

  search(options.sysinfo, options.breakoutChildren || false, program.timeout, params);
});
program.command('send <host> <payload>').description('Send payload to device (using Client.send)').action(function (host, payload, options) {
  client = setupClient();

  const _host$split = host.split(':'),
        _host$split2 = _slicedToArray(_host$split, 2),
        hostOnly = _host$split2[0],
        port = _host$split2[1];

  send(hostOnly, port, payload);
});
program.command('sendCommand <host> <payload>').description('Send payload to device (using Device#sendCommand)').action(function (host, payload, options) {
  client = setupClient();

  const _host$split3 = host.split(':'),
        _host$split4 = _slicedToArray(_host$split3, 2),
        hostOnly = _host$split4[0],
        port = _host$split4[1];

  sendCommand(hostOnly, port, payload);
});
program.command('details <host>').action(function (host, options) {
  client = setupClient();

  const _host$split5 = host.split(':'),
        _host$split6 = _slicedToArray(_host$split5, 2),
        hostOnly = _host$split6[0],
        port = _host$split6[1];

  details(hostOnly, port, program.timeout);
});
program.command('blink <host> [times] [rate]').action(function (host, times = 5, rate = 500, options) {
  client = setupClient();

  const _host$split7 = host.split(':'),
        _host$split8 = _slicedToArray(_host$split7, 2),
        hostOnly = _host$split8[0],
        port = _host$split8[1];

  blink(hostOnly, port, times, rate);
});
[{
  fnName: 'getSysInfo',
  supportsChildId: true
}, {
  fnName: 'getInfo',
  supportsChildId: true
}, {
  fnName: 'setAlias',
  supportsChildId: true
}, {
  fnName: 'getModel',
  supportsChildId: true
}, {
  fnName: 'setPowerState',
  paramTypes: ['boolean'],
  supportsChildId: true
}, {
  fnName: 'setLocation',
  paramTypes: ['number', 'number']
}, {
  fnName: 'reboot',
  paramTypes: ['number']
}, {
  fnName: 'reset',
  paramTypes: ['number']
}].forEach(command => {
  let commandName;
  let paramTypes;
  let supportsChildId = false;

  if (command.fnName) {
    commandName = command.fnName;
    paramTypes = command.paramTypes;
    supportsChildId = command.supportsChildId;
  } else {
    commandName = command;
  }

  let cmd = program.command(`${commandName} <host> [params]`).description(`Send ${commandName} to device (using Device#${commandName})`).option('-t, --timeout [timeout]', 'timeout (ms)', toInt, 10000);

  if (supportsChildId) {
    cmd = cmd.option('-c, --childId [childId]', 'childId');
  }

  cmd.action(function (host, params, options) {
    client = setupClient();

    const _host$split9 = host.split(':'),
          _host$split10 = _slicedToArray(_host$split9, 2),
          hostOnly = _host$split10[0],
          port = _host$split10[1];

    sendCommandDynamic(hostOnly, port, commandName, setParamTypes(params, paramTypes), options.childId);
  });
});
program.command('encrypt <outputEncoding> <input> [firstKey=0xAB]').action(function (outputEncoding, input, firstKey = 0xAB) {
  const outputBuf = tplinkCrypto.encrypt(input, firstKey);
  console.log(outputBuf.toString(outputEncoding));
});
program.command('encryptWithHeader <outputEncoding> <input> [firstKey=0xAB]').action(function (outputEncoding, input, firstKey = 0xAB) {
  const outputBuf = tplinkCrypto.encryptWithHeader(input, firstKey);
  console.log(outputBuf.toString(outputEncoding));
});
program.command('decrypt <inputEncoding> <input> [firstKey=0xAB]').action(function (inputEncoding, input, firstKey = 0xAB) {
  const inputBuf = Buffer.from(input, inputEncoding);
  const outputBuf = tplinkCrypto.decrypt(inputBuf, firstKey);
  console.log(outputBuf.toString());
});
program.command('decryptWithHeader <inputEncoding> <input> [firstKey=0xAB]').action(function (inputEncoding, input, firstKey = 0xAB) {
  const inputBuf = Buffer.from(input, inputEncoding);
  const outputBuf = tplinkCrypto.decryptWithHeader(inputBuf, firstKey);
  console.log(outputBuf.toString());
});
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}