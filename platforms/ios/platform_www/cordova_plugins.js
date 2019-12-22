cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova_voip_plugin.Sip",
      "file": "plugins/cordova_voip_plugin/www/voipCordova.js",
      "pluginId": "cordova_voip_plugin",
      "clobbers": [
        "window.plugins.Sip"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.4",
    "cordova_voip_plugin": "0.0.1"
  };
});