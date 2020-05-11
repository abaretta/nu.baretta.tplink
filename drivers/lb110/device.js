"use strict";
const Homey = require('homey');
const {
    Client
} = require('tplink-smarthome-api');
const client = new Client();
var oldColorTemp = "";
var oldHue = "";
var oldSaturation = "";
var oldBrightness = "";
var unreachableCount = 0;
var discoverCount = 0;

// mode: enum: color, temperature
const mode = {
    color: 'color',
    temperature: 'temperature'
}
var oldMode = mode.color;

// get driver name based on dirname (hs100, hs110, etc.)
function getDriverName() {
    var parts = __dirname.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1].split('.')[0];
}

var TPlinkModel = getDriverName().toUpperCase();

// Kelvin (LB120:2700-6500 LB130:2500-9000)
if (TPlinkModel == "LB120") {
    var kelvinLow = 2700;
    var kelvinHigh = 6500
} else {
    var kelvinLow = 2500;
    var kelvinHigh = 9000
}

var options = {};

class TPlinkBulbDevice extends Homey.Device {

    onInit() {
        var interval = 10;

        this.log('device init');
        //        console.dir(this.getSettings()); // for debugging
        //        console.dir(this.getData()); // for debugging
        let settings = this.getSettings();
        let id = this.getData().id;
        this.log('id: ', id);
        this.log('name: ', this.getName());
        this.log('class: ', this.getClass());
        this.log('settings IP address: ', settings["settingIPAddress"])
        //this.log('settings totalOffset: ', settings["totalOffset"])
        //totalOffset = settings["totalOffset"];

        // in case the device was not paired with a version including the dynamicIp setting, set it to false
        if ((settings["dynamicIp"] != undefined) && (typeof (settings["dynamicIp"]) === 'boolean')) {
            this.log("dynamicIp is defined: " + settings["dynamicIp"])
        } else {
            this.setSettings({
                dynamicIp: false
            }).catch(this.error);
        }

        this.pollDevice(interval);

        // Capabilities: "measure_power", "meter_power""
        //"onoff", "dim", "light_hue", "light_saturation","light_mode","light_temperature"
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
        this.registerCapabilityListener('light_hue', this.onCapabilityHue.bind(this));
        this.registerCapabilityListener('light_saturation', this.onCapabilitySaturation.bind(this));
        this.registerCapabilityListener('light_temperature', this.onCapabilityTemperature.bind(this));
        this.registerCapabilityListener('light_mode', this.onCapabilityMode.bind(this));

        // flow conditions

        // register flow card actions

        let circadianModeOn = new Homey.FlowCardAction('circadianModeOn');
        circadianModeOn
            .register().registerRunListener(async (args, state) => {
                let settings = await args.device.getSettings();
                let device = settings["settingIPAddress"];
                this.log("Flow card action circadianModeOn ip: " + device);
                this.circadianModeOn(device);
                return Promise.resolve(true);
            });

        let circadianModeOff = new Homey.FlowCardAction('circadianModeOff');
        circadianModeOff
            .register().registerRunListener(async (args, state) => {
                let settings = await args.device.getSettings();
                let device = settings["settingIPAddress"];
                this.log("Flow card action circadianModeOff ip: " + device);
                this.circadianModeOff(device);
                return Promise.resolve(true);
            });

        let transitionOn = new Homey.FlowCardAction('transitionOn');
        transitionOn
            .register().registerRunListener(async (args, state) => {
                var transition = args.transition * 1000;
                let settings = await args.device.getSettings();
                let device = settings["settingIPAddress"];
                this.log("Flow card action transitionOn ip: " + device);
                this.onTransition(device, transition);
                return Promise.resolve(true);
            });

        let transitionOff = new Homey.FlowCardAction('transitionOff');
        transitionOff
            .register().registerRunListener(async (args, state) => {
                var transition = args.transition * 1000;
                let settings = await args.device.getSettings();
                let device = settings["settingIPAddress"];
                this.log("Flow card action transitionOff ip: " + device);
                this.offTransition(device, transition);
                return Promise.resolve(true);
            });

        /*
        let meterResetAction = new Homey.FlowCardAction('meter_reset');
        meterResetAction
            .register().registerRunListener(async (args, state) => {
                let settings = await args.device.getSettings();
                let device = settings["settingIPAddress"];
                let totalOffset = settings["totalOffset"];
                this.log("Flow card reset meter");
                this.meter_reset(device);
                return Promise.resolve(true);
            });

        let undoMeterResetAction = new Homey.FlowCardAction('undo_meter_reset');
        undoMeterResetAction
            .register().registerRunListener(async (args, state) => {
                let settings = this.getSettings();
                let device = settings["settingIPAddress"];
                this.log("Flow card undo reset meter");
                this.undo_meter_reset(device);
                return Promise.resolve(true);
            }); */

    } // end onInit

    onAdded() {
        let id = this.getData().id;
        this.log("Device added: " + id);
        var interval = 10;
        this.pollDevice(interval);
    }

    // this method is called when the Device is deleted
    onDeleted() {
        let id = this.getData().id;
        this.log('device deleted: ', id);
        clearInterval(this.pollingInterval);
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff(value, opts, callback) {
        // ... set value to real device
        this.log("Capability called: onoff value: ", value);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        if (value) {
            this.powerOn(device);
        } else {
            this.powerOff(device);
        }
        // Then, emit a callback ( err, result )
        callback(null, true);
    }

    onCapabilityDim(value, opts, callback) {
        // ... set value to real device
        this.log("Capability called: dim value: ", value);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        // name: 'brightness', type: 'num', max: 100, min: 5, step: 1
        var dimLevel = Math.round((value * 100));
        if (dimLevel >= 100) {
            dimLevel = 100;
        }
        if (dimLevel <= 5) {
            dimLevel = 5;
        }
        this.log('Setting brightness ' + device + ' to ' + dimLevel);
        this.dim(device, dimLevel);
        this.setCapabilityValue('dim', value)
            .catch(this.error);
        // Then, emit a callback ( err, result )
        callback(null, value);
    }

    onCapabilityHue(value, opts, callback) {
        // ... set value to real device
        this.log("Capability called: hue value: ", value);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        // name: 'hue', type: 'num', max: 360, min: 0, step: 1
        // FIXME: minimum is 3.6 instead of 0
        var hueLevel = Math.round((value) * 360);
        if (hueLevel >= 360) {
            hueLevel = 360;
        }
        if (hueLevel <= 0) {
            hueLevel = 0;
        }
        this.log('Setting hue level of ' + device + ' to ' + hueLevel);
        this.set_hue(device, hueLevel);
        this.setCapabilityValue('light_hue', value)
            .catch(this.error);
        // Then, emit a callback ( err, result )
        callback(null, value);
    }

    onCapabilitySaturation(value, opts, callback) {
        // ... set value to real device
        this.log("Capability called: saturation value: ", value);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        // name: 'saturation', type: 'num', max: 100, min: 0, step: 1
        var saturationLevel = Math.round((value * 100));
        if (saturationLevel >= 100) {
            saturationLevel = 100;
        }
        if (saturationLevel <= 0) {
            saturationLevel = 0;
        }
        this.log('Setting light saturation of ' + device + ' to ' + saturationLevel);
        this.set_saturation(device, saturationLevel);
        this.setCapabilityValue('light_saturation', value)
            .catch(this.error);
        // Then, emit a callback ( err, result )
        callback(null, value);
    }

    onCapabilityTemperature(value, opts, callback) {
        // ... set value to real device
        this.log("Capability called: light temperature value: ", value);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        // name: 'color_temp', type: 'num', max: kelvinHigh, min: kelvinLow, step: 1
        if (value == 0) {
            var tempLevel = value;
        } else {
            var tempLevel = Math.round(((1 - value) * (kelvinHigh - kelvinLow) + kelvinLow));
            if (tempLevel >= kelvinHigh) {
                tempLevel = kelvinHigh;
            }
            if (tempLevel <= kelvinLow) {
                tempLevel = kelvinLow;
            }
            this.log('Setting light temperature of ' + device + ' to ' + tempLevel);
            this.color_temp(device, tempLevel);
            this.setCapabilityValue('light_temperature', value)
                .catch(this.error);
            // Then, emit a callback ( err, result )
            callback(null, value);
        }
    }

    onCapabilityMode(value, opts, callback) {
        // ... set value to real device
        this.log("Capability called: mode value: ", value);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        this.log('Setting light mode of ' + device + ' to ' + value);
        //   Someone touched one of the 'mode' icons: turn on device
        this.powerOn(device);
        this.setCapabilityValue('light_mode', value)
            .catch(this.error);
        // Then, emit a callback ( err, result )
        callback(null, value);
    }

    // start functions
    onSettings(settings, newSettingsObj, changedKeysArr, callback) {
        try {
            for (var i = 0; i < changedKeysArr.length; i++) {
                switch (changedKeysArr[i]) {
                    case 'settingIPAddress':
                        this.log('IP address changed to ' + newSettingsObj.settingIPAddress);
                        settings.settingIPAddress = newSettingsObj.settingIPAddress;
                        break;

                    default:
                        this.log("Key not matched: " + i);
                        break;
                }
            }
            callback(null, true)
        } catch (error) {
            callback(error, null)
        }
    }


    powerOn(device) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": 300,
            "on_off": 1
        }
        this.bulb.lighting.setLightState(options);
    }

    powerOff(device) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": 1000,
            "on_off": 0
        }
        this.bulb.lighting.setLightState(options);
    }

    dim(device, dimLevel) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": 30,
            "brightness": dimLevel
        }
        this.bulb.lighting.setLightState(options);
    }

    color_temp(device, tempLevel) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": 30,
            "color_temp": tempLevel
        }
        this.bulb.lighting.setLightState(options);
    }

    set_hue(device, hueLevel) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": 30,
            "hue": hueLevel,
            "color_temp": 0
        }
        this.bulb.lighting.setLightState(options);
    }

    set_saturation(device, saturationLevel) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": 30,
            "saturation": saturationLevel,
        }
        this.bulb.lighting.setLightState(options);
    }

    getPower(device) {
        this.bulb = client.getBulb({
            host: device
        });
        this.bulb.getSysInfo().then((sysInfo) => {
            if (sysInfo.relay_state === 1) {
                Homey.log('TP Link smartbulb app - light is on ');
                callback(null, true);
            } else {
                Homey.log('TP Link smartbulb app - light is off ');
                callback(null, false);
            }
        });
    }

    // mode 'normal', 'circadian'
    circadianModeOn(device) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": 100,
            "mode": "circadian"
        }
        this.bulb.lighting.setLightState(options);
    }

    circadianModeOff(device) {
        this.log('CircadionModeOn device: ' + device.id);
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": 100,
            "mode": "normal",
            "brightness": 100
        }
        this.bulb.lighting.setLightState(options);
    }

    onTransition(device, transition) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": transition,
            "on_off": 1,
            "brightness": 100
        }
        this.bulb.lighting.setLightState(options);
    }

    offTransition(device, transition) {
        this.bulb = client.getBulb({
            host: device
        });
        options = {
            "transition_period": transition,
            "on_off": 0
        }
        this.bulb.lighting.setLightState(options);
    }

    getInfo(device) {
        this.bulb = client.getBulb({
            host: device
        });
        this.bulb.getInfo().then(this.log);
    }

    /*
    getPower(device) {
        this.bulb = client.getBulb({
            host: device
        });
        this.bulb.getSysInfo().then((sysInfo) => {
                if (sysInfo.relay_state === 1) {
                    this.log('Relay state on ');
                    callback(null, true);
                } else {
                    this.log('Relay state off ');
                    callback(null, false);
                }
            })
            .catch((err) => {
                this.log("Caught error in getPower function: " + err.message);
            });
    }

    meter_reset(device) {
        this.log('Reset meter ');
        this.bulb = client.getBulb({
            host: device
        });
        // reset meter for counters in Kasa app. Does not actually clear the total counter though...
        // this.bulb.emeter.eraseStats(null);
        this.log('Setting totalOffset to oldtotalState: ' + oldtotalState);
        totalOffset = oldtotalState;
        this.setSettings({
            totalOffset: totalOffset
        }).catch(this.error);
    }

    undo_meter_reset(device) {
        this.log('Undo reset meter, setting totalOffset to 0 ');
        // reset meter for counters in Kasa app. Does not actually clear the total counter though...
        totalOffset = 0;
        this.setSettings({
            totalOffset: totalOffset
        }).catch(this.error);
    }
*/

    async getStatus() {
        let settings = this.getSettings();
        let device = settings.settingIPAddress;
        let deviceId = settings.deviceId;
        this.log("getStatus device: " + device);
        //this.log("DeviceId device: " + deviceId);

        try {
            this.bulb = await client.getBulb({
                host: device
            });

            if (settings["deviceId"] === undefined) {
                try {
                    this.bulb.getSysInfo().then((info) => {
                        this.log("Fetched bulb deviceId: " + info.deviceId);
                        this.setSettings({
                            deviceId: info.deviceId
                        }).catch(this.error);
                    }).catch(this.error)
                } catch (err) {
                    this.log("Caught error in setting deviceId: " + err.message);
                }
            } else {
                this.log("DeviceId: " + settings["deviceId"])
            }

            oldColorTemp = this.getCapabilityValue('light_temperature');
            oldHue = this.getCapabilityValue('light_hue');
            oldSaturation = this.getCapabilityValue('light_saturation');
            oldBrightness = this.getCapabilityValue('dim');
            oldMode = mode[this.getCapabilityValue('light_mode')];

            await this.bulb.lighting.getLightState().then((bulbState) => {
                    this.log('getLightState: ' + JSON.stringify(bulbState));
                    if (bulbState.on_off === 1) {
                        this.log('TP Link smartbulb app - bulb on ');
                        this.setCapabilityValue('onoff', true)
                            .catch(this.error);

                        // bulbState mode: circadian or normal. Only for LB130 and LB120
                        if ((TPlinkModel == "LB130") || (TPlinkModel == "LB120")) {
                            if (bulbState.mode == "normal") {
                                this.log('Bulb state: normal');
                            } else
                            if (bulbState.mode == "circadian") {
                                this.log('Bulb state: circadian');
                            }

                            if (bulbState.color_temp == 0) {
                                var new_light_temperature = 0
                            } else {
                                var new_light_temperature = this.round(1 - ((bulbState.color_temp - kelvinLow) / (kelvinHigh - kelvinLow)), 2);
                            }

                            if (oldColorTemp != new_light_temperature) {
                                this.log('ColorTemp changed: ' + new_light_temperature);
                                this.setCapabilityValue('light_temperature', new_light_temperature)
                                    .catch(this.error);
                            }
                            if (oldSaturation != bulbState.saturation / 100) {
                                this.log('Saturation changed: ' + bulbState.saturation);
                                this.setCapabilityValue('light_saturation', bulbState.saturation / 100)
                                    .catch(this.error);
                            }
                        }

                        if (TPlinkModel == "LB130") {
                            if (oldHue != this.round((bulbState.hue / 360), 2)) {
                                this.log('Hue changed: ' + this.round((bulbState.hue / 360), 2));
                                this.setCapabilityValue('light_hue', this.round((bulbState.hue / 360), 2))
                                    .catch(this.error);
                            }
                        }

                        if (oldBrightness != bulbState.brightness / 100) {
                            this.log('Brightness changed: ' + bulbState.brightness / 100);
                            this.setCapabilityValue('dim', bulbState.brightness / 100)
                                .catch(this.error);
                        }

                        if (oldMode != this.getCapabilityValue('light_mode')) {
                            this.log('Light_mode changed: ' + this.getCapabilityValue('light_mode'));
                        }

                    } else if (bulbState.on_off === 0) {
                        this.log('Bulb off ');
                        this.setCapabilityValue('onoff', false)
                            .catch(this.error);
                    } else {
                        this.log("BulbState.on_off undefined")
                    }
                })
                .catch((err) => {
                    var errRegEx = new RegExp("EHOSTUNREACH", 'g')
                    if (err.message.match(errRegEx)) {
                        unreachableCount += 1;
                        this.log("Device unreachable. Unreachable count: " + unreachableCount + " Discover count: " + discoverCount + " DynamicIP option: " + settings["dynamicIp"]);

                        if ((unreachableCount >= 3) && settings["dynamicIp"] && (discoverCount < 10)) {
                            this.setUnavailable("Device offline");
                            discoverCount += 1;
                            this.log("Unreachable, starting autodiscovery");
                            this.discover();
                        }
                    }
                    this.log("Caught error in getStatus / getSysInfo function: " + err.message);
                });
        } catch (err) {
            this.log("Caught error in getStatus function: " + err.message);
        }
    }

    pollDevice(interval) {
        clearInterval(this.pollingInterval);

        this.pollingInterval = setInterval(() => {
            // poll status
            try {
                this.getStatus();
            } catch (err) {
                this.log("Error: " + err.message)
            }
        }, 1000 * interval);
    }

    round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    discover() {
        // TODO: rewrite with API's discovery options (timeout, excluded MAC addresses, interval)
        let settings = this.getSettings();
        // discover new bulbs
        client.startDiscovery();
        client.on('bulb-new', (bulb) => {
            if (bulb.deviceId == settings["deviceId"]) {
                this.setSettings({
                    settingIPAddress: bulb.host
                }).catch(this.error);
                setTimeout(function () {
                    client.stopDiscovery()
                }, 1000);
                this.log("Discovered online bulb: " + bulb.deviceId);
                this.log("Resetting unreachable count to 0");
                unreachableCount = 0;
                discoverCount = 0;
                this.setAvailable();
            }
        })
        client.on('bulb-online', (bulb) => {
            if (bulb.deviceId == settings["deviceId"]) {
                this.setSettings({
                    settingIPAddress: bulb.host
                }).catch(this.error);
                setTimeout(function () {
                    client.stopDiscovery()
                }, 1000);
                this.log("Discovered online bulb: " + bulb.deviceId);
                this.log("Resetting unreachable count to 0");
                unreachableCount = 0;
                discoverCount = 0;
                this.setAvailable();
            }
        })
    }

}

module.exports = TPlinkBulbDevice;
