
function close_keypad(){
	$('.keypad ').remove();
	app.off('key_datimob');
}

function key(e){
	app.emit('key_datimob',e);
}

function iniPassword_keypad(){
	$('.keypad ').remove();
	var numpad = 
		"<div class='sheet-modal keypad keypad-sheet keypad-type-custom modal-in' style='display: block;'>"+
			"<div class='sheet-modal-inner keypad-buttons'>"+
				"<span class='keypad-button'><span class='key'>1</span></span>"+
				"<span class='keypad-button'><span class='key'>2</span></span>"+
				"<span class='keypad-button'><span class='key'>3</span></span>"+
				"<span class='keypad-button'><span class='key'>4</span></span>"+
				"<span class='keypad-button'><span class='key'>5</span></span>"+
				"<span class='keypad-button'><span class='key'>6</span></span>"+
				"<span class='keypad-button'><span class='key'>7</span></span>"+
				"<span class='keypad-button'><span class='key'>8</span></span>"+
				"<span class='keypad-button'><span class='key'>9</span></span>"+
				"<span class='keypad-button'><span class='key cancel' style='font-size:15px;'>FORGET?</span></span>"+
				"<span class='keypad-button'><span class='key'>0</span></span>"+
				"<span class='keypad-button keypad-delete-button'><span class='key'><i class='fas fa-backspace'></i></span></span>"+
			"</div>"+
		"</div>";
	$('#app').append(numpad);
	$('.keypad-button').click(function () {
		if($(this).attr('class').indexOf('keypad-delete-button')>=0)
			key(11);
		else
			key($(this).children('.key').text());
	});
	return numpad;
}

function iniCall_keypad(){
	$('.keypad ').remove();
	var numpad = 
	"<div class='sheet-modal keypad keypad-sheet keypad-type-custom modal-in' style='display: block;'>"+
		"<div class='toolbar'>"+
			"<div class='toolbar-inner' style='border: 3px solid rgb(242, 242, 242);'><div class='list'><ul><li class='item-content item-input '><div class='item-inner'><div class='item-title'></div><div class='item-input-wrap'><div class='iti iti--allow-dropdown iti--separate-dial-code'><div class='iti__flag-container'><div class='iti__selected-flag' role='combobox' aria-owns='country-listbox' tabindex='0' title='United States: +1'><div class='iti__flag iti__us'></div><div class='iti__selected-dial-code'>+1</div><div class='iti__arrow'></div></div></div><input type='tel' name='phonenumber' id='phone' placeholder='201-555-0123' autocomplete='off' data-intl-tel-input-id='0' style='padding-left: 78px;'></div></div></div></li></ul></div><div class='right'><a href='#' class='link '><i class='fas fa-backspace' style='font-size:20px;'></i></a></div></div>"+
		"</div>"+
		"<div class='sheet-modal-inner keypad-buttons'>"+
			"<span class='keypad-button call_button'><span class='key'>1</span><span class='keypad-button-letters'></span></span>"+
			"<span class='keypad-button call_button'><span class='key'>2</span><span class='keypad-button-letters'>ABC</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>3</span><span class='keypad-button-letters'>DEF</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>4</span><span class='keypad-button-letters'>GHI</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>5</span><span class='keypad-button-letters'>JKL</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>6</span><span class='keypad-button-letters'>MNO</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>7</span><span class='keypad-button-letters'>PQRS</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>8</span><span class='keypad-button-letters'>TUV</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>9</span><span class='keypad-button-letters'>WXYZ</span></span>"+
			"<span class='keypad-button call_button'><span class='key ' style='font-size:15px;'>*</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>0</span></span>"+
			"<span class='keypad-button call_button'><span class='key'>#</span></span>"+
			"<span class='keypad-button dia_button address'><span class='key'><i class='fas fa-address-card'></i></span></span>"+
			"<span class='keypad-button dia_button dial'><span class='key'><i style='color:#fff;' class='fas fa-phone'></i></span></span>"+
			"<span class='keypad-button dia_button'><span class='key'><i class='fas fa-phone'></i></span></span>"+
		"</div>"+
	"</div>";
	$('#app').append(numpad);
	$('.keypad-button').click(function () {
		if($(this).attr('class').indexOf('dia_button address')>=0)
			key('contact');
		else if($(this).attr('class').indexOf('dia_button dial')>=0)
			key('call');
		else
			key($(this).children('.key').text());
	});
	return numpad;
	
}

