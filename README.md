# TP-Link Smart Plug and Bulb (WIFI) app for Athom Homey

This app lets you control TP-Link Smart Plugs HS100 (plug with no energy monitoring) HS110 (plug with energy monitoring) and Smart Bulbs LB100, LB110, LB120 and LB130 from within flows and the (mobile) app. The HS200 Smart Switch is as of yet untested but should work as well (please let me know ;-) 

Support for several other devices such as the HS115 mini plug and LB200 and LB230 bulbs can be added with little effort, let me know if you have one of these devices.

While it is probably a good idea to used fixed IP addresses for the TP Link devices, the app now also works when the IP addresses are dynamic. This option can be enabled in the settings.

This app is based on the following resources:

* The tplink-smarthome-api: https://github.com/plasticrake/tplink-smarthome-api
* https://github.com/ggeorgovassilis/linuxscripts/tree/master/tp-link-hs100-smartplug
* https://www.softscheck.com/en/reverse-engineering-tp-link-hs110 
* https://github.com/DaveGut/TP-Link-Bulbs  

Kudo's to Patrick Seal for the fantastic job on the TP Link smarthome API!

Supported flow triggers:

* Power / total power changed (HS110/HS200)
* On / off state changed
* Dim level changed (LB100/LB110/LB120/LB130)

Supported flow conditions:

* If on / off

Supported flow actions:

* Switch on / off
* Toggle on / off
* Switch LED on / off ('nightmode', HS100/HS110)
* reset power meter / undo reset power meter (HS110/HS200)
* Transition on / off ('wake-up light', LB100/LB110/LB120/LB130)
* Select mode ('circadian' or 'normal', LB120/LB130) 

Mobile capabilities:

* On/off
* Display power and energy usage (HS110/HS200)
* Dim (LB100/LB110/LB120/LB130
* Set light temperature (LB120/LB130)
* Set hue (LB130)

Energy monitoring has currently not been implemented for the bulbs (LB110 and up) as I am not sure anyone would use it. The selection of pre-sets for the LB130 is currently not supported in the API.

![](https://drive.google.com/uc?id=0B4QdLfQ7j41Jc3daMm9xSmsyUjg)
![](https://drive.google.com/uc?id=0B4QdLfQ7j41JY3N5Y2JNRWZRVmM)
![](https://drive.google.com/uc?id=0B4QdLfQ7j41Jbmd3eGpPVWQxa1k)

##### Donate: #####
If you like the app you can show your appreciation by posting it in the [forum],
and if you really like it you can donate. Bug reports and feature requests can also be placed on
the forum.

===============================================================================
