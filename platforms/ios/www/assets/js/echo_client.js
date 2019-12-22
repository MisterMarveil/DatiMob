var page="";
var page_last = ["services"];
var index_page=0;
var debugTextArea = "";
var notif_timer = 0;
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

//alert(JSON.stringify(user));//86400000
//window.localStorage.removeItem("user");
//alert(Date.now());

//alert(user);

function getPage(url,callback_func,position) {
	if(page != "" && page!="services" && position!="back"){
		index_page++;
		page_last[index_page] = page;
	}
    page = url;
	if(url == "login-form"){
		if(user!=null){
			user.login=false;
			window.localStorage.setItem("user", JSON.stringify(user));
		}
		window.location.href="home.html";
	}
    else if (typeof (pages[url]) != "undefined") {
        $("body").html(pages[url]);
    }
    $(document).ready(function () {
        $(".trans").each(function (index) {
            $(this).text(translate[_locale][$(this).attr("data-trans")]);
        });
    });
	

    var input = document.querySelector("#phone");
    if (input != null) {
        TelInput = intlTelInput(input, {
            // allowDropdown: false,
            // autoHideDialCode: false,
            // autoPlaceholder: "off",
            // dropdownContainer: document.body,
            // excludeCountries: ["us"],
            // formatOnDisplay: false,
           geoIpLookup: function (callback) {
				if(user.profile.contryNamecode != undefined){
					callback(user.profile.contryNamecode);
					if(user.profile.phonenumber != undefined){
						var ts=setTimeout(function () {
							clearTimeout(ts);
							//$('#phone').val(user.profile.phonenumber);
						},500);
					}
				}
				else{
					$.get("http://ipinfo.io", function() {}, "jsonp").always(function(resp) {
						var countryCode = (resp && resp.country) ? resp.country : "";
						callback(countryCode);
						if(user.profile.phonenumber != undefined){
							var ts=setTimeout(function () {
								clearTimeout(ts);
								//$('#phone').val(user.profile.phonenumber);
							},500);
						}
					});
				}
            },
            hiddenInput: "fullnumber",
            initialCountry: "auto",
            // localizedCountries: { 'de': 'Deutschland' },
            // nationalMode: false,
            // onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'],
            placeholderNumberType: "MOBILE",
            // preferredCountries: ['cn', 'jp'],
            separateDialCode: true,
            utilsScript: "./assets/js/utils.js",
        });

        $('button').click(function () {
            var num = TelInput.getNumber(),
                valid = TelInput.isValidNumber();
            $('input[name="fullnumber"]').val(num);
            $('input[name="fullnumber"]').attr('valide', valid);
            $('input[name="fullnumber"]').attr('for', TelInput.selectedCountryData.name);
            $('input[name="countrycode"]').val(TelInput.selectedCountryData.dialCode);
        });
		
		
		input.addEventListener("open:countrydropdown", function(e) {
			$("#fake_input").remove();
			/*
			$("body").prepend("<input placeholder=' search (enter country name or code)' "+
				"style='border-radius:5px;width: 90%; z-index: 9999; text-align: left; position: absolute; "+
				"height:29px;top:5px;left:29px;/*background-color:var(--theme-color1);color:#fff;' id='fake_input'  type='text'/>"); 
*/
			$("#iti-item-us").css('margin-top','35px');
			$("#country-listbox").prepend("<div style='height:30px;font-size:18px; position:fixed;padding-bottom:35px;background-color:#fff;' class=' iti__preferred' tabindex='-1' id='fake_input' role='option' data-dial-code='1'"+
				"data-country-code='us'><div class='iti__flag-box'> <div class='fa fa-search'></div></div><span class='iti__country-name'>"+
				" Search by country name</span></div>");
			
			$("#fake_input").blur(function(e){          
				$("#fake_input").remove();
			});
			
			$("#fake_input").click(function() { 
				setAlert("alert-info",
					function(){
						$("#contain").html("<input style='background-color:#fff;position:absolute;left:5%;top:50px;width:80%;height:35px;' id='tags' placeholder=' enter country name'/><button  style='position:absolute;left:87%;top:50px;height:35px;'><i id=finish class='fa fa-search'></i></button><br><br><br>");
						var countryData = window.intlTelInputGlobals.getCountryData();
						var availableTags=[];
						for (var i = 0; i < countryData.length; i++) {
							var tag={};
							tag.value  = countryData[i].name;
							tag.iso2  = countryData[i].iso2;
							tag.label  = countryData[i].name;
							tag.desc  = countryData[i].dialCode;
							availableTags.push(tag);
						}
						$( "#tags" ).autocomplete({
							source: availableTags,
							select : function(event, ui){ 
								TelInput.setCountry(ui.item.iso2, true);
								$('#not').remove();
							}
						});
						
						$("#tags").keyup(function(e){            
							var filterSpecialCharacter = /^[a-zA-Z0-9-]*$/;
							if(!filterSpecialCharacter.test($(this).val())){
								$(this).val("");
								return;
							}
        
							var _countryObject = TelInput._searchForCountry($(this).val());
							if(_countryObject != undefined)
								TelInput.setCountry(_countryObject.iso2, true);

							if(e.which == 13){
								$('#not').remove();
								
								return;
							}


						});
						$("#finish").click(function() { 
							var _countryObject = TelInput._searchForCountry($("#tags").val());
							if(_countryObject != undefined)
								TelInput.setCountry(_countryObject.iso2, true);
							$('#not').remove();
						});
						$("#tags").focus();
					}, 
					function(result){
						if(result){
							//getPage("new_password");
						}
				}, null,999999);
			});
		  
			$("#country-listbox li:not(.fake)").click(function(e){            
				var flagChanged = TelInput._setFlag($(this).attr('data-country-code'));
				 if(!$("#country-listbox").hasClass("iti__hide"))
					$("#country-listbox").addClass("iti__hide");    
				
				//input.focus();
				$("#fake_input").remove();
				TelInput._updateDialCode($(this).attr("data-dial-code"), true);
				
				if (flagChanged) {
					TelInput._triggerCountryChange();
				}            
			});
			
			  
			
		});
		
		input.addEventListener("close:countrydropdown", function() {
			if($("#fake_input").is(":focus")){            
				if($("#country-listbox").hasClass("iti__hide"))
					$("#country-listbox").removeClass("iti__hide");    
			}
		});
    
    }
	
	if(page == "confirmation"){
		$('#Confirm').click(function () {
		});
		$('#Over').click(function () {
			getPage("services");
		});
	}
    if (page == "services") {
		index_page=0;
		operation = {}; /*
        $('#country_selector').countrySelect({
            defaultCountry: "cm",
            onlyCountries: ['cm', 'td', 'ci', 'cg', 'fr', 'ga', 'gn', 'us'],
            responsiveDropdown: true
        });*/
		operation.currency_code="XAF";
		operation.callingCodes=237;
		operation.countryCode="cm";
		operation.alpha3Code="CMR";
		$('.country').click(function() {
			operation.countryCode = $(this).attr('data-country-code');
			var url = encodeURI("https://restcountries.eu/rest/v2/alpha/"+operation.countryCode);
			$.get(url, function(data, status) {
				if(status == "success"){
					operation.currency_code=data.currencies[0].code;
					operation.callingCodes=data.callingCodes[0];
					operation.alpha3Code=data.alpha3Code;
					//alert(data.currencies[0].code);
				}
			});
		}); 
        getSolde();
		var start = window.localStorage.getItem("start");
		start = $.parseJSON(start);//start.aide=true;
		start.start = false;
		if(start.aide != false && start.counter<3 && start.hide != true){
			start.hide=true;
			var ts=setTimeout(function () {
				clearTimeout(ts);
				$('body').append("<div id=aide style='position:fixed; top:0px; width:100%; height:100%; z-index: 999;background-color:#eee;'><img src='./img/DatiMob_toujours.gif' width='100%' height='100%'></div>");
				ts=setTimeout(function () {
					clearTimeout(ts);
					$('#aide').remove();
					completeInfos();
				},45000);
				$('#aide').click(function () {
					clearTimeout(ts);
					setAlert("alert-info", "Never show this help again?", function(result){
						if(result){
							start.aide=false;
							window.localStorage.setItem("start", JSON.stringify(start));
						}
					}, null,999999,true);
					
					$('#aide').remove();
					completeInfos();
				});
					
			},3000);
		}
		else {
			completeInfos();
		}
		window.localStorage.setItem("start", JSON.stringify(start));
    }
	if(page=="International_call"){
		$('#send_call').hide();
		function getHistorique(){
			var hist = window.localStorage.getItem("hist");
			var last='';
			if (hist != null) {
				try {
					hist = $.parseJSON(hist);
					jQuery.each(hist, function(index, value) {
						//alert(index+": "+ hist[index].dialCode+hist[index].val);
						last += "<a style='overflow: hidden;width:100%;' class='list-group-item hist' for="+hist[index].dialCode+" num='"+hist[index].val+"'><i class='fa fa-user-circle' style='font-size:40px'></i><span style='color:#2196F3;font-weight: bold;'>"+hist[index].val+
						"</span><i style='position:absolute; right:10px;color:var(--theme-color1);' class='fa fa-phone-alt'></i><span style='position:absolute;bottom:0px;top:50px;left:75px;font-size:12px;' class='badge'>"+hist[index].date+
						" </span></a>";
					});
				} catch (e) {
					console.log("erreur capturée :", e);
				}
			}
			$('#list-group').html(last);
			
			$('.hist').click(function (event) {
				var num = $(this).attr('num');
				operation.callingCodes=$(this).attr('for');
				setAlert("alert-info", "Call this number?", function(result){
					if(result){
						sendCall(num);
					}
				}, null,999999,true);
				
			});
		}
		function setHistorique(contact,Code){
			var hist = window.localStorage.getItem("hist");
			var heure = new Date();
			if (hist == null) {
				hist={};
				hist[contact] = {
					val:contact,
					dialCode:Code,
					date:heure.getHours()+":"+ heure.getMinutes()+":"+ heure.getSeconds()
				}
			}
			else {
				try {
					hist = $.parseJSON(hist);
					hist[contact] = {
						val:contact,
						dialCode:Code,
						date:heure.getHours()+":"+ heure.getMinutes()+":"+ heure.getSeconds()
					}
				} catch (e) {
					console.log("erreur capturée :", e);
				}
			}
			window.localStorage.setItem("hist", JSON.stringify(hist));
		}
		getHistorique();
		$('#clavier').hide();	
		$('#Last').click(function () {
			$('#call_list').css('height','75%');
			getHistorique();
			$('#clavier').hide();
		});
		$('#showClavier').click(function (event) {
			if($("#phone").css('padding-left')=='6px'){
				$("#phone").css('padding-left','110px');
			}
			$('#clavier').show();
			$('#call_list').css('height','35%');
		});
		
		$('#Back').click(function (event) {
			last_page();
		});
		$( "#phone" ).focus(function() {
		  //event.preventDefault();
		});	
			

		var dials = $(".dials ol li");
		var index;
		var number = $(".tel");
		var total;
		
		dials.click(function(){
			index = dials.index(this);
			if(21<$(".tel").val().length){
				setAlert("alert-danger", "Number too long",null,"alert_long_number");
			} 
			else if(index == 9){
				$(".tel").val($(".tel").val()+"*");
			}else if(index == 10){
				$(".tel").val($(".tel").val()+"0");
			}else if(index == 11){
				$(".tel").val($(".tel").val()+"#");
			}else if(index == 12){
				//contact
				$('#call_list').css('height','75%');
				getHistorique();
				$('#clavier').hide();
			}else if(index == 13){
				//add any call action here
				if(TelInput.isValidNumber()){
					var countryData = TelInput.getSelectedCountryData();
					operation.callingCodes=countryData.dialCode;
					sendCall(TelInput.getNumber());
				}
				else
					setAlert("alert-danger", "Numéro mal formaté!",null,"alert_format_number");
			}else if(index == 14){
				//backspace
			}else{ 
				$(".tel").val($(".tel").val()+(index+1));
				if($("#phone").css('padding-left')=='6px'){
					$("#phone").css('padding-left','110px');
				}
			}
			if(16<$(".tel").val().length){
				$(".tel").css('font-size','15px');
			}
			else if(11<$(".tel").val().length){
				$(".tel").css('font-size','20px');
			}else{
				$(".tel").css('font-size','30px');
			}
		});

		 
		$('.backspace').click(function (event) {	
				total = $(".tel").val();
				total = total.slice(0,-1);
				$(".tel").val(total)
		});  

		function sendCall(num){
			$('#call_num').text(num);
			$('#send_call').show();
			$('#Cancel').click(function (event) {
				//$('#send_call').hide();
				sipManager.hangup();
			});
			operation.callingNumber = num;
			//sipManager.call(num);
			var req={};
			req.type = "sipcallinit";
			req.callercountrycode = operation.callingCodes;
			req.callerphonenumber = operation.callingNumber.replace('+'+operation.callingCodes, '');;
			req.socketclienttype = "MOBILE_CLIENT";
			req.sessionid = user.sessionid;
			setHistorique(num,req.callercountrycode);
			req = JSON.stringify(req);
			sendMessage(req);
			
			
			$('#Speaker').click(function (event) {
				$('#Speaker').css('color', '#0f0');
				sipManager.toggleSpeaker();
			});
			$('#Mute').click(function (event) {
				$('#Mute').css('color', '#f00');
				sipManager.toggleMute();
			});
			//timer_call('timer_call');
		}
		var sec=0,min=0;
		function timer_call(t){
			if(t=="timer_call"){
				$('#infos_call').append('<br><span id="timer" style="font-size: 25px;">00:00</span>');
			}
			if($('#timer').text()==""){
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
	}
	if(page=="password"){
		var _requiredDigitsNumber = 6;
		var _isRegistering = 0;
		var _countdown = " digits left";
		var _countdownOK = "PASSWORD OK";
		var _enteredPassword = "";
		var oldpassword = "";
		initData();
		function initData(Registering){
			if(Registering != undefined)
				_isRegistering=Registering;
			if(Registering==1){
				$(".passtitle").html("Choose your passcode");
			}
			else if(Registering==2){
				$(".passtitle").html("Enter your old passcode");
			}
			else
				$(".passtitle").html("Enter your pin");
			
			$(".countdown").html(_requiredDigitsNumber + _countdown);
			_enteredPassword = "";
			$("#password").val("");
			$("#steps").html("");
			for(var i=0; i < _requiredDigitsNumber; i++){
				$("#steps").append('<i id="'+(i + 1)+'" class="fas fa-minus"></i>');                    
			}
		}
		
		$("#password").focus(function(){
			$(this).blur();
		});
		
		$(".button,.swipe").click(function(e){                    
			var v = $( "#password" ).val();
			if(!$(this).hasClass("swipe")){
				if(v.length < _requiredDigitsNumber){
					$( "#password" ).val(v +""+ $(this).attr("data-val"));    
					var _length = $( "#password" ).val().length;
					$('#'+_length).removeClass('fa-minus');
					$('#'+_length).addClass('fa-check-circle');
				}
			}else{                    
				swipeDigit($("#password").val());
			}
			checkDigit($("#password").val());
			e.preventDefault();
		});
		
		function checkDigit(v){
		    if(v.length == _requiredDigitsNumber){
				$(".countdown").html("Password length OK");
				if(_isRegistering==1 || (_isRegistering==2 && oldpassword.length==6)){
					if(_enteredPassword.length == 0){
						initData(_isRegistering);
						_enteredPassword = v;
						setAlert("alert-info", "Password length OK...",null);
						var ts=setTimeout(function () {
							clearTimeout(ts);
							$('#not').remove(); 
							$(".passtitle").text("Confirm your pin"); 
						},2000);
					}else{
						if(_enteredPassword == v){
						   submitData(_isRegistering);
						}
						else{
						    setAlert("alert-danger", "Warning !!! The two codes inserted do not match. Please start again.",function(){
								initData(_isRegistering);
								if(_isRegistering==1)
									$(".passtitle").html("Choose your pin");
								else if(_isRegistering==2)
									$(".passtitle").text("Choose your new pin");
							});
						}
					}
				}
				else if(_isRegistering==2){
					oldpassword=v;
					setAlert("alert-info", "Password length OK...",null);
					var ts=setTimeout(function () {
						clearTimeout(ts);
						$('#not').remove();
						initData(_isRegistering);
						$(".passtitle").text("Choose your new passcode"); 
					},2000);
				}
				else{
					submitData(_isRegistering);
				}
			}
			else{
				$(".countdown").html((_requiredDigitsNumber - v.length) + _countdown);
		    }       
		}	
		
		function submitData(isRegistering=0){
			var passValue = $("#password").val();
			if(isRegistering>0){                       
				console.log("Registering data with pass: " );
				var request={};
				request.type = "change-password";
				request.email = user.profile.email;
				if(isRegistering==1)
					request.oldpassword = user.profile.password;
				else if(isRegistering==2)
					request.oldpassword = oldpassword;
				request.newpassword = passValue;
				request.billtofirstname = user.profile.billtofirstname;
				request.billtolastname = user.profile.billtolastname;
				request.countrycode = user.profile.countrycode;
				request.phonenumber = user.profile.phonenumber; 
				request.socketclienttype = "MOBILE_CLIENT";
				request.sessionid = user.sessionid;
				request = JSON.stringify(request);
								
				user.pass=request.newpassword;
				//user.profile.token=false;
				window.localStorage.setItem("user", JSON.stringify(user));
				//alert(request);
				//console.log( "Objet :", request);
				sendMessage(request);
			}else{
				console.log("Login with pass: " );
				var req={};
				req.type = "login";
				req.countrycode = user.profile.countrycode;
				req.phonenumber = user.profile.phonenumber;
				req.password = passValue;
				user.pass = req.password;
				req.socketclienttype = "MOBILE_CLIENT";
				req.sessionid = user.sessionid;
				req = JSON.stringify(req);
				window.localStorage.setItem("user", JSON.stringify(user));
				sendMessage(req);
			}                
		}
		
		function swipeDigit(v){                
			if(v != undefined && v.length >= 1){
				$('#'+v.length).removeClass('fa-check-circle');
				$('#'+v.length).addClass('fa-minus');
				
				v = v.substring(0, v.length - 1);
				$("#password").val(v);                        							
			}
			return;
		}
		if (typeof callback_func == 'function') {
			initData(callback_func());
		}
	}
    main_();
}

function completeInfos(){
	var ts=setTimeout(function () {
				//user.profile.email="user@daticloud.com";
		//alert(user.profile.password);
		clearTimeout(ts);
		if(page == "services"){
			if(user.profile.email==user.profile.countrycode+user.profile.phonenumber+"@daticloud.com" || user.profile.billtofirstname==undefined || user.profile.billtofirstname=="" ){
				setAlert("alert-info", "Complete your profile information", function(result){
					if(result){
						getPage("user_infos");
					}
				}, null,999999,true);
				
			}
			else if(user.profile.password==user.profile.phonenumber){
				setAlert("alert-info", "Secure your account with a password", function(result){
					if(result){
						getPage("new_password");
					}
				}, null,999999,true);
				
			}
			else if(user.profile.billtocountry==undefined || user.profile.billtocountry==""){
				setAlert("alert-info", "Complete your address", function(result){
					if(result){
						getPage("address");
					}
				}, null,999999,true);
				
			}
		}
	},3000);
}

function getLien(url, callback){
	$.get(url, callback, "jsonp")
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

if (user == null || user == 'null') {
    user = {
        name: "",
        countryCode: "",
        tel: "",
        mail: "",
		pass:"",
        device: "USD",
		SipUser:{},
		balance:0,
		profile:{}
    }
} else {
    try {
        user = $.parseJSON(user);
    } catch (e) {
        console.log("erreur capturée :", e);
    }
}

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
    sendMessage(request);
}

function setAlert(type, msg, callback_func, trans_key,delay,showConfim=false) {
	var icon ="<i style='font-size: 30px;' class='fas fa-exclamation'></i>";
	var callfrom_func=msg;
	if (typeof msg == 'function')
		msg="";
	if(type!="alert-info")
		icon ="<i style='font-size: 30px;' class='fas fa-exclamation-triangle'></i>";
	if(trans_key != undefined){
		msg = translate[_locale][trans_key];
	}
    clearTimeout(notif_timer);
    $('#not').remove();
	if(msg==null){
		$('body').append(
			"<div id=not class='' style='position: fixed ; top: 0%; left: 0%; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.7); z-index: 5000 '>" +
			"<div class='' style='width: 100%; height: 100%; background : url(\"assets/img/loading.gif\") 50% 50% no-repeat;cursor : wait;'></div>" +
			"</div>");
	}
	else{
		$('body').append(
			"<div id=not style='position: fixed ; top: 0%; left: 0%; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 5000 '>" +
				"<div id=alert class='alert alert-info' style='background-color:var(--theme-color1);'>" +
					"<div>" +
						"<i style='font-size: 25px;position:absolute;top:10px;right:15px;' class='fas fa-times' id=x></i><br>"+
						"<div style='width:100%;'  id=contain>"+
							"<div style='float: left;width:10%; '>"+ 
								icon+
							"</div>"+
							"<div style='margin-left:15%;width:85%;'>"+
								msg +
							"</div>"+
							"<br><br>" +
						"</div>"+
						"<div id=showConfim style=''>" +
							"<div style='position:absolute;right:0px;bottom:0px;background-color:#feeee2;width:100%;height:40px;'>" +
								"<a href='#' style='position:absolute;right:70px;top:10px;font-size:15px;background-color:#aaa;' class='badge badge-pill badge-secondary text-right' id=CANCEL >CANCEL</a> "+
								"<a href='#' style='position:absolute;right:10px;top:10px;font-size:15px;background-color:var(--theme-color1);' class='badge badge-pill badge-primary text-right' id=OK >OK</a>"+
							"</div>" +
						"</div>"+
					"</div>" +
				"</div>" +
			"</div>"
		);
	}
	if (typeof callfrom_func == 'function')
		callfrom_func();
	if(!showConfim)
		$('#showConfim').hide();
	else
		$('#x').hide();
	
    $('#x').click(function () {
        clearTimeout(notif_timer);
        $('#not').remove();
        if (typeof callback_func == 'function') {
            callback_func();
        }
    });
	if(delay==undefined)
		delay=10000;
    notif_timer = setTimeout(function () {
        $('#not').remove();
        clearTimeout(notif_timer);
        if (typeof callback_func == 'function') {
            callback_func();
        }
    }, delay);
	
	$('#OK').click(function () {
        clearTimeout(notif_timer);
        $('#not').remove();
        if (typeof callback_func == 'function') {
            callback_func(true);
        }
    });
	
	$('#CANCEL').click(function () {
        clearTimeout(notif_timer);
        $('#not').remove();
        if (typeof callback_func == 'function') {
            callback_func(false);
        }
    });
}

function debug(message) {
	message=message.replace(/\n/g, '')
    try {
        var res = $.parseJSON(message);
        reponse(res);
    } catch (e) {
        console.log("debug(message) erreur capturée :"+e+"\n"+message);
    }
    //debugTextArea.value += message + "\n";
    //debugTextArea.scrollTop = debugTextArea.scrollHeight;
}

function sendMessage(msg) {
	if(checkSocket()){
		if(!msg.includes("\"type\":\"login\""))
			lastReq=msg;
		try {
			if (websocket != null) {
				setAlert("alert-info", null,null,null,9999000);
				clearTimeout(notif_timer);
				notif_timer = setTimeout(function () {
					setAlert("alert-danger", "Le serveur ne répond pas",null,"alert_no_resp");
				}, 50000);
				websocket.send(msg);
				console.log("string sent :"+msg );
			}
		} catch (e) {
			console.log("erreur capturée :", e);
		}
	}
}

//sendMessage("msg");
//getPage("confirm-code");
//$('#solde').text("50300FCFA");
//$('#material').remove();

function reponse(res) {
   /*
    if (typeof (res.header) == 'object') {
    	setAlert("alert-danger","votre session a expiré...",
    		function(){getPage("login-form");}
    	);
    }*/
    clearTimeout(notif_timer);
    $('#not').remove();
    if (typeof (res) == 'object') {
        //alert(res.data.type);
        //res = res.data;
        if (typeof (res.sessionid) != "undefined") {
            user.sessionid = res.sessionid;
            window.localStorage.setItem("user", JSON.stringify(user));
        }
        if (res.value == "confirm-token-form") {
            setAlert("alert-info", "Entrez le code d'activation que vous allez recevoir par SMS...", function () {
                getPage("confirm-code");
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
        if (res.type == "call-busy") {
			var req={};
			req.type = "sipcallend";
			req.registerednum=sipManager.User.tel;
			req.registeredpass=sipManager.User.pass;
			req.socketclienttype = "MOBILE_CLIENT";
			req.sessionid = user.sessionid;
			req = JSON.stringify(req);
			sendMessage(req);
        }
        if (res.type == "account-topup") {
			if(res.status == "approved"){
				setAlert("alert-success", "Operation succeeds...<br> your new DatiCash balance is "+res.balance+user.device, function () {
					if(operation.type == "money-transfer"){
						getPage("livraison_methode");
					}
					else if(operation.type == "Bill-payment"){
						getPage("livraison_methode");
					}
					else
						getPage("services");
				});
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
        if (res.type == "balance") {
			if(operation.type != undefined){ 
				res.value=parseInt(res.value, 10);
				if(res.value<operation.montant){
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
            var balance = "$0.000";
			user.balance=parseInt(res.value, 10);
            if (res.unit == "USD") {
                balance = "$" + res.value;
            } else
                balance = res.value + res.unit;
            $('#solde').text(balance);
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
			user.SipUser = SipUser;
			window.localStorage.setItem("user", JSON.stringify(user));
			sipManager.init(SipUser);
				
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
					else
						sipManager.hangup();
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
				$('#send_call').hide();
                setAlert("alert-danger", res.details);
            }
        }
        else if (res.type == "register-form") {
            if (res.value == "confirm-token-form") {
				user.profile.token="confirm-code";
                getPage("confirm-code");
            } else if (res.value == "already") {
				user.profile.token="ok";
				setAlert("alert-info", "Un compte existe déjà avec ce numéro...",null,"alert_already");
				var ts=setTimeout(function () {
					clearTimeout(ts);
					$('#not').remove();
					getPage("password");
				},3000);
            } else if (res.value == "bad") {
                if (res.keys != "undefined")
                    setAlert("alert-danger", "Les valeurs " + JSON.stringify(res.keys) + " ne sont pas correctes");
                else
                    setAlert("alert-danger", "Une erreur c'est produit!");
            }
        } else if (res.type == "confirm-token") {
            if (res.value == "ok") {
				user.profile.token="ok";
                autoStart();
            } else if (res.value == "bad") {
				user.profile.token="bad";
                setAlert("alert-danger", "Code incorrecte...",
                    function () {
                        if (page != "confirm-code")
                            getPage("confirm-code");
                    },"alert_token_bad"
                );
            } else if (res.value == "expired") {
				user.profile.token="expired";
                setAlert("alert-danger", "Ce code a expiré...",
                    function () {
                        if (page != "reset-methode")
                            getPage("reset-methode");
                    },"alert_token_expired"
                );
            }
        } else if (res.type == "get-reset-token") {
            if (res.value == "token-send-ok") {
                getPage("reset-passwort");
            } else {
                getPage("login-form");
            }
        } else if (res.type == "reset-password") {
            if (res.value == "password-reset-ok") {
                getPage("services");
            } else if (res.value == "token-bad") {
                setAlert("alert-danger", "Code de reinitialisation incorrecte...",
                    function () {
                        if (page != "reset-passwort")
                            getPage("reset-passwort");
                    },"alert_resset_token_bad"
                );
            } else if (res.value == "password-length-bad") {
                setAlert("alert-danger", "Nouveau mot de passe trop court...",
                    function () {
                        if (page != "reset-passwort")
                            getPage("reset-passwort");
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
        } else if (res.type == "change-password") {
            if (res.value == "password-change-ok") {
				user.profile.password=user.pass;
				setAlert("alert-danger", "Succès...",
                    function () {
                        getPage("password");
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
        } else if (res.type == "login") {
            if (res.value == "login-ok") {
				user.lastLogin = Date.now();
				user.login=true;
				var SipUser ={};
				SipUser.domaine=res.host;
				
				SipUser.tel=user.profile.countrycode+user.profile.phonenumber;
				SipUser.pass=res.sippass;
								
				user.profile.password=user.pass;
				//user.profile.phonenumber=user.name;
				user.SipUser = SipUser;
				window.localStorage.setItem("user", JSON.stringify(user));
				sipManager.init(SipUser);
				if(page=="" || page=="login-form" || page=="password")
					getPage("services");
            } else if (res.value == "login-bad") {
				user.lastLogin=null;
				window.localStorage.setItem("user", JSON.stringify(user));
                setAlert("alert-danger", "Mot de passe ou numéro incorrecte...",
                    function () {
                        if (page != "login-form")
                            getPage("login-form");
                    },"alert_login_bad"
                );
            } else if (res.value == "login-lock") {
                setAlert("alert-danger", "Ce compte est momentanement bloqué...",
                    function () {
                        if (page != "login-form")
                            getPage("login-form");
                    },"alert_login_lock"
                );
            }else if (res.value == "non-existent-account") {
                setAlert("alert-danger", "Aucun compte trouvé. Créez en un avec votre numéro.",
                    function () {
                        getPage("register-form");
                    },"alert_non-existent-account",3000
                );
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
	var tt=0;
	setAlert("alert-info", null,null,null,9999000);
    try {
        if (typeof MozWebSocket == 'function')
            WebSocket = MozWebSocket;
        if (websocket && websocket.readyState == 1)
            websocket.close();
		websocket = new WebSocket(wsUri);
		
        websocket.onopen = function (evt) {
			$('#not').remove();
			clearTimeout(tt);
			var req ={};
			req.socketclienttype = "MOBILE_CLIENT";
			req.sessionid = user.sessionid;
			req = JSON.stringify(req);
			sendMessage(req);
			//autoStart();
        };
        websocket.onclose = function (evt) {
			setAlert("alert-danger", "Connexion impossible!<br> vérifiez votre accès internet. prochaine tentative dans 10s",null,"alert_no_connect");
			tt = setTimeout(function () {
				try {
					initWebSocket();
				} catch (e) {
					console.log("erreur capturée :", e);
				}
			},10000);
        };
        websocket.onmessage = function (evt) {
            window.localStorage.setItem("websocket", evt.data);
            debug(evt.data);
            console.log("Message received :"+evt.data);
        };
        websocket.onerror = function (evt) {
           // debug('ERROR: ' + evt.data);
        };
    } catch (exception) {
		setAlert("ERROR: "+exception);
    }
}

function stopWebSocket() {
    if (websocket)
        websocket.close();
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
					initWebSocket();
                    break;
                }
            default:
                {
                    stateStr = "UNKNOW";
					initWebSocket();
                    break;
                }
        }
        console.log("WebSocket state = " + websocket.readyState + " ( " + stateStr + " )");
    } else {
        console.log("WebSocket is null");
    }
	return false;
}

function main_() {
    $(':root').css('--theme-color1', '#00aff0');
    $(':root').css('--theme-color2', '#00aff0');

    $('.btn-menu').click(function () {
		$('.menu-cover').remove();
		$('body').append(
			"<div class='menu-cover'>"+
				"<nav class='menu' style='transform: translateX(0vw);'>" +
				"<br><span style='color:#fff;font-size:20px;' class='close_menu' > <i class='fa fa-angle-left'></i> Back</span><br><br><br>" +
				"<ul>" +
				"<li class='menu-item separate'><a href='home.html' for='Out' ><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>Logout</font></font><i class='fa fa-sign-out-alt'></i></a></li>" +
				"<li class='menu-item'><a href='#' class='topup '><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'> Account topup</font></font><i class='fa fa-dollar-sign'></i></a></li>" +
				"<li class='menu-item'><a href='user_infos' ><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>Profile</font></font><i class='fa fa-user-circle'></i></a></li>" +
				"<li class='menu-item separate'><a href='address' ><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>Address</font></font><i class='fa fa-map-marker-alt'></i></a></li>" +
				"<li class='menu-item'><a href='change-password'><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>Pin code</font></font><i class='fa fa-key'></i></a></li>" +
				"<li class='menu-item'><a href='#'><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>Change account</font></font><i class='fa fa-exchange-alt'></i></a></li>" +
				"<li class='menu-item separate'><a href='#'><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>Setting</font></font><i class='fa fa-cogs'></i></a></li>" +
				"<li class='menu-item'><a href='#' class='Help '><font style='vertical-align: inherit;'><font style='vertical-align: inherit;'>Help</font></font><i class='fa fa-question-circle'></i></a></li>" +
				"</ul>" +
				"</nav>"+
			"</div>"
		);
		
		$('.close_menu').click(function () {
			$('.menu-cover').remove();
		});
		
		$('.menu a').click(function () {
			$('.menu-cover').remove();
		});
		
		$('.Help').click(function () {
			$('body').append("<div id=aide style='position:fixed; top:0px; width:100%; height:100%; z-index: 999;background-color:#eee;'><img src='./img/DatiMob_toujours.gif' width='100%' height='100%'></div>");
			$('#aide').click(function () {
				$('#aide').remove();
			});
		});
		main_();
    });

    $('form').submit(function () {
        var request = $("form").serializeFormJSON();
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
			request.creditcardexpirationdate="20"+request.creditcardexpirationdate+"-"+$('#ccmonth').val();
			request.billtofirstname="";
			request.billtolastname="";
			request.billtocompany="";
			request.billtocustomertype="";
			request.billtoaddress="";
			request.billtocity="";
			request.billtostate="";
			request.billtozip="";
			request.billtocountry="";
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
			getPage("payment_methode");
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
			request.countrycode=user.profile.countrycode;
			request.phonenumber=user.profile.phonenumber;
			request.email=user.profile.email;
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
        }
        if (request.type == "change-password") {
			if(request.email==undefined)
				request.email = user.profile.email;
			if(request.password==undefined){
				request.oldpassword = user.profile.password;
				request.newpassword = user.profile.password;
				request.password = user.profile.password;
			}
			else{
				request.oldpassword = user.profile.password;
				user.profile.password=request.newpassword;
			}
			if(request.billtofirstname==undefined)
				request.billtofirstname = user.profile.billtofirstname;
			if(request.billtolastname==undefined)
				request.billtolastname = user.profile.billtolastname;
			if(request.countrycode==undefined)
				request.countrycode = user.profile.countrycode;
			if(request.phonenumber==undefined)
				request.phonenumber = user.profile.phonenumber;
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
    });

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
    });
	$('#Change_account').click(function (event) {
		user = null;
		window.localStorage.setItem("user", JSON.stringify(user));
		getPage("login-form");
    });

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
	$('.services').click(function (event) {
		operation.step="account-topup";
		operation.type = $(this).attr('for');/*
		if(operation.countryCode != "cm" && operation.type!="International-call"){
			setAlert("alert-info", "Our services are not yet available for this country...",null,"alert_not_service");
			return;
		}
		operation.country = $('#country_selector').val().split(" ")[0];
		*/
		if(operation.type=="money-transfer"){
			getPage("montant");
		}
		else if(operation.type=="Bill-payment"){
			operation.montant=2;
			getPage("type_facture");
		}
		else if(operation.type=="International-call"){
			getPage("International_call");
		}
		else if(operation.type=="Phone-credit"){
			setAlert("alert-info", "Ce service sera disponible sur notre plateforme très bientot!",null,"service_will_be_available");
		}
		else if(operation.type=="Send-SMS"){
			setAlert("alert-info", "Ce service sera disponible sur notre plateforme très bientot!",null,"service_will_be_available");
		}/*
		else{
			$('html').addClass('nav-open');
			$('.navbar-toggler').removeClass('navbar-toggler').addClass('navbar-toggler toggled');
		}*/
	});
	$('.Bill').click(function (event) {
		operation.bill = $(this).attr('for');
		getPage("bill_number");
	});
	


}

function autoStart(){ 
	if(user.profile.phonenumber == undefined || user.profile.phonenumber == ""){
		getPage("register-form");
	}
	else if(user.profile.password == user.profile.phonenumber){
		getPage("password",function(){return 1;});
	}
	else
		getPage("password");/*
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
	if(index_page>0)
		index_page--;
	//getPage(page_last[index_page],"back");
	if(user.login==true)
		getPage("services");
	else
		getPage("login-form");
}


function start(){
	autoStart();
	try {
		initWebSocket();
	} catch (e) {
		console.log("erreur capturée :", e);
	}
	main_();
}
//main_();


function confirme(txt='',callback_func,title='',type='info',ok='OK',cancel='CANCEL'){
	Swal.fire({
		title: '<strong>'+title+'</strong>',
		type: type,
		html:txt,
		reverseButtons: true,
		showCloseButton: true,
		showCancelButton: true,
		focusConfirm: false,
		confirmButtonText:'<i class="fa fa-thumbs-up"></i> '+ok,
		cancelButtonText:cancel
	}).then((result) => {
		if (typeof callback_func == 'function') {
            callback_func(result);
        }
	})
}
/*
confirme("Call this number?",function(result){
	alert(JSON.stringify(result));
});*/

start();
//getPage("password",function(){return 2;});

//getPage("services");
/*
setAlert("alert-info", "Secure your account with a passwordSecure your account with passwordSecure your account with ", function(result){
	if(result){
		getPage("new_password");
	}
}, null,999999,false);
*/
//user={};true
//window.localStorage.removeItem("user");false
//getPage("International_call");
//alert("path");
//window.localStorage.clear();
//window.localStorage.removeItem("user");
//debug(window.localStorage.getItem("websocket"));

