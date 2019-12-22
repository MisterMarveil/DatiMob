/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 
function endCall(){
	$('#send_call').hide();
	$('#timer').remove();
	
	if(Speaker)
		sipManager.toggleSpeaker();

	window.plugins.Sip.hangup(function (e) { console.log(e) }, function (e) { console.log(e) });
	
	var req={};
	req.type = "sipcallend";
	req.registerednum=sipManager.User.tel;
	req.registeredpass=sipManager.User.pass;
	req.socketclienttype = "MOBILE_CLIENT";
	req.sessionid = user.sessionid;
	req = JSON.stringify(req);
	sendMessage(req);
}
 
var notif_timer=0;
var Speaker=false;
var sipManager = {
	User:{
		tel: "909)5284904",
		pass:"hermantestsip",
        domaine: "sip.viskiglobal.com"
	},
	callingNumber:null,
	isRegister:false,
	init: function (user) {
		if(user == undefined)
			user = sipManager.User;
		console.log(JSON.stringify(user));
		if(sipManager.isRegister==false || sipManager.User.tel != user.tel || sipManager.User.pass != user.pass || sipManager.User.domaine != user.domaine){
			sipManager.User=user;
			sipManager.register();
		}
		else{
			console.log('déjà enregistré...');
			sipManager.call(sipManager.callingNumber);
		}
	},
	register: function () {
		console.log("enregistrement...");
		window.plugins.Sip.login(sipManager.User.tel, sipManager.User.pass, sipManager.User.domaine, function (e) {
			//	alert(e);
				console.log(e);
			if (e == 'RegistrationSuccess') {
				sipManager.isRegister = true;
				sipManager.listen();
				sipManager.call(sipManager.callingNumber);
			} else {
				sipManager.isRegister = false;
				notif_timer=setTimeout(function () {
					clearTimeout(notif_timer);
					sipManager.register();
				},2000);
			}

		}, function (e) { console.log(e) })
	},
	call: function (sipNumber) {
		if(sipManager.isRegister==true && sipNumber!=null){
			sipManager.callingNumber=null;
			window.plugins.Sip.call(sipNumber, sipManager.User.tel, sipManager.events, sipManager.events);
		}
		else{
			sipManager.callingNumber=sipNumber;
		}
	},
	listen: function () {
		window.plugins.Sip.listenCall(sipManager.events, sipManager.events);
	},
	hangup: function () {
		endCall();
	},
	toggleSpeaker: function () {
		window.plugins.Sip.toggleSpeaker(function(e){
				if(e==1){
					$('#Speaker').css('color', '#0f0');
					Speaker=true;
				}
				else{
					$('#Speaker').css('color', '#fff');
					Speaker=false;
				}
			}, null
		);
	},
	toggleMute: function () {
		window.plugins.Sip.toggleMute(function(e){
				if(e==1){
					$('#Mute').css('color', '#f00');
				}
				else
					$('#Mute').css('color', '#fff');
			}, null
		);
	},
	events: function (e) {
		console.log(e);
	//	alert(e);
		if (e == 'Incoming') {
			//cordova.plugins.CordovaCall.receiveCall('Incoming');
			/*
			cordova.plugins.CordovaCall.on('answer', function(e){
				window.plugins.Sip.accept(true, sipManager.events, sipManager.events);
			});
			//cordova.plugins.CordovaCall.on('reject', function(e){
				sipManager.hangup();
			});
			//cordova.plugins.CordovaCall.on('hangup', function(e){
				sipManager.hangup();
			});
			/*
			if (r == true) {
				window.plugins.Sip.accept(true, sipManager.events, sipManager.events);
			} else {

			}*/
		}
		if (e == 'Connected') {
			//cordova.plugins.CordovaCall.connectCall(sipManager.events, sipManager.events);
			//$('#send_call').hide();
			timer_call('timer_call');
			console.log("Connected!");
			sipManager.listen();
		}
		if (e == 'Error') {
			console.log("Call Error!");
			$('#send_call').hide();
			sipManager.listen();
			sipManager.hangup();
		}
		if (e == 'End') {
			console.log("Call End!");
			$('#send_call').hide();
			sipManager.listen();
			sipManager.hangup();
		}


	}
}

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
		document.addEventListener("backbutton", onBackKeyDown, false);
		function onBackKeyDown() {
			last_page();/*
			//cordova.plugins.CordovaCall.on('answer', function(e){alert('answer: '+e);});
			//cordova.plugins.CordovaCall.on('hangup', function(e){alert('hangup: '+e);});
			//cordova.plugins.CordovaCall.on('reject', function(e){alert('reject: '+e);});
			//cordova.plugins.CordovaCall.on('receiveCall', function(e){alert('receiveCall: '+e);});
			////cordova.plugins.CordovaCall.receiveCall('+237698672241',function(e){},function(e){alert(e);});
			////cordova.plugins.CordovaCall.on('mute', function(e){alert('mute: '+e);});// seulement pour IOS
			////cordova.plugins.CordovaCall.sendCall('Daniel Marcus', 123,function(e){},function(e){alert(e);});
			////cordova.plugins.CordovaCall.callNumber('Daniel Marcus',function(e){},function(e){alert(e);});
			*/
		}
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {/*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
		
*/
		console.log(JSON.stringify(user));
        console.log('Received Event: ' + id);
		/*window.plugins.Sip.show('Hello Ionic !');
		sipManager.User.domaine="192.168.8.100";
		sipManager.User.tel="1003";
		sipManager.User.pass="1234";*/
		sipManager.init(user.SipUser);	
    }
};

app.initialize();

