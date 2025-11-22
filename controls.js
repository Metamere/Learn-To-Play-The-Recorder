var control_y, inst_x, scale_x, key_x, mode_x, tune_x
var tuning_slider_shown = false
var tempo_slider_shown = false
var drone_vol_slider_shown = false
var vol_slider_shown = false
var sequence_slider_shown = false
var initial_tuning
var sequence_shuffled
var shuffled_scale_indices = []
var shuffled_keys_indices = []
var shuffled_mode_indices = []
var shuffled_sequence_indices = []
var shuffled_scales_index = 0
var shuffled_keys_index = 0
var shuffled_mode_index = 0
var shuffled_sequence_index = 0
var sequence_number_temp = 0
var misc_buttons_shown = false
var octaves_changed = false
var save_confirm_shown = false
var reverse_mode_switched = false
let img_w, img_h, img_y

function create_controls(initial=true){
	inst_x = 1.5 * U
	scale_x = chart_x + 4.25 * U + inst_x
	key_x = chart_x + 13 * U + inst_x
	mode_x = chart_x + 16.5 * U + inst_x
	control_y = 0//chart_y - 5*U
	
	const button_h = 1.65 * U
	const button_w = min(4 * U, W - chart_x2)
	const scl = int(U * 0.5)
	const scl_L = int(U * 0.7)
	const scl2 = min(button_h, int(U * (0.55 + 0.25 * mobile)))

	const text_w = int(0.25 * button_w)
	
	background(255)
	
	if(initial){
		instrument_select = createSelect();
		// if (note_count >= 12) 
		scale_select = createSelect();
		key_select = createSelect();
		mode_select = createSelect();
		create_dropdown(inst_x, control_y, instruments_arr, instrument_select, instrument_name, update_instrument, "instrument_select")
		create_dropdown(scale_x, control_y, scales_arr, scale_select, scale_name, update_scale, "scale_select")
		create_dropdown(mode_x, control_y, modes_arr, mode_select, modes_arr[0], update_mode, 'mode_select')
	}
	else{
		instrument_select.position(inst_x, control_y)
		scale_select.position(scale_x, control_y)
		key_select.position(key_x, control_y)
		mode_select.position(mode_x, control_y)

		let font_size = int(U * 0.65) + "px"
		instrument_select.style("font-size", font_size)
		scale_select.style("font-size", font_size)
		key_select.style("font-size", font_size)
		mode_select.style("font-size", font_size)
	}

	// sequence_select = createSelect();
	// if (note_count >= 12) 
	
	// instrument_index = instruments_arr.findIndex(object => {return object.name === instrument_name})
	// starting_note = instruments_arr[instrument_index].key
	// if(instrument_obj.key[0] == 'F') notes_arr = notes_arr_F
	// else notes_arr = notes_arr_C
	
	// create_dropdown(key_x, control_y, notes_arr, key_select, notes_arr[0], update_key, "key_select")

	img_h = 15.8 * U
	img_w = img.width / img.height * img_h
	img_y = chart_y - 5.25 * U
	image(img, 0, img_y, img_w, img_h)
	
	if(initial){
		TEMPO_button = createButton(str(tempo) + ' bpm')
		TEMPO_button.mousePressed(toggle_tempo_slider)
		TEMPO_button.id('TEMPO')
	}
	TEMPO_button.size(button_w, button_h)
	TEMPO_button.position(chart_x2, 0)
  TEMPO_button.style("font-size", min(button_h, int(U * (0.6 + 0.27 * mobile))) + "px") // int(U*0.65)
	
	if(initial){
		TEMPO_slider = createSlider(20, 400, tempo, 1)
		TEMPO_slider.input(update_tempo)
		TEMPO_slider.hide()
		TEMPO_slider.addClass("slider")
	} 
	TEMPO_slider.position(5 * U + inst_x, control_y + 0.75 * U)
	TEMPO_slider.size(U * 22)
	
	if(initial){
		COND_button = createButton('⁞⁞⁞⁞⁞⁞')
		COND_button.id('COND')
		COND_button.mousePressed(condense_notes)
	} 
	COND_button.style("font-size", int(U * (0.7 + 0.1 * mobile)) + "px")
	COND_button.size(button_w, button_h)
	COND_button.position(chart_x2, chart_hy - button_h)

	if(initial){
		HIDE_FING_button = createButton('HIDE ◑|◉|◒')
		HIDE_FING_button.id('HIDE')
		// HIDE_FING_button = createButton('HIDE FING')
		HIDE_FING_button.mousePressed(hide_fingerings)
	} 
	HIDE_FING_button.style("font-size", scl2 * 0.85 + "px")
	HIDE_FING_button.size(button_w, button_h)
	HIDE_FING_button.position(chart_x2, chart_hy - 2 * button_h)
	
	let button_w2 = U * 2.62
	let button_h2 = U * 1.8
	let row2 = U*2.85
	let row3 = row2 - button_h2
	let row1 = row2 + button_h2
	
	// if (note_count == 12){
	if(initial){
		TOGL_MISC_button = createButton('MISC. MENU')
		TOGL_MISC_button.mousePressed(TOGL_miscellaneous_buttons)
	} 
	TOGL_MISC_button.style("font-size", scl + "px")
	TOGL_MISC_button.size(1.5 * U, U * 2.775)
	TOGL_MISC_button.position(0, 0)
	
	if(initial){
		HOLD_KEY_button = createButton('HOLD KEY')
		HOLD_KEY_button.mousePressed(TOGL_instrument)   
		HOLD_KEY_button.hide()
	} 
	HOLD_KEY_button.style("font-size", scl_L + "px")
	HOLD_KEY_button.size(button_w2, button_h2)
	HOLD_KEY_button.position(button_w2*4, row2)
	
	if(initial){
		HOLD_FING_button = createButton('HOLD FING.')
		HOLD_FING_button.mousePressed(TOGL_instrument2)
		HOLD_FING_button.hide()
	} 
	HOLD_FING_button.style("font-size", scl_L + "px")
	HOLD_FING_button.size(button_w2, button_h2)
	HOLD_FING_button.position(button_w2*4, row1)
	
	let last_col_x = U * 13.1
	
	if(initial){
		SAVE_CHART_button = createButton('SAVE CHART')
		SAVE_CHART_button.mouseReleased(save_confirm)
		SAVE_CHART_button.id('SAVE_CHART')
		SAVE_CHART_button.hide()
	} 
	SAVE_CHART_button.style("font-size", scl_L + "px")
	SAVE_CHART_button.size(button_w2 - U * 0.1, button_h2 + U * 0.15)
	SAVE_CHART_button.position(U * 13.35, row3 - U * 0.15)
	
	if(initial){
		SAVE_CHART_CANCEL_button = createButton('CANCEL')
		SAVE_CHART_CANCEL_button.mouseReleased(save_confirm)
		SAVE_CHART_CANCEL_button.id('SAVE_CANCEL')
		SAVE_CHART_CANCEL_button.hide()
	} 
	SAVE_CHART_CANCEL_button.style("font-size", scl_L + "px")
	SAVE_CHART_CANCEL_button.size(button_w2 * 1.4, button_h2)
	SAVE_CHART_CANCEL_button.position(U * 13.25 + button_w2, row3)
	
	if(initial){
		SAVE_CHART_CONFIRM_button = createButton('CONFIRM')
		SAVE_CHART_CONFIRM_button.mouseReleased(save_chart)
		SAVE_CHART_CONFIRM_button.id('SAVE_CONFIRM')
		SAVE_CHART_CONFIRM_button.hide()	
	} 
	SAVE_CHART_CONFIRM_button.style("font-size", scl_L + "px")
	SAVE_CHART_CONFIRM_button.size(button_w2*1.4, button_h2)
	SAVE_CHART_CONFIRM_button.position(U*13.25 + button_w2*2.4, row3)
	
	if(initial){
		DRONE_VOL_button = createButton('DRONE VOL ' + round(default_drone_vol * 100))
		DRONE_VOL_button.mousePressed(toggle_drone_vol_slider)
		DRONE_VOL_button.id('DRONE_VOL')
		DRONE_VOL_button.hide()
	} 
	DRONE_VOL_button.style("font-size", int(U * 0.67) + "px")
	DRONE_VOL_button.size(button_w2 + U*0.15, button_h2)
	DRONE_VOL_button.position(last_col_x, row2)
	
	if(initial){
		DRONE_VOL_slider = createSlider(0, 1, drone_vol, 0.01)
		DRONE_VOL_slider.input(update_drone_vol)
		DRONE_VOL_slider.addClass("slider")
		DRONE_VOL_slider.hide()
	} 
	DRONE_VOL_slider.position(U*16.5, U*4.5 - button_h2)
	DRONE_VOL_slider.size(U*12)
		
	if(initial){
		VOL_button = createButton('VOL ' + round(default_vol * 100))
		VOL_button.mousePressed(toggle_vol_slider)
		VOL_button.id('VOL')
		VOL_button.hide()
	} 
	VOL_button.style("font-size", int(U*0.67) + "px")
	VOL_button.size(button_w2 + U*0.15, button_h2)
	VOL_button.position(last_col_x, row1)
	
	if(initial){
		VOL_slider = createSlider(0, 1, vol, 0.01)
		VOL_slider.input(update_vol)
		VOL_slider.addClass("slider")
		VOL_slider.hide()
	} 
	VOL_slider.position(U*16.5, U*4.5)
	VOL_slider.size(U*12)
	
	if(initial){
		SCL_DOWN_button = createButton('SCALE ▼')
		SCL_DOWN_button.mousePressed(scale_increase)
		SCL_DOWN_button.id('SCL_DOWN')
		SCL_DOWN_button.hide()		
	} 
	SCL_DOWN_button.style("font-size", scl_L + "px")
	SCL_DOWN_button.size(button_w2, button_h2)
	SCL_DOWN_button.position(button_w2*1.5, row1)
	
	if(initial){
		SCL_UP_button = createButton('▲ SCALE')
		SCL_UP_button.mousePressed(scale_decrease)
		SCL_UP_button.id('SCL_UP')
		SCL_UP_button.hide()
	} 
	SCL_UP_button.style("font-size", scl_L + "px")
	SCL_UP_button.size(button_w2, button_h2)
	SCL_UP_button.position(button_w2*1.5, row2)

	if(initial){ 
		MODE_INC_button = createButton('▶')
		MODE_INC_button.mousePressed(mode_increase)
		MODE_INC_button.id('MODE_INC')	
		MODE_INC_button.hide()
	}
	MODE_INC_button.style("font-size", int(U * 1.5) + "px")
	MODE_INC_button.size(button_w2 * 0.75, button_h2)
	MODE_INC_button.position(button_w2 * 0.75, row1)

	if(initial){
		MODE_DEC_button = createButton('◀')
		MODE_DEC_button.mousePressed(mode_decrease)
		MODE_DEC_button.id('MODE_DEC')
		MODE_DEC_button.hide()	
	} 
	MODE_DEC_button.style("font-size", int(U * 1.5) + "px")
	MODE_DEC_button.size(button_w2 * 0.75, button_h2)
	MODE_DEC_button.position(0, row1)
	
	if(initial){
		MODE_MODE_button = createButton('RELATIVE MODE ◀ ▶')
		MODE_MODE_button.mousePressed(mode_mode_switch)
		MODE_MODE_button.id('MODE_MODE')
		MODE_MODE_button.hide()
	} 
	MODE_MODE_button.style("font-size", scl_L + "px")
	MODE_MODE_button.size(button_w2 * 1.5, button_h2)
	MODE_MODE_button.position(0, row2)
	
	if(initial){
		PLACEHOLDER_button = createButton(' ')
		// PLACEHOLDER_button.mousePressed()
		PLACEHOLDER_button.id('PLACEHOLDER')
		PLACEHOLDER_button.hide()
	} 
	PLACEHOLDER_button.style("font-size", scl_L + "px")
	PLACEHOLDER_button.size(button_w2*1.5, button_h2*2 * 2/3)
	PLACEHOLDER_button.position(button_w2*2.5, row2 + button_h2*2/3)
	
	if(initial){
		TUNING_button = createButton(str(tuning) + ' Hz')
		TUNING_button.mousePressed(toggle_tuning_slider)
		TUNING_button.id('TUNING')
		TUNING_button.hide()
	} 
	TUNING_button.style("font-size", int(U*0.95) + "px")
	TUNING_button.size(button_w2*1.5, button_h2*2/3)
	TUNING_button.position(button_w2*2.5, row2)
	
	if(initial){
		PREV_SCALE_button = createButton('PREV. SCL.')
		NEXT_SCALE_button = createButton('NEXT SCL.')
		PREV_SCALE_button.id('PREV_SCALE')	
		NEXT_SCALE_button.id('NEXT_SCALE')
		PREV_SCALE_button.mousePressed(prev_scale)
		NEXT_SCALE_button.mousePressed(next_scale)
		PREV_SCALE_button.hide()
		NEXT_SCALE_button.hide()
		PREV_SCALE_button.style('backgroundColor', 'rgb(140,140,140)')
		NEXT_SCALE_button.style('backgroundColor', 'rgb(140,140,140)')
	} 
	PREV_SCALE_button.style("font-size", scl_L * 0.9 + "px")
	NEXT_SCALE_button.style("font-size", scl_L * 0.9 + "px")
	PREV_SCALE_button.size(button_w2*0.75, button_h2*4/3)
	NEXT_SCALE_button.size(button_w2*0.75, button_h2*4/3)
	PREV_SCALE_button.position(button_w2*2.5, row2 + button_h2*2/3)
	NEXT_SCALE_button.position(button_w2*3.25, int(row2 + button_h2*2/3))
	
	if(initial){
		TUNING_slider = createSlider(392, 494, tuning, 1)
		TUNING_slider.input(update_tuning)
		TUNING_slider.hide()
		TUNING_slider.addClass("slider")
	} 
	TUNING_slider.position(button_w2*4.2, row2)
	TUNING_slider.size(U*17.5)

	if(initial){
		RAND_KEY_button = createButton('KEY 🔀')
		RAND_MODE_button = createButton('MODE 🔀')
		RAND_SCL_button = createButton('SCALE 🔀')
		RAND_KEY_button.mousePressed(random_key)			
		RAND_MODE_button.mousePressed(random_mode)
		RAND_SCL_button.mousePressed(random_scale)
		RAND_MODE_button.id('RAND_MODE')
	} 
	RAND_KEY_button.style("font-size", scl2 + "px")
	RAND_KEY_button.size(button_w, button_h * 1.1)
	RAND_KEY_button.position(chart_x2, chart_hy - 5.5 * button_h)
	RAND_MODE_button.style("font-size", scl2 * (0.85 + 0.1 * mobile) + "px")
	RAND_MODE_button.size(button_w, button_h * 1.1)
	RAND_MODE_button.position(chart_x2, chart_hy - 4.4 * button_h)
	RAND_SCL_button.style("font-size", scl2 * (0.85 + 0.1 * mobile) + "px")
	RAND_SCL_button.size(button_w, button_h * 1.1)
	RAND_SCL_button.position(chart_x2, chart_hy - 3.3 * button_h)
	
	if(initial){
		DRONE_button = createButton('DRONE')
		DRONE_button.mousePressed(toggle_drone)
		DRONE_button.id('DRONE')
	} 
	DRONE_button.style("font-size", text_w + "px")
	DRONE_button.size(button_w, button_h)
	DRONE_button.position(chart_x2, button_h)
	
	if(initial){
		PLAY_button = createButton('PLAY')
		PLAY_button.mousePressed(play_scale)
		PLAY_button.id('PLAY')
		set_play_button_chars()
	} 
	PLAY_button.style("font-size", scl2 + "px")
	PLAY_button.size(button_w, button_h)
  PLAY_button.position(chart_x2, 2*button_h)
	
	if(initial){
		SEQ_SELECT_button = createButton('SEQ. 01')
		SEQ_SELECT_button.mousePressed(toggle_sequence_slider)
		SEQ_SELECT_button.id('SEQUENCE')
	} 
	SEQ_SELECT_button.style("font-size", scl2 * 1.1 + "px")
	SEQ_SELECT_button.size(button_w, button_h)
  SEQ_SELECT_button.position(chart_x2, 3*button_h)
	
	if(initial){
		PLACEHOLDER2_button = createButton(' ') // for backdrop on sequence options menu
		PLACEHOLDER2_button.id('PLACEHOLDER2')
		PLACEHOLDER2_button.hide()	
	} 
	PLACEHOLDER2_button.size(button_w2 * 5.3, button_h2 * 2)
	PLACEHOLDER2_button.position(U * 1.55, row2)
	
	if(initial){
		SEQUENCE_slider = createSlider(1, seq_arr.length, sequence_number, 1)
		SEQUENCE_slider.input(update_sequence)
		SEQUENCE_slider.hide()
		SEQUENCE_slider.addClass("slider")
		SEQUENCE_slider.value(sequence_number)
		let seq_chars = sequence_number + (dir_override != 0 ? '*' : '')
		document.getElementById("SEQUENCE").innerHTML = 'SEQ. ' + seq_chars
	} 
	SEQUENCE_slider.position(chart_x + 0.4 * U, control_y + 4.5 * U)
	SEQUENCE_slider.size(U * 13)

	
	if(initial){
		OCT_RADIO = createRadio('octaves to play')
		OCT_RADIO.option('1')
		OCT_RADIO.option('2')
		OCT_RADIO.selected(str(octaves_to_play))
		OCT_RADIO.changed(set_octaves_to_play)
		OCT_RADIO.hide()
	} 
	OCT_RADIO.style("font-size", int(U * 0.85) + "px")
	OCT_RADIO.size(U * 5, U * 0.9)
	OCT_RADIO.position(U * 10.5,  U * 2.9)
	
	if(initial){
		REVERSE_button = createButton('◀') // ⬅️
		REVERSE_button.mousePressed(toggle_reverse_mode)
		REVERSE_button.id('REV')
		REVERSE_button.hide()
		FORWARD_button = createButton('▶') // ➡️
		FORWARD_button.mousePressed(toggle_forward_mode)
		FORWARD_button.id('FORW')
		FORWARD_button.hide()
		BOTH_DIR_button = createButton('◀▶') // ↔️
		BOTH_DIR_button.mousePressed(toggle_both_directions_mode)
		BOTH_DIR_button.id('BOTH')
		BOTH_DIR_button.hide()
		LOOP_button = createButton('🔁')
		LOOP_button.mousePressed(toggle_loop_mode)
		LOOP_button.id('BOTH')
		LOOP_button.hide()
	} 
	const scl_L2 = scl_L * 1.5
	REVERSE_button.style("font-size", scl_L2 + "px")
	REVERSE_button.size(U * 1.5, U * 1.5)
	REVERSE_button.position(U * 2, U * 2.85)

	BOTH_DIR_button.style("font-size", scl_L2 + "px")
	BOTH_DIR_button.size(U * 2.25, U * 1.5)
	BOTH_DIR_button.position(U * 3.5, U * 2.85)

	FORWARD_button.style("font-size", scl_L2 + "px")
	FORWARD_button.size(U * 1.5, U * 1.5)
	FORWARD_button.position(U * 5.75, U * 2.85)

	LOOP_button.style("font-size", scl_L2 + "px")
	LOOP_button.size(U * 1.5, U * 1.5)
	LOOP_button.position(U * 7.75, U * 2.85)
	

	// if(initial) notes_count_input = createInput(str(note_count))
	// notes_count_input.style("font-size", int(U*0.65) + "px")
	// notes_count_input.size(button_w*0.75, button_h/2)
  // 	notes_count_input.position(W-button_w*0.8, chart_hy - 2.65*button_h)
  // 	notes_count_input.changed(set_note_count)	
	// if(note_count == 12 && !stylo_mode) notes_count_input.hide()
	
	if(initial){
		shuffled_scale_indices = [...Array(scales_arr.length-1).keys()] // -1 to exclude the chromatic scale
		shuffle(shuffled_scale_indices, true)
		//shuffle(array, [bool])
		// shuffle_array(shuffled_scale_indices)
		shuffled_keys_indices = [...Array(12).keys()]
		shuffle(shuffled_keys_indices, true)
		// shuffle_array(shuffled_keys_indices)
		shuffled_sequence_indices = [...Array(seq_arr.length).keys()]
		shuffle(shuffled_sequence_indices, true)	
		// shuffle_array(shuffled_sequence_indices)	
	}

}

var mode_mode = 'relative'
function mode_mode_switch(){
	if(mode_mode == 'relative'){
		mode_mode = 'parallel'
		if(condensed_notes){
			document.getElementById("MODE_MODE").innerHTML = 'RELATIVE MODE ◀ ▶'
			MODE_MODE_button.style('backgroundColor', 'rgb(180,180,180)')
			RAND_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
		}
		else{
			document.getElementById("MODE_MODE").innerHTML = 'PARALLEL MODE ◀ ▶'
			MODE_MODE_button.style('backgroundColor', 'rgb(110,150,240)')
			RAND_MODE_button.style('backgroundColor', 'rgb(110,150,240)')
		}
	}
	else{
		mode_mode = 'relative'
		document.getElementById("MODE_MODE").innerHTML = 'RELATIVE MODE ◀ ▶'
		MODE_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
		RAND_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
	}
}

function TOGL_miscellaneous_buttons(){
	misc_buttons_shown = !misc_buttons_shown
	if(misc_buttons_shown){
		HOLD_KEY_button.show()
		HOLD_FING_button.show()
		DRONE_VOL_button.show()
		VOL_button.show()	
		SCL_UP_button.show()
		SCL_DOWN_button.show()
		if(!tempo_slider_shown) SAVE_CHART_button.show()
		if(sequence_slider_shown) toggle_sequence_slider()
		PLACEHOLDER_button.show()	
		MODE_MODE_button.show()
		MODE_INC_button.show()
		MODE_DEC_button.show()	
		TUNING_button.show()
		PREV_SCALE_button.show()
		NEXT_SCALE_button.show()
		TOGL_MISC_button.style('backgroundColor', 'rgb(255,200,95)')
		TOGL_MISC_button.size(1.57*U, 1.5*U*2.4)
		
	}
	else{
		HOLD_KEY_button.hide()
		HOLD_FING_button.hide()
		DRONE_VOL_button.hide()	
		VOL_button.hide()	
		SCL_UP_button.hide()
		SCL_DOWN_button.hide()
		SAVE_CHART_button.hide()
		SAVE_CHART_CONFIRM_button.hide()
		SAVE_CHART_CANCEL_button.hide()
		save_confirm_shown = false
		PLACEHOLDER_button.hide()
		MODE_MODE_button.hide()
		MODE_INC_button.hide()
		MODE_DEC_button.hide()
		PREV_SCALE_button.hide()
		NEXT_SCALE_button.hide()
		if(drone_vol_slider_shown) toggle_drone_vol_slider()
		if(vol_slider_shown) toggle_vol_slider()
		if(tuning_slider_shown) toggle_tuning_slider() // TUNING_slider.hide()
		TUNING_button.hide()	
		TOGL_MISC_button.style('backgroundColor', 'rgb(240,240,240)')
		TOGL_MISC_button.size(1.5*U, 1.5*U*1.85)
	}
}


function save_confirm(){
	save_confirm_shown = !save_confirm_shown
	if(save_confirm_shown){
			SAVE_CHART_CONFIRM_button.show()
			SAVE_CHART_CANCEL_button.show()
	}
	else{
		SAVE_CHART_CONFIRM_button.hide()
		SAVE_CHART_CANCEL_button.hide()
	}
}

var dir_override = 0

function toggle_reverse_mode(){
	direction_mode_switch(-1)
}
function toggle_forward_mode(){
	direction_mode_switch(1)
}
function toggle_both_directions_mode(){
	direction_mode_switch(2)
}

function direction_mode_switch(direction){
	if(direction != dir_override){
		dir_override = direction
		if(direction == 2) chart.reversal = true
		else{
			chart.reversal = false
			if(dir_override != chart.dir){
				// chart.dir = dir_override
				if(chart.playing_scale) chart.play_scale()
			}
		} 
	}
	else{
		dir_override = 0
		if ([3, 6, 10, 13, 14].includes(sequence_number)) chart.reversal = false
		else chart.reversal = true
	}
	storeItem("dir_override", dir_override)
	set_direction_button_colors()
	set_play_button_chars()
	let seq_chars = sequence_number + (dir_override != 0 ? '*' : '')
	document.getElementById("SEQUENCE").innerHTML = 'SEQ. ' + seq_chars
}

function set_direction_button_colors(){
	if(chart.reversal){
		if(dir_override == 2)	BOTH_DIR_button.style('backgroundColor', 'rgb(255,200,95)') 
		else BOTH_DIR_button.style('backgroundColor', 'rgb(255, 237, 123)')
		REVERSE_button.style('backgroundColor', 'rgb(240,240,240)')
		FORWARD_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	else{
		BOTH_DIR_button.style('backgroundColor', 'rgb(240,240,240)')
		FORWARD_button.style('backgroundColor', 'rgb(240,240,240)')
		REVERSE_button.style('backgroundColor', 'rgb(240,240,240)')
		if(dir_override == -1){
			REVERSE_button.style('backgroundColor', 'rgb(255,200,95)')
		} 
		else if(dir_override == 1){
			FORWARD_button.style('backgroundColor', 'rgb(255,200,95)')
		}
		else FORWARD_button.style('backgroundColor', 'rgb(255, 237, 123)')
	}
}

function set_play_button_chars(){
	let direction_chars
	if(dir_override == 0){
		direction_chars = chart.reversal ? '◀ ▶' : '▶'
	}
	else{
		if(dir_override == 2) direction_chars = '◀ ▶'
		else if(dir_override == 1) direction_chars = '▶'
		else direction_chars = '◀'
	}
	if(chart.repeat) direction_chars += ' 🔁'
	document.getElementById("PLAY").innerHTML = direction_chars
}

function toggle_loop_mode(){

	chart.repeat = !chart.repeat
	storeItem("repeat_state", chart.repeat)

	if(chart.repeat){
		LOOP_button.style('backgroundColor', 'rgb(255,200,95)')
	}
	else{
		LOOP_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	set_play_button_chars()
}

// function set_note_count(){
// 	// let note_count_temp = min(max(int(abs(notes_count_input.value())),1),120)
// 	// if(note_count_temp != note_count){ 
// 		// note_count = note_count_temp
// 		note_count = min(max(int(abs(notes_count_input.value())),1),120)
// 		notes_count_input.value(str(note_count))
// 		if(note_count < 12) {
// 			condensed_notes = false
// 			condense_notes()
// 		}
// 		if(note_count == 12){
// 			HIDE_FING_button.show()
// 			HOLD_KEY_button.show()
// 			HOLD_FING_button.show()
// 			RAND_SCL_button.show()
// 			RAND_KEY_button.show()
// 			RAND_MODE_button.show()
// 			OCT_RADIO.show()
// 			document.getElementById("instrument_select").style.display = "block"
// 			document.getElementById("scale_select").style.display = "block"
// 			document.getElementById("mode_select").style.display = "block"
// 			if(!stylo_mode) notes_count_input.hide()
	// if(!mobile) OCT_RADIO.style('transform', 'translateX(1.6em)')
// 		}
// 		else{
// 			HIDE_FING_button.hide()
// 			HOLD_KEY_button.hide()
// 			HOLD_FING_button.hide()
// 			RAND_SCL_button.hide()
// 			RAND_KEY_button.hide()
// 			RAND_MODE_button.hide()
// 			OCT_RADIO.hide()
// 			document.getElementById("instrument_select").style.display = "none"
// 			document.getElementById("scale_select").style.display = "none"
// 			document.getElementById("mode_select").style.display = "none"
// 		}
// 		update_instrument()
// 	// }
// }


function set_octaves_to_play(value = null){
  if (typeof value !== 'number' || isNaN(value) || value === null) {
    value = int(OCT_RADIO.value());
  }
	let octaves_to_play_new = value
	if (octaves_to_play_new != octaves_to_play){
		let currently_playing_scale = chart.playing_scale
		if(currently_playing_scale){
			chart.playing_scale = false
		}
		octaves_to_play = octaves_to_play_new
		storeItem("octaves_to_play", octaves_to_play)
		OCT_RADIO.selected(str(octaves_to_play))
		chart.OTP = octaves_to_play
		octaves_changed = true
		update_seq_display = true
		chart.generate_sequence()

		if(currently_playing_scale){
			chart.play_scale()
		}
	}
}


// function shuffle_array(array) {
// 	// let ind = 0 // array[array.length-1]
// 	// for( var i = 0; i < array.length; i++){ 
// 	// 		if ( array[i] === ind) { 
// 	// 				array.splice(i, 1); 
// 	// 				i--;
// 	// 		}
// 	// }
// 	for (let i = array.length - 1; i > 0; i--) {
// 			const j = Math.floor(Math.random() * (i + 1));
// 			[array[i], array[j]] = [array[j], array[i]];
// 	}
// 	// array.push(ind)
// }


// function shuffle_sequence(){
// 	if(chart.playing_scale){ 
// 		// sequence_number = int(random(1,6))
// 		chart.play_scale(sequence_number)
// 		chart.generate_note_lengths(true)
// 		shuffle(chart.notes_sequence, true)
// 		// print(chart.notes_sequence)
// 	}											
// }


function random_scale(){		
	scale_name = scales_arr[shuffled_scale_indices[shuffled_scales_index]].name
	// if (note_count >= 12) 
	scale_select.value(scale_name)
	update_scale()
	
	shuffled_scales_index++
	if(shuffled_scales_index == shuffled_scale_indices.length){
		shuffle(shuffled_scale_indices, true)
		shuffled_scales_index = 0
	}
}


function random_key(){
	key_name = notes_arr[shuffled_keys_indices[shuffled_keys_index]]
	key_select.value(key_name)
	update_key()

	shuffled_keys_index++
	if(shuffled_keys_index == shuffled_keys_indices.length){
		shuffle(shuffled_keys_indices, true)
		shuffled_keys_index = 0
	}
}


function random_sequence(){
	SEQUENCE_slider.value(shuffled_sequence_indices[shuffled_sequence_index] + 1)
	update_sequence()
	
	shuffled_sequence_index++
	if(shuffled_sequence_index == shuffled_sequence_indices.length){
		shuffle(shuffled_sequence_indices, true)
		shuffled_sequence_index = 0
	}
}

function update_sequence(){
	update_seq_display = true
	sequence_number = SEQUENCE_slider.value()
	storeItem("sequence_number", sequence_number)
	chart.generate_sequence()
	let seq_chars = sequence_number + (dir_override != 0 ? '*' : '')
	document.getElementById("SEQUENCE").innerHTML = 'SEQ. ' + seq_chars
	if(chart.playing_scale) chart.play_scale(sequence_number)
	if(!dir_override){
		set_direction_button_colors()
		set_play_button_chars()
	}
}

function random_mode(){
	if(modes_arr.length < 2) return
	if(modes_arr.length < 4){
		mode_increase()
		return
	}
	while (shuffled_mode_indices[shuffled_mode_index] == mode_shift){
		shuffle(shuffled_mode_indices, true)
	}
	mode_change(shuffled_mode_indices[shuffled_mode_index])
	
	shuffled_mode_index++
	if(shuffled_mode_index == shuffled_mode_indices.length){
		shuffle(shuffled_mode_indices, true)
		shuffled_mode_index = 0
	}
}


function mode_change(new_mode_shift){
	if(modes_arr.length < 2) return
	mode_shift = new_mode_shift
	let selected_key
	if(mode_mode == 'parallel' && !condensed_notes){
		let selected_note2
		for(let note of chart.notes){
			if(note.note_val == 2){
				selected_note2 = note
				break
			}
		}
		let index_shift = 0
		for(i=0;i < mode_shift;i++){ index_shift += scale_pattern[i] } //  shifted_scale_pattern[i]
		index_shift = index_shift%12
		let selected_index = selected_note2.index + 12 - index_shift
		if(selected_index > 12) selected_index -= 12
		for (let note of chart.notes){ 
			if(note.index == selected_index){
				selected_key = note.note_name
				break
			}
		}
	}
	mode_select.value(modes_arr[mode_shift])
	update_mode()
	if(mode_mode == 'parallel' && !condensed_notes){
		key_select.value(selected_key)
		update_key()
	}
}


function update_tuning(){
	tuning = TUNING_slider.value()
	document.getElementById("TUNING").innerHTML = str(tuning) + ' Hz'
}

function update_drone_vol(){
	default_drone_vol = DRONE_VOL_slider.value()
	update_volumes()
	document.getElementById("DRONE_VOL").innerHTML = 'DRONE VOL ' + round(default_drone_vol * 100)
}
function update_vol(){
	default_vol = VOL_slider.value()
	update_volumes()
	document.getElementById("VOL").innerHTML = 'VOL ' + round(default_vol * 100)
}


function update_tempo(){
	tempo = TEMPO_slider.value()
	storeItem("tempo", tempo)
	chart.beat = 60/tempo
	chart.interval_time = chart.beat
	chart.generate_note_lengths()
	document.getElementById("TEMPO").innerHTML = str(tempo) + ' bpm'
}


function toggle_drone(){
	drone_playing = !drone_playing
	if(drone_playing){ 
		play_drone()
		DRONE_button.style('backgroundColor', 'rgb(255,200,95)') //(212,140,0) = col2
	}
	else{ 
		drone_env.triggerRelease(drone)
		DRONE_button.style('backgroundColor', 'rgb(240,240,240)')
	}
}

function play_drone() {
	drone.freq(drone_freq)
	drone.stop()
	drone.start()
	drone_env.triggerAttack(drone)
}

function toggle_tuning_slider(){
	if(tuning_slider_shown){ 
		TUNING_slider.hide()
		if(misc_buttons_shown){
			HOLD_KEY_button.show()
			HOLD_FING_button.show()
			DRONE_VOL_button.show()
			VOL_button.show()	
		}
		if(misc_buttons_shown && !tempo_slider_shown) SAVE_CHART_button.show()
		tuning_slider_shown = false
		TUNING_button.style('backgroundColor', 'rgb(240,240,240)')
		if(tuning != initial_tuning){
			update_chart = true
			chart.create_frequencies()
			chart.create_fingering_pattern()
			chart.create_notes(update_label=true,update_color=true)
			if(chart.playing_scale) chart.play_scale()
			if(drone_playing) play_drone()
		}
		else if(tuning != default_tuning) {
			tuning = default_tuning
			TUNING_slider.value(tuning)
			document.getElementById("TUNING").innerHTML = str(tuning) + ' Hz'
			update_chart = true
			chart.create_frequencies()
			chart.create_fingering_pattern()
			chart.create_notes(update_label=true,update_color=true)
			if(chart.playing_scale) chart.play_scale()
			if(drone_playing) play_drone()
		}
		storeItem("tuning", tuning)
	}
	else{
		//if (tempo_slider_shown) toggle_tempo_slider()
		initial_tuning = tuning
		TUNING_slider.show()
		SAVE_CHART_button.hide()
		SAVE_CHART_CONFIRM_button.hide()
		SAVE_CHART_CANCEL_button.hide()
		save_confirm_shown = false
		HOLD_KEY_button.hide()
		HOLD_FING_button.hide()
		DRONE_VOL_button.hide()	
		VOL_button.hide()	
		DRONE_VOL_slider.hide()
		DRONE_VOL_button.style('backgroundColor', 'rgb(240,240,240)')
		VOL_slider.hide()
		VOL_button.style('backgroundColor', 'rgb(240,240,240)')
		drone_vol_slider_shown = false
		vol_slider_shown = false
		
		tuning_slider_shown = true
		TUNING_button.style('backgroundColor', 'rgb(255,180,160)')
	}
}


function toggle_tempo_slider(){
	if(tempo_slider_shown){ 
		if(misc_buttons_shown) SAVE_CHART_button.show()
		TEMPO_slider.hide()
		tempo_slider_shown = false
		TEMPO_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	else{
		// if (tuning_slider_shown) toggle_tuning_slider()
		if(misc_buttons_shown){
			SAVE_CHART_button.hide()
			save_confirm_shown = false
		}
		tempo_slider_shown = true
		TEMPO_slider.show()
		TEMPO_button.style('backgroundColor', 'rgb(255,200,95)')
	}
}


function toggle_drone_vol_slider(){
	if(drone_vol_slider_shown){ 
		DRONE_VOL_slider.hide()
		storeItem("default_drone_vol", default_drone_vol)
		drone_vol_slider_shown = false
		DRONE_VOL_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	else{
		DRONE_VOL_slider.show()
		drone_vol_slider_shown = true
		DRONE_VOL_button.style('backgroundColor', 'rgb(255,200,95)')
	}
}
function toggle_vol_slider(){
	if(vol_slider_shown){ 
		VOL_slider.hide()
		storeItem("default_vol", default_vol)
		vol_slider_shown = false
		VOL_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	else{
		VOL_slider.show()
		vol_slider_shown = true
		VOL_button.style('backgroundColor', 'rgb(255,200,95)')
	}
}

let sequence_slider_shown_time = 0

function toggle_sequence_slider(){
	if(sequence_slider_shown){ 
		SEQUENCE_slider.hide()
		REVERSE_button.hide()
		FORWARD_button.hide()
		BOTH_DIR_button.hide()
		LOOP_button.hide()
		PLACEHOLDER2_button.hide()	
		OCT_RADIO.hide()
		sequence_slider_shown = false
		SEQ_SELECT_button.style('backgroundColor', 'rgb(240,240,240)')
		const shown_time = millis() - sequence_slider_shown_time
		if(shown_time < 1000 &&
			sequence_number == sequence_number_temp && 
			!octaves_changed && 
			!reverse_mode_switched){
			random_sequence()
		}
		reverse_mode_switched = false
		octaves_changed = false
	}
	else{
		PLACEHOLDER2_button.show()	
		SEQUENCE_slider.show()
		REVERSE_button.show()
		FORWARD_button.show()
		BOTH_DIR_button.show()
		LOOP_button.show()
		set_direction_button_colors()
		sequence_slider_shown = true
		sequence_slider_shown_time = millis()
		SEQ_SELECT_button.style('backgroundColor', 'rgb(255,200,95)')
		sequence_number_temp = sequence_number
		OCT_RADIO.show()
	}
}

var starting_note, starting_octave, new_instrument

function update_instrument(maintain_fingering,maintain_key){
	new_instrument = true
	let play = false
	// if(hide_fingering) hide_fingerings()
	if(typeof chart != "undefined"){ if(chart.playing_scale) play = true }
	instrument_obj = instruments_arr.find(x => x.name === instrument_name)
	let previous_starting_note = starting_note //instrument_obj.key[0]
	update_chart = true
	if(typeof chart != "undefined" && instrument_select.value() != previous_instrument && instrument_select.value() != instrument_name){
		previous_instrument = instrument_name
		storeItem("previous_instrument", previous_instrument)
	}
	if(typeof chart != "undefined" ) instrument_name = instrument_select.value()
	instrument_obj = instruments_arr.find(x => x.name === instrument_name)
	starting_note = instrument_obj.key[0]
	starting_octave = instrument_obj.key[1]
	key_select.remove()
	key_select = createSelect();
	
	notes_arr = (starting_note == 'F')? notes_arr_F : notes_arr_C
	
	if(maintain_fingering && starting_note != previous_starting_note){
		// find equivalent key name for the given fingering
		let opp_array
		if(notes_arr[0] == notes_arr_C[0]) opp_array = notes_arr_F
		else opp_array = notes_arr_C
		key_name = notes_arr[opp_array.indexOf(key_name)]
	}	
	else if(maintain_key != true) key_name = notes_arr[0]

	create_dropdown(key_x, control_y, notes_arr, key_select, key_name, update_key, 'key_select')
	update_chart = true
	chart = new fingering_chart(chart_x, chart_y); //x,y,noteWidth, noteHeight
	chart.create_fingering_pattern()
	if(play) chart.play_scale()
	if(drone_playing) play_drone()
	if(show_info) generate_info_display()
	new_instrument = false
	storeItem("instrument_name", instrument_name)
}


function update_scale(history=false){
	// print(scale_select.value().slice(scale_select.value().length-1))
	update_chart = true
	let previous_scale_length = 0
	if(scale_pattern) previous_scale_length = scale_pattern.length
	let mode_needs_to_be_shifted = false
	let scale_mode_shift = 0
	if (note_count == 12){
		if(history == true){ 
			// print(scale_history_index)
			let scale_history_item = scales_history_list[scale_history_index]
			// print('scale_history_index = ' + scale_history_index + ', ' + scale_history_item)
			scale_mode_shift = scale_history_item[1]
			let scale_name_shift = scale_history_item[0]
			if(scale_name == scale_name_shift){
				if(scale_mode_shift == mode_shift) return
				else{
					mode_shift = scale_mode_shift
					update_mode(history=true)
					return
				}
			}
			else{ 
				scale_name = scale_name_shift
				if(scale_mode_shift != mode_shift) mode_needs_to_be_shifted = true
			}
			scale_select.value(scale_name)
		}
		else scale_name = scale_select.value()
	}
	// 	if(scale_select.value().slice(scale_select.value().length-2) == 12) scale_name = "Chromatic"
	// 	else if(!isNaN(scale_select.value().slice(scale_select.value().length-1))){
	// 		scale_name = scale_select.value().slice(0,scale_select.value().length - 4)
	// 	}
	// 	else scale_name = scale_select.value()
	// }
	else scale_name = "Chromatic"
	// if(scale_name.includes('minor')) mode_scale_type = 'minor'
	// else mode_scale_type = 'Major'
	// print(mode_scale_type)
	// mode_scale_type = (scale_name.includes('minor'))? 'minor':'Major'
	scale_obj = scales_arr.find(x => x.name === scale_name)
	
	scale_index = scales_arr.findIndex(object => {return object.name === scale_name})
	// if (scale_index != -1) scale_pattern = scales_arr[scale_index].pattern
	
	scale_pattern = scale_obj.pattern
	if(scale_pattern.length != previous_scale_length) update_seq_display = true
	mode_select.remove()
	mode_select = createSelect();
	mode_shift = 0 //min(mode_shift,scale_pattern.length-1)
	if(scale_obj.mode_names) modes_arr = scale_obj.mode_names
	else modes_arr = [...mode_numerals]
	create_dropdown(mode_x, control_y, modes_arr, mode_select, modes_arr[0], update_mode, 'mode_select')
	mode_scale_type = minor_check()? 'minor':'Major'
	chart.create_fingering_pattern()
	chart.create_notes(update_label=true,update_color=true)
	// chart.generate_sequence()
	if(chart.playing_scale) chart.play_scale()
	shuffled_mode_indices = [...Array(modes_arr.length).keys()]
	shuffle(shuffled_mode_indices, true)
	shuffled_mode_index = 0
	if(drone_playing) play_drone()
	diatonic = (scale_name == 'Major' || scale_name == 'natural minor' ||
							scale_name == 'Major Hexatonic' || scale_name == 'Major Pentatonic' || scale_name == 'minor pentatonic')

	if(show_info) generate_info_display()
	
	if(modes_arr.length < 2){// scale_name == 'Chromatic' || scale_name == 'Whole Tone'){
		document.getElementById("RAND_MODE").innerHTML = 'ONE MODE'
		RAND_MODE_button.style('backgroundColor', 'rgb(150,140,140)')
		MODE_INC_button.style('backgroundColor', 'rgb(150,140,140)')
		MODE_DEC_button.style('backgroundColor', 'rgb(150,140,140)')
	}
	else{
		if(modes_arr.length < 4){
			document.getElementById("RAND_MODE").innerHTML = 'NEXT MODE'
			RAND_MODE_button.style('backgroundColor', 'rgb(240,190,190)')
		}
		else{
			document.getElementById("RAND_MODE").innerHTML = 'MODE 🔀'
			RAND_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
		}
		MODE_INC_button.style('backgroundColor', 'rgb(240,240,240)')
		MODE_DEC_button.style('backgroundColor', 'rgb(240,240,240)')
	}

	if(history != true){
		if(scale_history_index < scales_history_list.length-1) scales_history_list.splice(scale_history_index+1,scales_history_list.length - scale_history_index)
		scales_history_list.push([scale_name,mode_shift])
		if(scales_history_list.length > 200) scales_history_list.splice(0,1) // restrict length of undo history.
		scale_history_index = scales_history_list.length-1
		NEXT_SCALE_button.style('backgroundColor', 'rgb(140,140,140)')
		if(scales_history_list.length > 1) PREV_SCALE_button.style('backgroundColor', 'rgb(240,240,240)')
		// print(scales_history_list)
	}
	if(mode_needs_to_be_shifted){
		mode_shift = scale_mode_shift
		update_mode(history=true)
	}
	storeItem("scale_name", scale_name)
}


var mode_scale_type = 'Major'

function update_mode(history=false){
	// mode_select.value(modes_arr[mode_shift]) 
	if(history == true){ 
			// let scale_mode_shift = scales_history_list[scale_history_index][1]
			mode_name = modes_arr[mode_shift]
			mode_select.value(mode_name)
	}	
	else{
		mode_name = mode_select.value()
		mode_shift = max(0,modes_arr.indexOf(mode_select.value()) )
	}
	mode_scale_type = minor_check()? 'minor':'Major'
	update_chart = true
	chart.create_fingering_pattern()
	// update_label can be false, except that some info is needed for the music notation generation.
	chart.create_notes(update_label=true,update_color=true) 
	if(chart.playing_scale) chart.play_scale()
	if(drone_playing) play_drone()
	if(mode_shift > 0) mode_select.style('backgroundColor', 'rgb(255,200,95)')
	else mode_select.style('backgroundColor', 'rgb(229,229,255)')
	if(show_info) generate_info_display()
	
	if(history != true){
		scales_history_list.push([scale_name,mode_shift])
		if(scales_history_list.length > 200) scales_history_list.splice(0,1) // restrict length of undo history.
		scale_history_index = scales_history_list.length-1
		// print(scales_history_list)
	}
	// storeItem("mode_scale_type", mode_scale_type)
	storeItem("mode_shift", mode_shift)
}
// function go_to_scale_and_mode(){} // could do both at the same time for randomization?


function update_key(){
	update_chart = true
	key_name = key_select.value()
	selected_key_name = key_name
	chart.create_fingering_pattern()
	// if(!condensed_notes)	chart.create_notes(true,true)
	// else 
	chart.create_notes(update_label=true,update_color=true)
	if(chart.playing_scale) chart.play_scale()
	if(drone_playing) play_drone()
	if(show_info) generate_info_display()
	storeItem("key_name", key_name)
}


function minor_check(){
	if(scale_name == 'Augmented') return true
	let minor_elements = ['inor', 'ocrian', 'ygian', 'olian', 'orian', 'iminished']
	let major_elements = ['ajor', 'onian', 'ydian']
	if(minor_elements.some(element => mode_name.includes(element))) return true
	let alt_index = min(mode_shift,scale_obj.alt.length-1)
	for(let i=0;i<scale_obj.alt[alt_index].length;i++){
			if(minor_elements.some(element => scale_obj.alt[alt_index][i].includes(element))) return true
	}
	let major_check = true
	if(minor_elements.some(element => scale_name.includes(element))){
		major_check = false
		major_check = (major_elements.some(element => mode_name.includes(element)) && !minor_elements.some(element => mode_name.includes(element)))
		for(let i=0;i<scale_obj.alt[alt_index].length;i++){
			if(major_elements.some(element => scale_obj.alt[alt_index][i].includes(element)) &&
				 !minor_elements.some(element => scale_obj.alt[alt_index][i].includes(element))) major_check = true
		}
	}
	return !major_check
}

	// if(mode_name.includes('minor') || 
	// 	 mode_name.includes('crian') ||
	// 	 mode_name.includes('ygian') ||
	// 	 mode_name.includes('olian') ||
	// 	 mode_name.includes('orian') ||
	// 	 scale_name == 'Augmented'
	// 	) mode_scale_type = 'minor'
	// else if(mode_name.includes('Major') ||
	// 			 mode_name.includes('onian') ||
	// 			 mode_name.includes('ydian')
	// 			 ) mode_scale_type = 'Major'
// }


function create_dropdown(x, y, arr, selection_object, start_value, selection_event_function, ID_name){
	selection_object.position(x, y);
	let val
  for(i=0;i<arr.length;i++){
		if(arr === modes_arr && (i == scale_pattern.length || 
			(((scale_name == 'Whole Tone' || scale_name == 'Chromatic') && i == 0)|| 
			(( scale_name == 'Diminished' || scale_name == 'Augmented') && i == 2)||
			(( scale_name == '2S Tritone' || scale_name == 'Tritone'  ) && i == 3) ))){
			modes_arr = modes_arr.slice(0, i);
			break

		}
		if(arr === notes_arr || arr === modes_arr || arr === seq_arr) val = arr[i]
		else val = arr[i].name
		selection_object.option(val);
  }
  selection_object.selected(start_value);
  selection_object.changed(selection_event_function);
	
  // selection_object.size(100, 100);
  // selection_object.style("font-family", "Comic Sans MS");  // to make it cursed
  selection_object.style("font-size", int(U*0.65) + "px")
  // selection_object.style('text-align', 'center')
	selection_object.id(ID_name)
}