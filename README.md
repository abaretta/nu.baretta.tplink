# TP-Link Smart Plug and Bulb (WIFI) app for Athom Homey

This app lets you control TP-Link Smart Plugs HS100 (plug with no energy monitoring) HS110 (plug with energy monitoring) and Smart Bulbs LB100, LB110, LB120 and LB130 from within flows and the (mobile) app. The HS200 Smart Switch is as of yet untested but should work as well (please let me know ;-) The same goes for the HS115 mini plug, this should work with the HS110 driver.

In its current state, the app can auto-detect the IP address of the device when adding a device, however it currently cannot detect when it is changed. It is advised to set it up to have a fixed IP address or a 'static lease' from the DHCP server until this feature is added. 

This app is based on the following resources:

* The HS100 API: https://github.com/plasticrake/hs100-api
* https://github.com/ggeorgovassilis/linuxscripts/tree/master/tp-link-hs100-smartplug
* https://www.softscheck.com/en/reverse-engineering-tp-link-hs110 
* https://github.com/DaveGut/TP-Link-Bulbs  

NB: in a recent firmware update a change was made in the API which has broken the Homey app for these devices. The fix for this will be forthcoming in Q4 2018.

Supported flow triggers:

* Power / total power changed (HS110/HS200)
* On / off state changed

Supported flow conditions:

* If on / off

Supported flow actions:

* Switch on / off
* Toggle on / off
* Switch LED on / off ('nightmode', HS100/HS110)
* reset power meter / undo reset power meter (HS110/HS200)
* Transition on / off ('wake-up light', LB100/LB110/LB120/LB130)
* Select mode (LB130) 

Mobile capabilities:

* On/off
* Display power and energy usage (HS110/HS200)
* Dim (LB100/LB110/LB120/LB130
* Set light temperature (LB120/LB130)
* Set hue (LB130)
* Select mode (LB130)

Energy monitoring has currently not been implemented for the bulbs (LB110 and up) as I am not sure anyone would use it. The selection of pre-sets for the LB130 is currently not supported in the API.

![](https://drive.google.com/uc?id=0B4QdLfQ7j41Jc3daMm9xSmsyUjg)
![](https://drive.google.com/uc?id=0B4QdLfQ7j41JY3N5Y2JNRWZRVmM)
![](https://drive.google.com/uc?id=0B4QdLfQ7j41Jbmd3eGpPVWQxa1k)

##### Donate: #####
If you like the app you can show your appreciation by posting it in the [forum],
and if you really like it you can donate. Bug reports and feature requests can also be placed on
the forum.

===============================================================================

# Changelog

**Version 0.0.9**
- Added fix for emetering change in API (for HS110 and HS200)

**Version 0.0.8:**
- Bugfixes for bulbs, added app to 'lights' category.

**Version 0.0.7:**
- Bumping version number to workaround an app store issue...

**Version 0.0.6:**
- Changed name of the app to reflect the wider support for TP-Link devices.

**Version 0.0.5:**
- Added support for TP-Link light bulbs LB100, LB110, LB120 and LB130, including 'wake-up light' feature.

**Version 0.0.4:**
- Bugfixes. Added check on model type in autodiscovery. Autodiscovery can now detect both new and existing plugs.

**Version 0.0.3:**
- Bugfixes, added autodiscovery feature.

**Version 0.0.2:**
- Bugfixes, added capabilities.

**Version 0.0.1:**
- Initial version

[forum]: https://forum.athom.com/discussion/3234
[pp-donate-link]: https://www.paypal.me/Baretta
[pp-donate-image]: https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif

