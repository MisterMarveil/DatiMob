// Dom7
var $ = Dom7;
// Theme
var theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}

//Framework7.use(Framework7Keypad);
var timer_status_=0;

function status(statusText){
	if(Sip_status=="RegistrationSuccess")
		Sip_status=" Ready";/*
	else if(Sip_status!="Registering...")
		Sip_status=" Not Ready";*/
	$('.status span').text(Sip_status);
	if($('.status span').text()=="Registering..."){
		$('.status i').css("color","#f00");
		clearTimeout(timer_status_);
		timer_status_=setTimeout(function () {
			if($('.status i').css('display')=="block")
				$('.status i').css("display","none");
			else
				$('.status i').css("display","block");
			status();
		},500);
	}
	else if($('.status span').text()=="Ready"){
		$('.status i').css("color","#0f0");
		$('.status i').css("display","block");
		clearTimeout(timer_status_);
	}
	else{
		$('.status i').css("color","#FFA500");
		$('.status i').css("display","block");
		clearTimeout(timer_status_);
	}
}

function get_app(){
	app = new Framework7({
		name:'DatiMob',
		id: 'com.daticloud.datimob',
		root: '#app',
		theme: theme,
		data: function () {
			return {
				user: {
					firstName: 'John',
					lastName: 'Doe',
				},
			};
		},
		methods: {
			helloWorld: function () {
				app.dialog.alert('Hello World!');
			},
		},
		on: {
			pageInit: function () {
				$(".trans").each(function (index) {
					$(this).text(translate[_locale][$(this).attr("data-trans")]);
				});
			}
		},
		routes: routes,
		popup: {
			closeOnEscape: true,
		},
		sheet: {
			closeOnEscape: true,
		},
		popover: {
			closeOnEscape: true,
		},
		actions: {
			closeOnEscape: true,
		},
		vi: {
			placementId: 'pltd4o7ibb9rc653x14',
		},
	});

	mainView = app.views.create('.view-main');


	start();


	app.on('Sip_status', function (Sip_status) {
	status(Sip_status);
	});
}

var app_ = {
    // Application Constructor
    initialize: function() {//get_app();
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
		window.screen.orientation.lock('portrait');
		get_app();
		document.addEventListener("backbutton", onBackKeyDown, false);
		function onBackKeyDown() {
			return last_page();
		}
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
		console.log(JSON.stringify(user));
        console.log('Received Event: ' + id);
		//sipManager.init(user.SipUser);	
		
		
		var permissions = cordova.plugins.permissions;
		var list = [
			permissions.CAMERA,
			permissions.RECORD_AUDIO,
			permissions.MODIFY_AUDIO_SETTINGS
		];
		permissions.checkPermission(list, function( status ){
			if ( status.hasPermission ) {
				console.log("permissions OK");
			}
			else {
				permissions.requestPermissions(list,function(status) {
					if( !status.hasPermission ) 
						console.warn("permissions.CAMERA No");
				},function(){
					console.warn("error: permissions No");
				});
				
			}
		});
		
		permissions.requestPermissions(list, function(e){console.log(JSON.stringify(e));}, function(e){console.log(JSON.stringify(e));});
    }
};

app_.initialize();

