# Changelog

**Version 0.1.12**
- Added support for KL range of bulbs: KL50/60/110/120/130

**Version 0.1.8**
- Copied lb130 driver for other bulb devices

**Version 0.1.7**
- Updated tplink-smarthome-api version
- Fixed LED on/off function ('nightmode') for plugs
- Properly removed LED on/off switch from mobile interface

**Version 0.1.6**
- Version bump due to silly app submission process caused by app-store overhaul

**Version 0.1.5**
- Updated tplink-smarthome-api version and reduced the footprint of the app
- Added energy estimation for bulbs

**Version 0.1.4**
- Small code improvement for pairing.
- Removed on/off function from mobile interface for plugs
- Added the TP-Link brand color.

**Version 0.1.3**
- Fixed typo in function name which caused the app to crash for some users on V2.

**Version 0.1.2**
- Bugfixes, 'dynamic' ip feature is now an option that can be enabled in the settings.
- Changed to discovery process, now using some of the builtin options.
- The number of discovery attempts is limited to 3 at 2,5 s intervals and a timeout of 9 seconds. 

**Version 0.1.1**
- Bugfixes 

**Version 0.1.0**
- Complete SDK2 rewrite
- The app will now continue to work when the IP address of the plugs or bulbs changes.

**Version 0.0.17**
- Switched to the tplink-smarthome-api (https://github.com/plasticrake/tplink-smarthome-api) to address
the issues with encryption of newer devices as well as changes in metering.

**Version 0.0.16**
- Edited app.json. Ready for beta release. 

**Version 0.0.15**
- Sorted out hue/saturation/color temp. options. 

**Version 0.0.14**
- Ran into git issue... Re-added missing_modules. 

**Version 0.0.13**
- Updated node_modules. 

**Version 0.0.12**
- Copied LB110 and LB120 drivers. 

**Version 0.0.11**
- Rewritten based on new tplink-smarthome API. 

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
