# TP Link HS100/HS110/HS200 IP control app for Athom Homey

This app lets you control a TP Link HS100 (wallplug without energy monitoring), HS110 (wallplug with energy monitoring) and the HS200 wall switch (with energy monitoring) from within flows on a Homey device (by Athom). Homey is NodeJS based and allows for apps to extend its functionality.

In its current state, the app requires that you enter the smartplug's IP address so it is advised to set it up to have a fixed IP address or a 'static lease' from the DHCP server. 

This app is based on the following resources:

* The HS100 API: https://github.com/plasticrake/hs100-api
* https://github.com/ggeorgovassilis/linuxscripts/tree/master/tp-link-hs100-smartplug
* https://www.softscheck.com/en/reverse-engineering-tp-link-hs110. 

Supported flow triggers:

* Power / total power changed (HS110/HS200)
* On / off state changed

Supported flow conditions:

* If on / off

Supported flow actions:

* Switch on / off
* Toggle on / off
* Switch LED on / off ('nightmode')
* reset power meter / undo reset power meter (HS110/HS200)

Mobile capabilities:

* On/off
* Display power and energy usage (HS110/HS200)

![](https://drive.google.com/uc?id=0B4QdLfQ7j41Jc3daMm9xSmsyUjg)
![](https://drive.google.com/uc?id=0B4QdLfQ7j41JY3N5Y2JNRWZRVmM)

##### Donate: #####
If you like the app you can show your appreciation by posting it in the [forum],
and if you really like it you can donate. Feature requests can also be placed on
the forum.

[![Paypal donate][pp-donate-image]][pp-donate-link]
===============================================================================

# Changelog

**Version 0.0.2:**
- Bugfixes, added capabilities

**Version 0.0.1:**
- Initial version

[forum]: https://forum.athom.com/discussion/2875/submitted-tp-link-hs100-hs110-hs200-app
[pp-donate-link]: https://www.paypal.me/Baretta
[pp-donate-image]: https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif

