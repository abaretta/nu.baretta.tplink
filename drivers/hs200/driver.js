"use strict";

// We need network functions.
var net = require('net');

const {
    Client
} = require('tplink-smarthome-api/src');
const client = new Client();
var TPlinkModel = getDriverName().toUpperCase();
var myRegEx = new RegExp(TPlinkModel, 'g');

// Temporarily store the device's IP address and name. For later use, it gets added to the device's settings
var tempIP = '';
var tempDeviceName = '';
// Variable to hold responses from the AVR
var receivedData = "";
// The TP Link smartplug IP network interface uses tcp port 9999.
var IPPort = 9999;
// a list of devices, with their 'id' as key
// it is generally advisable to keep a list of
// paired and active devices in your driver's memory.
var devices = {};
// var client = new Hs100Api.Client();
var plug = '';
var intervalID;
var oldonoffState = false;
var oldpowerState = {};
var oldtotalState = 0;
var totalOffset = 0;
var oldvoltageState = 0;
var oldcurrentState = 0;
var logEvent = function (eventName, plug) {
    //  Homey.log(`${(new Date()).toISOString()} ${eventName} ${plug.model} ${plug.host} ${plug.deviceId}`);
    Homey.log(`${(new Date()).toISOString()} ${eventName} ${plug.model} ${plug.host}`);
};
module.exports.init = function (devices_data, callback) {
    devices_data.forEach(function (device_data) {
        Homey.log('TP Link smartplug app - init device: ' + JSON.stringify(device_data));
        Homey.log('TP Link smartplug app - model: ' + TPlinkModel);
        initDevice(device_data);

    })
    //tell Homey we're happy to go
    callback();
}

// start of pairing functions
module.exports.pair = function (socket) {
    // socket is a direct channel to the front-end

    // discover function
    socket.on('discover', function (data, callback) {
        Homey.log('TP Link smartplug app - Starting Plug Discovery');

        // discover new plugs
        client.startDiscovery();
        client.on('plug-new', (plug) => {
            logEvent('plug-new', plug);
            Homey.log('TP Link smartplug app - devices: ' + JSON.stringify(devices));
            if (plug.model.match(myRegEx)) {
                // check if device is known
                //Homey.log("TP Link smartplug app - device " + devices[].data.name);
                if (devices.hasOwnProperty(plug.host)) {
                    console.log("Key found in devices: " + JSON.stringify(devices));

                    Homey.log("TP Link smartplug app - device " + plug.host + " is known, skipping. Model: " + plug.model + " name " + plug.name + " mac " + plug.mac);
                } else {
                    Homey.log("TP Link smartplug app - plug found: " + plug.host + " model " + plug.model + " name " + plug.name + " mac " + plug.mac);
                    var data = {
                        id: plug.host,
                        name: plug.name
                    }
                    setTimeout(function () {
                        socket.emit('found', data);
                        client.stopDiscovery()
                    }, 1000);
                    Homey.log("TP Link smartplug app - discovered new plug: " + data.id + " name " + data.name);
                    callback(null, data);
                }
            }
        })
        client.on('plug-online', (plug) => {
            logEvent('plug-online', plug);
            if (plug.model.match(myRegEx)) {
                if (devices.hasOwnProperty(plug.host)) {
                    console.log("Key found in devices: " + JSON.stringify(devices));

                    Homey.log("TP Link smartplug app - device " + plug.host + " is known, skipping. Model: " + plug.model + " name " + plug.name + " mac " + plug.mac);
                } else {
                    Homey.log("TP Link smartplug app - online plug found: " + plug.host + " model " + plug.model + " name " + plug.name + " mac " + plug.mac);
                    var data = {
                        id: plug.host,
                        name: plug.name
                    }
                    setTimeout(function () {
                        socket.emit('found', data);
                        client.stopDiscovery()
                    }, 1000);
                    Homey.log("TP Link smartplug app - discovered online plug: " + data.id + " name " + data.name);
                    callback(null, data);
                }
            }
        })
    });

    // this method is run when Homey.emit('list_devices') is run on the front-end
    // which happens when you use the template `list_devices`

    socket.on('list_devices', function (data, callback) {

        Homey.log("TP Link smartplug app - list_devices data: " + JSON.stringify(data));
        // tempIP and tempDeviceName we got from when get_devices was run (hopefully?)

        var newDevices = [{
            name: tempDeviceName,
            data: {
                id: tempIP
            },
            settings: {
                "settingIPAddress": tempIP
            } // initial settings
        }];

        callback(null, newDevices);
    });

    // this is called when the user presses save settings button in start.html
    socket.on('get_devices', function (data, callback) {

        // Set passed pair settings in variables
        tempIP = data.ipaddress;
        tempDeviceName = data.deviceName;
        Homey.log("TP Link smartplug app - got get_devices from front-end, tempIP =", tempIP, " tempDeviceName = ", tempDeviceName);
        // FIXME: should check if IP leads to an actual TP link device
        // assume IP is OK and continue, which will cause the front-end to run list_amplifiers which is the template list_devices
        socket.emit('continue', null);
    });

    socket.on('disconnect', function () {
        Homey.log("TP Link smartplug app - Pairing is finished (done or aborted)");
    })
}
// end pair

module.exports.added = function (device_data, callback) {
    // run when a device has been added by the user 
    Homey.log("TP Link smartplug app - device added: " + JSON.stringify(device_data));
    // update devices data array
    initDevice(device_data);
    Homey.log('TP Link smartplug app - add done. devices =' + JSON.stringify(devices));
    callback(null, true);
}

module.exports.renamed = function (device_data, new_name) {
    // run when the user has renamed the device in Homey.
    // It is recommended to synchronize a device's name, so the user is not confused
    // when it uses another remote to control that device (e.g. the manufacturer's app).
    Homey.log("TP Link smartplug app - device renamed: " + JSON.stringify(device_data) + " new name: " + new_name);
    // update the devices array we keep
    devices[device_data.id].data.name = new_name;
}

module.exports.deleted = function (device_data) {
    // run when the user has deleted the device from Homey
    Homey.log("TP Link smartplug app - device deleted: " + JSON.stringify(device_data));
    // remove from the devices array we keep
    delete devices[device_data.id];
    // stop polling 
    clearInterval(intervalID);
}

// handling settings (wrench icon in devices)
module.exports.settings = function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
    // run when the user has changed the device's settings in Homey.
    // changedKeysArr contains an array of keys that have been changed, for your convenience :)

    // always fire the callback, or the settings won't change!
    // if the settings must not be saved for whatever reason:
    // callback( "Your error message", null );
    // else callback( null, true );

    Homey.log('TP Link smartplug app - Settings were changed: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj) + ' / changedKeysArr = ' + JSON.stringify(changedKeysArr));

    try {
        changedKeysArr.forEach(function (key) {
            switch (key) {
                case 'settingIPAddress':
                    Homey.log('TP Link smartplug app - IP address changed to ' + newSettingsObj.settingIPAddress);
                    device_data.id = newSettingsObj.settingIPAddress;
                    initDevice(device_data);
                    clearInterval(intervalID);
                    module.exports.capabilities.onoff.get(device_data, callback);

                    // FIXME: check if IP is valid, otherwise return callback with an error
                    break;
            }
        })
        callback(null, true)
    } catch (error) {
        callback(error)
    }

}

// capabilities

module.exports.capabilities = {
    onoff: {
        get: function (device_data, callback) {
            Homey.log("TP Link smartplug app - getting device on/off status of " + device_data.id);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
            intervalID = setInterval(function () {
                Homey.log("TP Link smartplug app - updating state every 10s for " + device_data.id);
                getStatus(device_data);
            }, 10000);
            callback(null, device.state.onoff);
        },

        set: function (device_data, onoff, callback) {
            Homey.log('TP Link smartplug app - Setting device_status of ' + device_data.id + ' to ' + onoff);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);

            device.state.onoff = onoff;
            if (onoff) {
                powerOn(device_data);
            } else {
                powerOff(device_data);
            }
            callback(null, onoff);
        }
    },

    ledonoff: {
        get: function (device_data, callback) {
            Homey.log("TP Link smartplug app - getting LED on/off status of " + device_data.id);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
            device.state.ledonoff = getLed(device_data);
            callback(null, device.state.ledonoff);
        },

        set: function (device_data, turnon, callback) {
            Homey.log('TP Link smartplug app - setting LED status ' + device_data.id + ' to ' + turnon);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);

            device.state.ledonoff = turnon;

            if (turnon) {
                ledOn(device_data);
            } else {
                ledOff(device_data);
            }
            callback(null, turnon);
        }
    },

    meter_power: {
        get: function (device_data, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);

            return callback(null, device.state.meter_power);
        }
    },

    measure_power: {
        get: function (device_data, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);

            return callback(null, device.state.measure_power);
        }
    },

    measure_current: {
        get: function (device_data, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);

            return callback(null, device.state.measure_current);

        }
    },

    measure_voltage: {
        get: function (device_data, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);

            return callback(null, device.state.measure_voltage);
        }
    }
}

// end capabilities
// flow condition handlers: default for class 'socket'

// start flow action handlers: on/off are included by default with class 'socket'

Homey.manager('flow').on('action.ledOn', function (callback, args) {
    var device = args.device;
    ledOn(device);
    callback(null, true); // we've fired successfully
});

Homey.manager('flow').on('action.ledOff', function (callback, args) {
    var device = args.device;
    ledOff(device);
    callback(null, true); // we've fired successfully
});

Homey.manager('flow').on('action.meter_reset', function (callback, args) {
    var device = args.device;
    //meter_reset(device);
    Homey.log('TP Link smartplug app - oldtotalState: ' + oldtotalState);
    totalOffset = oldtotalState;
    callback(null, true); // we've fired successfully
});

Homey.manager('flow').on('action.undo_meter_reset', function (callback, args) {
    var device = args.device;
    //undo_meter_reset(device);
    Homey.log('TP Link smartplug app - undo reset meter ');
    totalOffset = 0;
    callback(null, true); // we've fired successfully
});

// start functions

function powerOn(device_data) {
    var device = getDeviceByData(device_data);
    Homey.log('TP Link smartplug app - turning device on ');
    plug = client.getPlug({
        host: device_data.id
    });
    plug.setPowerState(true);
}

function powerOff(device_data) {
    var device = getDeviceByData(device_data);
    Homey.log('TP Link smartplug app - turning device off ');
    plug = client.getPlug({
        host: device_data.id
    });
    plug.setPowerState(false);
}

function getPower(device_data) {
    var device = getDeviceByData(device_data);
    plug = client.getPlug({
        host: device_data.id
    });
    plug.getSysInfo().then((sysInfo) => {
            if (sysInfo.relay_state === 1) {
                Homey.log('TP Link smartplug app - relay state on ');
                callback(null, true);
            } else {
                Homey.log('TP Link smartplug app - relay state off ');
                callback(null, false);
            }
        })
        .catch((err) => {
            Homey.log("TP Link smartplug app - caught error in getPower function: " + err.message);
        });
}

function getLed(device_data) {
    var device = getDeviceByData(device_data);
    plug = client.getPlug({
        host: device_data.id
    });
    plug.getSysInfo().then((sysInfo) => {
            if (sysInfo.led_off === 0) {
                Homey.log('TP Link smartplug app - LED on ');
                return true;
            } else {
                Homey.log('TP Link smartplug app - LED off ');
                return false;
            }
        })
        .catch((err) => {
            Homey.log("TP Link smartplug app - caught error in getLed function: " + err.message);
        });

}

function ledOn(device_data) {
    Homey.log('TP Link smartplug app - turning LED on ');
    var device = getDeviceByData(device_data);
    plug = client.getPlug({
        host: device_data.id
    });
    plug.setLedState(1);
}

function ledOff(device_data) {
    Homey.log('TP Link smartplug app - turning LED off ');
    var device = getDeviceByData(device_data);
    plug = client.getPlug({
        host: device_data.id
    });
    plug.setLedState(0);
}

function meter_reset(device_data) {
    Homey.log('TP Link smartplug app - reset meter ');
    var device = getDeviceByData(device_data);
    // reset meter for counters in Kasa app. Does not actually clear the total counter though...
    plug = client.getPlug({
        host: device_data.id
    });
    //FIXME
    plug.emeter.eraseStats(null);
    Homey.log('TP Link smartplug app - oldtotalState: ' + oldtotalState);
    totalOffset = oldtotalState;
}

function undo_meter_reset(device_data) {
    Homey.log('TP Link smartplug app - undo reset meter ');
    var device = getDeviceByData(device_data);
    // reset meter for counters in Kasa app. Does not actually clear the total counter though...
    plug = client.getPlug({
        host: device_data.id
    });
    totalOffset = 0;
}

function getStatus(device_data) {
    try {
        var device = getDeviceByData(device_data);
        plug = client.getPlug({
            host: device_data.id
        });

        plug.getInfo().then((data) => {
            //Homey.log("TP Link smartplug app - meter power %j ", data.emeter.realtime.power);
            //Homey.log("TP Link smartplug app - system %j ", data.sysInfo.relay_state);

            oldonoffState = device.state.onoff;
            oldpowerState = device.state.measure_power;
            oldtotalState = device.state.meter_power;
            oldvoltageState = device.state.measure_voltage;
            oldcurrentState = device.state.measure_current;

            // updated states, added check/hack for newer FW's which report milli-amp/volt and wh instead of kilo
            // NB: not needed anymore with new tplink-smarthome lib, it returns both
            device.state.measure_current = data.emeter.realtime.current;
            device.state.measure_voltage = data.emeter.realtime.voltage;
            device.state.measure_power = data.emeter.realtime.power;
            var total = data.emeter.realtime.total;

            Homey.log('TP Link smartplug app - total: ' + total);
            // for some reason the Kasa app does reset something, but not the total
            Homey.log('TP Link smartplug app - totalOffset: ' + totalOffset);
            device.state.meter_power = total - totalOffset;
            Homey.log('TP Link smartplug app - total - Offset: ' + device.state.meter_power);

            if (data.sysInfo.relay_state === 1) {
                Homey.log('TP Link smartplug app - relay state on ');
                device.state.onoff = true;
            } else {
                Homey.log('TP Link smartplug app - relay state off ');
                device.state.onoff = false;
            }
        });

        // update realtime data only in case it changed
        if (oldonoffState != device.state.onoff) {
            Homey.log("TP Link smartplug app - capability power on: " + device.state.onoff);
            module.exports.realtime(device_data, 'onoff', device.state.onoff);
        }
        if (oldpowerState != device.state.measure_power) {
            Homey.log('TP Link smartplug app - power changed: ' + device.state.measure_power);
            module.exports.realtime(device_data, 'measure_power', device.state.measure_power);
        }
        if (oldtotalState != device.state.meter_power) {
            Homey.log('TP Link smartplug app - total changed: ' + device.state.meter_power);
            module.exports.realtime(device_data, 'meter_power', device.state.meter_power);
        }
        if (oldvoltageState != device.state.measure_voltage) {
            Homey.log('TP Link smartplug app - voltage changed: ' + device.state.measure_voltage);
            module.exports.realtime(device_data, 'measure_voltage', device.state.measure_voltage);
        }
        if (oldcurrentState != device.state.measure_current) {
            Homey.log('TP Link smartplug app - current changed: ' + device.state.measure_current);
            module.exports.realtime(device_data, 'measure_current', device.state.measure_current);
        }
    } catch (err) {
        Homey.log("TP Link smartplug app - caught error in getStatus function: " + err.message);
    }
}

// a helper method to get a device from the devices list by it's device_data object
function getDeviceByData(device_data) {
    var device = devices[device_data.id];
    if (typeof device === 'undefined') {
        return new Error("invalid_device");
    } else {
        return device;
    }
}

// a helper method to add a device to the devices list
function initDevice(device_data) {
    devices[device_data.id] = {};
    devices[device_data.id].state = {
        onoff: true,
        ledonoff: false,
        meter_power: {},
        measure_power: {},
        measure_current: {},
        measure_voltage: {}
    };
    devices[device_data.id].data = device_data;
    plug = client.getPlug({
        host: device_data.id
    });
    Homey.log('TP Link smartplug app - plug IP: ' + device_data.id);
}

// get driver name based on dirname (hs100, hs110, etc.)
function getDriverName() {
    var parts = __dirname.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1].split('.')[0];
}
