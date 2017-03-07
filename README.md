# TP Link HS100 IP control app for Athom Homey

This app lets you control a TP Link HS100 smartplug from within flows on a Homey device (by Athom). Homey is NodeJS based and allows for apps to extend its functionality.

In its current state, the app requires that you enter the smartplug's IP address so it is advised to set it up to have a fixed IP address or a 'static lease' from the DHCP server.

Based on the Hs100 API: https://github.com/plasticrake/hs100-api and https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html and https://www.softscheck.com/en/reverse-engineering-tp-link-hs110. 

Supported flow actions:

* switch on / off

Supported flow controls:

* switch on / off
* measure power / energy usage

Mobile capabilities:

* on/off
* display power and energy usage

##### Donate: #####
If you like the app you can show your appreciation by posting it in the [forum],
and if you really like it you can donate. Feature requests can also be placed on
the forum.

[![Paypal donate][pp-donate-image]][pp-donate-link]
===============================================================================

# Changelog

**Version 0.0.1:**
- Initial version

[forum]: https://forum.athom.com/discussion/
[pp-donate-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=
[pp-donate-image]: https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif


