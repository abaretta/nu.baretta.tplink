//"use strict";
const Homey = require('homey');
const {
    Client
} = require('tplink-smarthome-api');
const client = new Client();

//var oldonoffState = "";
var oldpowerState = "";
var oldtotalState = 0;
var totalOffset = 0
var oldvoltageState = 0;
var oldcurrentState = 0;
var reachable = 0;

class TPlinkPlugDevice extends Homey.Device {

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
        this.log('settings totalOffset: ', settings["totalOffset"])
        totalOffset = settings["totalOffset"];

        if (settings["deviceId"] === 'undefined') {
            try {
                this.plug = client.getPlug({
                    host: settings["settingIPAddress"]
                });
                this.plug.getSysInfo().then((info) => {
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

        this.pollDevice(interval);

        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('ledonoff', this.onCapabilityLedOnoff.bind(this));

        // flow conditions - default for "socket"

        // register flow card actions

        let ledOnAction = new Homey.FlowCardAction('ledOn');
        ledOnAction
            .register().registerRunListener((args, state) => {
                let settings = this.getSettings();
                let device = settings["settingIPAddress"];
                this.log("Flow card action ledOn ip " + device);
                this.ledOn(device);
                return Promise.resolve(true);
            });

        let ledOffAction = new Homey.FlowCardAction('ledOff');
        ledOffAction
            .register().registerRunListener((args, state) => {
                let settings = this.getSettings();
                let device = settings["settingIPAddress"];
                this.log("Flow card action ledOff args ");
                this.ledOff(device);
                return Promise.resolve(true);
            });

        let meterResetAction = new Homey.FlowCardAction('meter_reset');
        meterResetAction
            .register().registerRunListener((args, state) => {
                let settings = this.getSettings();
                let device = settings["settingIPAddress"];
                let totalOffset = settings["totalOffset"];
                this.log("Flow card reset meter");
                this.meter_reset(device);
                return Promise.resolve(true);
            });

        let undoMeterResetAction = new Homey.FlowCardAction('undo_meter_reset');
        undoMeterResetAction
            .register().registerRunListener((args, state) => {
                let settings = this.getSettings();
                let device = settings["settingIPAddress"];
                this.log("Flow card undo reset meter");
                this.undo_meter_reset(device);
                return Promise.resolve(true);
            });

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
        callback(null);
    }

    onCapabilityLedOnoff(value, opts, callback) {
        // ... set value to real device
        this.log("Capability called: onoff value: ", value);
        let settings = this.getSettings();
        let device = settings["settingIPAddress"];
        if (value) {
            this.LedOn(device);
        } else {
            this.LedOff(device);
        }
        // Then, emit a callback ( err, result )
        callback(null);
    }

    onActionLedOn(device) {
        this.log("Action called: ledOn");
        device.LedOn(device);
    }

    onActionLedOff(device) {
        this.log("Action called: ledOff");
        device.LedOff(device);
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
        this.plug.setLedState(true);
        this.setCapabilityValue('ledonoff', true);
    }

    ledOff(device) {
        this.log('Turning LED off ');
        this.plug = client.getPlug({
            host: device
        });
        this.plug.setLedState(false);
        this.setCapabilityValue('ledonoff', false);
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
        this.log("getStatus device: " + device);
        this.plug = client.getPlug({
            host: device
        });
        await this.plug.getInfo().then((data) => {
                //this.log("Data: ", JSON.stringify(data));

                //oldonoffState = this.getCapabilityValue('onoff');
                oldpowerState = this.getCapabilityValue('measure_power');
                oldtotalState = this.getCapabilityValue('meter_power');
                oldvoltageState = this.getCapabilityValue('measure_voltage');
                oldcurrentState = this.getCapabilityValue('measure_current');

                var total = data.emeter.realtime.total;
                var corrected_total = total - totalOffset;


                if (data.sysInfo.relay_state === 1) {
                    this.log('Relay state on ');
                    this.setCapabilityValue('onoff', true);
                } else {
                    this.log('Relay state off ');
                    this.setCapabilityValue('onoff', false);
                }

                // update realtime data only in case it changed

                if (oldtotalState != corrected_total) {
                    this.log("Total - Offset: " + corrected_total);
                    this.setCapabilityValue('meter_power', corrected_total);
                }
                /*
                if (oldonoffState != data.sysInfo.relay_state) {
                    this.log("Capability power on: " + data.sysInfo.relay_state);
                    this.log("typeof data.sysInfo.relay_state: " + typeof(data.sysInfo.relay_state));
                    this.setCapabilityValue('onoff', data.sysInfo.relay_state);
                } 
                */
                if (oldpowerState != data.emeter.realtime.power) {
                    this.log('Power changed: ' + data.emeter.realtime.power);
                    this.setCapabilityValue('measure_power', data.emeter.realtime.power);
                }
                if (oldvoltageState != data.emeter.realtime.voltage) {
                    this.log('Voltage changed: ' + data.emeter.realtime.voltage);
                    this.setCapabilityValue('measure_voltage', data.emeter.realtime.voltage);
                }
                if (oldcurrentState != data.emeter.realtime.current) {
                    this.log('Current changed: ' + data.emeter.realtime.current);
                    this.setCapabilityValue('measure_current', data.emeter.realtime.current);
                }
            })
            .catch((err) => {
                var errRegEx = new RegExp("EHOSTUNREACH", 'g')
                if (err.message.match(errRegEx)) {
                    this.log("Device unreachable");
                    reachable += 1;
                    if (reachable >= 3) {
                        this.log("Unreachable, starting autodiscovery");
                        this.discover();
                    }
                }
                this.log("Caught error in getStatus / getSysInfo function: " + err.message);
            });
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
        let settings = this.getSettings();
        // discover new plugs
        client.startDiscovery();
        client.on('plug-new', (plug) => {
            //logEvent('plug-new', plug);
            if (plug.deviceId == settings["deviceId"]) {
                this.setSettings({
                    settingIPAddress: plug.host
                }).catch(this.error);
                setTimeout(function () {
                    client.stopDiscovery()
                }, 1000);
                this.log("Discovered online plug: " + plug.deviceId);
                //callback(null, data);
            }
        })
        client.on('plug-online', (plug) => {
            //logEvent('plug-online', plug);
            if (plug.deviceId == settings["deviceId"]) {
                this.setSettings({
                    settingIPAddress: plug.host
                }).catch(this.error);
                setTimeout(function () {
                    client.stopDiscovery()
                }, 1000);
                this.log("Discovered online plug: " + plug.deviceId);
                //callback(null, data);
            }
        })
    }


}

module.exports = TPlinkPlugDevice;