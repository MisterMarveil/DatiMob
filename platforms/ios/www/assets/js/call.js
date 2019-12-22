$('#send_call').hide();
		var input = document.querySelector("#phonenumber");
		var iti = intlTelInput(input, {
			// allowDropdown: false,
			autoHideDialCode: false,
			autoPlaceholder: "off",
			// dropdownContainer: document.body,
			// excludeCountries: ["us"],
			// formatOnDisplay: false,
			geoIpLookup: function(callback) {
				$.get("http://ipinfo.io", function() {}, "jsonp").always(function(resp) {
					var countryCode = (resp && resp.country) ? resp.country : "";
					callback(countryCode);
				});
			},
			hiddenInput: "fullnumber",
			initialCountry: "auto",
			// localizedCountries: { 'de': 'Deutschland' },
			nationalMode: true,
			// onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'],
			placeholderNumberType: "MOBILE",
			// preferredCountries: ['cn', 'jp'],
			separateDialCode: true,
			utilsScript: "./assets/js/utils.js"
		});	
//window.localStorage.removeItem("hist");
		function getHistorique(){
			var hist = window.localStorage.getItem("hist");
			var last='';
			if (hist != null) {
				try {
					hist = $.parseJSON(hist);
					jQuery.each(hist, function(index, value) {
						//alert(index+": "+ value);
						last += "<a href='#' class='list-group-item hist' for="+hist[index].dialCode+" num='"+hist[index].val+"'><i class='fa fa-user-circle'></i>"+hist[index].val+"<span class='badge'>"+hist[index].date+"</span></i></a>";
					});
				} catch (e) {
					console.log("erreur capturée :", e);
				}
			}
			$('#list-group').html(last);
			
			$('.hist').click(function (event) {
				//alert($(this).attr('num'));
				var r = confirm("Call this number?");
				if(r == true){
					var num = $(this).attr('num');
					operation.callingCodes=$(this).attr('for');
					sendCall(num);
				}
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
			$('#clavier').show();
			$('#call_list').css('height','20%');
		});
		
		$('#Back').click(function (event) {
			last_page();
		});
		$( "#phonenumber" ).focus(function() {
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
				var countryData = TelInput.getSelectedCountryData();
				operation.callingCodes=countryData.dialCode;
				sendCall(TelInput.getNumber());
			}else if(index == 14){
				//backspace
			}else{ 
				$(".tel").val($(".tel").val()+(index+1));
				if($("#phonenumber").css('padding-left')=='6px'){
					$("#phonenumber").css('padding-left','110px');
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
		}