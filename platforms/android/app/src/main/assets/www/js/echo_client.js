var app;
var mainView;
var page="";
var page_last = "";
var index_page=0;
var debugTextArea = "";
var notif_timer = 0;
var timer_websocket=0;
var _locale = "en";
var taux = 581.29;
var user = window.localStorage.getItem("user");
//user=null;
var operation = {};
operation.currency_code="XAF";
operation.callingCodes=237;
operation.countryCode="cm";
operation.alpha3Code="CMR";
var lastReq=null;
var TelInput={};

var obj_page=null;
var historique='';
var params={};
var webSocketId="";
var methode="http";
//alert(JSON.stringify(user));//86400000
//window.localStorage.removeItem("user");
//alert(Date.now());

//alert(user);

function getPage(url,callback_func,position) {
	
	if (typeof (url) == 'object') {
		if (typeof (url.params) == 'object') {
			params=url.params;
		}
		url = url.name;
	}
	page=name;
	for(var index in routes) {
		if(routes[index].name==url){
			url=routes[index].componentUrl;
		}
	}
	
	if(historique.indexOf(url)>=0){
		historique=historique.replace(url+"\n", "");
	}
	historique = url+"\n"+historique;
	//console.log("historique: "+historique);
	
	if (obj_page!=null && position!="modal" && typeof obj_page.on =='object'){
		if (typeof obj_page.on.pageBeforeremove == 'function')
			obj_page.on.pageBeforeremove();
		if (typeof obj_page.on.pageAfterOut == 'function')
			obj_page.on.pageAfterOut();
	}

	app.request.get(url, function (content) {
		var template = content.split("<template>")[1].split("</template>")[0];
		var style = content.split("<style>")[1].split("</style>")[0];
		var script = content.split("<script>")[1].split("</script>")[0];
		
		//console.log(template+"\n**************************"+style+"\n**************************"+script+"\n**************************");
		//$('.keypad ').remove();
		var scriptElement = document.createElement('script');
        scriptElement.text = "function script_(){"+script+"}";
       // document.body.appendChild(scriptElement);
		
		if(position=="modal"){
			$('.pqge_modal').remove();
			$('.view').append("<div class='pqge_modal' style='z-index:999999999;'></div>");
			$('.pqge_modal').html(template);
			if($('#style').html().indexOf(style)<0)
				$('#style').append(style);
		}
		else{
			$('.view').html(template);
			$('#style').html(style);
		}
		$('.view').append(scriptElement);
		//console.log(script_().on.pageInit);
		
		obj_page = script_();
		if( typeof obj_page.on =='object'){
			if (typeof obj_page.on.pageInit == 'function')
				obj_page.on.pageInit();
			if (typeof obj_page.on.pageBeforein == 'function')
				obj_page.on.pageBeforein();
			if (typeof obj_page.on.pageAfterin == 'function')
				obj_page.on.pageAfterin();
		}
		//$('.keypad ').remove();
		//console.log(iniCall_keypad());
		
		$('.back').click(function (){
			close_keypad();
			last_page();
		});
		
		$('body a').click(function (event) {
			//event.preventDefault();
			if ($(this).attr("href") == "#" && $(this).attr("link") != null && $(this).attr("link") != "") {
				var u=String($(this).attr("link"));
				
				if(u!=undefined && u!=null && u != "")
					getPage(u,null,$(this).attr("modal"));
			}
			else if($(this).attr("href") == "home.html"){
				if($(this).attr("for")=="Out"){
					user.lastLogin=null;
					window.localStorage.setItem("user", JSON.stringify(user));
				}
			}
			return false;
		});
	});

}

function completeInfos(res){
	if(res == "updateprofiledata_email_need_activation" || res == "sendmailconfirmtoken_OK"){
		user.profile.token="confirm_mail";
		getPage("cofirm_mail");
	}
	else if(page == "user_infos"){
		if(res == "updateprofiledata_OK"){
			user.profile.token="ok";
			getPage("address");
		}
	}
	else if(page == "cofirm_mail"){
		if(res == "confirm_token_ok"){
			user.profile.token="ok";
			getPage("address");
		}
	}
	else if(page == "address" && res == "updateprofiledata_OK"){
		getPage("services");
	}
	else if(page_last=="password"){
		if(page == "services" && (user.profile.email==user.profile.countrycode+user.profile.phonenumber+"@daticloud.com" || user.profile.billtofirstname==undefined || user.profile.billtofirstname=="" )){
			ts=setTimeout(function () {
				clearTimeout(ts);
				setAlert("fa fa-user", "help us know you better and improve the security of your account", function(result){
					if(result){
						getPage("user_infos");
					}
				}, null,999999,true,"Later","I secure my account");
			},3000);
		}
		else if(page == "services" && user.profile.token=="confirm_mail"){
			ts=setTimeout(function () {
				clearTimeout(ts);
				setAlert("fa fa-user", "Oops! your account is not secure yet.Please activate your recovery email address.", function(result){
					if(result){
						var req={};
						req.type = "confirm_mail";
						req.countrycode=user.profile.countrycode;
						req.phonenumber=user.profile.phonenumber;
						req.email=user.profile.email;
						req.socketclienttype = "MOBILE_CLIENT";
						req.sessionid = user.sessionid;
						req = JSON.stringify(req);
						sendMessage(req);
						//getPage("cofirm_mail");
					}
				}, null,999999,true,"Later","let's secure it");
			},3000);
			
		}
		else if(page == "services" && (user.profile.billtocountry==undefined || user.profile.billtocountry=="")){
			ts=setTimeout(function () {
				clearTimeout(ts);
				setAlert("fa fa-user", "More than a step to complete your profile.Provide your address.", function(result){
					if(result){
						getPage("address");
					}
				}, null,999999,true,"Later","let's go");
			},3000);
			
		}
	}
}

function getLien(url, callback){
	$.get(url, null, function(data,status){
		if(status=="success"){
			callback(data);
		}
		else{
			console.log("error: "+status);
		}
	});
}

function getPath(para) {
    if (para == "path") {
        var para = window.location.href.split('/');
        return window.location.href.replace(para[para.length - 1], "");
    } else if (para == "file") {
        var para = window.location.href.split('/');
        return para[para.length - 1];
    } else
        return window.location.href;
}
/*
(function ($) {
    $.fn.serializeFormJSON = function () {

        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
})(jQuery);
*/
if (user == null || user == 'null') {
    user = {
        name: "",
        countryCode: "",
        tel: "",
        mail: "",
		pass:"",
        device: "USD",
		solde:"$----",
		SipUser:{},
		balance:0,
		profile:{}
    }
} else {
    try {
        user = JSON.parse(user);
    } catch (e) {
        console.log("erreur capturée :", e);
    }
}

user.login=false;
function getTaux(){
	var req={};
	req.type="money-converter";
	req.from=user.device;
	req.to=operation.currency_code;
	req.amount=1;
	req.socketclienttype = "MOBILE_CLIENT";
	req.sessionid = user.sessionid;
	req = JSON.stringify(req);
	sendMessage(req);
}

function getSolde() {
	
	$('#solde').text(user.balance);
    var request = {};
    request.type = "balance";
    request.unit = user.device;
    request.socketclienttype = "MOBILE_CLIENT";
    request.sessionid = user.sessionid;
    request = JSON.stringify(request);
    sendMessage(request, "system");
}

function setAlert(type, msg, callback_func, trans_key,delay,showConfim,CANCEL,OK) {
	var icon ="<i style='color:var(--f7-theme-color);' class='fas fa-info-circle'></i>";
	var callfrom_func=msg;
	var notificationFull=null;
	var subtitle = "Notification";
	var styleText="";
	if(delay==undefined)
		delay=5000;
	if(showConfim == undefined)
		showConfim = false;
	if(CANCEL == undefined)
		CANCEL = "CANCEL";
	if(OK == undefined)
		OK = "OK";
	if (typeof msg == 'function')
		msg="";
	if(type=="alert-info")
		icon ="<i style='color:var(--f7-theme-color);' class='fas fa-info-circle'></i>";
	else if(type=="alert-danger"){
		icon ="<i style='color:var(--f7-theme-color);' class='fa fa-exclamation-triangle'></i>";
		subtitle="Warning!!";
		styleText="color:#ff3030;";
	}
	else
		icon ="<i style='color:var(--f7-theme-color);' class='"+type+"'></i>";
	if(trans_key != undefined){
		msg = translate[_locale][trans_key];
		msg="<span style='"+styleText+"' >"+msg+"</span>";
	}
    clearTimeout(notif_timer);
    app.dialog.close();  //$('#not').remove();
	
	if(msg != null && msg.indexOf("unexpected error")>=0)
		return;
	if(msg==null){
		app.dialog.progress("Connexion...");
		notif_timer = setTimeout(function () {
			clearTimeout(notif_timer);
			app.dialog.close();
			if (typeof callback_func == 'function') {
				callback_func();
			}
		}, delay);
	}
	else if(showConfim){
		var dialog = app.dialog.create({
			text: icon + " " + msg,
			buttons:[{
				text:CANCEL,
				close:true,
				onClick:function(){
					clearTimeout(notif_timer);
					if (typeof callback_func == 'function') {
						callback_func(false);
					}
				}
			},
			{
				text:OK,
				close:true,
				onClick:function(){
					clearTimeout(notif_timer);
					if (typeof callback_func == 'function') {
						callback_func(true);
					}
				}
			},],
		});
		dialog.open();
		notif_timer = setTimeout(function () {
			clearTimeout(notif_timer);
			app.dialog.close();
			if (typeof callback_func == 'function') {
				callback_func();
			}
		}, delay);
	}
	else{
		notificationFull = app.notification.create({
			icon: icon,
			title: '<b>DatiMob</b>',
			titleRightText: '',
			subtitle: subtitle,
			text: msg,
			closeButton: true,
			closeOnClick: true,
			closeTimeout: delay,
			on: {
				close: function () {
					clearTimeout(notif_timer);
					if (typeof callback_func == 'function') {
						callback_func();
					}
				},
			},
		});
		notificationFull.open();
	}
	
	if (typeof callfrom_func == 'function')
		callfrom_func();
    
	
}

function debug(message) {
	message=message.replace(/\n/g, '')
    try {
        var res = JSON.parse(message);
    } catch (e) {
        console.log("debug(message) erreur capturée :"+e+"\n"+message);
		return;
    }
	reponse(res);
	/*
	try {
		
    } catch (e) {
        console.log("debug(message) erreur capturée :"+e+"\n"+message);
		return;
    }*/
    //debugTextArea.value += message + "\n";
    //debugTextArea.scrollTop = debugTextArea.scrollHeight;
}

function sendMessage(msg,mode) {
	//console.log("sendMessage: "+msg);
	
	if(true){
		var temps_de_reponse=12000;
		if(msg.indexOf("\"type\":\"login\"")<0)
			lastReq=msg;
		lastReq=msg;
		if(msg.indexOf("\"type\":\"account-topup\"")>=0)
			temps_de_reponse=50000;
		if(msg.indexOf("\"type\":\"sipcallend\"")>=0 || msg.indexOf("\"type\":\"sipcallinit\"")>=0)
			temps_de_reponse=5000;
		if(methode=="http"){
			msg=JSON.stringify(msg);
			console.log("sendMessage: "+msg);
			if(mode != "system"){
				setAlert("", null,function(){
					if(lastReq.indexOf("\"type\":\"sipcallinit\"")>=0){
						sipManager.call(operation.callingNumber);
					}
				},null,temps_de_reponse);
			}
			cordova.plugin.http.setRequestTimeout(temps_de_reponse/1000);
			cordova.plugin.http.post('http://store.daticloud.com/get/operation', {
			  msg: msg
			}, { Authorization: 'OAuth2: token' }, function(response) {
				console.log("Message received : "+response.data);
				window.localStorage.setItem("websocket", response.data);
				response.data = response.data.split('{');
				if(response.data.length>=2){
					response.data = response.data[1];
					response.data = response.data.split('}');
					response.data = '{'+response.data[0]+'}';
					console.log("Message traité : "+response.data);
					debug(response.data);
				}
				
			}, function(response) {
				//setAlert("alert-danger", response.error+" CODE: "+response.status,function(){},"alert_no_resp",3000);
				if(response.status==0){
					setAlert("alert-danger", "Connexion impossible!<br> vérifiez votre accès internet. prochaine tentative dans 10s",function(){
						//console.log("reconnexion.........");
						initWebSocket();
					},"alert_no_connect",10000);
				}
				else if(lastReq.indexOf("\"type\":\"sipcallinit\"")>=0){
					sipManager.call(operation.callingNumber);
				}
				else
					setAlert("alert-danger", "Le serveur ne répond pas",function(){},"alert_no_resp",3000);
				console.log(" CODE: "+response.status);
			});

		}
		else{
			try {
				if(mode != "system"){
					setAlert("", null,function(){
						if(page!="send_call"){
							setAlert("alert-danger", "Le serveur ne répond pas",function(){
								/*
								if(page=="send_call")
									
								if(user.lastLogin!="login"){
									user.lastLogin="Restart";
									temps_de_reponse = setTimeout(function () {
										clearTimeout(temps_de_reponse);
										initWebSocket();
									},500);
								}*/
							},"alert_no_resp",3000);
						}
						else{
							if(lastReq.indexOf("\"type\":\"sipcallinit\"")>=0)
								sipManager.call(operation.callingNumber);
							//sipManager.hangup();
							
						}
					},null,temps_de_reponse);
				}
				//websocket.send(msg);
				CordovaWebsocketPlugin.wsSend(webSocketId, msg);
				console.log("string sent :"+msg );
			} catch (e) {
				console.log("erreur capturée :", e);
			}
		}
	}
	else if(websocket.readyState == 3)
		initWebSocket();
}

//sendMessage("msg");
//getPage("token_code");
//$('#solde').text("50300FCFA");
//$('#material').remove();

function setBalance(res){
	if(res!=undefined && res!=""){
		var balance = "$0.000";
		user.balance=parseInt(res.amount, 10);
		
		res.amount=parseFloat(res.amount, 10);
		res.amount=res.amount.toFixed(2);
		if (res.unit == "USD") {
			balance = "$" + res.amount;
		} else
			balance = res.amount + res.unit;
		user.solde=balance;
	}
	$('.solde').text(user.solde);
}

function reponse(res) {
   /*
    if (typeof (res.header) == 'object') {
    	setAlert("alert-danger","votre session a expiré...",
    		function(){getPage("login-form");}
    	);
    }*/
	
    clearTimeout(notif_timer);
    app.dialog.close();  //$('#not').remove();
    if (typeof (res) == 'object') {
        //alert(res.data.type);
        //res = res.data;
        if (typeof (res.sessionid) != "undefined") {
            user.sessionid = res.sessionid;
            window.localStorage.setItem("user", JSON.stringify(user));
        }
        if (res.value == "confirm-token-form") {
            setAlert("alert-info", "Entrez le code d'activation que vous allez recevoir par SMS...", function () {
                getPage("token_code");
            },"alert_enter_code");
        }
        if (res.type == "money-transfer") {
            if (res.status == "confirm") {
				getPage("confirmation");
				$('#confirm').text(res.message);
            } 
			else if (res.status == "approved") {
            }
			else if (res.status == "BAD") {
            }
        }
        if (res.type == "NONE") {
			var req ={};
			req.socketclienttype = "MOBILE_CLIENT";
			req.sessionid = user.sessionid;
			req = JSON.stringify(req);
			sendMessage(req,"system");
			/*
			if(user.lastLogin=="Restart"){
				user.lastLogin="login";
				var req={};
				req.type = "login";
				req.countrycode = user.profile.countrycode;
				req.phonenumber = user.profile.phonenumber;
				req.password = user.profile.password;
				req.socketclienttype = "MOBILE_CLIENT";
				req.sessionid = user.sessionid;
				req = JSON.stringify(req);
				sendMessage(req);
			}
			timer_websocket=setTimeout(function () {
				clearTimeout(timer_websocket);
				var req ={};
				req.type = "authentication";
				req.ping="OK";
				req.socketclienttype = "MOBILE_CLIENT";
				req.sessionid = user.sessionid;
				req = JSON.stringify(req);
			//	sendMessage(req);
			},2000);*/
        }
        if (res.type == "call-busy") {
			sipManager.hangup();
        } 
		if (res.type == "test-account") {
			if(res.value=="account-non-existent"){
				var request = operation.register;
				request.type = "register-form";
				operation.register=request;
				getPage({ 
					name: 'password', 
					params: { passType: 1}
				});
			}
			else if(res.value=="ready"){
				//console.log('operation: '+JSON.stringify(operation));
				user.profile=operation.register;
				user.profile.token="ok";
				getPage({ 
					name: 'password', 
					params: { passType: 0}
				});
			}
			else if(res.value=="need-activation"){
				setAlert("alert-info", "Entrez le code d'activation que vous allez recevoir par SMS...", function () {
					getPage("token_code");
				},"alert_enter_code");
			}
        }
        if (res.type == "updateprofiledata" || res.type == "sendmailconfirmtoken") {
			if(res.value=="BAD" && res.type == "updateprofiledata")
				setAlert("alert-danger", res.details);
			else
				completeInfos(res.type+"_"+res.value);
        }
        if (res.type == "account-topup") {
			if(res.status == "approved"){
				if (user.device == "USD") {
					res.balance = "$" + res.balance;
				} else
					res.balance = res.balance + user.device;
				setAlert("fa fa-check", "Operation succeeds...<br> your new DatiCash balance is "+res.balance, function () {
					if(operation.type == "money-transfer"){
						getPage("livraison_methode");
					}
					else if(operation.type == "Bill-payment"){
						getPage("livraison_methode");
					}
					else
						getPage({ name: 'services' });
				});
				setBalance({amount:res.value,unit:user.device});
				return;
			}
			else if(res.status == "declined"){
			}
			else if(res.status == "error"){
			}
			else if(res.status == "held for review"){
			}
			setAlert("alert-danger", res.details);
        }
        if (res.type == "balance" || res.balance != undefined) {
			if(res.balance != undefined){
				res.unit = "USD";
				res.amount = res.balance.replace(/balance-/g, '');
			}
			else if(res.value.indexOf("balance-")>=0){
				res.unit = "USD";
				res.amount= res.value.replace(/balance-/g, '');
				res.value=res.amount;
			}
			if(res.amount=="")
				res.amount=res.value;
			
			if(operation.type != undefined){ 
				res.amount=parseInt(res.amount, 10);
				if(res.amount<operation.montant){
					setAlert("alert-danger", "Your DatiCash balance is insufficient...",null,"balance_insufficient");
				}
				else if(operation.type == "account-topup"){
					getPage("services");
				}
				else if(operation.type == "money-transfer"){
					getPage("livraison_methode");
				}
				else if(operation.type=="Bill-payment"){//alert(operation.type);
					var req={};
					req.type=operation.type;
					req.BillNumber=operation.BillNumber;
					req.currency_code=operation.currency_code;
					req.bill=operation.bill;
					req.confirm="NO";
					req.socketclienttype = "MOBILE_CLIENT";
					req.sessionid = user.sessionid;
					req = JSON.stringify(req);
					sendMessage(req);
				}
				return;
			}
            
			setBalance(res);
        }
		if(res.type == "money-converter"){
			taux = res.converted/res.amount;
			$('#taux').html("<font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>1 </font></font><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>"+user.device+" </font></font><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>= </font><b><font style='vertical-align: inherit;'>"+taux+" </font></b><b><font style='vertical-align: inherit;'>"+operation.currency_code+"</font></b></font>");
		}
        if (res.crendentials == "BAD") {
			setAlert("alert-danger", "Cette session a expiré...", function () {
				getPage("password");
			},"alert_crendentials_bad");
			/*
			if(user.lastLogin != undefined && (Date.now() - user.lastLogin) >= 5000){
				autoStart();
			}
			else{
				setAlert("alert-danger", "Cette session a expiré...", function () {
					getPage("login-form");
				},"alert_crendentials_bad");
			}*/
        }
		if (res.type == "sipcallinit") {
			var SipUser ={};
			SipUser.domaine=res.host;
			SipUser.tel=res.registerednum;
			SipUser.pass=res.registeredpass;
			//user.SipUser = SipUser;
			window.localStorage.setItem("user", JSON.stringify(user));
			sipManager.init(user.SipUser);
				
			if(user.balance==0){
				setAlert("alert-info", "Your balance is insufficient...",function(){
					sipManager.hangup();
				},"alert_balance_insufficient");
			}
            else if (res.value == "OK") {
				
				if (res.currency == "USD") {
					res.rateperminute = "$" + res.rateperminute;
				} else
					res.rateperminute = res.rateperminute + res.currency;
				
				setAlert("alert-info", "This call to "+operation.callingNumber+" ("+res.ratedescription+") costs "+res.rateperminute+" / min. Carry on?", function(result){
					if(result){
						sipManager.call(operation.callingNumber);
					}
					else{
						sipManager.hangup();
					}
				}, null,999999,true);
				
				
				/*
				confirme("This call to "+operation.callingNumber+" ("+res.ratedescription+") costs "+res.rateperminute+" / min. Carry on?",function(result){
					if(result.value){
						sipManager.call(operation.callingNumber);
					}
					else
						sipManager.hangup();
				});*/
            }
			else if (res.value == "BAD") {
				/*
                setAlert("alert-danger", res.details,function(){
					getPage("International_call");
				});
				*/
				setAlert("alert-info", "Want to continue this call to "+operation.callingNumber+"?", function(result){
					if(result){
						sipManager.call(operation.callingNumber);
					}
					else
						sipManager.hangup();
				}, null,999999,true);
            }
        }
        else if (res.type == "register-form") {
            if (res.value == "confirm-token-form") {
				user.profile.token="confirm-code";
                getPage({ name: 'token_code' });
            } else if (res.value == "already") {
				user.profile=operation.register;
				user.profile.token="ok";
				setAlert("alert-info", "Un compte existe déjà avec ce numéro...",function () {
					getPage({ 
						name: 'password', 
						params: { passType: 0}
					});
				},"alert_already",2000);
            } else if (res.value == "bad") {
                if (res.keys != "undefined")
                    setAlert("alert-danger", "Values " + JSON.stringify(res.keys) + " are not correct");
                else
                    setAlert("alert-danger", "An error is produced!");
            }
        } 
		else if (res.type == "confirm-token") {
            if (res.value == "ok") {
				user.profile=operation.register;
				user.profile.token="ok";
				if(page == "cofirm_mail")
					completeInfos("confirm_token_ok");
                else 
					autoStart();
            } else if (res.value == "bad") {
				user.profile.token="bad";
                setAlert("alert-danger", "Code incorrecte...",
                    function () {/*
                        if (page != "confirm-code")
                            getPage("token_code");*/
                    },"alert_token_bad"
                );
            } else if (res.value == "expired") {
				user.profile.token="expired";
                setAlert("alert-danger", "Ce code a expiré...",
                    function () {/*
                        if (page != "reset-methode")
                            getPage("reset-methode");*/
                    },"alert_token_expired"
                );
            } else if (res.value == "already") {
				user.profile=operation.register;
				user.profile.token="ok";
				autoStart();
            } else if (res.value == "credentials_bad") {
				autoStart();
            }
        } 
		else if (res.type == "get-reset-token") {
            if (res.value == "token-send-ok") {
				setAlert("fa fa-unlock-alt", "You are about to reset your account. Use the code that you received by "+method+" Do you want to continue?", function(result){
					if(result){
						getPage({ name: 'reset_password' });
					}
				}, null,999999,true,"CANCEL","YES");
            } else {
                window.location.href="home.html?theme=md";
            }
        } 
		else if (res.type == "reset-password") {
            if (res.value == "password-reset-ok") {
                getPage("services");
            } else if (res.value == "token-bad") {
                setAlert("alert-danger", "Code de reinitialisation incorrecte...",
                    function () {
                        if (page != "reset-password")
                            getPage("reset-password");
                    },"alert_resset_token_bad"
                );
            } else if (res.value == "password-length-bad") {
                setAlert("alert-danger", "Nouveau mot de passe trop court...",
                    function () {
                        if (page != "reset-password")
                            getPage("reset-password");
                    },"alert_new_pass_short"
                );
            } else if (res.value == "token-expired") {
                setAlert("alert-danger", "Le code de reinitialisation a expiré...",
                    function () {
                        if (page != "reset-methode")
                            getPage("reset-methode");
                    },"alert_reset_token_expired"
                );
            }
        } 
		else if (res.type == "change-password") {
            if (res.value == "password-change-ok") {
				user.profile.password=user.pass;
				setAlert("alert-info", "Succès...",
                    function () {
                        getPage({ 
							name: 'password', 
							params: { passType: 0}
						});
                    },"alert_change_password_ok",3000
                );
            } else if (res.value == "oldpassword-bad") {
                setAlert("alert-danger", "Mot de passe incorrecte...",
                    function () {
                        getPage("password",function(){return 2;});
                    },"alert_oldpassword_bad",2000
                );
            } else if (res.value == "password-length-bad") {
                setAlert("alert-danger", "Nouveau mot de passe trop court...",
                    function () {
                        if (page != "change-passwort")
                            getPage("change-passwort");
                    },"alert_password_length_bad"
                );
            }
        } 
		else if (res.type == "login") { //alert("ggggggggggggggggggggggggg");
            if (res.value == "login-ok") {
				console.log(page +" online "+app.online);
				user.lastLogin = Date.now();
				user.login=true;
				var SipUser ={};
				SipUser.domaine=res.host;
				
				SipUser.tel=user.profile.countrycode+user.profile.phonenumber;
				SipUser.pass=res.sippass;
								
				user.profile.password=user.pass;
				
				//user.profile.phonenumber=user.name;
				user.SipUser = SipUser;
				//sipManager.User=SipUser;
				window.localStorage.setItem("user", JSON.stringify(user));
				sipManager.init(SipUser);
				/*
				var t_s=setTimeout(function () {
					clearTimeout(t_s);
					sipManager.init(SipUser);
				},100);*/
			//	if(page=="" || page=="password")
				//app.keypad.close();
				//mainView.router.clearPreviousHistory();
				getPage({ name: 'services' });
            } else if (res.value == "login-bad") {
				user.lastLogin=null;
				window.localStorage.setItem("user", JSON.stringify(user));
                setAlert("alert-danger", "Mot de passe ou numéro incorrecte...",
                    function () {/*0
                        if (mainView.router.currentRoute.name!="password")
                            getPage({ name: 'password' });*/
                    },"alert_login_bad"
                );
            } else if (res.value == "login-lock") {
                setAlert("alert-danger", "Ce compte est momentanement bloqué...",
                    function () {/*
                        if (page != "login-form")
                            getPage("login-form");*/
                    },"alert_login_lock"
                );
            }else if (res.value == "non-existent-account") {
				user=null;
                setAlert("alert-danger", "Aucun compte trouvé. Créez en un avec votre numéro.",
                    function () {
                        getPage({ name: 'register_form' });
                    },"alert_non-existent-account",3000
                );
            }else if (res.value == "confirm-token-form") {/*
				setAlert("alert-info", "Entrez le code d'activation que vous allez recevoir par SMS...", function () {
					getPage("token_code");
				},"alert_enter_code");
				*/
            }
        } else if (res.type == "list_service") {
            if (page == "services") {
                $('#list1_service').html("");
                $('#list2_service').html("");
                var line = true;
                $.each(res.response, function (i, obj) {
                    var serv = "<li class=\"nav-item\">" +
                        "<a class=\"nav-link active service\" id=\"" + obj.id_service + "\" href=\"#communication\" role=\"tab\" data-toggle=\"tab\">" +
                        "<i class=\"material-icons\">" + obj.icon + "</i>" + obj.name +
                        "</a>" +
                        "</li>";
                    if (line) {
                        $('#list1_service').html(
                            $('#list1_service').html() + serv
                        );
                        line = false;
                    } else {
                        $('#list2_service').html(
                            $('#list2_service').html() + serv
                        );
                        line = true;
                    }
                });
            } else {
                getPage("services");
            }
        } else if (res.type == "form") {
            if (page == "form") {
                getPage("services");
            } else if (page != "login-form") {
                getPage("login-form");
            } else {
                //alert
            }
        }
		window.localStorage.setItem("user", JSON.stringify(user));
    }
}

//var wsUri = "ws://localhost:1234";
//var wsUri = "ws://192.150.41.83:4559";

var wsUri = "ws://daticloud.com:4559";

var websocket = null;

function initWebSocket() {
	natifSocket();
}

function stopWebSocket() {
    if (websocket)
        websocket.close();
	websocket = null;
}

function checkSocket() {
    if (websocket != null) {
        var stateStr;
        switch (websocket.readyState) {
            case 0:
                {
                    stateStr = "CONNECTING";
					setAlert("alert-info", "Please wait ...",null,"alert_wait",9999000);
                    break;
                }
            case 1:
                {
                    stateStr = "OPEN";
					return true;
                    break;
                }
            case 2:
                {
                    stateStr = "CLOSING";
                    break;
                }
            case 3:
                {
                    stateStr = "CLOSED";
					//initWebSocket();
                    break;
                }
            default:
                {
                    stateStr = "UNKNOW";
					//initWebSocket();
                    break;
                }
        }
        console.log("WebSocket state = " + websocket.readyState + " ( " + stateStr + " )");
    } else {
        console.log("WebSocket is null");
    }
	return false;
}

function formSubmit(req){
	var request = req;
	//console.log(JSON.stringify(req));
	if (request.fullnumber != "undefined") {
		if ($('input[name="fullnumber"]').attr('valide') == "false") {
			setAlert("alert-danger", "Numéro mal formaté!",null,"alert_format_number");
			return false;
		}
	}
	if (typeof (request.newpassword) != "undefined") {
		if ($('#confirmPass').val() != request.newpassword) {
			setAlert("alert-danger", "La confirmation du mot de passe n'est pas correcte....",null,"alert_register_confirm_pass_bad");
			return false;
		} else if (request.newpassword.length < 6) {
			setAlert("alert-danger", "Nouveau mot de passe trop court....",null,"alert_password_length_bad");
			return false;
		}
	}
	if (typeof (request.phonenumber) != "undefined") {
		request.phonenumber = request.phonenumber.replace(/ /g, '');
	}
	if (request.type == "account-topup") {
		if($('input').val()== ""){
			setAlert("alert-danger", "Remplissez tous les champ",null,"alert_fill_fields");
			return false;
		}
		if(parseInt($('#ccmonth').val())>12 || parseInt($('#ccmonth').val())<1 || $('#ccmonth').val()==""){
			setAlert("alert-danger", "Le mois dexpiration de la carte est mal saisi.",null,"alert_month_bad");
			return false;
		}
		request.amount=operation.montant;
		request.currency_code=user.device;
		request.creditcardexpirationdate = request.creditcardexpirationdate + "-" +request.ccmonth;
		request.billtofirstname=user.profile.phonenumber;
		request.billtolastname=user.profile.phonenumber;
		request.billtocompany=user.profile.phonenumber;
		request.billtocustomertype=user.profile.phonenumber;
		request.billtoaddress=user.profile.phonenumber;
		request.billtocity=user.profile.phonenumber;
		request.billtostate=user.profile.phonenumber;
		request.billtozip=user.profile.phonenumber;
		request.billtocountry=user.profile.phonenumber;
		locale="en_US";
		//alert(request.creditcardexpirationdate);
	}
	if (request.type == "tel_payement") { 
		operation.tel_payement=request.recipient_number;
	}
	if (request.type == "montant") { 
		if(request.value=="" || request.value<1){
			setAlert("alert-danger", "Ce chiffre n'est pas autorisé...",null,"alert_value_bad");
			return false;
		}
		operation.montant=request.value;
		operation.currency_code=user.device;
		getPage({ name: 'payment_methode' });
		return false;
	}
	if(request.type == "recipient_number"){
		if(operation.type=="money-transfer" || 1){
			request.type = "money-transfer";
			request.to = request.recipient_number;
			request.mode = operation.mode;
			request.amount = operation.montant;
			request.currency_code = user.device;
			request.countrycode = operation.callingCodes;
			request.confirm ="NO";
		}
	}
	if (request.type == "Bill_number") {
		operation.BillNumber=request.BillNumber;
		operation.currency_code=user.device;
		getPage("payment_methode");
		return false;
	}
	if (request.type == "get-reset-token" || request.type == "confirm-token") {
		console.log('operation: '+JSON.stringify(operation));
		request.countrycode=operation.register.countrycode;
		request.phonenumber=operation.register.phonenumber;
		request.email=operation.register.email;
	}
	if (request.type == "login") {
		user.name = request.phonenumber;
		user.tel = request.fullnumber.replace(/\+/g, '');
		user.profile.password=user.pass;
		user.profile.phonenumber=user.name;
		
		var countryData = TelInput.getSelectedCountryData();
		user.profile.contryNamecode=countryData.iso2;
		user.countryCode = request.countrycode;
		user.pass = request.password;
		
		window.localStorage.setItem("user", JSON.stringify(user));
	}
	if (request.type == "register-form") {
		var countryData = TelInput.getSelectedCountryData();
		request.countrycode = countryData.dialCode;
		request.email = request.countrycode+request.phonenumber+"@daticloud.com";
		request.password = request.phonenumber;
		request.fullnumber = TelInput.getNumber();
		
		operation.register=request;
		getPage({ 
			name: 'password', 
			params: { passType: 1}
		});
		return false;
		/*
		user.profile = request;
		user.profile.contryNamecode=countryData.iso2;
		user.profile.billtofirstname="";
		user.profile.billtolastname="";
		user.profile.billtocountry="";
		user.profile.billtostate="";
		user.profile.billtocity="";
		user.profile.billtoaddress="";
		user.profile.billtozip="";
		
		window.localStorage.setItem("user", JSON.stringify(user));
		//alert(JSON.stringify(user));
		*/
	}
	if (request.type == "change-password" || request.type == "updateprofiledata") {
		if(request.password==undefined && request.type != "updateprofiledata"){
			request.oldpassword = user.profile.password;
			request.newpassword = user.profile.password;
			request.password = user.profile.password;
		}
		else if(request.type != "updateprofiledata"){
			request.oldpassword = user.profile.password;
			user.profile.password=request.newpassword;
		}
		if(request.countrycode==undefined)
			request.countrycode = user.profile.countrycode;
		if(request.phonenumber==undefined)
			request.phonenumber = user.profile.phonenumber;
		if(request.email==undefined)
			request.email = user.profile.email;
		if(request.type == "updateprofiledata"){
			if(request.billtofirstname==undefined)
				request.billtofirstname = user.profile.billtofirstname;
			if(request.billtolastname==undefined)
				request.billtolastname = user.profile.billtolastname;
			if(request.billtocountry==undefined)
				request.billtocountry = user.profile.billtocountry;
			if(request.billtostate==undefined)
				request.billtostate = user.profile.billtostate;
			if(request.billtocity==undefined)
				request.billtocity = user.profile.billtocity;
			if(request.billtoaddress==undefined)
				request.billtoaddress = user.profile.billtoaddress;
			if(request.billtozip==undefined)
				request.billtozip = user.profile.billtozip;
		}
		
		user.profile = request;
		window.localStorage.setItem("user", JSON.stringify(user));
		//alert(JSON.stringify(user));
	}
	request.socketclienttype = "MOBILE_CLIENT";
	request.sessionid = user.sessionid;
	//alert(user.sessionid);
	request = JSON.stringify(request);
	//alert(request);
	//console.log( "Objet :", request);
	sendMessage(request);
	return false;
}

function main_() {
    $(':root').css('--theme-color1', '#00aff0');
    $(':root').css('--theme-color2', '#00aff0');

/*
    $('body a').click(function (event) {
        //event.preventDefault();
        if ($(this).attr("href") != "#" && $(this).attr("href") != "home.html") {
            //alert($(this).attr("href"));
			var u=String($(this).attr("href")).replace(/.html/g, '');
			if(u=="change-password")
				getPage("password",function(){return 2;});
			else
				getPage(String($(this).attr("href")).replace(/.html/g, ''));
            return false;
        }
		else if($(this).attr("href") == "home.html"){
			if($(this).attr("for")=="Out"){
				user.lastLogin=null;
				window.localStorage.setItem("user", JSON.stringify(user));
			}
		}
    });*/

    $('.topup').click(function (event) {
        operation.type = "account-topup";
        getPage("montan-recharge");
    });
	
	$('.btn-back').click(function (event) {
		last_page();
	});
	$('.Payment_method').click(function (event) {
		operation.mode = $(this).attr('for');
		if(page=="payment_methode"){
			if(operation.mode=="CreditCard"){
				getPage("payment_card");
			}
			else if(operation.mode=="DatiCash"){
				getSolde();
			}
			else if(operation.mode=="MobileMoney"){
				setAlert("alert-info", "Pas encore disponible",null,"Not_available");
				//getPage("tel_payement");
			}
			else if(operation.mode=="BankDeposit"){
				setAlert("alert-info", "Pas encore disponible",null,"Not_available");
				//getPage("depot_bancaire");
			}
		}
		else if(page=="livraison_methode"){
			if(operation.mode=="MobileMoney"){
				getPage("tel_desti");
			}
			else if(operation.mode=="DatiCash"){
				getPage("tel_desti");
			}
			else if(operation.mode=="Express_union"){
				setAlert("alert-info", "Pas encore disponible",null,"Not_available");
			}
			else if(operation.mode=="CreditCard"){
				setAlert("alert-info", "Pas encore disponible",null,"Not_available");
			}
			else if(operation.mode=="BankDeposit"){
				setAlert("alert-info", "Pas encore disponible",null,"Not_available");
			}
		}
	});

	$('.Bill').click(function (event) {
		operation.bill = $(this).attr('for');
		getPage("bill_number");
	});
	
	$('.buttonHolder .question').click(function (event) {
		var req={};
		req.type = "get-reset-token";
		req.countrycode=user.profile.countrycode;
		req.phonenumber=user.profile.phonenumber;
		req.email=user.profile.email;
		req.socketclienttype = "MOBILE_CLIENT";
		req.sessionid = user.sessionid;
		req = JSON.stringify(req);
		sendMessage(req);
	});
	


}

function autoStart(){ 
		
	if(user.profile.phonenumber == undefined || user.profile.phonenumber == ""){
		//getPage("register-form");
		getPage({ name: 'register_form' });
	}/*
	else if(user.profile.password == user.profile.phonenumber){
		getPage({ 
			name: 'password', 
			params: { passType: 1}
		});
	}*/
	else{
		getPage({ 
			name: 'password', 
			params: { passType: 0}
		});
	}
	
	/*
	else
		getPage("password");
	/*
	else if(user.lastLogin != undefined && user.lastLogin != null && (Date.now() - user.lastLogin) <= 86400000){
		var req={};
		req.type = "login";
		req.countrycode = user.countryCode;
		req.phonenumber = user.name;
		req.password = user.pass;
		req.socketclienttype = "MOBILE_CLIENT";
		req.sessionid = user.sessionid;
		req = JSON.stringify(req);
		sendMessage(req);
	}*/
}

function init(){
	window.localStorage.setItem("start", "null");
}

function last_page(){
	if(user.login){
		getPage({ name: 'services' });
		return false;
	}
	else{
		start();
		return true;
	}
}


function start(){/*
	setAlert("alert-info", "SIP registration...",function(result){ alert(result);
		if(result){
		//	getPage("new_password");
		}
	}, null,999999,true);
	if(user != undefined){
		user.lastLogin = Date.now();
	}*/
	
	autoStart();/*
	try {
		initWebSocket();
	} catch (e) {
		console.log("erreur capturée :", e);
	}*/
	natifSocket();
	//main_();
}

function natifSocket(){
	if(methode=="http"){
		cordova.plugin.http.disableRedirect(false);
		cordova.plugin.http.setDataSerializer('urlencoded');
	}
	else{
		var accessToken = "abcdefghiklmnopqrstuvwxyz";
		var wsOptions = {
			url: "ws://daticloud.com:4559",
			timeout: 5000,
			pingInterval: 7000/*,
			headers: {"Authorization": "Bearer " + accessToken},
			acceptAllCerts: false*/
		}

		CordovaWebsocketPlugin.wsConnect(wsOptions,
			function(recvEvent) {
				if(recvEvent.callbackMethod=="onMessage"){
					console.log("Message received : "+recvEvent.message);
					window.localStorage.setItem("websocket", recvEvent.message);
					debug(recvEvent.message);
				}
				else if(recvEvent.callbackMethod=="onFail"){
					console.log(recvEvent.exception);
					initWebSocket();
				}
				else
					console.log(JSON.stringify(recvEvent));
			},
			function(success) {
				console.log("Connected to WebSocket with id: " + success.webSocketId);
				webSocketId=success.webSocketId;
				
				app.dialog.close();  //$('#not').remove();
				app.notification.close();
			},
			function(error) {
				console.log("Failed to connect to WebSocket: "+
							"code: "+error["code"]+
							", reason: "+error["reason"]+
							", exception: "+error["exception"]);
				setAlert("alert-danger", "Connexion impossible!<br> vérifiez votre accès internet. prochaine tentative dans 10s",function(){
					//console.log("reconnexion.........");
					initWebSocket();
				},"alert_no_connect",10000);
			}
		);
	}
}

//main_();


//start();
//alert($('.div_button').length);

//getPage("password",function(){return 2;});

//getPage("register-form");


/**/
//user={};true
//window.localStorage.removeItem("user");false
//getPage("International_call");
//alert("path");
//window.localStorage.clear();
//window.localStorage.removeItem("user");
//debug(window.localStorage.getItem("websocket"));

