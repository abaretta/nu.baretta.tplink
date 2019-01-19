"use strict";
// need Homey module, see SDK Guidelines
const Homey = require('homey');

const {
    Client
} = require('tplink-smarthome-api');
const client = new Client();

// get driver name based on dirname (hs100, hs110, etc.)
function getDriverName() {
    var parts = __dirname.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1].split('.')[0];
}
var TPlinkModel = getDriverName().toUpperCase();
var myRegEx = new RegExp(TPlinkModel, 'g');
//var devIds = {};
var logEvent = function (eventName, bulb) {
    //this.log(`${(new Date()).toISOString()} ${eventName} ${bulb.model} ${bulb.host} ${bulb.deviceId}`);
    console.log(`${(new Date()).toISOString()} ${eventName} ${bulb.model} ${bulb.host}`);
};

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

class TPlinkBulbDriver extends Homey.Driver {

    onPair(socket) {
        // socket is a direct channel to the front-end
        var devIds = {};

        try {
            Object.values(this.getDevices()).forEach(device => {
                this.log(device.bulb._sysInfo.deviceId);
                devIds[device.bulb._sysInfo.deviceId] = "";
            })
            this.log(devIds);
        } catch (err) {
            this.log(err);
        }

        var id = guid();
        let devices = [{
            "data": {
                "id": id
            },
            "name": "initial_name",
            "settings": {
                "settingIPAddress": "0.0.0.0",
                "totalOffset": 0
            } // initial settings
        }];

        // discover function
        socket.on('discover', (data, callback) => {
            this.log('TP Link smartbulb app - Starting Bulb Discovery');

            // discover new bulbs
            client.startDiscovery();
            client.on('bulb-new', (bulb) => {
                logEvent('bulb-new', bulb);

                if (bulb.model.match(myRegEx)) {
                    // check if device is known
                    if (devIds.hasOwnProperty(bulb.deviceId)) {
                        this.log("Key found in devices: " + JSON.stringify(devIds));
                        this.log("TP Link smartbulb app - device " + bulb.host + " is known, skipping. Model: " + bulb.model + " name " + bulb.name + " mac " + bulb.mac + " id " + bulb.deviceId);
                    } else {
                        this.log("TP Link smartbulb app - bulb found: " + bulb.host + " model " + bulb.model + " name " + bulb.name + " mac " + bulb.mac + " id " + bulb.deviceId);

                        var data = {
                            ip: bulb.host,
                            name: bulb.name
                        }
                        socket.emit('found', data);
                        setTimeout(function () {
                            client.stopDiscovery()
                        }, 1000);
                        this.log("TP Link smartbulb app - discovered new bulb: " + data.id + " name " + data.name);
                        callback(null, data);
                    }
                }
            })
            client.on('bulb-online', (bulb) => {
                logEvent('bulb-online', bulb);
                if (bulb.model.match(myRegEx)) {
                    if (devIds.hasOwnProperty(bulb.deviceId)) {
                        this.log("Key found in devices: " + JSON.stringify(devIds));
                        this.log("TP Link smartbulb app - device " + bulb.host + " is known, skipping. Model: " + bulb.model + " name " + bulb.name + " mac " + bulb.mac + " id " + bulb.deviceId);
                    } else {
                        this.log("TP Link smartbulb app - online bulb found: " + bulb.host + " model " + bulb.model + " name " + bulb.name + " mac " + bulb.mac + " id " + bulb.deviceId);

                        var data = {
                            ip: bulb.host,
                            name: bulb.name
                        }
                        socket.emit('found', data);
                        setTimeout(function () {
                            client.stopDiscovery()
                        }, 1000);
                        this.log("TP Link smartbulb app - discovered online bulb: " + data.name);
                        callback(null, data);
                    }
                }
            })
        });

        // this is called when the user presses save settings button in start.html
        socket.on('get_devices', (data, callback) => {
            this.log("TP Link smartbulb app - get_devices data: " + JSON.stringify(data));
            devices = [{
                data: {
                    id: id
                },
                name: data.deviceName,
                settings: {
                    "settingIPAddress": data.ipaddress,
                    "totalOffset": 0
                } // initial settings
            }];

            // Set passed pair settings in variables
            this.log("TP Link smartbulb app - got get_devices from front-end, IP =", data.ipaddress, " Name = ", data.deviceName);
            socket.emit('continue', null);

            // this method is run when Homey.emit('list_devices') is run on the front-end
            // which happens when you use the template `list_devices`

            socket.on('list_devices', (data, callback) => {

                this.log("TP Link smartbulb app - list_devices data: " + JSON.stringify(data));

                callback(null, devices);
            });
        });

        socket.on('disconnect', () => {
            this.log("TP Link smartbulb app - Pairing is finished (done or aborted)");
        })
    }
}

module.exports = TPlinkBulbDriver;