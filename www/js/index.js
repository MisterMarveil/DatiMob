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
 
var time_call;
var sec=0,min=0;
var Sip_status="Registering...";

function timer_call(t){
	if(t=="timer_call"){
		$('#infos_call').append('<br><span id="timer" style="font-size: 25px;">00:00</span>');
	}
	if($('#timer').length==0){
		time_call=null;
		return;
	}
	time_call=setTimeout(function () {
		sec++;
		if(sec>59){
			sec=0;
			min++;
		}
		var v_sec=sec,v_min=min;
		if(sec<10)
			v_sec = '0'+sec;
		if(min<10)
			v_min = '0'+min;
		$('#timer').text(v_min+':'+v_sec);
		timer_call();
	},1000);
}
 
function endCall(){
	if(Speaker)
		sipManager.toggleSpeaker();

	$('.pqge_modal ').remove();
	$('.keypad ').css("display","block");
}
 
var notif_r=0;
var Speaker=false;
var call_status={text:""};
var sipManager = {
	User:{
		tel: "909)5284904",
		pass:"hermantestsip",
        domaine: "sip.viskiglobal.com"
	},
	callingNumber:null,
	isRegister:false,
	iScalling:false,
	init: function (user) {
		console.log(JSON.stringify(user));
		if(user == undefined | user.tel==undefined | user.pass==undefined | user.tel=="" | user.pass==""){
			user = sipManager.User;
			//user = null;
		}
		if(sipManager.isRegister==false || (sipManager.User != user) ){
			
			sipManager.User=user;
			sipManager.User.domaine="98.158.144.238";
			sipManager.register();
		}
		else{
			console.log('déjà enregistré...');
			sipManager.call(sipManager.callingNumber);
		}
	},
	register: function () {
		console.log("enregistrement... "+JSON.stringify(sipManager.User));
		Sip_status="Registering...";
		app.emit('Sip_status', "Registering...");
		if(page=="send_call"){
			call_status.text('Registring...');
		}
		window.plugins.Sip.login(sipManager.User.tel, sipManager.User.pass, sipManager.User.domaine, function (e) { 
			//	alert(e);
			app.emit('Sip_status', e);
			Sip_status=e;
			if(page=="send_call"){
				call_status.text(e);
			}
				console.log(e);
			if (e == 'RegistrationSuccess') {
				$('#not').remove();
				sipManager.isRegister = true;
				sipManager.listen();
				sipManager.call(sipManager.callingNumber);
				
				notif_r=setTimeout(function () {
					clearTimeout(notif_r);
					sipManager.register();
				},300000);
			} else {
				sipManager.isRegister = false;
				notif_r=setTimeout(function () {
					clearTimeout(notif_r);
					sipManager.register();
				},3000);
			}

		}, function (e) { console.log(e) })
	},
	call: function (sipNumber) {
		if(sipManager.iScalling){
			console.log("sipManager.iScalling true...");
			return;
		}
		if(sipManager.isRegister==true && sipNumber!=null){
			/*
			if(page!="send_call"){
				getPage("send_call",function(){
					$('#call_status').text('Connecting...');
					$('#call_num').text(sipNumber);
					call_status=$('#call_status');
				});
			}*/
			sipManager.callingNumber=null;
			sipManager.iScalling=true;
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
		window.plugins.Sip.hangup(function (e) { console.log(e) }, function (e) { console.log(e) });
		var req={};
		req.type = "sipcallend";
		req.registerednum=sipManager.User.tel;
		req.registeredpass=sipManager.User.pass;
		req.socketclienttype = "MOBILE_CLIENT";
		req.sessionid = user.sessionid;
		req = JSON.stringify(req);
		sendMessage(req,"system");
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
			}, function(e){console.log(e);}
		);
	},
	toggleMute: function () {
		window.plugins.Sip.toggleMute(function(e){
				if(e==1){
					$('#Mute').css('color', '#f00');
				}
				else{
					$('#Mute').css('color', '#fff');
				}
			}, function(e){console.log(e);}
		);
	},
	events: function (e) {
		console.log(e);
	//	alert(e);
		if (e.indexOf('Incoming')>=0) {
			$('#call_status').text('Incoming...');
		}
		if(e.indexOf('Connected')>=0){
			call_status.text('Connected');
			timer_call('timer_call');
			console.log("Connected!");
			sipManager.listen();
		}
		if(e.indexOf('OutgoingInit')>=0) {
			var ts=setTimeout(function () {
				clearTimeout(ts);
				call_status.text('Starting outgoing call...');
			//	alert(call_status.text());
			},5);
		}
		if(e.indexOf('OutgoingEarlyMedia')>=0) {
			var ts=setTimeout(function () {
				clearTimeout(ts);
				call_status.text('Ringing...');
				//timer_call('timer_call');
			},5);
		}
		if(e.indexOf('Error')>=0) {
			sipManager.iScalling=false;
			console.log("Call Error!");
			var call_status_text='Service Unavailable!';
			if(e.indexOf('Temporarily Unavailable')>=0) {
				call_status_text='Temporarily Unavailable!';
			}
			call_status.text(call_status_text);
			var ts=setTimeout(function () {
				clearTimeout(ts);
				setAlert("alert-info", call_status_text, function(result){
					sipManager.listen();
					sipManager.hangup();
				}, null,4,false);
			},3000);
		}
		if (e.indexOf('End')>=0) {
			sipManager.iScalling=false;
			console.log("Call End!");
			call_status.text('Call End!');
			var ts=setTimeout(function () {
				clearTimeout(ts);
				sipManager.listen();
				endCall();
			},2000);
		}
		
		sipManager.listen();
	}
}


