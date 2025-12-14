
// Set default values (see data tab for options) --------------------
const interval_colors = [ 
	[20,55,45], // 1,  minor second, m2, semitone, half step
	[3,80,95], // 2,  Major second, M2, tone, whole tone, whole step
	[38,35,35], // 3,  minor third, m3, trisemitone
	[7.5,85,98] // 4,  Major third, M3
]
p5.disableFriendlyErrors = true;
let display_waveform = true
let display_staff = true
let default_instrument_name, default_previous_instrument_name // for quick toggle ability. Changes with new selection.
let default_scale_name = "Major"
let default_instrument_type = 'recorder'
let	default_recorder_name = "Tenor"
let default_previous_recorder_name = "Alto"
let	default_brass_instrument_name = "B♭ Trumpet"
let default_previous_brass_instrument_name = "Euphonium"
let	default_Irish_whistle_name = "D Whistle"
let default_previous_Irish_whistle_name = "D Whistle"
let default_mode_shift = 0
let key_name = "C"
let key_sig
let chart
let stored_key_name, stored_mode_shift, stored_repeat_state, stored_mode_mode, stored_select_menu_index
let stored_condensed_notes_state, stored_hide_fingering_state, stored_display_waveform_state, stored_instrument_type
let select_menus_move_list = ['INSTR.', 'SCALE', 'KEY']
let select_menus_move_index = 1
let selected_select_menu
let mode_mode = 'relative'
let octaves_to_play = 1
let pitch_bend_semitones = 2
let default_tuning = 440 // for A4 — can vary slightly between recorders, usually in the range 440-444 Hz. 
let tuning// = default_tuning
			// Some might default a bit higher because they can be tuned lower by pulling out the bottom piece a bit.
let default_base_tempo = 120 // for scale sequence playback
let default_tempo_multiplier = 1
let base_tempo, tempo, tempo_multiplier
let default_vol = 0.35
let default_drone_vol = 0.15
let default_sequence_number = 1
let sequence_number = 1
let default_octaves_to_play = 1
let nominal_vol, nominal_drone_vol, vol, drone_vol, effects_volume_compensation
let effects_on
const default_dry_wet_ratio = 0.2
let dry_wet_ratio
let default_sharp = false // if true, defaults to sharp when the key signature has 6 accidentals.
let note_count = 12 // try it with a different number than 12 if you want to hear something new and different.
/* 12 tone equal temperament (12-TET) with A at 440 Hz is the standard Western culture tuning
Setting it to 5 will give 5-TET, a cool Slendro scale, often used on the Balinese Gamelan. 
7-TET, turns out does NOT match the tuning traditionally used by Thai instruments, though it is somewhat close. 
Theirs have significant deviations from the average interval to match their tastes. See http://iftawm.org/journal/oldsite/articles/2015b/Garzoli_AAWM_Vol_4_2.pdf
One rough approximation expresses the seven pitches of Central Javanese pelog scale as a subset of 9-tone equal temperament.
8-TET is composed of 3/4 tones.
24-TET is called the quarter-tone scale
--------------------------------------- */

let instruments_arr
let mode_name = 'I'
let mode_proper_name
let scale_obj
let condensed_notes = false
let hide_fingering = false
let stylo_mode = false
let starting_y
let octave_start
let scale_pattern, scale_offset
let mode_shift // = 0 // have to start off here
let previous_instrument_name, instrument_name, scale_name
let mode_scale_type = 'Major'
let W,H,w,h, unit//, mX, mY
let update_chart = true
let osc_started = false
let drone_playing = false
let audio_started = false
let current_frequency = 0
let pitch_bend_amount = 0
let bend_started = false 
let pressed_note = null
let playing_note = null
let mode_shifted = false
let playing = false
let full_chart
let shifted_scale_pattern = []
let img, mobile
let redraw_waveform = false
let scale_index
let scales_history_list = []
let scale_history_index
let diatonic
let playing_paused = false

let	mode_shift_reference_index
let mode_shift_temp_index = null
let selected_note, selected_index, selected_key_name

// Sequence display long-press state
let seq_press_start = 0
let seq_pressing = false
let seq_press_start_x = 0
let seq_press_start_y = 0
const SEQ_LONG_PRESS_MS = 600 // ms required to count as a long press

let instrument_select, scale_select, mode_select
let frequency, frequency_temp
let chart_x, chart_y, chart_above, chart_h, chart_hy, v_space
let sequence_chart_buffer

let density
let midi_output_device = null
let main_output_channel = 0
let drone_output_channel = 0
let midi_output_device_count = 0
let midi_output_enabled = false
// let pitch_bend_val

function preload() {

	osc = new p5.MonoSynth()
	
	recorder_img = loadImage('recorder.jpg') // My trusty wooden alto recorder that I bought used
	Irish_whistle_img = loadImage('Irish_whistle.jpg')
	brass_instrument_img = loadImage('brass_instrument.jpg')

	stored_instrument_type = lookup_item("instrument_type", default_instrument_type)
	if(['recorder', 'brass', 'Irish whistle'].includes(stored_instrument_type)) instrument_type_switch(stored_instrument_type)
	else instrument_type_switch('recorder')

	osc.setADSR(0.2,0.2,0.75,0.1)  
	
	drone = new p5.Oscillator()
	drone.setType('sawtooth')
	drone_env = new p5.Envelope()
	drone_env.setADSR(1.5, 0.4, 1.0, 1.5)

	// osc_gain = new p5.Gain()
	drone_gain = new p5.Gain()
	
	default_vol = lookup_item("default_vol", default_vol)
	default_drone_vol = lookup_item("default_drone_vol", default_drone_vol)
	dry_wet_ratio = lookup_item("dry_wet_ratio", default_dry_wet_ratio)
	update_volumes()

	effects_on = (dry_wet_ratio > 0)

	reverb = new p5.Reverb()
	reverb.set(3.0,1)
	reverb.drywet(dry_wet_ratio)
	
	delay = new p5.Delay() // default = (0.250, 0.2) 0-1, 0-1
	delay.delayTime(0.3)
	delay.feedback(0.3)
	// delay.setType('pingPong')
	delay.drywet(dry_wet_ratio)
	
	playing = false
	LPF = new p5.LowPass()
	LPF.freq(700)
	
	drone_LPF = new p5.LowPass()
	drone_LPF.freq(250)

	osc.disconnect()
	drone.disconnect()
	drone_env.disconnect()
	
	reverb.disconnect()
	
	osc.connect(LPF)
	drone.connect(drone_gain)
	drone_gain.connect(drone_LPF)

	if(!effects_on){
		delay.disconnect()
	}
	else{
		LPF.disconnect()
		LPF.connect(reverb)
		drone_LPF.disconnect()
		drone_LPF.connect(reverb)
		reverb.connect(delay)
	}

	base_tempo = lookup_item("base_tempo", default_base_tempo)
	tempo_multiplier = lookup_item("tempo_multiplier", default_tempo_multiplier)
	tempo = base_tempo * tempo_multiplier
	dir_override = lookup_item("dir_override", 0)
	stored_repeat_state = lookup_item("repeat_state", 0)
	stored_key_name = lookup_item("key_name", key_name)
	stored_mode_shift = lookup_item("mode_shift", default_mode_shift)
	mode_shift = stored_mode_shift
	stored_select_menu_index = lookup_item("select_menu", select_menus_move_index)
	stored_mode_mode = lookup_item("mode_mode", mode_mode)
	stored_condensed_notes_state = lookup_item("condensed_notes_state", false)
	stored_hide_fingering_state = lookup_item("hide_fingering_state", false)
	stored_display_waveform_state = lookup_item("display_waveform_state", display_waveform)
	display_staff = note_count == 12 ? lookup_item("display_staff_state", display_staff) : false
	tuning = lookup_item("tuning", default_tuning)
	sequence_number = lookup_item("sequence_number", default_sequence_number)
	octaves_to_play = lookup_item("octaves_to_play", default_octaves_to_play)

	instrument_obj = instruments_arr.find(x => x.name === instrument_name)
	if(!instrument_obj){
		instrument_name = default_instrument_name
		instrument_obj = instruments_arr.find(x => x.name === instrument_name)
	} 

	// restore whether sequence display should be shown
	stored_show_seq = lookup_item("show_seq", true)
	show_seq = stored_show_seq

	scale_name = lookup_item("scale_name", default_scale_name)
	scale_obj = scales_arr.find(x => x.name === scale_name)
	if(!scale_obj){ // in case the data is edited and there is no match for the stored scale name.
		scale_name = default_scale_name
		scale_obj = scales_arr.find(x => x.name === scale_name)
		storeItem("scale_name", scale_name)
	} 
	diatonic = (scale_name == 'Major' || scale_name == 'natural minor') 
	scale_pattern = scale_obj.pattern
	pixelDensity(displayDensity())
	density = pixelDensity() // to see what the actual pixel density is.
}

function lookup_item(lookup_key, default_value){

	let	lookup_data = getItem(lookup_key)
	if (lookup_data === null){
		if(lookup_key) storeItem(lookup_key, default_value)
		lookup_data = default_value
	}
	
	return lookup_data
}

const midi_device_list = []
function setup(initial=true) {

	if(max(displayWidth,displayHeight) < 1000){ // most likely a mobile display
		W = window.innerWidth
		H = window.innerHeight
		mobile = true
		U = min(int(W / 30), int(H / 16))
		display_waveform = false
	}
	else{ 
		W = window.innerWidth
		H = window.innerHeight
		if (W < 1000) display_waveform = false
		mobile = false
		U = min(int(W / 31), int(H / 17))
	}

	y_move_amount = U * 2.5
	H_scale = H / 1800

	debug_indicator_location = [10.5 * U, 4.5 * U]
	chart_x = int(1.5 * U)
	chart_x2 = int(29.53 * U)
	chart_h = 8 * U
	chart_y = min(8 * U, H - chart_h)
	chart_hy = chart_y + chart_h
	chart_label_height = 1.45 * U
	chart_above = chart_y - chart_label_height
	const v_space_total = H - chart_y - chart_h
	v_space = ~~min(3 * U, v_space_total)
	tall_display = (v_space_total > 4 * U)

	L = int(W - 3 * U)
	text_size = int(U * 0.63)
	if(tall_display){
		text_size = U
		L = W 
	}

	if(initial){
		WebMidi
			.enable()
			.then(onEnabled)
			.catch(err => alert(err));

		// Function triggered when WEBMIDI.js is ready
		function onEnabled() {

			// Display available MIDI devices
			if (WebMidi.outputs.length > 0) {
				WebMidi.outputs.forEach((device, index) => {
					midi_device_list.push({ original_index: index, name: device.name })
					// console.log(`${index}: ${device.name}`)
					// in case a note or drone was left playing
					for(let i = 0; i < 128; i++){
						device.sendNoteOff(i, {channels: [1,2]})
					}
					midi_device_list.sort((a, b) => a.name.localeCompare(b.name))
				})
				midi_output_device_count = WebMidi.outputs.length
			}
		}
		createCanvas(W, H)
		chart = new fingering_chart(chart_x, chart_y)
	}	
	else{
		resizeCanvas(W, H)
	} 

	create_controls(initial)

	update_instrument(initial)
	update_scale(initial)
	if(stored_repeat_state){
		chart.repeat = stored_repeat_state
		if(chart.repeat) LOOP_button.style('backgroundColor', 'rgb(255,200,95)')
			else LOOP_button.style('backgroundColor', 'rgb(240,240,240)')
		set_play_button_chars()
	}
	if(stored_mode_mode != mode_mode){
		mode_mode_switch()
	}
	if(stored_mode_shift){
		mode_shift = stored_mode_shift
		mode_change(stored_mode_shift, true)
	} 
	if(stored_key_name){
		key_name = stored_key_name
		update_key(initial)
	} 
	if(stored_hide_fingering_state != hide_fingering){
		hide_fingerings()
	}
	if(stored_condensed_notes_state != condensed_notes){
		condensed_notes_toggle()
	}
	if(stored_display_waveform_state != display_waveform){
		toggle_waveform_display()
	}
	change_select_menu(stored_select_menu_index)
	update_mode_button() // would there be a better place for this?

	// Ensure sequence display matches stored preference on setup
	if(typeof set_show_seq === 'function') set_show_seq()
}

function play_oscillator(note, freq=0, duration=0) {
  if(!freq) freq = note.frequency
	playing = true
	vol = min(nominal_vol, 1)
	osc.amp(vol)
	if(default_vol > 0){
		note_start_time = ~~millis()
		if (!osc_started) osc_started = true
		if(duration > 0) osc.play(freq, vol, 0, duration) // for when playing a sequence
		else osc.triggerAttack(freq, vol)
	}
	current_frequency = freq
	if(midi_output_enabled && note.midi_note != current_midi_note_on) send_midi_note(note, true, duration)
}

var current_midi_note_on = -1
function send_midi_note(note, on = true, duration = 0){
	if(!midi_output_device || !note.midi_note) return
	if(on){
		current_midi_note_on = note.midi_note
		main_output_channel.playNote(note.midi_note, {attack: vol, duration: duration * 1000})
	}
	else if(current_midi_note_on > -1){
		main_output_channel.sendNoteOff(note.midi_note)
		current_midi_note_on = -1
	}
}

let redraw_time = 0
let redraw_count = 0
let note_start_time = 0
let note_duration = 0
let cleared_waveform = false
let pressed_note_temp_index = -1

function draw() {
	if(stylo_mode && pressed_note){
		note_duration = ~~millis() - note_start_time 
		if(note_duration > 1000 && default_vol > 0){
			const vibrato_delta = min(1, map(note_duration, 1000, 1500, 0, 1)) * 0.15 * sin(frameCount * 0.35)
			vol = min(nominal_vol + vibrato_delta, 1.0)
			const frequency_delta = (vibrato_delta * 10)
			osc.triggerAttack(frequency + frequency_delta, vol)
		}
	}

	if(!cleared_waveform && frequency && (frameCount % 4 == 0)){
		if(~~millis() - redraw_time < 4000){
			redraw_waveform = true
		}
		else{
			push()
			noStroke()
			fill(255)
			rectMode(CORNERS)
			rect(chart_x * 1.02, chart_hy, W, chart_hy + v_space * 2)
			pop()
			cleared_waveform = true
			pressed_note_temp_index = -1
		}
	}
	if(v_space > U && display_waveform && redraw_waveform){
	
		push() // fade out the old waveform
		fill(255,10)
		noStroke()
		rectMode(CORNERS)

		redraw_count++
		rect(chart_x * 1.02,chart_hy, L, chart_hy + v_space)
		pop()

		if(playing){
			const rw = U * 3.5
			cleared_waveform = false
			push()
			redraw_time = ~~millis()
			noFill()
			beginShape()
			let points = 500 //min(max(500,frequency/4),1200)
			let wavelength = 343 / frequency // in meters
			let log_f = Math.log10(frequency) //1.64 - 3.7
			let col_f = map(log_f, 1.64, 3.7, 0,1)
			let wave_color = [255 * (1 - col_f), 0, 255 * col_f, 90]
			wt = 80 * (1 - col_f) * H_scale // need to scale proportional to screen dims somehow
			strokeWeight(wt)
			let f_factor = 0.49 * (v_space - wt)
			stroke(wave_color)
			// stroke(120)
			let map_points = (L - rw/2) / points
			let x_offset = chart_x * 1.02
			let neutral_axis_position = chart_hy + 0.5 * v_space
			for (let i = 0; i < points; i++){
				// is the 2e4 factor messing up the scaling on different monitor resolutions? it should be a function of the pixel density, right?
				let f = f_factor * cos(frequency * i / 2e4) //map( norm*wave[i], -1, 1, 0, 2*U) 
				vertex(x_offset + i * map_points, neutral_axis_position + f)
			}
			endShape()
			pop()
			let unit = 'm'
			if (wavelength < 0.1){wavelength = nf(wavelength * 1000,1,0); unit = 'mm';}
			else if (wavelength < 1){ wavelength = nf(wavelength * 100,1,1); unit = 'cm';}
			else{wavelength = nf(wavelength, 1, 2)}

			if(pressed_note && pressed_note.index != pressed_note_temp_index){
				pressed_note_temp_index = pressed_note.index
				push() // wavelength and frequency text display
				// rectMode(CORNERS)
				noStroke()
				fill(255)
				let text_pos = []
				let text_pos2 = []
				let text_pos3 = []
				if(tall_display){
					text_pos = [12 * U, chart_hy + v_space + U * 1.1]
					text_pos2 = [text_pos[0] + 6 * U, text_pos[1]]
					text_pos3 = [text_pos2[0] + 5 * U, text_pos[1]]
					rect(x_offset, chart_hy + v_space, W, H) // rect to clear under waveform labels
				}
				else{
					const L2 = min(L + 2.8 * U, U * 33)
					const L2b  = L2 + U * 0.5
					text_pos = [L2, U * 16.8]
					text_pos2 = [L2, text_pos[1] + text_size]
					text_pos3 = [L2, text_pos[1] + text_size * 2]
					const rw = U * 3.5
					rect(L2b - rw, chart_hy, rw, H) // rect to clear under waveform labels
				}
				
				fill(100)
				textSize(text_size)
				textAlign(LEFT,BOTTOM)
				text(transpose_note(pressed_note.note_display_name, instrument_obj.transposition), text_pos[0] - text_size * 2, text_pos[1])
				textAlign(RIGHT,BOTTOM)
				text(pressed_note.current_octave, text_pos[0], text_pos[1])
				text(nf(frequency, 2, 1) + ' Hz' , text_pos2[0], text_pos2[1])
				text(wavelength + ' ' + unit, text_pos3[0], text_pos3[1])
				pop()
			}
		}
		redraw_waveform = false
	}
	
	chart.draw()
	
	// kind of fun pitch bend mechanic. Maybe play around with it in stylo mode. Would need an indicator. 
	// Maybe track how far the mouse has moved within the note.
	//if (mouseIsPressed && pressed_note && frequency) osc.triggerAttack(map(mouseY, 0,height, frequency*1.1, frequency*0.9)) 
}

function key_shift(input_note=null){
	let key_name_temp = key_name
	if(input_note){
		selected_note = input_note
	}
	else{
		for (let note of chart.notes){
			if (note.contains_above(mouseX, mouseY) && (mode_shift_temp_index == null ||
					mode_shift_reference_index === mode_shift_temp_index)){
				selected_note = note
			}
			else if(note.index == mode_shift_temp_index) selected_note = note
		}
	}
	if(selected_note) selected_key_name = selected_note.note_name
	else{
		console.log("no note somehow?")
		return false
	} 
	if(mode_shift > 0){
		let index_shift = 0
		for(i = 0; i < mode_shift; i++){ index_shift += scale_pattern[i] } //  shifted_scale_pattern[i]
		index_shift = index_shift % 12
		selected_index = (selected_note)? selected_note.index + 12 - index_shift : 0
		if(selected_index > 12) selected_index -= 12
		// for condensed notes, can't just use the note position index, have to use the note's frequency index
		for (let note of chart.all_notes){ 
			if(note.index == selected_index) selected_note = note // have to select note after key change? Otherwise things get shifted twice?
		}
	}

	if(key_name_temp == selected_note.note_name && !mode_shifted){
		// if((mode_scale_type == 'Major' && intial_selected_note.note_name == 'F♯ G♭') ||
			 // (mode_scale_type == 'minor' && intial_selected_note.note_name == 'D♯ E♭')) default_sharp = !default_sharp		
		default_sharp = !default_sharp
	}
	frequency = selected_note.frequency
	update_chart = true
	key_name = selected_note.note_name
	if(!mode_shifted) update_key()
	return
}

function condensed_notes_toggle(){
	condensed_notes = !condensed_notes
	storeItem("condensed_notes_state", condensed_notes)
	stored_condensed_notes_state = condensed_notes
	COND_button.style('backgroundColor', 'rgb(240,240,240)')
	HIDE_FING_button.style('backgroundColor', 'rgb(240,240,240)')
	if(condensed_notes){
		if(hide_fingering) document.getElementById("COND").innerHTML = '|||'
		else document.getElementById("COND").innerHTML = '⁞⁞⁞'
	}
	else{
		if(hide_fingering) document.getElementById("COND").innerHTML = '||||||'
		else document.getElementById("COND").innerHTML = '⁞⁞⁞⁞⁞⁞'
		COND_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	update_chart = true
	set_stylo_mode()
	chart.create_notes(update_label=true,update_color=true, 'condense notes toggle')
	if(chart.playing_scale) restart_scale()
}

function hide_fingerings(){
	if(note_count != 12) return
	hide_fingering = !hide_fingering
	storeItem("hide_fingering_state", hide_fingering)
	stored_hide_fingering_state = hide_fingering
	if(hide_fingering){
		if(condensed_notes)	document.getElementById("COND").innerHTML = '|||'
		else document.getElementById("COND").innerHTML = '||||||'
		if(mobile) document.getElementById("HIDE").innerHTML = '◯ ◯ ◯'
		else document.getElementById("HIDE").innerHTML = '◯◯◯'
	} 
	else{
		if(condensed_notes)	document.getElementById("COND").innerHTML = '⁞⁞⁞'
		else document.getElementById("COND").innerHTML = '⁞⁞⁞⁞⁞⁞'
		document.getElementById("HIDE").innerHTML = '⬤ ⬤ ⬤'
	} 
	update_chart = true
	set_stylo_mode()
}

function set_stylo_mode(){
	if (hide_fingering && condensed_notes){
		stylo_mode = true
		HIDE_FING_button.style('backgroundColor', 'rgb(255, 201, 154)')
		COND_button.style('backgroundColor', 'rgb(255, 201, 154)')
		// notes_count_input.show() // since it's not working properly, best hide it.
	}
	else{
		if(hide_fingering) HIDE_FING_button.style('backgroundColor', 'rgb(255,200,95)')
		else HIDE_FING_button.style('backgroundColor', 'rgb(240,240,240)')
		if(condensed_notes) COND_button.style('backgroundColor', 'rgb(255,200,95)')
		else COND_button.style('backgroundColor', 'rgb(240,240,240)')
		stylo_mode = false
		// if(note_count == 12) notes_count_input.hide()
	}
}

function cycle_mode(direction, dragging = false){
	if(modes_arr.length < 2) return

	if(direction == 1){
		if(mode_shift  <  modes_arr.length - 1) mode_shift++
		else mode_shift = 0
	}
	else{
		if(mode_shift > 0) mode_shift--
		else mode_shift = modes_arr.length - 1
	}

	let selected_key
	if(mode_mode == 'parallel' && !(condensed_notes && dragging)){
		let selected_note2
		for(let note of chart.notes){
			if(note.note_val == 2){
				selected_note2 = note
				break
			}
		}
		let index_shift = 0
		for(i = 0; i < mode_shift; i++){ index_shift += scale_pattern[i] }
		index_shift = index_shift % 12
		let selected_index = selected_note2.index + 12 - index_shift
		if(selected_index > 12) selected_index -= 12
		for (let note of chart.all_notes){ 
			if(note.index == selected_index){
				selected_key = note.note_name
				break
			}
		}
	}
	mode_select.value(modes_arr[mode_shift])
	if(mode_mode == 'parallel' && !(condensed_notes && dragging)){
		update_mode(false)
		key_name = selected_key
		update_key()
	}
	else update_mode()
}

function change_select_menu(index=null){
	if(index == null){
		select_menus_move_index = (select_menus_move_index + 1) % select_menus_move_list.length
	}
	else select_menus_move_index = index
	selected_select_menu = select_menus_move_list[select_menus_move_index]
	document.getElementById('SELECT_MENU').innerHTML = selected_select_menu
	update_select_menu_highlight()
	storeItem("select_menu", select_menus_move_index)
	stored_select_menu_index = select_menus_move_index
}

function move_in_select_menu(direction){
	if(selected_select_menu === 'SCALE'){
		scale_index = (scale_index + direction + scales_arr.length) % scales_arr.length
		scale_select.value(scales_arr[scale_index].name)
		update_scale()
	}
	else if(selected_select_menu === 'INSTR.'){
		// Find current instrument index
		let instrument_index = instruments_arr.findIndex(x => x.name === instrument_name)
		instrument_index = (instrument_index + direction + instruments_arr.length) % instruments_arr.length
		instrument_select.value(instruments_arr[instrument_index].name)
		update_instrument()
		if(instrument_type == 'recorder'){
			HOLD_FING_button.style('backgroundColor', 'rgb(240,240,240)')
		}
		HOLD_KEY_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	else if(selected_select_menu === 'KEY'){
		// Find current key index
		let key_index = notes_arr.findIndex(x => x === key_name)
		key_index = (key_index + direction + notes_arr.length) % notes_arr.length
		key_name = notes_arr[key_index]
		update_key()
	}
}

// Highlight the currently selected select menu
function update_select_menu_highlight() {
	// Remove highlight from all
	instrument_select.style('border', '0.2vw solid #ccc')
	scale_select.style('border', '0.2vw solid #ccc')

	// Highlight the selected one
	if (selected_select_menu === 'INSTR.') {
		instrument_select.style('border-left', '0.4vw solid #888')
		instrument_select.style('border-right', '0.4vw solid #888')
	} else if (selected_select_menu === 'SCALE') {
		scale_select.style('border-left', '0.4vw solid #888')
		scale_select.style('border-right', '0.4vw solid #888')
	} 
}

function play_scale(restart = true){
	if(restart){
		if(chart.playing_scale){
			if (playing_note){
				osc.triggerRelease()
				playing_note.release()
			} 
			chart.playing_scale = false
			playing_paused = false
			PLAY_button.style('backgroundColor', 'rgb(240,240,240)')
			if(show_seq) chart.generate_sequence_display()
		}
		else{
			chart.play_scale(true)
			PLAY_button.style('backgroundColor', 'rgb(255,200,95)')
		}
	}
	else toggle_pause()
}

function toggle_pause(disable = false){
	if(disable){
		playing_paused = false
		chart.playing_scale = false
		if (playing_note){
			osc.triggerRelease()
			playing_note.release()
		} 
		playing_note = null
		PLAY_button.style('backgroundColor', 'rgb(240,240,240)')
		return
	}
	if(playing_note && chart.scale_notes){
		playing_paused = !playing_paused
		if(playing_paused){
			osc.triggerRelease()
			if(main_output_channel) send_midi_note(playing_note, false)
		} 
		else{
			osc.triggerAttack(frequency, vol)
			playing_note.press()
		} 
		chart.playing_scale = !chart.playing_scale
		if(chart.playing_scale)	PLAY_button.style('backgroundColor', 'rgb(255,200,95)')
		else PLAY_button.style('backgroundColor', 'rgba(182, 139, 60, 1)')
	}
	else {
		chart.play_scale(!allow_continue)
		PLAY_button.style('backgroundColor', 'rgb(255,200,95)')
	}
}

// Restart the current playing sequence so the next played note is index 0
let allow_continue = true
function restart_scale(restart = false) {
	let play = true
	if(playing_paused){
		toggle_pause(true)
		allow_continue = false
		play = false
	} 
	chart.playing_scale = false
	if(play) chart.play_scale(restart)
}

let show_info = true
let show_seq = true

function generate_scale_pattern_representation(x_move = 0){
	shifted_scale_pattern = []
	if(mode_shift > 0){
		let idx = mode_shift
		for(let i = 0; i < scale_pattern.length; i++){
			shifted_scale_pattern.push(scale_pattern[idx])
			idx = (idx + 1) % scale_pattern.length
		}
	}
	else shifted_scale_pattern = scale_pattern

	push()
	fill(255)
	noStroke()
	translate(U * 1.65, U * 0.85)
	rect(-U, 0, U * 13.25, 1.1 * U)
	rectMode(CORNERS)
	
	push()
	stroke(255)
	const step_width = U * 0.95
	const pattern_width = step_width * note_count
	const x_offset = x_move / step_width
	const x_shift = x_move

	strokeWeight(step_width * 0.1)
	let x_pos = x_shift
	const y_pos = 0
	const ht = U * 1.1
	const y_pos2 = y_pos + ht
	
	// Ensure we have a usable shifted_scale_pattern
	if(!Array.isArray(shifted_scale_pattern) || shifted_scale_pattern.length === 0){
		shifted_scale_pattern = (Array.isArray(scale_pattern) && scale_pattern.length) ? scale_pattern.slice() : [2]
	}

	colorMode(HSB,70,100,100,100)
	// Safely read a color entry and copy it before adding alpha so we don't mutate the source
	const idx0 = (shifted_scale_pattern[0]) ? shifted_scale_pattern[0] - 1 : 0
	let baseCol0 = interval_colors[idx0] || [0,0,0]
	let col = baseCol0.slice()
	col.push(90)
	let num_col = color(...col)
	const adjust = step_width * 0.25
	for(let i = 0; i < scale_pattern.length; i++){
		const step_size = shifted_scale_pattern[i]
		const idx = (step_size) ? step_size - 1 : 0
		let baseCol = interval_colors[idx] || [0,0,0]
		col = baseCol.slice()
		col.push(90)
		fill(col)
		let x2 = x_pos + step_size * step_width
		if(i == 0 && x_offset < 0){
			rect(-adjust, y_pos, x2, y_pos2)
			rect(x_pos + pattern_width, y_pos, pattern_width + adjust, y_pos2)
		}
		else if(i == scale_pattern.length - 1 && x_offset > 0){
			rect(x_pos, y_pos, x2 - x_shift, y_pos2)
			rect(-adjust, y_pos, x_shift, y_pos2)
		}
		else rect(x_pos, y_pos, x2, y_pos2)
		x_pos = x2
	}
	pop()
	fill(50, 120)
	x_pos = -step_width + (x_offset - int(x_offset)) * step_width
	const diam1 = step_width * 0.3
	const diam2 = step_width * 0.4
	const y_pos3 = y_pos + ht * 0.5
	for(let i = 0; i < 20; i++){ // small dark dots
		const x_pos2 = x_pos + (i + 0.5) * step_width
		if(i > note_count - 2 && x_pos2 > pattern_width) break
		circle(x_pos2, y_pos3, diam1)
	}
	fill(255) // clear ends to trim dots when dragging
	rect(-U, y_pos, 0.04 * U, y_pos2) // left
	rect(pattern_width - 0.045 * U, y_pos, pattern_width + diam1, y_pos2) // right
	for(let i = 0; i < 20; i++){ // white circles to punch
		const x_pos2 = x_pos + i * step_width
		if(i > 10 && x_pos2 > pattern_width + diam2/2) break
		circle(x_pos2, y_pos3, diam2)
	}
	if(scale_pattern.length < 10 && note_count == 12){
		fill(num_col)
		textAlign(LEFT, BOTTOM)
		textSize(U)
		text(scale_pattern.length, step_width * 12.35, y_pos2)
	}
	pop()
}

function generate_info_display(){
	chart.generate_sequence_display()
	generate_scale_pattern_representation()
	
	push()
	translate(U * 1.5, U * 2)
	rectMode(CORNERS)
	fill(255)
	noStroke()
	rect(0, 0, U * 13, U * 4.5)
	let scale_factor = 6
	let size = U * 5.4 / scale_factor
	textSize(size * 0.95)
	const alt_index = min(mode_shift,scale_obj.alt.length-1)
	const fields = scale_obj.alt[alt_index].length
	textAlign(LEFT,TOP)
	fill(20)

	let scale_str
	let shift = 1
	if(scale_pattern.length < note_count){
		if (mode_select.value().length > 4) mode_proper_name = mode_select.value().slice(mode_select.value().indexOf('·')+2)
		else mode_proper_name = scale_name + '·' + mode_select.value()
		key_sig = chart.key_signature[0] // selected_key_name
		
		if(accidental_count > 5 && mode_shift == 0){
			if(default_sharp)	{
				key_sig = selected_key_name[0]
				if(selected_key_name.length > 1) key_sig += '♯'
				if(selected_key_name.length == 1){
					if(key_sig[0] == 'F') key_sig  = 'E♯'
				}
			}
			else{
				if(selected_key_name.length > 2) key_sig = selected_key_name.slice(3)
				else key_sig = chart.key_signature[0]
				if(selected_key_name.length == 1){
					if(key_sig[0] == 'B') key_sig  = 'C♭'
					if(key_sig[0] == 'E') key_sig  = 'F♭'
				}
			}
		}
		// }else if(accidental_count == 7){
		// 	if(default_sharp)	{ 
		// 			accidental_str = '7♯'
		// 			key_sig = chart.key_signature[0] + '𝄪'
		// 		}
		// 		else{
		// 			accidental_str = '7♭'
		// 			if(chart.key_signature.length > 2) key_sig = chart.key_signature[3]
		// 			else key_sig = chart.key_signature[0] + '𝄫'
		// 			key_sig += '𝄫' 
		// 		}
		// }
		if(mode_scale_type == 'minor'){
			let acc_temp = (key_sig.length > 1 )? key_sig[1]:''
			key_sig = key_sig[0].toLowerCase() + acc_temp
		}

		let scale_name_str = ''
		if(mode_shift > 0) scale_name_str = mode_proper_name
		else if(scale_name == 'natural minor') scale_name_str = 'minor'
		else scale_name_str = scale_name
		let scale_acc_str = ''
		if (chart.accidental_type != 'ALL' && accidental_count > 0){
			scale_acc_str = accidental_count + chart.accidental_type
		}
		let separator_str1 = ' · ' 
		let separator_str2 = ' · '
		const total_length = textWidth(key_sig + scale_name_str + scale_acc_str) / U
		if(total_length > 10) separator_str2 = '·'
		if(total_length > 10.6) separator_str1 = '·'
		// console.log(total_length)
		scale_str = `${key_sig}${separator_str1}${scale_name_str}${scale_acc_str ? separator_str2 + scale_acc_str : ''}`
		shift = 1.2
	}
	else if(note_count == 12) scale_str = 'The Chromatic Scale'
	else scale_str = str(note_count) + '-TET'
	const x_pos = U * 0.25
	const y_pos2 = U * 0.15
	const x_pos2 = y_pos2
	push()
		if(mode_shift > 0) fill(140, 80, 0)
		text(scale_str, x_pos2, 0)
		fill(160) // horizontal dashed line
		if(scale_pattern.length != 12) text(' _'.repeat(16), 0, y_pos2)
	pop()
	if(note_count == 12){
		scale_factor = 6 + 0.5 * max(0,(fields - 3))
		size = U * 5.4 / scale_factor
		textSize(size * 0.95)
		for(i = 0; i < fields; i++){
			let alt_text = scale_obj.alt[alt_index][i]
			text(alt_text, x_pos, y_pos2 + size * (i + shift))
		}
	}
	pop()
	// need to find first active note, first octave start, second octave start, third octave start if present.
	// make a list of the notes when updating scale, mode, and key. Use whichever is relevant. Color notes accordingly.
	if(display_staff){
		draw_staff_with_note_range()
	}
}

function draw_staff_with_note_range(){
	const octave_start_mod = octave_start % 12
	if(chart.first_scale_note_index >= 0){
		get_note(chart.first_scale_note_index).generate_engraving(true,true)
		if(chart.last_scale_note_index > 0) get_note(chart.last_scale_note_index).generate_engraving(false,true)
			get_note(octave_start_mod).generate_engraving(false)
	}
	else get_note(octave_start_mod).generate_engraving(true)
	if(get_note(octave_start_mod + 12)) get_note(octave_start_mod + 12).generate_engraving(false)
	if(get_note(octave_start_mod + 24)) get_note(octave_start_mod + 24).generate_engraving(false)
}

function get_note(index){
	for(let note of chart.notes){
		if(note.index == index) return note
	}
	return false
}

function touchStarted(){input_pressed()}
function touchEnded(){input_released()}
function touchMoved(){input_dragged()}
function mousePressed(){input_pressed()}
function mouseReleased(){input_released()}
function mouseDragged(){input_dragged()}

function go_fullscreen(){
	if(fullscreen()) return
	fullscreen(true)
}

function windowResized(){
	// prevents phone autorotate from activating setup if you accidentally rotate into portrait mode
	// if(!(window.innerWidth === H && window.innerHeight === W && W > H)){
	if(!((windowWidth === H && windowHeight === W) || (windowWidth === W && windowHeight === H))){
		setup(false)
	} 
}

document.addEventListener("contextmenu", (event) => event.preventDefault(), "true")
document.addEventListener("touchStarted", (event) => event.stopPropagation(), "true")
document.addEventListener("touchEnded", (event) => event.stopPropagation(), "true")
document.addEventListener("touchMoved", (event) => event.stopPropagation(), "true")

function update_effects_controls(control_value){
	const y1 = 3.5 * U
	const y2 = y1 + min(H - y1 - U, 13 * U)
	control_value = min(control_value, y2)
	push()
	image(img, 0, img_y, img_w, img_h)
	fill(255,255,230,100)
	rectMode(CORNERS)
	w1 = 1.45 * U
	rect(0, y1, w1, y2)
	if(control_value){
		dry_wet_ratio = round(constrain(sq(map(control_value, y1, y2, 1, 0)), 0, 1),3)
		update_volumes()
	}
	const y3 = lerp(y2, y1, sqrt(dry_wet_ratio))
	rectMode(CENTER)
	if(dry_wet_ratio > 0) fill(255 * dry_wet_ratio, 50, 255 * (1 - dry_wet_ratio), 200)
	else fill(0,200)
	rect(w1 / 2, y3, w1 * 0.8, U / 2)
	fill(0)
	textSize(U * 0.7)
	text(nf(dry_wet_ratio,0,2), U * 0.75, y1 + U * 0.3)
	pop()
	if(effects_on && dry_wet_ratio == 0){
		effects_on = false
		delay.disconnect()
		reverb.disconnect()
		LPF.disconnect()
		LPF.connect()
		drone_LPF.disconnect()
		drone_LPF.connect()
	}
	if(!effects_on && dry_wet_ratio > 0){
		LPF.disconnect()
		LPF.connect(reverb)
		drone_LPF.disconnect()
		drone_LPF.connect(reverb)
		reverb.connect(delay)
		delay.connect()
		effects_on = true
	}
	reverb.drywet(dry_wet_ratio)
	delay.drywet(dry_wet_ratio)
}

let effects_controls = false
let effects_controls_primed = false
let pattern_mode_shift_primed = false
let not_dragged = true
let pattern_mode_shift_starting_position = 0
let	key_shift_primed = false
let	x_start = 0
let y_start = 0
let staff_display_toggle_primed = false
let sequence_change_primed = false
let sequence_control_change_primed = false
let sequence_display_toggle_primed = false
let direction_change_tracking_right = 0
let direction_change_tracking_left = 0
let y_move_dir = 0

function input_pressed(){
	not_dragged = true
	x_start = mouseX
	y_start = mouseY
	if(!audio_started){
		userStartAudio()
		audio_started = true
		return
	} 

	if(mouseY > chart_hy && mouseX > chart_x * 1.02 && W > 1000){
		toggle_waveform_display()
		return
	}
	
	if(in_seq_display(mouseX, mouseY)){
		seq_press_start = ~~millis()
		sequence_display_toggle_primed = true
		sequence_change_primed = true
		sequence_control_change_primed = true
		return
	}
	else if(in_pattern_representation(mouseX, mouseY) && note_count == 12){
		pattern_mode_shift_primed = true
		return
	}
	else if(in_staff_display(mouseX, mouseY)){
		key_shift_primed = true
		staff_display_toggle_primed = true
		return
	}

	if(instrument_types_shown || midi_outputs_shown) return

	if(!in_effects_control_area(mouseX, mouseY)){
		if(effects_controls){
			effects_controls = false
			image(img, 0, img_y, img_w, img_h)
		} 
		if(chart) chart.press_note()
	}
	else {
		effects_controls_primed = true
	}
}

function input_dragged(){
	// cancel sequence long-press if the user moves significantly while pressing
	const x_move = int(mouseX - x_start)
	const y_move = int(mouseY - y_start)
	not_dragged = (abs(x_move) < U * 0.5 && abs(y_move) < U * 0.5)
	let x_move_dir = 0
	if(sequence_change_primed || sequence_control_change_primed){
		// small movement tolerance based on UI unit `U`
		const x_step = U * 1.3
		if(x_move > x_step) x_move_dir = 1
		else if (x_move < -x_step) x_move_dir = -1
		if(x_move_dir){
			x_start += x_step * x_move_dir
			sequence_display_toggle_primed = false
			if(chart.playing_scale || playing_paused){
				sequence_change_primed = false
				if(x_move_dir == 1)	direction_change_tracking_right++
				else direction_change_tracking_left++
				if(direction_change_tracking_right > 4 && direction_change_tracking_left > 4){
					direction_mode_switch(2)
					direction_change_tracking_right = direction_change_tracking_left = 0
				} 
				else if(direction_change_tracking_right > 4){
					if(dir_override != 1){
						direction_mode_switch(1)
						direction_change_tracking_right = 0
					}
				}
				else if(direction_change_tracking_left > 4){
					if(dir_override != -1){
						direction_mode_switch(-1)
						direction_change_tracking_left = 0
					}
				}
			}
			else if(sequence_change_primed){
				sequence_number = constrain(sequence_number + x_move_dir, 1, 17)
				update_sequence(sequence_number)
			}
		}
		if(y_move > y_move_amount) y_move_dir = 1
		else if (y_move < -y_move_amount) y_move_dir = -1
		if(y_move_dir){
			y_start += y_move_amount * y_move_dir
			sequence_display_toggle_primed = false
			if(chart.playing_scale || playing_paused){
				sequence_change_primed = false
				toggle_loop_mode()
			}
			else if(sequence_change_primed){
				if(y_move_dir == 1) set_octaves_to_play(1)
				else set_octaves_to_play(2)
			}
			y_move_dir = 0
		}
		return
	}
	if(effects_controls) update_effects_controls(mouseY)
	else if(pattern_mode_shift_primed){
		const pattern_width = int(U * 11)
		const shift_increment = pattern_width / 12
		const snap_dist = shift_increment / 4
		const left_width = shifted_scale_pattern[0] * shift_increment
		const right_width = shifted_scale_pattern[scale_pattern.length - 1] * shift_increment
		if(x_move > 0){
			if(right_width - x_move < snap_dist || x_move > right_width){
				cycle_mode(-1)
				x_start += right_width
				generate_scale_pattern_representation(0)
			}
			else if(abs(x_move) > snap_dist) generate_scale_pattern_representation(x_move)
			else generate_scale_pattern_representation(0)
		}
		else{ 
			if(left_width + x_move < snap_dist || -x_move > left_width){
				cycle_mode(1)
				x_start -= left_width
				generate_scale_pattern_representation(0)
			}
			else if(abs(x_move) > snap_dist) generate_scale_pattern_representation(x_move)
			else generate_scale_pattern_representation(0)
		}
		return
	}
	else if(key_shift_primed){
		if(x_move > U) x_move_dir = 1
		else if (x_move < -U) x_move_dir = -1
		if(x_move_dir){
			x_start += x_move_dir * U
			let key_index = notes_arr.findIndex(x => x === key_name)
			// chart.accidental_counts[(key_index + mode_shift) % notes_arr.length] = str(accidental_count) + chart.accidental_type
			key_index = (key_index + x_move_dir + notes_arr.length) % notes_arr.length
			key_name = notes_arr[key_index]
			update_key()
			staff_display_toggle_primed = false
		}
		return
	}
	else if(mode_shift_temp_index != null && draggable){
		if(mouseY < chart.above) mode_shift_temp_index = null
		else{
			for (let note of chart.notes){
				if (note.note_val != 0 && note.index != mode_shift_temp_index && note.contains_above(mouseX, mouseY)){
					if(note.index > mode_shift_temp_index){
						mode_shifted = true
						cycle_mode(1, true)
						mode_shift_temp_index = note.index
					}
					else if(note.index < mode_shift_temp_index){ 
						mode_shifted = true
						cycle_mode(-1, true)
						mode_shift_temp_index = note.index
					}
				}
			}
		}
	}
	else if(instrument_types_shown || midi_outputs_shown) return
	else if(chart) chart.press_note()
}

function input_released() {
	// handle short / long press behavior for sequence display
	if (mobile && !fullscreen()){
		go_fullscreen()
		return
	} 
	const x_start_temp = x_start
	x_start = y_start = direction_change_tracking_left = direction_change_tracking_right = 0
	if(sequence_display_toggle_primed){
		const elapsed_time = ~~millis() - seq_press_start
		if(elapsed_time >= SEQ_LONG_PRESS_MS){
			// long press -> turn sequence display off
			show_seq = !show_seq
			set_show_seq()
		}
		else{
			if(show_seq) toggle_pause()
			else {
				show_seq = true
				set_show_seq()
			}
			// short press -> toggle pause (existing behavior)
		}
		// we've handled this input event
		sequence_display_toggle_primed = false
		sequence_change_primed = false
		return
	}
	if(effects_controls && !isNaN(dry_wet_ratio)){
		storeItem("dry_wet_ratio", dry_wet_ratio)
		return
	}
	else if(effects_controls_primed && mouseX < chart_x){
		effects_controls = true
		update_effects_controls(0)
		effects_controls_primed = false
		return
	}
	else if(not_dragged && !sequence_change_primed && !sequence_control_change_primed && !key_shift_primed && !pattern_mode_shift_primed && !instrument_types_shown && 
		mouseY > chart_above && mouseY < chart_y && mouseX > chart_x && mouseX < chart_end
		&& !(mode_mode == 'parallel' && (mode_shifted || (condensed_notes && abs(mouseX - x_start_temp) > U))) ){
		key_shift()
	} 
	starting_y = null
	pitch_bend_amount = 0
	bend_started = false
	mode_shift_temp_index = null
	mode_shifted = false
	key_shift_primed = false
	effects_controls_primed = false
	sequence_change_primed = false
	sequence_control_change_primed = false
	if(pattern_mode_shift_primed){
		generate_scale_pattern_representation()
		pattern_representation_captured = false
		pattern_mode_shift_primed = false
		return
	}
	else if(staff_display_toggle_primed){
		toggle_staff_display()
		staff_display_toggle_primed = false
		return
	} 
 	if(chart && chart.playing_scale == false){
		playing = false
		if (pressed_note != null){
			pressed_note.release()
			pressed_note = null
			osc.triggerRelease()
			note_start_time = 0
			return
		}
	}
}

let saved_chart_graphics = false

function save_chart(){
	if(note_count != 12) return
	// let alt_chart1 = (instrument_name.includes('Trumpet') && condensed_notes)
	let rows = 4
	let cols = 3
	let chart_height = chart_h
	if(scale_pattern.length == 12){ // chromatic scale, only need one.
		rows = 1
		cols = 1
	}
	else if(instrument_type == 'Irish whistle'){
		chart_height *= 0.75
		// need to run through keys here and check if there are at least 
		// scale_pattern.length + 1 notes in a row that are playable

	}
	else if(instrument_name.includes('Trumpet')){
		if(condensed_notes){
			rows = 6
			cols = 2
			chart_height *= 0.375
		}
		else chart_height *= 0.625
	}

	const total_keys = rows * cols
	const H1 = int(chart_y - chart_above + chart_height)
	const W1 = int(chart_end - chart_x)
	const dims = [int(chart_x), int(chart_above), W1, H1]
	const margin = int(U * 0.2)
	const WP = int(U * 12.75) // pattern rep width
	const HP = int(U) // pattern rep height
	const footer_H = max(int(H1 * 0.15) + margin, HP + 2 * margin)
	const W2 = cols * W1 + (cols - 1) * margin
	const w2 = W2/2
	const H2 = rows * H1 + (rows - 1) * margin + footer_H

	if(saved_chart_graphics){
		full_chart.resizeCanvas(W2, H2)
	}
	else{
		saved_chart_graphics = true
		full_chart = createGraphics(W2, H2)
	}

	full_chart.background(0)

	let starting_key = instrument_obj.key ? instrument_obj.key : 'C'

	// Calculate the total interval shift for the current mode
	let mode_shift_offset = 0
	for(let i = 0; i < mode_shift; i++){
		mode_shift_offset += scale_pattern[i]
	}

	// Find the index of starting_key in notes_arr
	let starting_index = -1
	for(let i = 0; i < notes_arr.length; i++){
		if(notes_arr[i].includes(starting_key)){
			starting_index = i
			break
		}
	}

	// Transpose backwards by the mode offset
	let target_index = (starting_index - mode_shift_offset) % 12
	if(target_index < 0) target_index += 12

	let target_root = notes_arr[target_index - 1]

	// If current key doesn't match the target root, update it
	if(key_name !== target_root){
		key_name = target_root
		update_key()
	}

	let key_index = notes_arr.findIndex(x => x === key_name)
	// console.log(key_index)
	// const condense_toggle_required = condense_notes
	for(let count = 0; count < total_keys; count++){
		const final = (count == total_keys - 1)
		// if(condense_toggle_required) condensed_notes_toggle()
		key_index = (key_index + 1 + notes_arr.length) % notes_arr.length
		key_name = notes_arr[key_index]
		update_key(final, !final)
		// if(condense_toggle_required) condensed_notes_toggle()
		
		let key_chart = better_get(dims[0],dims[1], dims[2], dims[3])

		const x = (W1 + margin) * int(count / rows)
		const y = (H1 + margin) * (count % rows)
		full_chart.image(key_chart, ~~x, ~~y, W1, H1)
		// break
	}
	let save_str
	if(mode_shift == 0 || mode_select.value().indexOf('·') == -1) save_str = scale_name
	else save_str = mode_select.value().slice(mode_select.value().indexOf('·') + 2) // remove the roman numerals

	const text_pos = footer_H * 0.45
	full_chart.translate(0, (H2 - footer_H + margin))
	full_chart.noStroke()
	full_chart.fill(255)
	full_chart.rect(0,0, W2, (footer_H - margin/2))
	full_chart.fill(0)
	full_chart.textSize(footer_H * 0.75)
	
	if(scale_pattern.length == 12){
		save_str = scale_name
		full_chart.textAlign(LEFT,CENTER)
		full_chart.text(save_str, U * 0.5, text_pos)
		full_chart.textAlign(RIGHT,CENTER)
		full_chart.text(instrument_name, W2 - U * 0.5, text_pos)
	} 
	else{
		let pattern_representation = better_get(int(U * 1.5), int(U * 0.9), WP, HP)
		full_chart.textAlign(RIGHT,CENTER)
		full_chart.text(save_str, w2 - WP * 0.8, text_pos)
		full_chart.image(pattern_representation, int(w2 - WP * 0.5), int((footer_H - (HP + margin)) / 2), WP, HP)
		full_chart.textAlign(LEFT,CENTER)
		full_chart.text(instrument_name, w2 + WP * 0.8, text_pos)
	}
	let condensed_str = condensed_notes? ' - condensed' : ''
	save(full_chart, instrument_name + ' - ' + save_str + condensed_str + ".png")
}

function better_get(x,y,w,h){ // Credit to Dave Pagurek for this miracle function
	// p5.Graphics::get doesn't respect pixel density, so we have to make a new function to compensate
	// make sure you use integer values for x,y,w,h in this function's arguments and 
	// when using image() so that the final image doesn't get blurred
	const canvas = _renderer.elt
	const img = createImage(
		Math.ceil(w * density),
		Math.ceil(h * density)
	)

	img.canvas
		.getContext('2d')
		.drawImage(
			canvas,
			x * density,
			y * density,
			w * density,
			h * density,
			0,
			0,
			w * density,
			h * density,
		)
	return img
}

function prev_scale(){
	if(scale_history_index == 0){
		PREV_SCALE_button.style('backgroundColor', 'rgb(140,140,140)')
		return
	}
	else{
		scale_history_index--
		if(scale_history_index == 0) PREV_SCALE_button.style('backgroundColor', 'rgb(140,140,140)')
		NEXT_SCALE_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	update_scale(true, true)
}

function next_scale(){
	if(scale_history_index == scales_history_list.length - 1){
		NEXT_SCALE_button.style('backgroundColor', 'rgb(140,140,140)')
		return
	}
	else{
		scale_history_index++
		if(scale_history_index == scales_history_list.length - 1) NEXT_SCALE_button.style('backgroundColor', 'rgb(140,140,140)')
		PREV_SCALE_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	update_scale(true, true)
}

function keyPressed() {
	const key_L = key.toLowerCase()
	if(keyIsDown(SHIFT)){
		if(key_L === 's') save_chart()	
		else if (key_L === 'q') clearStorage()
		else if (key_L === 'l'){
			console.log(getItem("scale_name") + ', ' + getItem("mode_shift")  + ', ' + getItem("previous_instrument_name") + ', ' + getItem("instrument_name"))
		}
	}
	else{
		if (keyCode === LEFT_ARROW) cycle_mode(-1)
		else if (keyCode === RIGHT_ARROW) cycle_mode(1)
		else if (keyCode === UP_ARROW) move_in_select_menu(-1)
		else if (keyCode === DOWN_ARROW) move_in_select_menu(1)
		else if (key_L === 'z') prev_scale()
		else if (key_L === 'x') next_scale()
		else if (key_L === 'd') toggle_drone()
		else if (key_L === 'p') play_scale(true)
		else if (key_L === 'l') toggle_loop_mode()
		else if (key_L === ' ') toggle_pause()
		else if (key_L === 'm')	mode_mode_switch()
		else if (key_L === 'w') toggle_waveform_display()
		else{
			const num = ~~key
			if (num == 1 || num == 2) {
				set_octaves_to_play(num)
			}
			else if(keyCode == 96){ // 0 (using keyCode prevents other key types from activating this)
				change_select_menu()
			}
		}
	}
}

function toggle_waveform_display(){
	display_waveform = !display_waveform
	storeItem("display_waveform_state", display_waveform)
	stored_display_waveform_state = display_waveform
	
	push()
	if(display_waveform){
		strokeWeight(4)
		stroke(200)
		const y_pos = int(chart_hy + v_space / 2)
		line(int(chart_x * 1.02), y_pos , W, y_pos)
		redraw_waveform = false
	}
	else{
		fill(255)
		rectMode(CORNERS)	
		rect(int(chart_x * 1.02), chart_hy, W, H)
	}
	pop()
}

function toggle_staff_display(){
	display_staff = !display_staff
	storeItem("display_staff_state", display_staff)
	push()
	if(!display_staff){
		fill(255)
		rectMode(CORNERS)
		const x0 = chart.sd.x0
		const y0 = chart.sd.y0
		const M2 = chart.sd.M2
		const x1 = chart.sd.x1
		const y3 = chart.sd.y3

		rect(x0 - M2, y3 - M2, x1 + M2, y0 + M2) // clear staff area
		rect(x0 - 1.2 * U, y3 + U, x0, y0)  // clear clef area
	}
	else draw_staff_with_note_range()
	pop()
}

// Centralized setter for sequence-display visibility. Clears or redraws the sequence area.
function set_show_seq(){
	try{ storeItem('show_seq', show_seq) }catch(e){}
	// if hiding, clear the area immediately
	if(!show_seq){
		if(typeof seq_display !== 'undefined' && seq_display.w){
			push()
			fill(255)
			rectMode(CORNERS)
			rect(~~seq_display.x0, ~~seq_display.y0, ~~seq_display.x3, ~~seq_display.y3)
			pop()
		}
	}
	else{
		if(typeof chart !== 'undefined' && chart.generate_sequence_display){
			chart.generate_sequence_display()
		}
	}
}

function in_effects_control_area(x, y){
	if(misc_buttons_shown) return false
	return (x <= chart_x && 3 * U <= y && y <= min(H - U, 16.5 * U))
}

function in_seq_display(x, y){
	if(vol_slider_shown || drone_vol_slider_shown || tempo_slider_shown || 
		tuning_slider_shown || save_confirm_shown){
		return false
	} 
	return (seq_display.x1 <= x && x <= seq_display.x2 && seq_display.y1 <= y && y <= seq_display.y2)
}

function in_staff_display(x, y){
	if(tempo_slider_shown || misc_buttons_shown){
		return false
	}
	return (U * 13.5 <= x && x <= U * 16 && U * 1.5 <= y && y <= U * 6.25)
}

function in_pattern_representation(x, y){
	if(tempo_slider_shown || scale_pattern.length == 12){
		return false
	}
	const y_limit_factor = (misc_buttons_shown || sequence_slider_shown) ? 2.8 : 4.25
	return (U * 1.5 <= x && x <= U * 13.25 && U <= y && y <= U * y_limit_factor)
}

function find_note_index(){
	for (let note of chart.notes){
		if (note.contains_above(mouseX, mouseY)) return [note.index, note.chart_index, note.note_display_name + note.current_octave]
	}
	return false
}

function transpose_note(current_note, transpose_semitones) {
	if (current_note === undefined) return false
  let current_index = note_to_index[current_note]
  if ( transpose_semitones === 0 || transpose_semitones === 12 || 
		transpose_semitones === undefined || current_index === undefined) return current_note

  let new_index = (current_index + transpose_semitones + 12) % 12
  let new_note = index_to_note[new_index]

	if(new_note.natural !== undefined) return new_note.natural
  else if (chart.accidental_type == '♭' || (chart.accidental_type == 'ALL' && !default_sharp)){
    return new_note.flat
  }
	else if (chart.accidental_type == '♯' || (chart.accidental_type == 'ALL' && default_sharp)){
    return new_note.sharp
	}
	return false
}