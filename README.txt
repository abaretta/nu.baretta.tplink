TP-Link Smart Plug and Bulb (WIFI) app for Athom Homey

This app lets you control TP-Link Smart Plugs HS100 (plug with no energy monitoring) HS110 (plug with energy monitoring) and Smart Bulbs LB100, LB110, LB120 and LB130 from within flows and the (mobile) app. The HS200 Smart Switch is as of yet untested but should work as well (please let me know ;-) 

Support for several other devices such as the HS115 mini plug and LB200 and LB230 bulbs can be added with little effort, let me know if you have one of these devices.

Usage note:
Use fixed IP addresses for the TP Link devices by reserving IP addresses in the DHCP server for each device if you can. In case this is not possible, enable the option to use dynamic IP addresses in the settings. The app will then attempt to rediscover the device each time the IP address has changed.

Supported flow triggers:

- Power / total power changed (HS110/HS200)
- On / off state changed
- Dim level changed (LB100/LB110/LB120/LB130)

Supported flow conditions:

- If on / off

Supported flow actions:

- Switch on / off
- Toggle on / off
- Switch LED on / off ('nightmode', HS100/HS110)
- reset power meter / undo reset power meter (HS110/HS200)
- Transition on / off ('wake-up light', LB100/LB110/LB120/LB130)
- Select mode ('circadian' or 'normal', LB120/LB130) 

Mobile capabilities:

- On/off
- Display power and energy usage (HS110/HS200)
- Dim (LB100/LB110/LB120/LB130
- Set light temperature (LB120/LB130)
* Set hue (LB130)

This app is based on the following resources:

- The tplink-smarthome-api: https://github.com/plasticrake/tplink-smarthome-api
- https://github.com/ggeorgovassilis/linuxscripts/tree/master/tp-link-hs100-smartplug
- https://www.softscheck.com/en/reverse-engineering-tp-link-hs110 
- https://github.com/DaveGut/TP-Link-Bulbs  

Kudo's to Patrick Seal for the fantastic job on the TP Link smarthome API!

