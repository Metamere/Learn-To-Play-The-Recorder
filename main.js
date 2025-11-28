
// Set default values (see data tab for options) --------------------
// var debug_mode = true
const interval_colors = [ 
	[20,55,45], // 1,  minor second, m2, semitone, half step
	[3,80,95], // 2,  Major second, M2, tone, whole tone, whole step
	[38,35,35], // 3,  minor third, m3, trisemitone
	[7.5,85,98] // 4,  Major third, M3
]

var key_sig
var debug_mode = false
var display_waveform = true
var display_staff = true
let default_instrument_name = "Tenor"
let default_previous_instrument = "Alto" // for quick toggle ability. Changes during run with new selection.
// var scale_name = 'Kokin-joshi' 'Mixolydian Pentatonic' // has m2, M2, m3, M3 intervals, good for testing
var default_scale_name = "Major"
var default_mode_shift = 0
var key_name // = "C"
var stored_key_name, stored_mode_shift, stored_repeat_state, stored_mode_mode, stored_select_menu_index
var stored_condensed_notes_state, stored_hide_fingering_state, stored_display_waveform_state
let select_menus_move_list = ['INSTR.', 'SCALE', 'KEY']
var select_menus_move_index = 1
var selected_select_menu
var mode_mode = 'relative'
var octaves_to_play = 1
var pitch_bend_semitones = 2
var default_tuning = 440 // Hz - can vary slightly between recorders, usually in the range 440-444. 
var tuning// = default_tuning
			// Some might default a bit higher because they can be tuned lower by pulling out the bottom piece a bit.
var default_tempo = 120 // for scale sequence playback
var default_vol = 0.35
var default_drone_vol = 0.15
var default_sequence_number = 1
var default_octaves_to_play = 1
var nominal_vol, nominal_drone_vol, vol, drone_vol, effects_volume_compensation
var effects_on
const default_dry_wet_ratio = 0.2
var dry_wet_ratio
var default_sharp = true // if true, defaults to sharp when the key signature has 6 accidentals.
var note_count = 12 // try it with a different number than 12 if you want to hear something new and different.
// 12 tone equal temperament (12-TET) with A at 440 Hz is the standard Western culture tuning
// Setting it to 5 will give 5-TET, a cool Slendro scale, often used on the Balinese Gamelan. 
// 7-TET, turns out does NOT match the tuning traditionally used by Thai instruments, though it is somewhat close. 
// Theirs have significant deviations from the average interval to match their tastes. See http://iftawm.org/journal/oldsite/articles/2015b/Garzoli_AAWM_Vol_4_2.pdf
// One rough approximation expresses the seven pitches of Central Javanese pelog scale as a subset of 9-tone equal temperament.
// 8-TET is composed of 3/4 tones.
// 24-TET is called the quarter-tone scale
// ---------------------------------------

var mode_name = 'I'
var mode_proper_name
var scale_obj
var condensed_notes = false
var hide_fingering = false
var stylo_mode = false
var starting_y
var octave_start, bass_instrument
var scale_pattern, scale_offset
var mode_shift // = 0 // have to start off here
var previous_instrument, instrument_name, scale_name
var mode_scale_type
var W,H,w,h, unit//, mX, mY
var update_chart = true
var osc_started = false
var drone_playing = false
var audio_started = false
var current_frequency = 0
var pitch_bend_amount = 0
var bend_started = false 
var pressedNote = null
var mode_shifted = false
var playing_note = null
var playing = false
var full_chart
var shifted_scale_pattern = []
var img, mobile, redraw_waveform
var scale_index
var scales_history_list = []
var scale_history_index
var diatonic
var playing_paused = false

var	mode_shift_reference_index
var mode_shift_temp_index = null
var selected_note, selected_index, selected_key_name

// Sequence display long-press state
var seq_press_start = 0
var seq_pressing = false
var seq_press_start_x = 0
var seq_press_start_y = 0
const SEQ_LONG_PRESS_MS = 600 // ms required to count as a long press

var instrument_select, scale_select, key_select, mode_select
var scale_pattern, frequency, frequency_temp
var chart_x, chart_y, chart_above, chart_h, chart_hy, v_space
var AR_debug = false
let sequence_chart_buffer
// let pattern_representation_buffer
// let pattern_representation_buffer2
// var AR_debug = true

var density

function preload() {
	osc = new p5.MonoSynth()

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

	img = loadImage('DSCF8169_v1.jpg') // My trusty wooden alto recorder that I bought used

	tempo = lookup_item("tempo", default_tempo)
	dir_override = lookup_item("dir_override", 0)
	stored_repeat_state = lookup_item("repeat_state", 0)
	stored_key_name = lookup_item("key_name", '')
	stored_mode_shift = lookup_item("mode_shift", default_mode_shift)
	mode_shift = stored_mode_shift
	stored_select_menu_index = lookup_item("select_menu", select_menus_move_index)
	stored_mode_mode = lookup_item("mode_mode", mode_mode)
	stored_condensed_notes_state = lookup_item("condensed_notes_state", false)
	stored_hide_fingering_state = lookup_item("hide_fingering_state", false)
	stored_display_waveform_state = lookup_item("display_waveform_state", display_waveform)
	display_staff = lookup_item("display_staff_state", display_staff)
	tuning = lookup_item("tuning", default_tuning)
	sequence_number = lookup_item("sequence_number", default_sequence_number)
	octaves_to_play = lookup_item("octaves_to_play", default_octaves_to_play)
	// storeItem("octaves_to_play", octaves_to_play)
	instrument_name = lookup_item("instrument_name", default_instrument_name)
	previous_instrument = lookup_item("previous_instrument", default_previous_instrument)	
	instrument_obj = instruments_arr.find(x => x.name === instrument_name)

	// restore whether sequence display should be shown
	stored_show_seq = lookup_item("show_seq", true)
	show_seq = stored_show_seq

	scale_name = lookup_item("scale_name", default_scale_name)
	diatonic = (scale_name == 'Major' || scale_name == 'natural minor' ||
		scale_name == 'Major Hexatonic' || scale_name == 'Major Pentatonic' || scale_name == 'minor pentatonic')
	scale_obj = scales_arr.find(x => x.name === scale_name)
	scale_pattern = scale_obj.pattern
	pixelDensity(displayDensity())
	density = pixelDensity() // to see what the actual pixel density is.
}

function lookup_item(lookup_key, default_value){

	let	lookup_data = getItem(lookup_key)
	if (lookup_data === null){
		storeItem(lookup_key, default_value)
		lookup_data = default_value
	}
	
	return lookup_data
}

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
	H_scale = H / 1800

	debug_indicator_location = [10.5 * U, 4.5 * U]
	chart_x = 1.5 * U
	chart_x2 = 29.53 * U
	chart_h = 8 * U
	chart_y = min(8 * U, H - chart_h)
	chart_hy = chart_y + chart_h
	chart_above = chart_y - 1.45 * U
	const v_space_total = H - chart_y - chart_h
	v_space = min(3 * U, v_space_total)
	tall_display = (v_space_total > 4 * U)

	L = W - 3 * U
	text_size = U * 0.63
	if(tall_display){
		text_size = U
		L = W 
	}

	if(initial)	createCanvas(W, H)
	else resizeCanvas(W, H)

	chart = new fingering_chart(chart_x, chart_y)
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
		key_select.value(stored_key_name)
		update_key(initial)
	} 
	if(stored_hide_fingering_state != hide_fingering){
		hide_fingerings()
	}
	if(stored_condensed_notes_state != condensed_notes){
		condense_notes()
	}
	if(stored_display_waveform_state != display_waveform){
		toggle_waveform_display()
	}
	change_select_menu(stored_select_menu_index)
	update_mode_button() // would there be a better place for this?

	// Ensure sequence display matches stored preference on setup
	if(typeof set_show_seq === 'function') set_show_seq(show_seq)
}

function play_oscillator(frequency, duration=0) {
  playing = true
	vol = nominal_vol
	osc.amp(vol)
	note_start_time = ~~millis()
	if (!osc_started) osc_started = true
	if(duration > 0) osc.play(frequency, vol, 0, duration) // for when playing a sequence
	else osc.triggerAttack(frequency, vol)
	current_frequency = frequency
}

let redraw_time = 0
let redraw_count = 0
let note_start_time = 0
let note_duration = 0
function draw() {
	if(stylo_mode && pressedNote){
		note_duration = ~~millis() - note_start_time 
		if(note_duration > 1000){
			const vibrato_delta = min(1, map(note_duration, 1000, 1500, 0, 1)) * 0.15 * sin(frameCount * 0.4)
			vol = nominal_vol + vibrato_delta
			const frequency_delta = (vibrato_delta * 10)
			osc.triggerAttack(frequency + frequency_delta, vol)
		}
	}

	if(frequency && (frameCount % 4 == 0)){
		if(millis() - redraw_time < 4000){
			redraw_waveform = true
		}
		else{
			push()
			noStroke()
			fill(255)
			rectMode(CORNERS)
			rect(chart_x * 1.02, chart_hy, W, chart_hy + v_space * 2)
			pop()
		}
	}
	if(v_space > U && display_waveform && redraw_waveform /*&& pressedNote!=null*/){
	
		push() // fade out the old waveform
		fill(255,10)
		noStroke()
		rectMode(CORNERS)

		redraw_count++
		rect(chart_x * 1.02,chart_hy, L, chart_hy + v_space)
		pop()

		if(playing){
			push()
			redraw_time = ~~millis()
			noFill()
			beginShape()
			let points = 500 //min(max(500,frequency/4),1200)
			let wavelength = 343/frequency // in meters
			let log_f = Math.log10(frequency) //1.64 - 3.7
			let col_f = map(log_f, 1.64, 3.7, 0,1)
			let wave_color = [255 * (1 - col_f), 0, 255 * col_f, 90]
			wt = 80 * (1 - col_f) * H_scale // need to scale proportional to screen dims somehow
			strokeWeight(wt)
			let f_factor = 0.49 * (v_space - wt)
			stroke(wave_color)
			// stroke(120)
			let map_points = (L - chart_x + wt) / points
			let x_offset = chart_x * 1.02
			let neutral_axis_position = chart_hy + 0.5 * v_space
			for (let i = 0; i < points; i++){
				// is the 2e4 factor messing up the scaling on different monitor resolutions? it should be a function of the pixel density, right?
				let f = f_factor*cos(frequency*i/2e4) //map( norm*wave[i], -1, 1, 0, 2*U) 
				vertex(x_offset + i*map_points, neutral_axis_position + f)
			}
			endShape()
			pop()
			let unit = 'm'
			if (wavelength < 0.1){wavelength = nf(wavelength * 1000,1,0); unit = 'mm';}
			else if (wavelength < 1){ wavelength = nf(wavelength * 100,1,1); unit = 'cm';}
			else{wavelength = nf(wavelength, 1, 2)}

			push() // wavelength and frequency text display
			// rectMode(CORNERS)
			noStroke()
			fill(255)
			let text_pos = [15 * U, chart_hy + v_space + U * 1.1]
			let text_pos2 = []
			if(tall_display){
				text_pos2 = [21 * U, text_pos[1]]
				rect(x_offset,chart_hy + v_space, W, H) // rect to clear under waveform labels
			}
			else{
				const L2 = L + 2.8 * U
				text_pos = [L2, neutral_axis_position + U * 0.06]
				text_pos2 = [L2, text_pos[1] + text_size]
				rect(L - 5,chart_hy, W, H) // rect to clear under waveform labels
			}
			
			fill(100)
			textSize(text_size)
			// textAlign(LEFT,BOTTOM)
			textAlign(RIGHT,BOTTOM)
			text(wavelength + ' ' + unit, text_pos[0], text_pos[1])
			text(nf(frequency, 2, 1) + ' Hz' , text_pos2[0], text_pos2[1])
			pop()
		}
		redraw_waveform = false
	}
	
	// debug --------------
	if(debug_mode){
		push()
		fill(200)
		let start_x = (16.5 - 8 * mobile)*U
		let start_y = 1.5 * U
		noStroke()
		rect(start_x - 0.25 * U, start_y - 0.25 * U, 4.5 * U, 4.5 * U)
		textSize(U * 0.5)
		textAlign(LEFT,TOP)
		fill(0)
		if(playing_note !== null) text('playing_note = ' + playing_note.note_name, start_x,start_y) 
		else text('a = ' + (scale_obj), start_x, start_y)
		// text('dens = ' + str(density), start_x,start_y)
		// text('dia = ' + str(diatonic), start_x,start_y)
		// text('seq = ' + str(sequence_number), start_x, start_y + 0.5*U)
		// if(log_f) text('col = ' + str(log_f), start_x,start_y)
		// text('stylo = ' + str(stylo_mode), start_x,start_y)
		// text('msTi = ' + str(mode_shift_temp_index), start_x,start_y)
		if(mode_shift_reference_index) text('msRi = ' + str(mode_shift_reference_index), start_x, start_y + 0.5*U)
		// text('shift = ' + str(mode_shift), start_x, start_y + 1.0*U)
		// text('shifted = ' + str(mode_shifted), start_x, start_y + 1.5*U)
		// if(selected_index) text('sel_I = ' + str(selected_index), start_x, start_y + 2.0*U)

		// text(str(int(displayWidth)) + ', ' +  str(int(displayHeight)), start_x, start_y + 1.0*U)
		// text(str(int(window.innerWidth)) + ', ' +  str(int(window.innerHeight)), start_x, start_y + 1.5*U)

		text('sel_K = ' + str(selected_key_name), start_x, start_y + 1.0 * U)
		text('key = ' + notes_arr[octave_start % 12], start_x, start_y + 1.5 * U)
		
		text('octS = ' + octave_start, start_x, start_y + 2.0 * U)
		// text('acc = ' + chart.accidental_type, start_x, start_y + 1.5*U)
		// text('accC = ' + str(accidental_count), start_x, start_y + 2.0*U)
		text('accN = ' + str(accidental_notes), start_x, start_y + 2.5 * U)
		text('def = ' + str(default_sharp), start_x, start_y + 3.0 * U)
		// text('LSNI = ' + str(chart.last_scale_note_index), start_x, start_y + 3.0*U)
		text('sig = ' + str(chart.key_signature), start_x, start_y + 3.5 * U)
		// if(pressedNote)	text(str(round(pressedNote.frequency,2)),2*U,start_y)
		// text(str(mode_name),2*U,start_y)
		// if(chart.beat)	text(str(chart.beat),2*U,start_y + 0.5*U)
		// if(playing_note) text(str(playing_note),2*U,start_y + 0.5*U)
		// text("nc1 " + str(note_draw_count1),2*U,start_y + 1*U)
		// text("nc2 " + str(note_draw_count2),2*U,start_y + 1.5*U)
		// text("re " + str(redraw_notes),2*U,start_y + 2*U)
		// text("pr " + str(pressedNote),2*U,start_y + 2.5*U)
	// 	text(str(chart.notes_sequence.length),3*U,2*U)
	// 	text(str(f_span),3*U,3.0*U)
	// 	text(str(max_f),3*U,3.5*U)
	// 	text(str(sequence_slider_shown),3*U,4*U)
	pop()
	}
	// ------------------
	
	chart.draw()
	
	// kind of fun pitch bend mechanic. Maybe play around with it in stylo mode. Would need an indicator. 
	// Maybe track how far the mouse has moved within the note.
	//if (mouseIsPressed && pressedNote && frequency) osc.triggerAttack(map(mouseY, 0,height, frequency*1.1, frequency*0.9)) 
}


function key_shift(input_note=null){
	let key_name_temp = key_name
	if(input_note){
		selected_note = input_note
	}
	else{ 
		for (let note of chart.notes){
			// print(note.index + ' ' + mode_shift_reference_index + ' ' + mode_shift_temp_index)
			if (note.contains_above(mouseX, mouseY) &&
					mode_shift_reference_index === mode_shift_temp_index ){
				selected_note = note
			}
			else if(note.index == mode_shift_temp_index) selected_note = note
		}
	}
	// let intial_selected_note = selected_note
	if (selected_note) selected_key_name = selected_note.note_name
	if(mode_shift > 0){ // && !mode_shifted
		let index_shift = 0
		for(i = 0; i < mode_shift; i++){ index_shift += scale_pattern[i] } //  shifted_scale_pattern[i]
		index_shift = index_shift % 12
		selected_index = (selected_note)? selected_note.index + 12 - index_shift : 0
		if(selected_index > 12) selected_index -= 12
		// for condensed notes, can't just use the note position index, have to use the note's frequency index
		for (let note of chart.notes){ 
			if(note.index == selected_index) selected_note = note // have to select note after key change? Otherwise things get shifted twice?
		}
	}
	if(key_name_temp == selected_note.note_name && !mode_shifted){
		// if((mode_scale_type == 'Major' && intial_selected_note.note_name == 'F♯ G♭') ||
			 // (mode_scale_type == 'minor' && intial_selected_note.note_name == 'D♯ E♭')) default_sharp = !default_sharp		
		if(accidental_count > 5) default_sharp = !default_sharp		
		else if(!mode_shifted) return
	}
	frequency = selected_note.frequency
	update_chart = true
	key_name = selected_note.note_name
	key_select.value(key_name)
	update_key()
	return
}

function condense_notes(){
	condensed_notes = !condensed_notes
	storeItem("condensed_notes_state", condensed_notes)
	stored_condensed_notes_state = condensed_notes
	COND_button.style('backgroundColor', 'rgb(240,240,240)')
	HIDE_FING_button.style('backgroundColor', 'rgb(240,240,240)')
	if(condensed_notes){
		if(hide_fingering) document.getElementById("COND").innerHTML = '|||'
		else document.getElementById("COND").innerHTML = '⁞⁞⁞'
		document.getElementById("MODE_MODE").innerHTML = 'RELATIVE ◀ MODE ▶'
		MODE_MODE_button.style('backgroundColor', 'rgb(180,180,180)')
		RAND_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
	}
	else{
		if(hide_fingering) document.getElementById("COND").innerHTML = '||||||'
		else document.getElementById("COND").innerHTML = '⁞⁞⁞⁞⁞⁞'
		COND_button.style('backgroundColor', 'rgb(240,240,240)')
		if(mode_mode == 'parallel'){
			document.getElementById("MODE_MODE").innerHTML = 'PARALLEL // MODE //'
			MODE_MODE_button.style('backgroundColor', 'rgb(110,150,240)')
			RAND_MODE_button.style('backgroundColor', 'rgb(110,150,240)')
		}
		else{
			MODE_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
			RAND_MODE_button.style('backgroundColor', 'rgb(240,240,240)')
		}
	}
	update_chart = true
	chart.create_notes(update_label=true,update_color=true)
	if(chart.playing_scale) restart_scale()
	set_stylo_mode()
}


function hide_fingerings(){
	if(note_count != 12) return
	hide_fingering = !hide_fingering
	storeItem("hide_fingering_state", hide_fingering)
	stored_hide_fingering_state = hide_fingering
	if(hide_fingering){
		if(condensed_notes)	document.getElementById("COND").innerHTML = '|||'
		else document.getElementById("COND").innerHTML = '||||||'
		document.getElementById("HIDE").innerHTML = 'SHOW ◑|◉|◒'
	} 
	else{
		if(condensed_notes)	document.getElementById("COND").innerHTML = '⁞⁞⁞'
		else document.getElementById("COND").innerHTML = '⁞⁞⁞⁞⁞⁞'
		document.getElementById("HIDE").innerHTML = 'HIDE ◑|◉|◒'
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


function cycle_mode(direction){
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
	if(mode_mode == 'parallel' && !condensed_notes){
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
		for (let note of chart.notes){ 
			if(note.index == selected_index){
				selected_key = note.note_name
				break
			}
		}
	}
	mode_select.value(modes_arr[mode_shift])
	if(mode_mode == 'parallel' && !condensed_notes){
		update_mode(false)
		key_select.value(selected_key)
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
	}
	else if(selected_select_menu === 'KEY'){
		// Find current key index
		let key_index = notes_arr.findIndex(x => x === key_name)
		key_index = (key_index + direction + notes_arr.length) % notes_arr.length
		key_select.value(notes_arr[key_index])
		update_key()
	}
}

// Highlight the currently selected select menu
function update_select_menu_highlight() {
	// Remove highlight from all
	instrument_select.style('border', '2px solid #ccc')
	scale_select.style('border', '2px solid #ccc')
	key_select.style('border', '2px solid #ccc')

	// Highlight the selected one
	if (selected_select_menu === 'INSTR.') {
		instrument_select.style('border-left', '4px solid #888')
		instrument_select.style('border-right', '4px solid #888')
	} else if (selected_select_menu === 'SCALE') {
		scale_select.style('border-left', '4px solid #888')
		scale_select.style('border-right', '4px solid #888')
	} else if (selected_select_menu === 'KEY') {
		key_select.style('border-left', '4px solid #888')
		key_select.style('border-right', '4px solid #888')
	}
}


function TOGL_instrument(){
	let temp_name = instrument_name
	instrument_select.value(previous_instrument)
	update_instrument(false, false, true)
	previous_instrument = temp_name
}
function TOGL_instrument2(){
	let temp_name = instrument_name
	instrument_select.value(previous_instrument)
	update_instrument(false, true, false)
	previous_instrument = temp_name
}

function play_scale(restart = true){
	if(restart){
		if(chart.playing_scale){
			if (playing_note){
				osc.triggerRelease()
				playing_note.mouseReleased()
			} 
			chart.playing_scale = false
			playing_paused = false
			// if(dir_override) PLAY_button.style('backgroundColor', 'rgba(213, 190, 117, 1)')
			PLAY_button.style('backgroundColor', 'rgb(240,240,240)')
			if(show_seq) chart.generate_sequence_display()
		}
		else{
			chart.play_scale(true)
			// if(dir_override) PLAY_button.style('backgroundColor', 'rgba(234, 202, 96, 1)')
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
			playing_note.mouseReleased()
		} 
		playing_note = null
		PLAY_button.style('backgroundColor', 'rgb(240,240,240)')
		return
	}
	if(playing_note && chart.scale_notes){
		playing_paused = !playing_paused
		if(playing_paused) osc.triggerRelease()
		else osc.triggerAttack(frequency, vol)
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
var allow_continue = true
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

var show_info = true
var show_seq = true

function generate_scale_pattern_representation(x_move = 0){
	shifted_scale_pattern = []
	// let st_col = 255
	if(mode_shift > 0){
		// st_col = 0
		let ind = mode_shift
		for(let steps in scale_pattern){
			shifted_scale_pattern.push(scale_pattern[ind])
			ind++
			if(ind == scale_pattern.length) ind = 0
		}
	}
	else shifted_scale_pattern = scale_pattern
	
	push()
	fill(255)
	noStroke()
	translate(U * 1.65, U * 0.85)
	rect(-U, 0, U * 13.15, 1.1 * U)
	rectMode(CORNERS)
	let scale_factor = 6
	let size = seq_display.h / scale_factor
	textSize(size * 0.95)
	
	push()
	stroke(255)
	const step_width = U * 0.92
	const pattern_width = U * 11
	const x_offset = x_move / step_width
	const x_shift = x_move

	strokeWeight(step_width * 0.1)
	let x_pos = x_shift
	const y_pos = 0
	const ht = U * 1.1 //1.2 * step_width
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
	const diam1 = step_width * 0.25
	const diam2 = step_width * 0.37
	const y_pos3 = y_pos + ht * 0.5
	for(let i = 0; i < 20; i++){ // small dark dots
		const x_pos2 = x_pos + (i + 0.5) * step_width
		if(i > 10 && x_pos2 > pattern_width) break
		circle(x_pos2, y_pos3, diam1)
	}
	fill(255)
	rect(pattern_width, y_pos, pattern_width + diam1, y_pos2)
	rect(-U, y_pos, 0 , y_pos2)
	for(let i = 0; i < 20; i++){ // white circles to punch
		const x_pos2 = x_pos + i * step_width
		if(i > 10 && x_pos2 > pattern_width + diam2/2) break
		circle(x_pos2, y_pos3, diam2)
	}
	fill(num_col)
	textAlign(LEFT, BOTTOM)
	text(scale_pattern.length, step_width * 12.2, y_pos2)
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
	let size = seq_display.h / scale_factor
	textSize(size * 0.95)
	const alt_index = min(mode_shift,scale_obj.alt.length-1)
	const fields = scale_obj.alt[alt_index].length
	textAlign(LEFT,TOP)
	fill(20)

	let scale_str
	// let pattern_str = ''
	let shift = 1
	if(scale_pattern.length < note_count){
		// mode_proper_name = 
		// print(mode_select.value().length)
		// if(!selected_key_name) selected_key_name = 'C'
		if (mode_select.value().length > 4) mode_proper_name = mode_select.value().slice(mode_select.value().indexOf('· ')+2)
		else mode_proper_name = scale_name + ' · ' + mode_select.value()
		// print(scale_name, mode_select.value())
		key_sig = chart.key_signature[0] // selected_key_name
		
		let accidental_str = (diatonic && accidental_count > 0 && chart.accidental_type != 'ALL')? chart.key_sig2[1] + chart.accidental_type:''
		if(accidental_count > 5 && !mode_shifted){
			if(default_sharp)	{
				key_sig = selected_key_name[0]
				if(selected_key_name.length > 1) key_sig += '♯'
				accidental_str = accidental_count + '♯'
				//E# locrian, not F
				if(/* accidental_count > 5 && */ selected_key_name.length == 1){
					// key_sig += '♯'
					if(key_sig[0] == 'F') key_sig  = 'E♯'
				}
			}
			else{
				accidental_str = accidental_count + '♭'
				if(selected_key_name.length > 2) key_sig = selected_key_name.slice(3)
				else key_sig = chart.key_signature[0]
				if(/*accidental_count > 5 && */selected_key_name.length == 1){
					// key_sig += '♭'
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
		if(scale_name == 'natural minor') scale_str = key_sig + ' · ' + 'minor'
		if(mode_shift > 0 /*&& mode_proper_name.length > 1 */){
			// if(mode_select.value().length <= 4) scale_str += ' · ' + mode_select.value()
			// else 
			scale_str = key_sig + ' · ' + mode_proper_name //mode_select.value().slice(mode_select.value().indexOf('· ')+2)
		}
		else scale_str = key_sig + ' · ' + scale_name
		if (diatonic && accidental_count > 0){
			scale_str += ' (' + accidental_str + ')'
			// print(scale_str)
		}
		//pattern_str =	'[' + str(shifted_scale_pattern) + ']' 
		//if(accidental_count < 7) pattern_str += '   ' + accidental_str // scale_types_arr[len - 5] +  "Scale length = " + str(len)
		shift = 1.2
	}
	else if(note_count == 12) scale_str = 'The Chromatic Scale'
	// else scale_str = str(note_count) + ' tone equal temperament (' + str(note_count) + '-TET)'
	else scale_str = str(note_count) + '-TET'
	let x_pos = U * 0.25
	let y_pos2 = U * 0.15
	push()
		if(mode_shift > 0) fill(140, 80, 0)
		text(scale_str, x_pos, 0)
		fill(160)
		if(scale_pattern.length != 12) text(' _'.repeat(15), 0, y_pos2)
		//text(pattern_str, seq_display.x1, seq_display.y0)
	pop()
	if(note_count == 12){
		scale_factor = 6 + 0.5 * max(0,(fields - 3))
		size = seq_display.h / scale_factor
		textSize(size * 0.95)
		for(i = 0; i < fields; i++){
			let alt_text = scale_obj.alt[alt_index][i]
			text(alt_text, x_pos, y_pos2 + size * (i+shift))
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
	let octave_start_mod = octave_start % 12
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
	// prevents phone autorotate from restarting the config in portrait mode
	if(!(window.innerWidth === H && window.innerHeight === W && W > H)){
		setup(false) 
	} 
}

document.addEventListener("contextmenu", (event) => event.preventDefault(), "true")
document.addEventListener("touchStarted", (event) => event.stopPropagation(), "true")
document.addEventListener("touchEnded", (event) => event.stopPropagation(), "true")
document.addEventListener("touchMoved", (event) => event.stopPropagation(), "true")
// document.addEventListener("touchmove", (event) => event.preventDefault(), {passive: false}) // this prevents the sliders from working on mobile for some reason.

let effects_controls = false
let effects_controls_primed = false
let pattern_mode_shift_primed = false
let pattern_mode_shift_starting_position = 0
let	key_shift_primed = false
let	key_shift_starting_position = 0

function input_pressed(){
	effects_controls_primed = false
	if(!audio_started){
		userStartAudio()
		audio_started = true
	} 
	if(mouseY > chart_hy && mouseX > chart_x * 1.02 && W > 1000){
		toggle_waveform_display()
	}
	if(chart && mouseX > chart_x){
		if(effects_controls){
			effects_controls = false
			image(img, 0, img_y, img_w, img_h)
		} 
		chart.mousePressed()
	}
	else if(mouseY > 3.5 * U && mouseY < min(H - U, 16.5 * U) && !misc_buttons_shown){
		effects_controls_primed = true
	}
    
    // If user pressed inside sequence display, start long-press detection.
    // Actual action (short press = toggle pause, long press = hide sequence) is handled on release.
	if(in_seq_display(mouseX, mouseY)){
			seq_press_start = ~~millis()
			seq_pressing = true
			seq_press_start_x = mouseX
			seq_press_start_y = mouseY
	}
	else if(in_staff_display(mouseX, mouseY)){
		toggle_staff_display()
	}
	else if(in_clef(mouseX, mouseY)){
		key_shift_primed = true
		key_shift_starting_position = mouseX
	}
	else if(in_pattern_representation(mouseX, mouseY)){
		pattern_mode_shift_primed = true
		pattern_mode_shift_starting_position = mouseX
	}
}

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
	textSize(U * 0.75)
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

function input_dragged(){
	// cancel sequence long-press if the user moves significantly while pressing
	if(seq_pressing){
		let dx = abs(mouseX - seq_press_start_x)
		let dy = abs(mouseY - seq_press_start_y)
		// small movement tolerance based on UI unit `U`
		if(dx > (U * 0.5) || dy > (U * 0.5)){
			seq_pressing = false
		}
	}
	if(effects_controls) update_effects_controls(mouseY)
	else if(pattern_mode_shift_primed){
		const pattern_width = int(U * 11)
		const shift_increment = pattern_width / 12
		const snap_dist = shift_increment / 4
		const x_move = int(mouseX - pattern_mode_shift_starting_position)
		const left_width = shifted_scale_pattern[0] * shift_increment
		const right_width = shifted_scale_pattern[scale_pattern.length - 1] * shift_increment
		if(x_move > 0){
			if(right_width - x_move < snap_dist || x_move > right_width){
				cycle_mode(-1)
				pattern_mode_shift_starting_position += right_width
				generate_scale_pattern_representation(0)
			}
			else if(abs(x_move) > snap_dist) generate_scale_pattern_representation(x_move)
			else generate_scale_pattern_representation(0)
		}
		else{ 
			if(left_width + x_move < snap_dist || -x_move > left_width){
				cycle_mode(1)
				pattern_mode_shift_starting_position -= left_width
				generate_scale_pattern_representation(0)
			}
			else if(abs(x_move) > snap_dist) generate_scale_pattern_representation(x_move)
			else generate_scale_pattern_representation(0)
		}
	}
	else if(key_shift_primed){
		const x_move = int(mouseX - key_shift_starting_position)
		let move_amount = 0
		if(x_move > U) move_amount = 1
		else if (x_move < -U) move_amount = -1
		if(move_amount){
			key_shift_starting_position += move_amount * U
			let key_index = notes_arr.findIndex(x => x === key_name)
			key_index = (key_index + move_amount + notes_arr.length) % notes_arr.length
			key_select.value(notes_arr[key_index])
			update_key()
		}
	}
	else if(mode_shift_temp_index != null && draggable){
		if(mouseY < chart.above) mode_shift_temp_index = null
		else{
			for (let note of chart.notes){
				if (note.note_val != 0 && note.index != mode_shift_temp_index && note.contains_above(mouseX, mouseY)){
					if(note.index > mode_shift_temp_index){
						mode_shifted = true
						cycle_mode(1)
						mode_shift_temp_index = note.index
					}
					else if(note.index < mode_shift_temp_index){ 
						mode_shifted = true
						cycle_mode(-1)
						mode_shift_temp_index = note.index
					}
				}
			}
		}
	}
	else if(chart) chart.mousePressed()
}

function input_released() {
	// handle short / long press behavior for sequence display
	if(seq_pressing){
		let dur = ~~millis() - seq_press_start
		seq_pressing = false
		if(dur >= SEQ_LONG_PRESS_MS){
			// long press -> turn sequence display off
			show_seq = !show_seq
			set_show_seq(show_seq)
		}
		else{
			if(show_seq) toggle_pause()
			else {
				show_seq = true
				set_show_seq(show_seq)
			}
			// short press -> toggle pause (existing behavior)
		}
		// we've handled this input event
		return
	}
	if(effects_controls && !isNaN(dry_wet_ratio)){
		storeItem("dry_wet_ratio", dry_wet_ratio)
	}
	else if(effects_controls_primed && mouseX < chart_x && mouseY > 3.5 * U && mouseY < min(H - U, 16.5 * U)){
		effects_controls = true
		update_effects_controls(0)
	}
	else if(mouseY > chart_above && mouseY < chart_y && mouseX > chart_x && mouseX < chart_end 
		&& !(mode_mode == 'parallel' && mode_shifted) ){
		key_shift()
	} 
	starting_y = null
	pitch_bend_amount = 0
	bend_started = false
	mode_shift_temp_index = null
	mode_shifted = false
	key_shift_primed = false
	if(pattern_mode_shift_primed){
		generate_scale_pattern_representation()
		pattern_representation_captured = false
		pattern_mode_shift_primed = false
	}
 	if(chart.playing_scale == false){
		playing = false
		if (pressedNote!=null){
			pressedNote.mouseReleased()
			pressedNote = null
			osc.triggerRelease()
			note_start_time = 0
		}
	}
	if(debug_mode && mouseButton === CENTER){
		debug_indicator_location = [mouseX, mouseY]
	}
	if (mobile && !fullscreen()) go_fullscreen()
}

	// generate a different way to represent the scale patterns. Maybe less useful.
	// let position = 0
	// let pitch_class_set = [0]
	// for(let i = 0;i < shifted_scale_pattern.length - 1; i++){
	// 	position += shifted_scale_pattern[i]
	// 	pitch_class_set.push(position)
	// }	

let saved_chart_graphics = false

function save_chart(){
	let rows = 4
	let cols = 3
	if(scale_pattern.length == 12){
		rows = 1
		cols = 1
	}
	let dims = [int(chart_x), int(chart_above), int(chart_end-chart_x), int(chart_y+chart_h-chart_above)]
	let margin = int(U * 0.2)
	let W1 = int(chart_end - chart_x)
	let H1 = int(chart_y + chart_h - chart_above)
	let footer_H = int(H1 * 0.15) + margin
	let W2 = cols * W1 + (cols - 1) * margin
	const w2 = W2/2
	let H2 = rows * H1 + (rows - 1) * margin + footer_H

	if(saved_chart_graphics){
		full_chart.resizeCanvas(W2, H2)
	}
	else{
		saved_chart_graphics = true
		full_chart = createGraphics(W2, H2)
	}

	full_chart.background(0)

	for(let count = 0; count < rows * cols; count++){
		if(condensed_notes){ // have to uncondense and then recondense for it to work properly?
			condense_notes()
			key_shift(chart.notes[count])
			update_key()
			condense_notes()
		} else{
			key_shift(chart.notes[count])
			update_key()
		}
		let key_chart = better_get(dims[0],dims[1], dims[2], dims[3])

		let x = (W1 + margin) * int(count/rows)
		let y = (H1 + margin) * (count%rows)
		full_chart.image(key_chart, ~~x, ~~y, W1, H1)
	}
	let save_str = (mode_shift == 0) ? scale_name : mode_select.value().slice(mode_select.value().indexOf('· ')+2) // remove the roman numerals
	
	let WP = int(U * 13)
	let HP = int(U * 1.2)
	let text_pos = footer_H * 0.45
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
		let pattern_representation = better_get(int(U * 1.0), int(U * (0.7 + 0.1 * mobile)), WP, HP)
		full_chart.textAlign(RIGHT,CENTER)
		full_chart.text(save_str, w2 - WP * 0.8, text_pos)
		full_chart.image(pattern_representation, int(w2 - WP * 0.5), int(footer_H * 0.03), WP, HP)
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
				else if (key_L === 'd') debug_mode = !debug_mode
		else if (key_L === 'l'){
			console.log(getItem("scale_name") + ', ' + getItem("mode_shift")  + ', ' + getItem("previous_instrument") + ', ' + getItem("instrument_name"))
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
	if(!display_waveform){
		push()
		fill(255)
		rectMode(CORNERS)	
		rect(int(chart_x * 1.02), chart_hy, W, H)
		pop()
	}
}

function toggle_staff_display(){
	display_staff = !display_staff
	storeItem("display_staff_state", display_staff)
	push()
	if(!display_staff){
		fill(255)
		rectMode(CORNERS)
		rect(U * 13.8, U * 6.4, U * 15.5, U * 1)
		rect(U * 13.8, U * 6.4, U * 13, U * 3)
	}
	else draw_staff_with_note_range()
	pop()
}

// Centralized setter for sequence-display visibility. Clears or redraws the sequence area.
function set_show_seq(state){
	try{ storeItem('show_seq', show_seq) }catch(e){}
	// if hiding, clear the area immediately
	if(!show_seq){
		if(typeof seq_display !== 'undefined' && seq_display.w && seq_display.h){
			push()
			fill(255)
			rectMode(CORNERS)
			rect(~~seq_display.x0, ~~seq_display.y0, ~~seq_display.x3, ~~seq_display.y3)
			pop()
		}
	}
	else{
		// show -> regenerate sequence and info displays
		if(typeof chart !== 'undefined' && chart.generate_sequence_display){
			chart.generate_sequence_display()
		}
		// if(typeof generate_info_display === 'function' && show_info){
		// 	generate_info_display()
		// }
	}
}

function in_seq_display(x, y){
	if(vol_slider_shown || drone_vol_slider_shown || tempo_slider_shown || 
		tuning_slider_shown || save_confirm_shown){
		return false
	} 
	return (seq_display.x1 <= x && x <= seq_display.x2 && seq_display.y1 <= y && y <= seq_display.y2)
}
function in_staff_display(x, y){
	if(vol_slider_shown || drone_vol_slider_shown || tempo_slider_shown || sequence_slider_shown
		|| tuning_slider_shown || save_confirm_shown){
		return false
	}
	return (U * 14 <= x && x <= U * 15.5 && U * 1.5 <= y && y <= U * 6.25)
}
function in_clef(x, y){
	if(!display_staff || vol_slider_shown || drone_vol_slider_shown || tempo_slider_shown || 
		sequence_slider_shown || tuning_slider_shown || save_confirm_shown){
		return false
	}
	return (U * 13 <= x && x <= U * 14 && U * 3.5 <= y && y <= U * 5.5)
}
function in_pattern_representation(x, y){
	if(vol_slider_shown || drone_vol_slider_shown || tempo_slider_shown || sequence_slider_shown
		|| tuning_slider_shown || save_confirm_shown || scale_pattern.length == 12){
		return false
	}
	return (U * 1.5 <= x && x <= U * 12.5 && U <= y && y <= U * 6.25)
}