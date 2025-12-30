let control_y, inst_x, scale_x, key_x, mode_x, tune_x
let tuning_slider_shown = false
let tempo_slider_shown = false
let drone_vol_slider_shown = false
let vol_slider_shown = false
let sequence_slider_shown = false
let initial_tuning
let sequence_shuffled
let shuffled_scale_indices = []
let shuffled_keys_indices = []
let shuffled_mode_indices = []
let shuffled_sequence_indices = []
let shuffled_scales_index = 0
let shuffled_keys_index = 0
let shuffled_mode_index = 0
let shuffled_sequence_index = 0
let sequence_number_temp = 0
let misc_buttons_shown = false
let octaves_changed = false
let save_confirm_shown = false
let reverse_mode_switched = false
let img_w, img_h, img_y
let drone_button_longpress_timer = null
let drone_button_longpressed = false
let MIDI_OUTPUT_button = false

function create_controls(initial=true){
	inst_x = 2 * U
	scale_x = chart_x + 4.5 * U + inst_x
	mode_x = chart_x + 14 * U + inst_x
	control_y = 0
	
	const button_h = int(1.65 * U)
	const button_w = min(4 * U, W - chart_x2)
	const scl = int(U * 0.5)
	const scl_L = int(U * 0.7)
	const scl2 = min(button_h, int(U * (0.55 + 0.25 * mobile)))

	const text_w = int(0.25 * button_w)
	
	background(255)
	
	if(initial){
		instrument_select = createSelect()
		// if (note_count >= 12) 
		scale_select = createSelect()
		mode_select = createSelect()
		create_dropdown(inst_x, control_y, instruments_arr, instrument_select, instrument_name, update_instrument, "instrument_select")
		create_dropdown(scale_x, control_y, scales_arr, scale_select, scale_name, update_scale, "scale_select")
		create_dropdown(mode_x, control_y, modes_arr, mode_select, modes_arr[0], update_mode, 'mode_select')
	}
	else{
		instrument_select.position(inst_x, control_y)
		scale_select.position(scale_x, control_y)
		mode_select.position(mode_x, control_y)

		let font_size = int(U * 0.65) + "px"
		instrument_select.style("font-size", font_size)
		scale_select.style("font-size", font_size)
		mode_select.style("font-size", font_size)
	}

	img_w = U * 1.45
	img_h = int(img.height / img.width * img_w)
	img_y = int(chart_y - 5.25 * U)
	image(img, 0, img_y, img_w, img_h)
	
	if(initial){
		TEMPO_button = createButton(str(tempo) + ' bpm')
		TEMPO_button.mousePressed(toggle_tempo_slider)
		TEMPO_button.id('TEMPO')
	}
	TEMPO_button.size(button_w, button_h)
	TEMPO_button.position(chart_x2, 0)
  TEMPO_button.style("font-size", min(button_h, int(U * (0.6 + 0.27 * mobile))) + "px")
	
	if(initial){
		TEMPO_slider = createSlider(20, 200, base_tempo, 1)
		TEMPO_slider.input(function() {update_tempo(false)})
		TEMPO_slider.hide()
		TEMPO_slider.addClass("slider")
		let val
		if(tempo_multiplier < 1) val = 4 * tempo_multiplier
		else val = tempo_multiplier + 2 
		TEMPO_multiplier_slider = createSlider(1, 6, val, 1)
		TEMPO_multiplier_slider.input(function() {update_tempo(true)})
		TEMPO_multiplier_slider.hide()
		TEMPO_multiplier_slider.addClass("slider")
	} 
	TEMPO_slider.position(2 * U, control_y + U)
	TEMPO_slider.size(U * 27)
	TEMPO_multiplier_slider.position(17.5 * U, control_y + 3.5 * U)
	TEMPO_multiplier_slider.size(U * 10)
	
	if(initial){
		HIDE_FING_button = createButton('⬤ ⬤ ⬤')
		HIDE_FING_button.id('HIDE')
		HIDE_FING_button.mousePressed(hide_fingerings)
	} 
	HIDE_FING_button.style("font-size", scl2 * (0.85 + 0.35 * mobile) + "px")
	HIDE_FING_button.size(button_w, button_h)
	HIDE_FING_button.position(chart_x2, chart_hy - 2 * button_h)
	
	if(initial){
		COND_button = createButton('⁞⁞⁞⁞⁞⁞')
		COND_button.id('COND')
		COND_button.mousePressed(condensed_notes_toggle)
	} 
	COND_button.style("font-size", int(U * (0.75 + 0.6 * mobile)) + "px")
	COND_button.size(button_w, button_h)
	COND_button.position(chart_x2, chart_hy - button_h)
	
	const button_w2 = U * 2.62
	const button_w2b = button_w2 * 0.9
	const button_h2 = U * 1.8
	const button_hs = int(U * 1.5)
	const button_h23 = button_h2 * 2/3
	const row2 = U * 2.85
	const row3 = row2 - button_h2
	const row1 = row2 + button_h2

	if(initial){
		MISC_MENU_button = createButton('MISC. MENU')
		MISC_MENU_button.mousePressed(MISC_MENU_buttons_toggle)
	} 
	MISC_MENU_button.style("font-size", scl + "px")
	MISC_MENU_button.size(1.5 * U, U * 2.775)
	MISC_MENU_button.position(0, 0)
	
	let last_col_x = U * 13.4
	
	if(initial){
		SAVE_CHART_button = createButton('SAVE CHART')
		SAVE_CHART_button.mouseReleased(save_confirm)
		SAVE_CHART_button.id('SAVE_CHART')
		SAVE_CHART_button.hide()
		if(note_count != 12) SAVE_CHART_button.style('backgroundColor', 'rgb(140,140,140)')
	} 
	SAVE_CHART_button.style("font-size", scl_L + "px")
	SAVE_CHART_button.size(button_w2, button_h2 + U * 0.25)
	SAVE_CHART_button.position(last_col_x, row3 - U * 0.25)
	
	if(initial){
		SAVE_CHART_CANCEL_button = createButton('CANCEL')
		SAVE_CHART_CANCEL_button.mouseReleased(save_confirm)
		SAVE_CHART_CANCEL_button.id('SAVE_CANCEL')
		SAVE_CHART_CANCEL_button.hide()
	} 
	SAVE_CHART_CANCEL_button.style("font-size", scl_L + "px")
	SAVE_CHART_CANCEL_button.size(button_w2 * 1.4, button_h2)
	SAVE_CHART_CANCEL_button.position(last_col_x + button_w2, row3)
	
	if(initial){
		SAVE_CHART_CONFIRM_button = createButton('CONFIRM')
		SAVE_CHART_CONFIRM_button.mouseReleased(save_chart)
		SAVE_CHART_CONFIRM_button.id('SAVE_CONFIRM')
		SAVE_CHART_CONFIRM_button.hide()	
	} 
	SAVE_CHART_CONFIRM_button.style("font-size", scl_L + "px")
	SAVE_CHART_CONFIRM_button.size(button_w2 * 1.4, button_h2)
	SAVE_CHART_CONFIRM_button.position(last_col_x + button_w2 * 2.4, row3)
	
	if(initial){
		DRONE_VOL_button = createButton('DRONE VOL ' + round(default_drone_vol * 100))
		DRONE_VOL_button.mousePressed(toggle_volume_sliders)
		DRONE_VOL_button.id('DRONE_VOL')
		DRONE_VOL_button.hide()
	} 
	DRONE_VOL_button.style("font-size", int(U * 0.67) + "px")
	DRONE_VOL_button.size(button_w2 + U * 0.15, button_h2)
	DRONE_VOL_button.position(last_col_x, row2)
	
	if(initial){
		DRONE_VOL_slider = createSlider(0, 1, default_drone_vol, 0.01)
		DRONE_VOL_slider.input(update_drone_vol)
		DRONE_VOL_slider.addClass("slider")
		DRONE_VOL_slider.hide()
	} 
	DRONE_VOL_slider.position(U * 16.5, U * 4.5 - button_h2)
	DRONE_VOL_slider.size(U * 12)
		
	if(initial){
		VOL_button = createButton('VOL ' + round(default_vol * 100))
		VOL_button.mousePressed(toggle_volume_sliders)
		VOL_button.id('VOL')
		VOL_button.hide()
	} 
	VOL_button.style("font-size", int(U * 0.67) + "px")
	VOL_button.size(button_w2 + U * 0.15, button_h2)
	VOL_button.position(last_col_x, row1)
	
	if(initial){
		VOL_slider = createSlider(0, 1, vol, 0.01)
		VOL_slider.input(update_vol)
		VOL_slider.addClass("slider")
		VOL_slider.hide()
	} 
	VOL_slider.position(U * 16.5, U * 4.5)
	VOL_slider.size(U * 12)
	
	last_col_x -= button_w2b

	if(initial){
		HOLD_KEY_button = createButton('HOLD KEY')
		HOLD_KEY_button.mousePressed(function() {TOGL_instrument(false)})
		HOLD_KEY_button.hide()
		if(note_count != 12) HOLD_KEY_button.style('backgroundColor', 'rgb(140,140,140)')
	} 
	HOLD_KEY_button.style("font-size", scl_L + "px")
	HOLD_KEY_button.size(button_w2b, button_h2)
	HOLD_KEY_button.position(last_col_x, row2)
	
	if(initial){
		HOLD_FING_button = createButton('HOLD FING.')
		HOLD_FING_button.mousePressed(function() {TOGL_instrument(true)})
		HOLD_FING_button.hide()
	if(note_count != 12) HOLD_FING_button.style('backgroundColor', 'rgb(140,140,140)')
	} 
	HOLD_FING_button.style("font-size", scl_L + "px")
	HOLD_FING_button.size(button_w2b, button_h2)
	HOLD_FING_button.position(last_col_x, row1)

	if(instrument_type == 'recorder'){
		HOLD_FING_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	else HOLD_FING_button.style('backgroundColor', 'rgb(140,140,140)')

	if(initial){
		UP_button = createButton('▲')
		UP_button.mousePressed(function() {move_in_select_menu(-1)})
		UP_button.id('UP')
		UP_button.hide()

		DOWN_button = createButton('▼')
		DOWN_button.mousePressed(function() {move_in_select_menu(1)})
		DOWN_button.id('DOWN')
		DOWN_button.hide()

		SELECT_MENU_button = createButton('SCALE')
		SELECT_MENU_button.mousePressed(function() {change_select_menu()})
		SELECT_MENU_button.id('SELECT_MENU')
		SELECT_MENU_button.hide()
	} 
	
	SELECT_MENU_button.style("font-size", scl_L * 1.4 + "px")
	SELECT_MENU_button.style('transform', 'rotate(270deg)')
	SELECT_MENU_button.size(int(button_h2 * 2.0), U * 1.53)
	SELECT_MENU_button.position(button_w2 * 1.05, row2 + U * 1.05)
	
	UP_button.style("font-size", scl_L * 2 + "px")
	UP_button.size(button_w2 * 0.7, button_h2)
	UP_button.position(button_w2 * 2.015, row2)

	DOWN_button.style("font-size", scl_L * 2 + "px")
	DOWN_button.size(button_w2 * 0.7, button_h2)
	DOWN_button.position(button_w2 * 2.015, row1)

	if(initial){ 
		MODE_INC_button = createButton('▶')
		MODE_INC_button.mousePressed(function() {cycle_mode(1)})
		MODE_INC_button.id('MODE_INC')	
		MODE_INC_button.hide()
		MODE_DEC_button = createButton('◀')
		MODE_DEC_button.mousePressed(function() {cycle_mode(-1)})
		MODE_DEC_button.id('MODE_DEC')
		MODE_DEC_button.hide()	
		MODE_MODE_button = createButton('RELATIVE ◀ MODE ▶')
		MODE_MODE_button.mousePressed(mode_mode_switch)
		MODE_MODE_button.id('MODE_MODE')
		MODE_MODE_button.hide()
	}
	MODE_INC_button.style("font-size", button_hs + "px")
	MODE_INC_button.size(button_w2 * 0.725, button_h2)
	MODE_INC_button.position(button_w2 * 0.725, row1)
	MODE_DEC_button.style("font-size", button_hs + "px")
	MODE_DEC_button.size(button_w2 * 0.725, button_h2)
	MODE_DEC_button.position(0, row1)
	MODE_MODE_button.style("font-size", scl_L + "px")
	MODE_MODE_button.size(button_w2 * 1.45, button_h2)
	MODE_MODE_button.position(0, row2)

	if(initial){
		TYPE_MENU_button = createButton('TYPE')
		TYPE_MENU_button.id('TYPE')
		TYPE_MENU_button.hide()
		TYPE_MENU_button.mousePressed(instrument_type_menu_toggle)
		RECORDER_TYPE_button = createButton('RECORDER')
		RECORDER_TYPE_button.id('RECORDER')
		RECORDER_TYPE_button.hide()
		RECORDER_TYPE_button.mousePressed(function() {instrument_type_switch('recorder', false)})
		BRASS_TYPE_button = createButton('BRASS')
		BRASS_TYPE_button.id('BRASS')
		BRASS_TYPE_button.hide()
		BRASS_TYPE_button.mousePressed(function() {instrument_type_switch('brass', false)})
		Irish_whistle_TYPE_button = createButton('IRISH WHISTLE')
		Irish_whistle_TYPE_button.id('IRISH_WHISTLE')
		Irish_whistle_TYPE_button.hide()
		Irish_whistle_TYPE_button.mousePressed(function() {instrument_type_switch('Irish whistle', false)})
	}
	const scl_L2 = scl_L * 1.5
	TYPE_MENU_button.style("font-size", scl_L2 + "px")
	TYPE_MENU_button.style('transform', 'rotate(270deg)')
	TYPE_MENU_button.size(U * 3, 1.45 * U)
	TYPE_MENU_button.position(-U * 0.75, row1 + U * 2.58)
	
	RECORDER_TYPE_button.style("font-size", scl_L2 + "px")
	RECORDER_TYPE_button.size(U * 10, button_h)
	RECORDER_TYPE_button.position(U * 1.5, int(row1 + button_h2))
	BRASS_TYPE_button.style("font-size", scl_L2 + "px")
	BRASS_TYPE_button.size(U * 10, button_h)
	BRASS_TYPE_button.position(U * 1.5, int(row1 + button_h2 + button_h))
	Irish_whistle_TYPE_button.style("font-size", scl_L2 + "px")
	Irish_whistle_TYPE_button.size(U * 10, button_h)
	Irish_whistle_TYPE_button.position(U * 1.5, int(row1 + button_h2 + button_h * 2))
	
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

	const button_w2c = button_w2 * 0.75
	PREV_SCALE_button.style("font-size", scl_L * 0.9 + "px")
	NEXT_SCALE_button.style("font-size", scl_L * 0.9 + "px")
	PREV_SCALE_button.size(button_w2 * 0.75, button_h2 * 4/3)
	NEXT_SCALE_button.size(button_w2 * 0.75, button_h2 * 4/3)
	PREV_SCALE_button.position(last_col_x - 2 * button_w2c, row2 + button_h23)
	NEXT_SCALE_button.position(last_col_x - button_w2c, int(row2 + button_h23))
	
	if(initial){
		TUNING_button = createButton(str(tuning) + ' Hz')
		TUNING_button.mousePressed(toggle_tuning_slider)
		TUNING_button.id('TUNING')
		TUNING_button.hide()
	} 
	TUNING_button.style("font-size", int(U * 0.95) + "px")
	TUNING_button.size(button_w2 * 1.5, button_h23)
	TUNING_button.position(last_col_x - button_w2 * 1.5, row2)

	if(initial){
		TUNING_slider = createSlider(392, 494, tuning, 1)
		TUNING_slider.input(update_tuning)
		TUNING_slider.hide()
		TUNING_slider.addClass("slider")
	} 
	TUNING_slider.position(button_w2 * 4.2, row2)
	TUNING_slider.size(U * 17.5)

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
		// long-press (1s) opens misc menu and shows drone & master volume sliders
		DRONE_button.mousePressed(function(){
			// if(drone_button_longpressed){
			// 	if(misc_buttons_shown) MISC_MENU_buttons_toggle()
			// 	// toggle_drone()
			// 	drone_button_longpressed = false
			// 	return
			// }

				drone_button_longpressed = false
				if(drone_button_longpress_timer) clearTimeout(drone_button_longpress_timer)
				drone_button_longpress_timer = setTimeout(function(){
				drone_button_longpressed = true
				if(!drone_playing){
					toggle_drone()
				}
				if(misc_buttons_shown){
					MISC_MENU_buttons_toggle()
				} 
				else {
					if(!misc_buttons_shown) MISC_MENU_buttons_toggle()
					if(!drone_vol_slider_shown) toggle_drone_vol_slider()
					if(!vol_slider_shown) toggle_vol_slider()
				}
			}, 500)
		})
		DRONE_button.mouseReleased(function(){
			if(drone_button_longpress_timer){
				clearTimeout(drone_button_longpress_timer)
			} 
			// if it was a long press, we've already opened the menu — don't toggle the drone
			if(!drone_button_longpressed && sequence_change_primed == 0) toggle_drone()
			
		})
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
	PLACEHOLDER2_button.size(U * 12.8, button_h2 * 2)
	PLACEHOLDER2_button.position(U * 1.55, row2)
	
	if(initial){
		SEQUENCE_slider = createSlider(1, seq_arr.length, sequence_number, 1)
		SEQUENCE_slider.input(function() {update_sequence(0)})
		SEQUENCE_slider.hide()
		SEQUENCE_slider.addClass("slider")
		let seq_chars = sequence_number + ((chart.default_reversal_setting && abs(dir_override) == 1) || 
		(!chart.default_reversal_setting && dir_override == 2) ? '*' : '')
		document.getElementById("SEQUENCE").innerHTML = 'SEQ. ' + seq_chars
	} 
	SEQUENCE_slider.position(chart_x + 0.2 * U, control_y + 4.55 * U)
	SEQUENCE_slider.size(U * 12.35)

	if(initial){
		SWING_info = createButton(swing_factor)
		SWING_info.id('SWING')
		SWING_info.mousePressed(toggle_swing)
		SWING_info.style("text-align", "left")
	}
	SWING_info.style("padding-left", U * 0.2 + "px")
	SWING_info.style("font-size", scl_L + "px")
	SWING_info.position(27 * U, control_y)
	SWING_info.size(U * 2.1, U * 0.85)

	const y_seq = U * 2.85

	if(initial){
		REVERSE_button = createButton('◀') // ⬅️
		REVERSE_button.mousePressed(function() {direction_mode_switch(-1)})
		REVERSE_button.id('REV')
		REVERSE_button.hide()
		FORWARD_button = createButton('▶') // ➡️
		FORWARD_button.mousePressed(function() {direction_mode_switch(1)})
		FORWARD_button.id('FORW')
		FORWARD_button.hide()
		BOTH_DIR_button = createButton('◀▶') // ↔️
		BOTH_DIR_button.mousePressed(function() {direction_mode_switch(2)})
		BOTH_DIR_button.id('BOTH')
		BOTH_DIR_button.hide()
		LOOP_button = createButton('🔁')
		LOOP_button.mousePressed(toggle_loop_mode)
		LOOP_button.id('BOTH')
		LOOP_button.hide()
		OCTAVES_button = createButton(str(octaves_to_play))
		OCTAVES_button.mousePressed(function() {set_octaves_to_play(0)})
		OCTAVES_button.id('OCTAVES')
		OCTAVES_button.hide()
	} 

	REVERSE_button.style("font-size", scl_L2 + "px")
	REVERSE_button.size(button_hs, button_hs)
	REVERSE_button.position(U * 1.75, U * 2.85)

	BOTH_DIR_button.style("font-size", scl_L2 + "px")
	BOTH_DIR_button.size(U * 2.25, button_hs)
	BOTH_DIR_button.position(U * 3.25, U * 2.85)

	FORWARD_button.style("font-size", scl_L2 + "px")
	FORWARD_button.size(button_hs, button_hs)
	FORWARD_button.position(U * 5.5, U * 2.85)

	LOOP_button.style("font-size", scl_L2 + "px")
	LOOP_button.size(button_hs, button_hs)
	LOOP_button.position(U * 7.25, y_seq)

	OCTAVES_button.style("font-size", scl_L2 + "px")
	OCTAVES_button.size(button_hs, button_hs)
	OCTAVES_button.position(U * 9,  y_seq)
	
	if(MIDI_OUTPUT_button) midi_output_button_style_update()
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

function mode_mode_switch(){
	if(mode_mode == 'relative'){
		mode_mode = 'parallel'
		document.getElementById("MODE_MODE").innerHTML = 'PARALLEL // MODE //'
		MODE_MODE_button.style('backgroundColor', 'rgb(110,150,240)')
		if(modes_arr.length >= 2){
			MODE_INC_button.style('backgroundColor', 'rgb(110,150,240)')
			MODE_DEC_button.style('backgroundColor', 'rgb(110,150,240)')
			RAND_MODE_button.style('backgroundColor', 'rgb(110,150,240)')
		}
	}
	else{
		mode_mode = 'relative'
		document.getElementById("MODE_MODE").innerHTML = 'RELATIVE ◀ MODE ▶'
		MODE_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
		if(modes_arr.length >= 2){
			MODE_INC_button.style('backgroundColor', 'rgb(240,240,240)')
			MODE_DEC_button.style('backgroundColor', 'rgb(240,240,240)')
			RAND_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
		}
	}
	storeItem("mode_mode", mode_mode)
	stored_mode_mode = mode_mode
}

function midi_output_button_style_update(){
	MIDI_OUTPUT_button.style("font-size", U + "px")
	MIDI_OUTPUT_button.style('transform', 'rotate(270deg)')
	MIDI_OUTPUT_button.size(U * 6, 1.45 * U)
	MIDI_OUTPUT_button.position(-U * 2.25, U * 12.25)
}

function MISC_MENU_buttons_toggle(){
	misc_buttons_shown = !misc_buttons_shown
	if(misc_buttons_shown){
		if(!MIDI_OUTPUT_button && midi_output_device_count){
			MIDI_OUTPUT_button = createButton(`${midi_output_device_count > 1 ? midi_output_device_count + ' ' : ''}MIDI OUT`)
			TYPE_MENU_button.id('MIDI')
			MIDI_OUTPUT_button.hide()
			MIDI_OUTPUT_button.mousePressed(midi_output_selection_menu_toggle)
			midi_output_button_style_update()
		}
		// PLACEHOLDER_button.show()
		if(previous_instrument_name){
			HOLD_KEY_button.style('backgroundColor', 'rgb(240,240,240)')
			if(instrument_type == 'recorder'){
				HOLD_FING_button.style('backgroundColor', 'rgb(240,240,240)')
			}
			else HOLD_FING_button.style('backgroundColor', 'rgb(140,140,140)')
		}
		else{
			HOLD_FING_button.style('backgroundColor', 'rgb(140,140,140)')
			HOLD_KEY_button.style('backgroundColor', 'rgb(140,140,140)')
		} 
		HOLD_KEY_button.show()
		HOLD_FING_button.show()
		DRONE_VOL_button.show()
		VOL_button.show()	
		UP_button.show()
		SELECT_MENU_button.show()
		DOWN_button.show()
		if(!tempo_slider_shown) SAVE_CHART_button.show()
		if(sequence_slider_shown) toggle_sequence_slider()
		MODE_MODE_button.show()
		MODE_INC_button.show()
		MODE_DEC_button.show()
		TYPE_MENU_button.show()
		if(MIDI_OUTPUT_button) MIDI_OUTPUT_button.show()
		TUNING_button.show()
		PREV_SCALE_button.show()
		NEXT_SCALE_button.show()
		MISC_MENU_button.style('backgroundColor', 'rgb(255,200,95)')
		MISC_MENU_button.size(1.57*U, 1.5*U*2.4)
	}
	else{
		HOLD_KEY_button.hide()
		HOLD_FING_button.hide()
		DRONE_VOL_button.hide()	
		VOL_button.hide()	
		UP_button.hide()
		SELECT_MENU_button.hide()
		DOWN_button.hide()
		SAVE_CHART_button.hide()
		SAVE_CHART_CONFIRM_button.hide()
		SAVE_CHART_CANCEL_button.hide()
		save_confirm_shown = false
		// PLACEHOLDER_button.hide()
		MODE_MODE_button.hide()
		MODE_INC_button.hide()
		MODE_DEC_button.hide()
		TYPE_MENU_button.hide()
		if(MIDI_OUTPUT_button) MIDI_OUTPUT_button.hide()
		PREV_SCALE_button.hide()
		NEXT_SCALE_button.hide()
		if(drone_vol_slider_shown) toggle_drone_vol_slider()
		if(vol_slider_shown) toggle_vol_slider()
		if(tuning_slider_shown) toggle_tuning_slider() // TUNING_slider.hide()
		if(instrument_types_shown) instrument_type_menu_toggle()
		TUNING_button.hide()	
		MISC_MENU_button.style('backgroundColor', 'rgb(240,240,240)')
		MISC_MENU_button.size(1.5*U, 1.5*U*1.85)
		if(midi_output_buttons.length){
			for(button of midi_output_buttons) button.hide()
			midi_outputs_shown = false
		} 
	}
}

let instrument_types_shown
function instrument_type_menu_toggle(){
	instrument_types_shown = !instrument_types_shown
	if(instrument_types_shown){
		RECORDER_TYPE_button.show()
		BRASS_TYPE_button.show()
		Irish_whistle_TYPE_button.show()
	}
	else{
		RECORDER_TYPE_button.hide()
		BRASS_TYPE_button.hide()
		Irish_whistle_TYPE_button.hide()
	}
}

let midi_outputs_shown
let midi_output_buttons = []
let midi_output_device_index = null
function midi_output_selection_menu_toggle(){
	if(!midi_output_device_count) return
	if(midi_output_buttons.length == 0){
		const button_width = midi_device_max_name_length + U // U * 14
		const button_stack = constrain(midi_output_device_count, 2, 4)
		const button_height = U * (6 / button_stack)
		const y0 = chart_y + chart_h
		const font_str = text_size2 + 'px'
		let previous_device_name = ''
		for(let i = 0; i < midi_output_device_count; i++){
				let list_item = midi_device_list[i]
				let device_name = list_item.name
				if(device_name == previous_device_name) continue
				previous_device_name = device_name
				let button = createButton(device_name)
					.size(button_width, button_height)
					.position(U * 1.5 + button_width * int(i / button_stack), y0 - button_height * (1 + i % button_stack))
					.style("font-size", font_str)
					.id('MIDI_' + i)
					.mousePressed(function() {
						if(midi_output_device && this.elt.id == 'MIDI_' + midi_output_device_index){
							for(let i = 0; i < 128; i++){
								midi_output_device.sendNoteOff(i, {channels: [1,2]})
							}
							midi_output_device = null
							midi_output_device_index = null
							main_output_channel = 0
							drone_output_channel = 0
							midi_output_enabled = false
							// console.log('midi output disconnected from: ' + device_name)
						}
						else{
							midi_output_device = WebMidi.outputs[midi_device_list[i].original_index]
							main_output_channel = midi_output_device.channels[1]
							main_output_channel.sendPitchBendRange(2, 0)
							drone_output_channel = midi_output_device.channels[2]
							midi_output_enabled = true
							midi_output_device_index = i
							// console.log('midi output connected to: ' + device_name)
						}
						update_midi_output_button_colors(i)
					})
				midi_output_buttons.push(button)
		}
	}
	midi_outputs_shown = !midi_outputs_shown
	if(midi_outputs_shown){
		for(button of midi_output_buttons) button.show()
	}
	else{
		for(button of midi_output_buttons) button.hide()
	}
}

function update_midi_output_button_colors(index){
	let idx = 0
	for(button of midi_output_buttons){
		if(midi_output_enabled && idx == index) button.style('backgroundColor', 'rgb(255,200,95)')
		else button.style('backgroundColor', 'rgb(240,240,240)')
		idx++
	}
}

function instrument_type_switch(instrument_type_input, initial = true){
	if(!initial && instrument_type_input == instrument_type) return
	instrument_type = instrument_type_input
	if(instrument_type == 'recorder'){
		instruments_arr = recorder_instruments_arr
		fingering_data = recorder_fingering_data
		default_instrument_name = default_recorder_name
		default_previous_instrument_name = default_previous_recorder_name
		instrument_name = lookup_item("recorder_name", default_instrument_name)
		previous_instrument_name = lookup_item("previous_recorder_name", default_previous_instrument_name)
		symbol_count = 8
		img = recorder_img
	}
	else if(instrument_type == 'brass'){
		instruments_arr = brass_instruments_arr
		default_instrument_name = default_brass_instrument_name
		default_previous_instrument_name = default_previous_brass_instrument_name
		instrument_name = lookup_item("brass_instrument_name", default_instrument_name)
		previous_instrument_name = lookup_item("previous_brass_instrument_name", default_previous_instrument_name)
		if(initial){
			if(instrument_name.includes('Euphonium')) fingering_data = euphonium_fingering_data
			else if(instrument_name.includes('Tuba')) fingering_data = tuba_fingering_data
			else fingering_data = trumpet_fingering_data
			symbol_count = fingering_data[0].length
		}
		img = brass_instrument_img
	}
	else if(instrument_type == 'Irish whistle'){
		instruments_arr = Irish_whistles_arr
		default_instrument_name = default_Irish_whistle_name
		default_previous_instrument_name = default_previous_Irish_whistle_name
		instrument_name = lookup_item("Irish_whistle_name", default_instrument_name)
		previous_instrument_name = lookup_item("previous_Irish_whistle_name", default_previous_instrument_name)
		fingering_data = tin_whistle_fingering_data
		symbol_count = 6
		img = Irish_whistle_img
	}
	else return false
	storeItem("instrument_type", instrument_type)
	if(!initial){
		instrument_select.remove()
		instrument_select = createSelect()
		create_dropdown(inst_x, control_y, instruments_arr, instrument_select, instrument_name, update_instrument, "instrument_select")
		update_instrument()

		img_w = U * 1.45
		img_h = int(img.height / img.width * img_w)
		img_y = int(chart_y - 5.25 * U)
		fill(255)
		rect(0,img_y,img_w, H)
		image(img, 0, img_y, img_w, img_h)
		if(previous_instrument_name){
			HOLD_KEY_button.style('backgroundColor', 'rgb(240,240,240)')
			if(instrument_type == 'recorder'){
				HOLD_FING_button.style('backgroundColor', 'rgb(240,240,240)')
			}
			else HOLD_FING_button.style('backgroundColor', 'rgb(140,140,140)')
		}
		else{
			HOLD_FING_button.style('backgroundColor', 'rgb(140,140,140)')
			HOLD_KEY_button.style('backgroundColor', 'rgb(140,140,140)')
		}
	}
}

function save_confirm(){
	if(note_count != 12) return
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

let dir_override = 0

function direction_mode_switch(direction){
	if(direction != dir_override){
		dir_override = direction
		if(direction == 2) chart.reversal = true
		else{
			chart.reversal = false
			if(dir_override != chart.dir){
				// chart.dir = dir_override
				if(chart.playing_scale || playing_paused) restart_scale(true)
			}
		} 
	}
	else{
		dir_override = 0
		if ([3, 6, 10, 13, 14, 17].includes(sequence_number)) chart.reversal = false
		else chart.reversal = true
	}
	storeItem("dir_override", dir_override)
	set_direction_button_colors()
	set_play_button_chars()
	let seq_chars = sequence_number + ((chart.default_reversal_setting && abs(dir_override) == 1) || 
	(!chart.default_reversal_setting && dir_override == 2) ? '*' : '')
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
	PLAY_button.style('border', '1px solid #000')
	if(dir_override == 0){
		direction_chars = chart.reversal ? '◀ ▶' : '&nbsp;&nbsp;&nbsp; ▶'
	}
	else{
		if(dir_override == 2) direction_chars = '◀ ▶'
		else if(dir_override == 1) direction_chars = '&nbsp;&nbsp;&nbsp;&nbsp; ▶'
		else{
			direction_chars = '◀&nbsp;&nbsp;&nbsp;'

		} 
		if(dir_override == 2 || dir_override == -1) PLAY_button.style('border-left', '0.5vw solid #614522ff')
		if(dir_override > 0) PLAY_button.style('border-right', '0.5vw solid #614522ff')
	}

	if(chart.repeat) direction_chars += ' 🔁'
	document.getElementById("PLAY").innerHTML = direction_chars
}

function toggle_loop_mode(){

	chart.repeat = !chart.repeat
	storeItem("repeat_state", chart.repeat)
	stored_repeat_state = chart.repeat

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
// 		if(note_count != 12) {
// 			condensed_notes = false
// 			condensed_notes_toggle()
// 		}
// 		if(note_count == 12){
// 			HIDE_FING_button.show()
// 			HOLD_KEY_button.show()
// 			HOLD_FING_button.show()
// 			RAND_SCL_button.show()
// 			RAND_KEY_button.show()
// 			RAND_MODE_button.show()
// 			OCTAVES_button.show()
// 			document.getElementById("instrument_select").style.display = "block"
// 			document.getElementById("scale_select").style.display = "block"
// 			document.getElementById("mode_select").style.display = "block"
// 			if(!stylo_mode) notes_count_input.hide()
	// if(!mobile) OCTAVES_button.style('transform', 'translateX(1.6em)')
// 		}
// 		else{
// 			HIDE_FING_button.hide()
// 			HOLD_KEY_button.hide()
// 			HOLD_FING_button.hide()
// 			RAND_SCL_button.hide()
// 			RAND_KEY_button.hide()
// 			RAND_MODE_button.hide()
// 			OCTAVES_button.hide()
// 			document.getElementById("instrument_select").style.display = "none"
// 			document.getElementById("scale_select").style.display = "none"
// 			document.getElementById("mode_select").style.display = "none"
// 		}
// 		update_instrument()
// 	// }
// }

function set_octaves_to_play(value = null){
	if(value == 1 || value == 2) octaves_to_play = value
	else if(octaves_to_play == 1) octaves_to_play = 2
	else octaves_to_play = 1
	let currently_playing_scale = chart.playing_scale
	if(currently_playing_scale){
		chart.playing_scale = false
	}
	storeItem("octaves_to_play", octaves_to_play)
	if(chart.OTP != octaves_to_play){
		octaves_changed = true
		update_seq_display = true
		chart.OTP = octaves_to_play
		chart.generate_sequence()
	}
	document.getElementById("OCTAVES").innerHTML = str(octaves_to_play)
	
	if(currently_playing_scale || playing_paused){
		// could probably continue from current location when going from 1 to 2,
		// or from 2 to 1 if it is in the range that it will be constrained to
		restart_scale(true)
	}
}

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

function update_sequence(number = 0){
	update_seq_display = true
	if(number == 0) sequence_number = SEQUENCE_slider.value()
	else SEQUENCE_slider.value(number)
	if(!isNaN(sequence_number)) storeItem("sequence_number", sequence_number)
	chart.generate_sequence()
	if(sequence_number >= 16){
		OCTAVES_button.style('backgroundColor', 'rgb(160,160,160)')
		document.getElementById("OCTAVES").innerHTML = str(chart.override_OTP)
	}
	else{
		OCTAVES_button.style('backgroundColor', 'rgb(240,240,240)')
		document.getElementById("OCTAVES").innerHTML = str(octaves_to_play)
	} 
	let seq_chars = sequence_number + ((chart.default_reversal_setting && abs(dir_override) == 1) || 
	(!chart.default_reversal_setting && dir_override == 2) ? '*' : '')
	document.getElementById("SEQUENCE").innerHTML = 'SEQ. ' + seq_chars
	if(chart.playing_scale) restart_scale(true)
	if(!dir_override){
		set_direction_button_colors()
		set_play_button_chars()
	}
}

function update_swing(){
	storeItem("swing_factor", swing_factor)
	document.getElementById("SWING").innerHTML = swing_factor
	update_seq_display = true
	chart.generate_sequence()
}

let stashed_swing_factor = 0
function toggle_swing(){
	if(stashed_swing_factor){
		swing_factor = stashed_swing_factor
		stashed_swing_factor = 0
	} 
	else if(swing_factor != 0){
		stashed_swing_factor = swing_factor
		swing_factor = 0
	}
	else return
	update_swing()
}

function random_mode(){
	if(modes_arr.length < 2) return
	if(modes_arr.length < 5){
		cycle_mode(1)
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

function mode_change(new_mode_shift, setup){
	if(modes_arr.length < 2) return
	mode_shift = new_mode_shift
	mode_select.value(modes_arr[mode_shift])
	if(mode_mode == 'parallel'){
		if(condensed_notes) cycle_mode(1)
		else{
			update_mode(false)
			update_key()
		}
	}
	else update_mode()
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

function update_volumes(){
	effects_volume_compensation = dry_wet_ratio * 0.5
	nominal_vol = default_vol + effects_volume_compensation
	vol = default_vol > 0 ? nominal_vol : 0
	osc.amp(vol)

	if(default_drone_vol == 0) nominal_drone_vol = 0
	else nominal_drone_vol = default_drone_vol + sq(1.5 * effects_volume_compensation)

	drone_vol = constrain(nominal_drone_vol, 0, 1)
	drone_gain.amp(drone_vol, 0.1)
}

function update_tempo(update_multiplier = false){
	if(update_multiplier){
		const val = TEMPO_multiplier_slider.value()
		if(val <= 2) tempo_multiplier = val / 4
		else tempo_multiplier = val - 2
		storeItem("tempo_multiplier", tempo_multiplier)
	}
	else{
		base_tempo = TEMPO_slider.value()
		storeItem("base_tempo", base_tempo)
	}
	
	tempo = base_tempo * tempo_multiplier
	chart.beat = 60 / tempo
	chart.interval_time = chart.beat
	chart.generate_note_lengths()
	document.getElementById("TEMPO").innerHTML = str(tempo) + ' bpm'
}

let drone_started = false
let drone_note
function toggle_drone(){
	drone_playing = !drone_playing
	if(drone_playing){
		update_drone_freq('toggle drone')
		if(!drone_started){
			drone.start()
			drone_env.triggerAttack(drone)
			drone_started = true
			if(midi_output_device){
				drone_note = freqToMidi(drone_freq)
				drone_output_channel.playNote(drone_note)
			} 
		}
		update_volumes()
		DRONE_button.style('backgroundColor', 'rgb(255,200,95)') //(212,140,0) = col2
	}
	else{
		drone_started = false
		drone_env.triggerRelease(drone)
		if(midi_output_device && drone_note){
			drone_output_channel.sendNoteOff(drone_note)
			drone_note = null
		}
		DRONE_button.style('backgroundColor', 'rgb(240,240,240)')
	}
}

function update_drone_freq(location='none') {
	// console.log(location) // for debugging
	drone.freq(drone_freq)
	if(midi_output_device){ 
		if(drone_started){
			new_drone_note = freqToMidi(drone_freq)
			if(drone_note && drone_note !== new_drone_note){
				drone_output_channel.sendNoteOff(drone_note)
				drone_note = new_drone_note
				drone_output_channel.playNote(drone_note)//, {attack: drone_vol})
			} 
		}
	}
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
			// update_chart = true
			chart.create_frequencies()
			chart.create_fingering_pattern()
			chart.create_notes(update_label=false,update_color=false, 'update tuning')
			if(chart.playing_scale) restart_scale()
			update_drone_freq('toggle_tuning_slider')
		}
		else if(tuning != default_tuning) {
			tuning = default_tuning
			TUNING_slider.value(tuning)
			document.getElementById("TUNING").innerHTML = str(tuning) + ' Hz'
			// update_chart = true
			chart.create_frequencies()
			chart.create_fingering_pattern()
			chart.create_notes(update_label=false,update_color=false, 'update tuning')
			if(chart.playing_scale) restart_scale()
			update_drone_freq('toggle_tuning_slider')
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
		TEMPO_multiplier_slider.hide()
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
		TEMPO_multiplier_slider.show()
		TEMPO_button.style('backgroundColor', 'rgb(255,200,95)')
	}
}

function toggle_volume_sliders(){
	toggle_drone_vol_slider()
	toggle_vol_slider()
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
		OCTAVES_button.hide()
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
		if(sequence_number >= 16){
			OCTAVES_button.style('backgroundColor', 'rgb(160,160,160)')
			document.getElementById("OCTAVES").innerHTML = str(chart.override_OTP)
		}
		else{
			OCTAVES_button.style('backgroundColor', 'rgb(240,240,240)')
			document.getElementById("OCTAVES").innerHTML = str(octaves_to_play)
		} 
		sequence_number_temp = sequence_number
		OCTAVES_button.show()
	}
}

function TOGL_instrument(maintain_fingering = true){
	let temp_name = instrument_name
	instrument_select.value(previous_instrument_name)
	update_instrument(false, maintain_fingering, !maintain_fingering)
	previous_instrument_name = temp_name
}

let starting_octave, new_instrument

function update_instrument(initial = true, maintain_fingering, maintain_key){
	new_instrument = true
	let play = false
	// if(hide_fingering) hide_fingerings()
	if(typeof chart != "undefined"){ if(chart.playing_scale) play = true }
	instrument_obj = instruments_arr.find(x => x.name === instrument_name)
	const temp_shift_amount = instrument_obj.shift_amount
	let previous_starting_key = instrument_obj.key
	update_chart = true
	if(typeof chart != "undefined" && instrument_select.value() != instrument_name){
		previous_instrument_name = instrument_name
		if(instrument_type == 'brass') storeItem("previous_brass_instrument_name", previous_instrument_name)
		else if(instrument_type == 'recorder') storeItem("previous_recorder_name", previous_instrument_name)
		else if(instrument_type == 'Irish whistle') storeItem("previous_Irish_whistle_name", previous_instrument_name)
	}
	if(typeof chart != "undefined" ) instrument_name = instrument_select.value()
	instrument_obj = instruments_arr.find(x => x.name === instrument_name)
	if(!instrument_obj){ // failsafe
		instrument_obj = instruments_arr[0]
		instrument_name = instrument_obj.name
	} 
	let starting_key = instrument_obj.key
	starting_octave = int((instrument_obj.lowest + 57) / 12)
	if(instrument_type == 'brass'){
		if(instrument_name == 'Euphonium') fingering_data = euphonium_fingering_data
		else if(instrument_name == 'Tuba') fingering_data = tuba_fingering_data
		else fingering_data = trumpet_fingering_data
		symbol_count = fingering_data[0].length
	}
	if(maintain_fingering && starting_key != previous_starting_key){
		// find equivalent key name for the given fingering
		// to facilitate switching between F and C recorders
		// since they are non-transposing instruments
		key_name = transpose_note(key_name, instrument_obj.shift_amount - temp_shift_amount)
	}	
	else if(!maintain_key){
		if(instrument_obj.key && instrument_obj.key != previous_starting_key) key_name = instrument_obj.key // the starting key for the instrument
	}
	// otherwise maintains current key by default

	update_chart = true
	chart = new fingering_chart(chart_x, chart_y) //x,y,noteWidth, noteHeight
	chart.create_fingering_pattern()
	if(play || playing_paused) restart_scale()
	if(initial) update_drone_freq('update instrument')
	if(show_info) generate_info_display()
	new_instrument = false
	if(instrument_type == 'brass') storeItem("brass_instrument_name", instrument_name)
	else if(instrument_type == 'recorder') storeItem("recorder_name", instrument_name)
	else if(instrument_type == 'Irish whistle') storeItem("Irish_whistle_name", instrument_name)
}

function update_scale(initial = true, history = false){
	// console.log(scale_select.value().slice(scale_select.value().length-1))
	update_chart = true
	let previous_scale_length = 0
	if(scale_pattern) previous_scale_length = scale_pattern.length
	let mode_needs_to_be_shifted = false
	let scale_mode_shift = 0
	if (note_count == 12){
		if(history == true){ 
			// console.log(scale_history_index)
			let scale_history_item = scales_history_list[scale_history_index]
			// console.log('scale_history_index = ' + scale_history_index + ', ' + scale_history_item)
			scale_mode_shift = scale_history_item[1]
			let scale_name_shift = scale_history_item[0]
			if(scale_name == scale_name_shift){
				if(scale_mode_shift == mode_shift) return
				else{
					mode_shift = scale_mode_shift
					update_mode(false, true)
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
	// console.log(mode_scale_type)
	// mode_scale_type = (scale_name.includes('minor'))? 'minor':'Major'
	scale_obj = scales_arr.find(x => x.name === scale_name)
	
	scale_index = scales_arr.findIndex(object => {return object.name === scale_name})
	// if (scale_index != -1) scale_pattern = scales_arr[scale_index].pattern
	
	scale_pattern = scale_obj.pattern
	if(scale_pattern.length != previous_scale_length) update_seq_display = true
	mode_select.remove()
	mode_select = createSelect()
	mode_shift = 0 //min(mode_shift,scale_pattern.length-1)
	if(scale_obj.mode_names) modes_arr = scale_obj.mode_names
	else modes_arr = [...mode_numerals]
	create_dropdown(mode_x, control_y, modes_arr, mode_select, modes_arr[0], update_mode, 'mode_select')
	mode_scale_type = minor_check() ? 'minor' : 'Major'
	chart.create_fingering_pattern()
	chart.create_notes(update_label=true,update_color=true, 'update scale')
	if(chart.playing_scale || playing_paused) restart_scale(true)
	shuffled_mode_indices = [...Array(modes_arr.length).keys()]
	shuffle(shuffled_mode_indices, true)
	shuffled_mode_index = 0
	if(initial) update_drone_freq('update scale')
	diatonic = (scale_name == 'Major' || scale_name == 'natural minor' ||
							scale_name == 'Major Hexatonic' || scale_name == 'Major Pentatonic' || scale_name == 'minor pentatonic')

	if(show_info) generate_info_display()

	if(history != true){
		if(scale_history_index < scales_history_list.length-1) scales_history_list.splice(scale_history_index+1,scales_history_list.length - scale_history_index)
		scales_history_list.push([scale_name,mode_shift])
		if(scales_history_list.length > 200) scales_history_list.splice(0,1) // restrict length of undo history.
		scale_history_index = scales_history_list.length-1
		NEXT_SCALE_button.style('backgroundColor', 'rgb(140,140,140)')
		if(scales_history_list.length > 1) PREV_SCALE_button.style('backgroundColor', 'rgb(240,240,240)')
		// console.log(scales_history_list)
	}
	if(mode_needs_to_be_shifted){
		mode_shift = scale_mode_shift
		update_mode(true, true)
	}

	update_mode_button()

	storeItem("scale_name", scale_name)
}

function update_mode_button(){
	if(modes_arr.length < 2){// scale_name == 'Chromatic' || scale_name == 'Whole Tone'){
		document.getElementById("RAND_MODE").innerHTML = 'ONE MODE'
		RAND_MODE_button.style('backgroundColor', 'rgb(150,140,140)')
		MODE_INC_button.style('backgroundColor', 'rgb(150,140,140)')
		MODE_DEC_button.style('backgroundColor', 'rgb(150,140,140)')
	}
	else{
		if(modes_arr.length < 5){
			document.getElementById("RAND_MODE").innerHTML = 'NEXT MODE'
			RAND_MODE_button.style('backgroundColor', 'rgb(240,190,190)')
		}
		else{
			document.getElementById("RAND_MODE").innerHTML = 'MODE 🔀'
			RAND_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
		}
		if(!mode_mode == 'parallel'){
			MODE_INC_button.style('backgroundColor', 'rgb(240,240,240)')
			MODE_DEC_button.style('backgroundColor', 'rgb(240,240,240)')
		}
	}
} 

function update_mode(initial = true, history=false){
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
	chart.create_notes(update_label=true,update_color=true, 'update mode') 
	if(chart.playing_scale || playing_paused) restart_scale()
	if(initial) update_drone_freq('update mode')
	if(mode_shift > 0) mode_select.style('backgroundColor', 'rgb(255,200,95)')
	else mode_select.style('backgroundColor', 'rgb(229,229,255)')
	if(show_info) generate_info_display()
	
	if(history != true){
		scales_history_list.push([scale_name,mode_shift])
		if(scales_history_list.length > 200) scales_history_list.splice(0,1) // restrict length of undo history.
		scale_history_index = scales_history_list.length-1
		// console.log(scales_history_list)
	}
	// storeItem("mode_scale_type", mode_scale_type)
	storeItem("mode_shift", mode_shift)
	stored_mode_shift = mode_shift
}
// function go_to_scale_and_mode(){} // could do both at the same time for randomization?


function update_key(initialize = true, update_all = true){
	update_chart = true
	selected_key_name = key_name
	chart.create_fingering_pattern()
	chart.create_notes(update_label = true, update_color = true, 'update key')
	if(initialize){
		if(chart.playing_scale || playing_paused) restart_scale()
		update_drone_freq('update key')
	} 
	if(update_all){
		if(show_info) generate_info_display()
		storeItem("key_name", key_name)
		stored_key_name = key_name
	}
}


function minor_check(){
	if(scale_name == 'Augmented') return true
	let minor_elements = ['inor', 'ocrian', 'ygian', 'olian', 'orian', 'iminished']
	let major_elements = ['ajor', 'onian', 'ydian']
	if(minor_elements.some(element => mode_name.includes(element))) return true
	let alt_index = min(mode_shift,scale_obj.alt.length-1)
	for(let i = 0; i < scale_obj.alt[alt_index].length; i++){
			if(minor_elements.some(element => scale_obj.alt[alt_index][i].includes(element))) return true
	}
	let major_check = true
	if(minor_elements.some(element => scale_name.includes(element))){
		major_check = false
		major_check = (major_elements.some(element => mode_name.includes(element)) && !minor_elements.some(element => mode_name.includes(element)))
		for(let i = 0; i < scale_obj.alt[alt_index].length; i++){
			if(major_elements.some(element => scale_obj.alt[alt_index][i].includes(element)) &&
				 !minor_elements.some(element => scale_obj.alt[alt_index][i].includes(element))) major_check = true
		}
	}
	return !major_check
}


function create_dropdown(x, y, arr, selection_object, start_value, selection_event_function, ID_name){
	selection_object.position(x, y)
	let val
  for(i = 0; i < arr.length; i++){
		if(arr === modes_arr && (i == scale_pattern.length || 
			(((scale_name == 'Whole Tone' || scale_name == 'Chromatic') && i == 0)|| 
			(( scale_name == 'Diminished' || scale_name == 'Augmented') && i == 2)||
			(( scale_name == '2S Tritone' || scale_name == 'Tritone'  ) && i == 3) ))){
			modes_arr = modes_arr.slice(0, i)
			break

		}
		if(arr === notes_arr || arr === modes_arr || arr === seq_arr) val = arr[i]
		else val = arr[i].name
		selection_object.option(val)
  }
  selection_object.selected(start_value)
  selection_object.changed(selection_event_function)
	
  // selection_object.style("font-family", "Papyrus"); // to make it cursed
  selection_object.style("font-size", int(U * 0.65) + "px")
	selection_object.id(ID_name)
}