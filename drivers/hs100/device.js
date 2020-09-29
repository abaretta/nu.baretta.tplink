//"use strict";
const Homey = require('homey');
const {
    Client
} = require('tplink-smarthome-api');
const client = new Client();

var oldpowerState = "";
var oldtotalState = 0;
var totalOffset = 0;
var oldvoltageState = 0;
var oldcurrentState = 0;
var unreachableCount = 0;
var discoverCount = 0;
var util = require('util')

class TPlinkPlugDevice extends Homey.Device {

    onInit() {
        this.log('device init');
        let device = this;
        var interval = 10;

        // console.dir(this.getSettings()); // for debugging
        // console.dir(this.getData()); // for debugging
        let settings = this.getSettings();
        let id = this.getData().id;
        let TPlinkModel = this.getDriver().id.toUpperCase();
        this.log('id: ', id);
        this.log('name: ', this.getName());
        this.log('class: ', this.getClass());
        this.log('settings IP address: ', settings["settingIPAddress"])
        this.log('Driver ID: ', TPlinkModel);

        // in case the device was not paired with a version including the dynamicIp setting, set it to false
        if ((settings["dynamicIp"] != undefined) && (typeof (settings["dynamicIp"]) === 'boolean')) {
            this.log("dynamicIp is defined: " + settings["dynamicIp"])
        } else {
            this.setSettings({
                dynamicIp: false
            }).catch(this.error);
        }

        this.log('settings totalOffset: ', settings["totalOffset"])
        totalOffset = settings["totalOffset"];

        this.pollDevice(interval);

        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        // actually quite useless to have the 'ledonoff' function in the mobile interface...
        this.registerCapabilityListener('ledonoff', this.onCapabilityLedOnoff.bind(this));

        // flow conditions - default for "socket"

        // register flow card actions

        let ledOnAction = new Homey.FlowCardAction('ledOn');
        ledOnAction
            .register().registerRunListener(async (args) => {
                let settings = await args.device.getSettings();
                let ip_device = settings["settingIPAddress"];
                this.log("Flow card action ledOff ip " + ip_device );
                this.ledOn(ip_device);
                return Promise.resolve(true);
            });

        let ledOffAction = new Homey.FlowCardAction('ledOff');
        ledOffAction
            .register().registerRunListener(async (args) => {
                let settings = await args.device.getSettings();
                let ip_device = settings["settingIPAddress"];
                this.log("Flow card action ledOff ip " + ip_device );
                this.ledOff(ip_device);
                return Promise.resolve(true);
            });

        let meterResetAction = new Homey.FlowCardAction('meter_reset');
        meterResetAction
            .register().registerRunListener(async (args, state) => {
                let settings = await args.device.getSettings();
                let ip_device = settings["settingIPAddress"];
                let totalOffset = settings["totalOffset"];
                this.log("Flow card reset meter" + ip_device);
                this.meter_reset(ip_device);
                return Promise.resolve(true);
            });

        let undoMeterResetAction = new Homey.FlowCardAction('undo_meter_reset');
        undoMeterResetAction
            .register().registerRunListener(async (args) => {
                let settings = await args.device.getSettings();
                let ip_device = settings["settingIPAddress"];
                this.log("Flow card undo reset meter" + ip_device);
                this.undo_meter_reset(ip_device);
                return Promise.resolve(true);
            });

    } // end onInit

    onAdded() {
        let id = this.getData().id;
        this.log("Device added: " + id);
        let settings = this.getSettings();
        var interval = 10;

        this.pollDevice(interval);
    }

    // this method is called when the Device is deleted
    onDeleted() {
        let id = this.getData().id;
        this.log("Device deleted: " + id);
        clearInterval(this.pollingInterval);
    }

    // this method is called when the Device has requested a state change (turned on or off)
    async onCapabilityOnoff(value, opts, callback) {
        // ... set value to real device
        this.log("Capability called: onoff value: ", value);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        if (value) {
            await this.powerOn(device);
        } else {
            await this.powerOff(device);
        }
        // Then, emit a callback ( err, result )
        callback(null);
    }

    async onCapabilityLedOnoff(value, opts, callback) {
        this.log("Capability called: LED onoff value: ", value);
        this.log("Capability called: opts", opts);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        if (value) {
            await this.ledOn(device);
        } else {
            await this.ledOff(device);
        }
        // Then, emit a callback ( err, result )
        callback(null);
    }

    // start functions
    onSettings(settings, newSettingsObj, changedKeysArr, callback) {
        try {
            for (var i = 0; i < changedKeysArr.length; i++) {
                this.log("Key: " + changedKeysArr[i]);
                switch (changedKeysArr[i]) {
                    case 'settingIPAddress':
                        this.log('IP address changed to ' + newSettingsObj.settingIPAddress);
                        settings.settingIPAddress = newSettingsObj.settingIPAddress;
                        break;

                    case 'dynamicIp':
                        this.log('DynamicIp option changed to ' + newSettingsObj.dynamicIp);
                        settings.dynamicIp = newSettingsObj.dynamicIp;
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
        this.log('Turning device on ' + device);
        this.plug = client.getPlug({
            host: device
        });
        this.plug.setPowerState(true);
    }

    powerOff(device) {
        this.log('Turning device off ');
        this.plug = client.getPlug({
            host: device
        });
        this.plug.setPowerState(false);
    }

    getPower(device) {
        this.plug = client.getPlug({
            host: device
        });
        this.plug.getSysInfo().then((sysInfo) => {
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

    getLed(device) {
        this.plug = client.getPlug({
            host: device
        });
        this.plug.getSysInfo().then((sysInfo) => {
                if (sysInfo.led_off === 0) {
                    this.log('LED on ');
                    return true;
                } else {
                    this.log('LED off ');
                    return false;
                }
            })
            .catch((err) => {
                this.log("Caught error in getLed function: " + err.message);
            });

    }

    ledOn(device) {
        this.log('Turning LED on ');
        this.plug = client.getPlug({
            host: device
        });
        this.plug.setLedState(true)
            .catch(this.error);
        this.setCapabilityValue('ledonoff', true)
            .catch(this.error);
    }

    ledOff(device) {
        this.log('Turning LED off ');
        this.plug = client.getPlug({
            host: device
        });
        this.plug.setLedState(false)
            .catch(this.error);
        this.setCapabilityValue('ledonoff', false)
            .catch(this.error);
    }

    meter_reset(device) {
        this.log('Reset meter ');
        this.plug = client.getPlug({
            host: device
        });
        // reset meter for counters in Kasa app. Does not actually clear the total counter though...
        // this.plug.emeter.eraseStats(null);
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

    async getStatus() {
        let settings = this.getSettings();
        let device = settings.settingIPAddress;
        let TPlinkModel = this.getDriver().id.toUpperCase();
        this.log("getStatus device: " + device);

        try {
            this.plug = await client.getPlug({
                host: device
            });

            await this.plug.getInfo().then((data) => {
                    //this.log("DeviceID: " + settings["deviceId"]);
                    //this.log("GetStatus data.sysInfo.deviceId: " + data.sysInfo.deviceId);

                    if (settings["deviceId"] === undefined) {
                        this.setSettings({
                            deviceId: data.sysInfo.deviceId
                        }).catch(this.error);
                        this.log("DeviceId added: " + settings["deviceId"])
                    }

                    if (TPlinkModel != "HS100") {
                        oldpowerState = this.getCapabilityValue('measure_power');
                        oldtotalState = this.getCapabilityValue('meter_power');
                        oldvoltageState = this.getCapabilityValue('measure_voltage');
                        oldcurrentState = this.getCapabilityValue('measure_current');

                        var total = data.emeter.realtime.total;
                        var corrected_total = total - totalOffset;
                    }

                    if (data.sysInfo.relay_state === 1) {
                        this.log('Relay state on ');
                        this.setCapabilityValue('onoff', true)
                            .catch(this.error);
                    } else {
                        this.log('Relay state off ');
                        this.setCapabilityValue('onoff', false)
                            .catch(this.error);
                    }

                    // update realtime data only in case it changed
                    if (TPlinkModel != "HS100") {
                        if (oldtotalState != corrected_total) {
                            this.log("Total - Offset: " + corrected_total);
                            this.setCapabilityValue('meter_power', corrected_total)
                                .catch(this.error);
                        }

                        if (oldpowerState != data.emeter.realtime.power) {
                            this.log('Power changed: ' + data.emeter.realtime.power);
                            this.setCapabilityValue('measure_power', data.emeter.realtime.power)
                                .catch(this.error);
                        }
                        if (oldvoltageState != data.emeter.realtime.voltage) {
                            this.log('Voltage changed: ' + data.emeter.realtime.voltage);
                            this.setCapabilityValue('measure_voltage', data.emeter.realtime.voltage)
                                .catch(this.error);
                        }
                        if (oldcurrentState != data.emeter.realtime.current) {
                            this.log('Current changed: ' + data.emeter.realtime.current);
                            this.setCapabilityValue('measure_current', data.emeter.realtime.current)
                                .catch(this.error);
                        }
                    }
                })
                .catch((err) => {
                    var errRegEx = new RegExp("EHOSTUNREACH", 'g')
                    if (err.message.match(errRegEx)) {
                        unreachableCount += 1;
                        this.log("Device unreachable. Unreachable count: " + unreachableCount + " Discover count: " + discoverCount + " DynamicIP option: " + settings["dynamicIp"]);

                        // attempt autodiscovery once every hour
                        if ((unreachableCount % 360 == 3) && settings["dynamicIp"]) {
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

    discover() {
        // TODO: rewrite with API's discovery options (timeout, excluded MAC addresses, interval)
        let settings = this.getSettings();
        var discoveryOptions = {
            deviceTypes: 'plug',
            discoveryInterval: 10000,
            discoveryTimeout: 5000,
            offlineTolerance: 3
        }
        // discover new plugs
        client.startDiscovery(discoveryOptions);
        client.on('plug-new', (plug) => {
            this.log("Settings deviceId: " + settings["deviceId"]);
            this.log("Host: " + plug.host + " deviceId: " + plug.deviceId);
            if (plug.deviceId == settings["deviceId"]) {
                this.setSettings({
                    settingIPAddress: plug.host
                }).catch(this.error);
                setTimeout(function () {
                    client.stopDiscovery()
                }, 1000);
                this.log("Discovered online plug: " + plug.deviceId);
                this.log("Resetting unreachable count to 0");
                unreachableCount = 0;
                discoverCount = 0;
                this.setAvailable();
            }
        })
        client.on('plug-online', (plug) => {
            this.log("Settings deviceId: " + settings["deviceId"]);
            this.log("Host: " + plug.host + " deviceId: " + plug.deviceId);
            if (plug.deviceId == settings["deviceId"]) {
                this.setSettings({
                    settingIPAddress: plug.host
                }).catch(this.error);
                setTimeout(function () {
                    client.stopDiscovery()
                }, 1000);
                this.log("Discovered online plug: " + plug.deviceId);
                this.log("Resetting unreachable count to 0");
                unreachableCount = 0;
                discoverCount = 0;
                this.setAvailable();
            }
        })
    }
}

module.exports = TPlinkPlugDevice;