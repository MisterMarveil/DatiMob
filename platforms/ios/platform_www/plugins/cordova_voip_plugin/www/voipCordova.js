cordova.define("cordova_voip_plugin.Sip", function(require, exports, module) {
// Empty constructor
function Sip() {}

// The function that passes work along to native shells
// Message is a string, duration may be 'long' or 'short'
Sip.prototype.show = function(message) {
	alert(message);
}

Sip.prototype.login= function (username, password, domain, successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"login",
		[username, password, domain]
	);
}

Sip.prototype.logout= function (successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"logout",
		[]
	);
}

Sip.prototype.accept= function (value, successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"acceptCall",
		[value]
	);
}

Sip.prototype.listenCall= function (successCallback, errorCallback) {
	cordova.exec(
			successCallback,
			errorCallback,
			"Linphone",
			"listenCall",
			[]
		);
}

Sip.prototype.call= function (address, displayName, successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"call",
		[address, displayName]
	);
}

Sip.prototype.videocall= function (address, displayName, successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"videocall",
		[address, displayName]
	);
}

Sip.prototype.hangup= function (successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"hangup",
		[]
	);
}

Sip.prototype.toggleVideo= function (successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"toggleVideo",
		[]
	);
}

Sip.prototype.toggleSpeaker= function (successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"toggleSpeaker",
		[]
	);
}

Sip.prototype.toggleMute= function (successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"toggleMute",
		[]
	);
}

Sip.prototype.sendDtmf= function (number, successCallback, errorCallback) {
	cordova.exec(
		successCallback,
		errorCallback,
		"Linphone",
		"sendDtmf",
		[number]
	);
}




// Installation constructor that binds Sip to window
Sip.install = function() {
  if (!window.plugins) {
    window.plugins = {};
  }
  window.plugins.Sip = new Sip();
  return window.plugins.Sip;
};
cordova.addConstructor(Sip.install);
});
