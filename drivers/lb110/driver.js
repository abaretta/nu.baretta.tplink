"use strict";

// We need network functions.
var net = require('net');

const TPLinkBulbApi = require('TPLinkBulb-api')
const client = new TPLinkBulbApi.Client()

var TPlinkModel = getDriverName().toUpperCase();
var myRegEx = new RegExp(TPlinkModel, 'g');

// Temporarily store the device's IP address and name. For later use, it gets added to the device's settings
var tempIP = '';
var tempDeviceName = '';
// Variable to hold responses from the AVR
var receivedData = "";
// The TP Link smartbulb IP network interface uses tcp port 9999.
var IPPort = 9999;
// a list of devices, with their 'id' as key
// it is generally advisable to keep a list of
// paired and active devices in your driver's memory.
var devices = {};
var bulb = '';
var intervalID;
var oldonoffState = false;
var oldpowerState = 0;
var oldtotalState = 0;
var totalOffset = 0;
var oldHue = 0;
var oldColorTemp = 0;
var oldSaturation = 0;
var oldBrightness = 0;
var logEvent = function(eventName, bulb) {
    //  Homey.log(`${(new Date()).toISOString()} ${eventName} ${bulb.model} ${bulb.host} ${bulb.deviceId}`);
    Homey.log(`${(new Date()).toISOString()} ${eventName} ${bulb.model} ${bulb.host}`);
};
module.exports.init = function(devices_data, callback) {
    devices_data.forEach(function(device_data) {
            Homey.log('TP Link smartbulb app - init device: ' + JSON.stringify(device_data));
            Homey.log('TP Link smartbulb app - model: ' + TPlinkModel);
            initDevice(device_data);

        })
        //tell Homey we're happy to go
    callback();
}

// start of pairing functions
module.exports.pair = function(socket) {
        // socket is a direct channel to the front-end

        // discover function
        socket.on('discover', function(data, callback) {
            Homey.log('TP Link smartbulb app - Starting Bulb Discovery');

            // discover new bulbs
            client.startDiscovery()
            client.on('bulb-new', (bulb) => {
                logEvent('bulb-new', bulb);
            if (bulb.model.match(myRegEx)) {
               Homey.log("TP Link smartbulb app - bulb found: " + bulb.host + " model " + bulb.model + " name " + bulb.name + " mac " + bulb.mac);
                // check if device is known
                if (devices.hasOwnProperty(bulb.host)) {
                    console.log("Key found in devices: " + JSON.stringify(devices));

                    Homey.log("TP Link smartbulb app - device " + bulb.host + " is known, skipping. Model: " + bulb.model + " name " + bulb.name + " mac " + bulb.mac);
                } else {
                    Homey.log("TP Link smartbulb app - bulb found: " + bulb.host + " model " + bulb.model + " name " + bulb.name + " mac " + bulb.mac);
                    var data = {
                        id: bulb.host,
                        name: bulb.name
                    }
                    setTimeout(function() {
                        socket.emit('found', data);
                        client.stopDiscovery()
                    }, 1000);
                    Homey.log("TP Link smartbulb app - discovered new bulbs: " + data.id + " name " + data.name);
                    callback(null, data);
                }
              }
            })
            client.on('bulb-online', (bulb) => {
                logEvent('bulb-online', bulb);
            if (bulb.model.match(myRegEx)) {
               Homey.log("TP Link smartbulb app - bulb found: " + bulb.host + " model " + bulb.model + " name " + bulb.name + " mac " + bulb.mac);
                if (devices.hasOwnProperty(bulb.host)) {
                    console.log("Key found in devices: " + JSON.stringify(devices));

                    Homey.log("TP Link smartbulb app - device " + bulb.host + " is known, skipping. Model: " + bulb.model + " name " + bulb.name + " mac " + bulb.mac);
                } else {
                    Homey.log("TP Link smartbulb app - online bulb found: " + bulb.host + " model " + bulb.model + " name " + bulb.name + " mac " + bulb.mac);
                    var data = {
                        id: bulb.host,
                        name: bulb.name
                    }
                    setTimeout(function() {
                        socket.emit('found', data);
                        client.stopDiscovery()
                    }, 1000);
                    Homey.log("TP Link smartbulb app - discovered online bulb: " + data.id + " name " + data.name);
                    callback(null, data);
                }
              }
            })
           });

        // this method is run when Homey.emit('list_devices') is run on the front-end
        // which happens when you use the template `list_devices`

        socket.on('list_devices', function(data, callback) {

            Homey.log("TP Link smartbulb app - list_devices data: " + JSON.stringify(data));
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
        socket.on('get_devices', function(data, callback) {

            // Set passed pair settings in variables
            tempIP = data.ipaddress;
            tempDeviceName = data.deviceName;
            Homey.log("TP Link smartbulb app - got get_devices from front-end, tempIP =", tempIP, " tempDeviceName = ", tempDeviceName);
            // FIXME: should check if IP leads to an actual TP link device
            // assume IP is OK and continue, which will cause the front-end to run list_amplifiers which is the template list_devices
            socket.emit('continue', null);
        });

        socket.on('disconnect', function() {
            Homey.log("TP Link smartbulb app - Pairing is finished (done or aborted)");
        })
    }
    // end pair

module.exports.added = function(device_data, callback) {
    // run when a device has been added by the user 
    Homey.log("TP Link smartbulb app - device added: " + JSON.stringify(device_data));
    // update devices data array
    initDevice(device_data);
    Homey.log('TP Link smartbulb app - add done. devices =' + JSON.stringify(devices));
    callback(null, true);
}

module.exports.renamed = function(device_data, new_name) {
    // run when the user has renamed the device in Homey.
    // It is recommended to synchronize a device's name, so the user is not confused
    // when it uses another remote to control that device (e.g. the manufacturer's app).
    Homey.log("TP Link smartbulb app - device renamed: " + JSON.stringify(device_data) + " new name: " + new_name);
    // update the devices array we keep
    devices[device_data.id].data.name = new_name;
}

module.exports.deleted = function(device_data) {
    // run when the user has deleted the device from Homey
    Homey.log("TP Link smartbulb app - device deleted: " + JSON.stringify(device_data));
    // remove from the devices array we keep
    delete devices[device_data.id];
    // stop polling 
    clearInterval(intervalID);
}

// handling settings (wrench icon in devices)
module.exports.settings = function(device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
    // run when the user has changed the device's settings in Homey.
    // changedKeysArr contains an array of keys that have been changed, for your convenience :)

    // always fire the callback, or the settings won't change!
    // if the settings must not be saved for whatever reason:
    // callback( "Your error message", null );
    // else callback( null, true );

    Homey.log('TP Link smartbulb app - Settings were changed: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj) + ' / changedKeysArr = ' + JSON.stringify(changedKeysArr));

    try {
        changedKeysArr.forEach(function(key) {
            switch (key) {
                case 'settingIPAddress':
                    Homey.log('TP Link smartbulb app - IP address changed to ' + newSettingsObj.settingIPAddress);
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
        get: function(device_data, callback) {
            Homey.log("TP Link smartbulb app - getting device on/off status of " + device_data.id);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
            intervalID = setInterval(function() {
                Homey.log("TP Link smartbulb app - updating state every 10s for " + device_data.id);
                getStatus(device_data);
            }, 10000);
            return callback(null, device.state.onoff);
        },

        set: function(device_data, onoff, callback) {
            Homey.log('TP Link smartbulb app - Setting device_status of ' + device_data.id + ' to ' + onoff);
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

/*    meter_power: {
        get: function(device_data, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);

            return callback(null, device.state.meter_power);
        }
    },

    measure_power: {
        get: function(device_data, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
            return callback(null, device.state.measure_power);
        }
    },
*/
    light_hue: {
        get: function(device_data, callback) {
            Homey.log("TP Link smartbulb app - getting hue status of " + device_data.id);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
            // value is updated with getStatus()
            return callback(null,device.state.light_hue);
        },

        set: function(device_data, huePercent, callback) {
            Homey.log('TP Link smartbulb app - Setting hue of ' + device_data.id + ' to ' + huePercent);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
    // name: 'hue', type: 'num', max: 360, min: 0, step: 1
    // FIXME: minimum is 3.6 instead of 0
    var hueLevel = (huePercent + 0.01)* 360 ;
        if (hueLevel >= 360) {
            hueLevel = 360;
        }
        if (hueLevel <= 0) {
            hueLevel = 0;
        }            Homey.log('TP Link smartbulb app - Setting hue of ' + device_data.id + ' to ' + hueLevel);
            set_hue(device_data,hueLevel);
            callback(null, hueLevel);
        }
    },

    light_temperature: {
        get: function(device_data, callback) {
            Homey.log("TP Link smartbulb app - getting light temperature status of " + device_data.id);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
            // value updated by getStatus()
            return callback(null,device.state.light_temperature);
        },

        set: function(device_data, light_temperature, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
    // name: 'color_temp', type: 'num', max: 9000, min: 2500, step: 1 
    var tempLevel = ((1-light_temperature) * 6565) + 2500;
        if (tempLevel >= 9000) {
            tempLevel = 9000;
        }
        if (tempLevel <= 2500) {
            tempLevel = 2500;
        }
            Homey.log('TP Link smartbulb app - Setting light temperature of ' + device_data.id + ' to ' + tempLevel);
            color_temp(device_data, tempLevel);
            callback(null, tempLevel);
        }
    },

    dim: {
        get: function(device_data, callback) {
            Homey.log("TP Link smartbulb app - getting dim level of " + device_data.id);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
            // value updated by getStatus()
            return callback(null,device.state.dim);
        },

        set: function(device_data, dimPercent, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
    // name: 'brightness', type: 'num', max: 100, min: 5, step: 1
            var dimLevel = (dimPercent * 100) + 1;
              if (dimLevel >= 100) {
                dimLevel = 100;
              }
             if (dimLevel <= 5) {
                dimLevel = 5;
             }
            Homey.log('TP Link smartbulb app - Setting brightness ' + device_data.id + ' to ' + dimLevel);
                dim(device_data,dimLevel); 
            callback(null, true);
        }
    },

    light_saturation: {
        get: function(device_data, callback) {
            Homey.log("TP Link smartbulb app - getting light saturation status of " + device_data.id);
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
            // value updated by getStatus()
            return callback(null,device.state.light_saturation);
        },

        set: function(device_data, saturationPercent, callback) {
            var device = getDeviceByData(device_data);
            if (device instanceof Error) return callback(device);
    // name: 'saturation', type: 'num', max: 100, min: 0, step: 1 
    var saturationLevel = (saturationPercent * 100) + 1;
        if (saturationLevel >= 100) {
            saturationLevel = 100;
        }
        if (saturationLevel <= 0) {
            saturationLevel = 0;
        }
            Homey.log('TP Link smartbulb app - Setting light saturation of ' + device_data.id + ' to ' + saturationLevel);
            set_saturation(device_data, saturationLevel);
            callback(null, true);
        }
    }
}

// end capabilities
// flow condition handlers: default for class 'socket'

// start flow action handlers: on/off are included by default with class 'socket'

Homey.manager('flow').on('action.meter_reset', function(callback, args) {
    var device = args.device;
    meter_reset(device);
    callback(null, true); // we've fired successfully
});

Homey.manager('flow').on('action.undo_meter_reset', function(callback, args) {
    var device = args.device;
    undo_meter_reset(device);
    callback(null, true); // we've fired successfully
});

// start functions

function powerOn(device_data) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.setLightOnWithTrans(true,100);
   // bulb.getSysInfo().then(Homey.log);
//    bulb.getLightWattage().then(Homey.log);
//    bulb.getLightDetails().then(Homey.log);
//    bulb.getLightParameters().then(Homey.log);
//    bulb.getLightState().then(Homey.log);
//    bulb.getLightOptions().then(Homey.log);
}

function powerOff(device_data) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.setLightOnWithTrans(false,2000);
}

function dim(device_data, dimLevel) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.setLightState('"brightness"',dimLevel);
}

function color_temp(device_data, tempLevel) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.setLightState('"color_temp"',tempLevel); 
}

function set_hue(device_data, hueLevel) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.setLightColor(hueLevel,device.state.light_saturation); 
}            

function set_saturation(device_data, saturationLevel) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.setLightColor(device.state.light_hue,saturationLevel); 
}

function getPower(device_data) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.getSysInfo().then((sysInfo) => {
        if (sysInfo.relay_state === 1) {
            Homey.log('TP Link smartbulb app - light is on ');
            callback(null, true);
        } else {
            Homey.log('TP Link smartbulb app - light is off ');
            callback(null, false);
        }
    });
}

function getInfo(device_data) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.getInfo().then(Homey.log);
}

function getConsumption(device_data) {
    var device = getDeviceByData(device_data);
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.getConsumption();
}

function meter_reset(device_data) {
    Homey.log('TP Link smartbulb app - reset meter ');
    var device = getDeviceByData(device_data);
    // reset meter for counters in Kasa app. Does not actually clear the total counter though...
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.resetConsumption();
    Homey.log('TP Link smartbulb app - oldtotalState: ' + oldtotalState);
    totalOffset = oldtotalState;
}

function undo_meter_reset(device_data) {
    Homey.log('TP Link smartbulb app - undo reset meter ');
    var device = getDeviceByData(device_data);
    // reset meter for counters in Kasa app. Does not actually clear the total counter though...
    bulb = client.getBulb({
        host: device_data.id
    });
    bulb.resetConsumption();
    totalOffset = 0;
}

function getStatus(device_data) {
    try {
        var device = getDeviceByData(device_data);
        var commands = {
            getConsumption: '{"emeter":{"get_realtime":{}}}'
        };
        bulb = client.getBulb({
            host: device_data.id
        });

//        bulb.get(commands.getConsumption).then((data) => {
//            data.emeter;
            //   Homey.log("TP Link smartbulb app - info %j ", data.emeter);

            // old states
            if (device.state.onoff == undefined) {
                oldonoffState = false;
            } else {
                oldonoffState = device.state.onoff;
            }
  //          oldpowerState = device.state.measure_power;
  //          oldtotalState = device.state.meter_power;
            oldColorTemp = device.state.light_temperature;
            oldSaturation = device.state.light_saturation;
            oldHue = device.state.light_hue;
            oldBrightness = device.state.dim;

        bulb.getLightState().then((bulbState) => {
            //Homey.log('TP Link smartbulb app - getLightState: ' + JSON.stringify(bulbState)); 
            if (bulbState.on_off === 1) {
                Homey.log('TP Link smartbulb app - bulb on ');
                device.state.onoff = true;
            // updated states
            //device.state.light_temperature = JSON.stringify(bulbState.dft_on_state.color_temp, null, 2);
            device.state.light_temperature = JSON.stringify(bulbState.color_temp, null, 2);
            Homey.log('TP Link smartbulb app - light temperature : ' + device.state.light_temperature);
            device.state.light_hue = bulbState.hue;
            Homey.log('TP Link smartbulb app - hue : ' + device.state.light_hue);
            device.state.light_saturation = bulbState.saturation;
            Homey.log('TP Link smartbulb app - saturation : ' + device.state.light_saturation);
            device.state.dim = bulbState.brightness;
            Homey.log('TP Link smartbulb app - brightness : ' + device.state.dim);
            Homey.log('TP Link smartbulb app - mode : ' + bulbState.mode);
            } else {
                Homey.log('TP Link smartbulb app - bulb off ');
                device.state.onoff = false;
            }
        });

// not sure which modes are available
//            device.state.mode = bulbState.dft_on_state.mode;
//            Homey.log('TP Link smartbulb app - mode : ' + device.state.mode);

/*             device.state.measure_power = parseFloat(JSON.stringify(data.emeter.get_realtime.power, null, 2));
            var total = parseFloat(JSON.stringify(data.emeter.get_realtime.total, null, 2));
            Homey.log('TP Link smartbulb app - total: ' + total);
            // for some reason the Kasa app does reset something, but not the total
            Homey.log('TP Link smartbulb app - totalOffset: ' + totalOffset);
            device.state.meter_power = total - totalOffset;
            Homey.log('TP Link smartbulb app - total - Offset: ' + device.state.meter_power);
        });

*/

        // update realtime data only in case it changed
        if (oldonoffState != device.state.onoff) {
            Homey.log("TP Link smartbulb app - capability power on: " + device.state.onoff);
            module.exports.realtime(device_data, 'onoff', device.state.onoff);
        }
//       if (oldpowerState != device.state.measure_power) {
//            Homey.log('TP Link smartbulb app - power changed: ' + device.state.measure_power);
//            module.exports.realtime(device_data, 'measure_power', device.state.measure_power);
//        }
//        if (oldtotalState != device.state.meter_power) {
//            Homey.log('TP Link smartbulb app - total changed: ' + device.state.meter_power);
//            module.exports.realtime(device_data, 'meter_power', device.state.meter_power);
//        }
        if (oldColorTemp != device.state.light_temperature) {
            Homey.log('TP Link smartbulb app - light temperature changed: ' + device.state.light_temperature);
            module.exports.realtime(device_data, 'light_temperature', device.state.light_temperature);
        }
        if (oldHue != device.state.light_hue) {
            Homey.log('TP Link smartbulb app - hue changed: ' + device.state.light_hue);
            module.exports.realtime(device_data, 'light_hue', device.state.light_hue);
        }
        if (oldSaturation != device.state.light_saturation) {
            Homey.log('TP Link smartbulb app - saturation changed: ' + device.state.light_saturation);
            module.exports.realtime(device_data, 'light_saturation', device.state.light_saturation);
        }
        if (oldBrightness != device.state.dim) {
            Homey.log('TP Link smartbulb app - brightness changed: ' + device.state.dim);
            module.exports.realtime(device_data, 'dim', device.state.dim);
        }
    } catch (err) {
        Homey.log("TP Link smartbulb app - caught error in getStatus function" + err.message);
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
        onoff: true
    };
    devices[device_data.id].state = {
        light_hue: {}
    };
    devices[device_data.id].state = {
        light_saturation: {}
    };
    devices[device_data.id].state = {
        dim: {}
    };
    devices[device_data.id].state = {
        light_temperature: {}
    };
    devices[device_data.id].data = device_data;
    bulb = client.getBulb({
        host: device_data.id
    });
    Homey.log('TP Link smartbulb app - bulb IP: ' + device_data.id);
}

// get driver name based on dirname (hs100, hs110, etc.)
function getDriverName() {
    var parts = __dirname.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1].split('.')[0];
}
