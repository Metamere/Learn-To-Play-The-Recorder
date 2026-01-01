let tempo_scroll_limit = 120

let val = 400
let col0 = [200] // gray
let col1 = [50, 0.2 * val, 0.5 * val] // standard highlight
let col2 = [0.55 * val * 0.88, 0.37 * val * 0.88, 0] // octave indication //
let col_set = [col0, col1, col2]

let fingering_pattern, drone_freq
let instrument_obj, notes_arr, scale_arr_index
let chart_end = 0
let scale_notes_length_temp = 0
let redraw_notes = true
let color_count = 0
let draggable = false
let accidental_notes = ''
let	accidental_count = 0
let update_seq_display, note_span, bend_factor
let note_index, note_index_temp
let midi_pitch_bend = 0
let wait_time, elapsed_time, wait_ratio
let play_clock = 0

const seq_display = {}

const seq_arr = []
let n = 17 // total number of different sequences 
while (n--) seq_arr[n] = n + 1

class fingering_chart {
	
	constructor(x, y) {
		pressed_note_temp_index = -1
		bend_factor = pow(2, pitch_bend_semitones/note_count)
		this.x = x
		this.y = y
		this.above = int(this.y - U * 1.45)

		if (note_count !== 12){ // for 5-TET, 7-TET, etc.
			this.chart_notes_count = min(28, max(24, 3.5 * note_count, int(28 * note_count / 12)))
			stylo_mode = true
		}
		else{
			this.chart_notes_count = fingering_data.length
			if(instrument_type == 'recorder'){
				// exclude last note for bass recorders
				if(instrument_obj.bass_instrument) this.chart_notes_count-- 
			}
			else if(instrument_type == 'brass'){
				// too many notes to fit otherwise when not condensed, so we need to wrap to a second row
				this.wrap_point = instrument_obj.wrap_point 
			}
		}

		this.on_notes = 0

		this.repeat = stored_repeat_state
		this.notes_sequence = []
		this.notes_sequence_lengths = []
		this.scale_notes = []
		this.octave_scale_notes = []
		this.notes = []
		this.all_notes = []
		this.scale_note_names_sharp = []
		this.scale_note_names_flat = []
		this.accidental_counts = []
		this.accidental_type = 'ALL'
		this.OTP = octaves_to_play
		this.override_OTP = octaves_to_play
		this.create_frequencies()
		this.create_fingering_pattern()

		this.create_notes(true, true, 'constructor')
		if (note_count < 12) {
			this.OTP = max(2, octaves_to_play) // Change to more octaves for 5-TET
			octaves_to_play = this.OTP
		}
		this.beat = 60 / tempo
		this.beats_per_measure = 4
		this.interval_time = this.beat
		this.current_note_index = 0
		this.sequence_note_index = 0
		this.dir = 1
		this.next_sequence_note_index = this.dir
		this.time = 0
		this.playing_scale = false
		playing = false
		this.index_offset = 0
		this.started = false
		if(dir_override == 0 || dir_override == 2) this.reversal = true
		this.reversal_mode = 2 // 2,1,-1
		this.default_reversal_setting = false
		this.first_scale_note = null
		this.last_scale_note = null
		update_seq_display = true
		this.bass_instrument = instrument_obj.bass_instrument ? 1 : 0
		staff_dims.y_pos_staff = int(staff_dims.y_pos0 - this.bass_instrument * staff_dims.S)
	}

	_handlePlayingScale() {
		// increment play clock in seconds using deltaTime so timing is independent of frame rate
		if(chart.playing_scale && !playing_paused) play_clock += deltaTime * 0.001
		elapsed_time = play_clock - this.time
		wait_time = this.interval_time // interval_time is in seconds
		wait_ratio = round(1 - (wait_time - elapsed_time) / wait_time,3)
		if (show_seq && !sheet_music_display_mode && tempo <= tempo_scroll_limit && this.started) {
			this.generate_sequence_display(this.sequence_note_index, this.next_sequence_note_index)
			push()
			const from_x = (seq_display.x || 0)
			const to_x = (seq_display.x || 0) + (seq_display.x_diff || 0)
			const travel_dist = (to_x - from_x)
			const x_current = from_x + wait_ratio * travel_dist
			const x_current2 = from_x + min(0.8, wait_ratio) * travel_dist

			// draw vertical indicator line
			if (this.dir == 1) stroke(255, 80, 50, 140)
			else stroke(50, 80, 255, 140)
			strokeWeight(max(1, round((this.override_OTP == 1 ? 1 : 0.6) * U * 0.15)))
			strokeCap(ROUND)
			const M_local = U * (0.35 - 0.1 * (this.override_OTP - 1))
			const inner_y0 = seq_display.y0 + M_local
			const inner_y1 = seq_display.y1 - M_local
			if (inner_y0 != null && inner_y1 != null) line(x_current, inner_y0, x_current, inner_y1)
			if (seq_display.y != null){
				let f = 0
				if (typeof this.notes_sequence !== 'undefined' && typeof this.sequence_note_index !== 'undefined') {
					f = this.notes_sequence[min(this.sequence_note_index, this.notes_sequence.length - 1)]
				}
				let COL = (f % scale_pattern.length == 0) ? [100, 230, 0, 200] : [20, 180, 230, 200]
				stroke(COL)
				strokeWeight(seq_display.diam2)
				line(from_x, seq_display.y, x_current2, seq_display.y) // note playing progress line
			}
			pop()
		}
		if(elapsed_time < wait_time){
			if(this.started && !playing_note){
				const seq_index = (this.dir == -1) ? (this.notes_sequence.length - 1 - this.current_note_index) : this.current_note_index
				const index1 = this.notes_sequence[seq_index]
				let index2 = index1 + scale_offset

				if (index2 > this.scale_notes.length - 1) this.index_offset = -scale_pattern.length // jump back down an octave
				if (index2 + this.index_offset < 0) this.index_offset = min(0, this.index_offset) + scale_pattern.length // jump uip an octave

				playing_note = this.scale_notes[min(max(index2 + this.index_offset, 0), this.scale_notes.length - 1)]
				if(playing_note){
					frequency = playing_note.frequency
					const rest_time = min(this.interval_time * 0.2, 3)
					const lead_time = 0.1 // min(this.interval_time * 0.5, 2) // why doesn't this work anymore?
					const remaining_time = this.interval_time * (1 - wait_ratio < 1 ? wait_ratio : 0) - rest_time
					// console.log('resume', this.interval_time, rest_time, wait_ratio, remaining_time)
					playing_note.press(remaining_time, false, lead_time)
				}
				else{
					console.log('no playing_note')
				}
			}
			return
		}

		if (this.started) {
			this.current_note_index++
			this.sequence_note_index += this.dir
			this.next_sequence_note_index += this.dir
		}

		redraw_notes = true
		this.time = play_clock
		// pick interval for the upcoming note taking direction into account
		if(this.dir == -1){
			const n = this.notes_sequence_lengths.length - 1
			if(n - this.current_note_index - 1 < 0){
				this.interval_time = this.notes_sequence_lengths[0] + this.notes_sequence_lengths[1]
			} 
			else this.interval_time = this.notes_sequence_lengths[n - this.current_note_index - 1]
		}		
		else this.interval_time = this.notes_sequence_lengths[this.current_note_index]

		if (playing_note) playing_note.release()

		const seq_index = (this.dir == -1) ? (this.notes_sequence.length - 1 - this.current_note_index) : this.current_note_index
		const index1 = this.notes_sequence[seq_index]
		let index2 = index1 + scale_offset

		if (index2 > this.scale_notes.length - 1) this.index_offset = -scale_pattern.length // jump back down an octave
		if (index2 + this.index_offset < 0) this.index_offset = min(0, this.index_offset) + scale_pattern.length // jump uip an octave

		playing_note = this.scale_notes[min(max(index2 + this.index_offset, 0), this.scale_notes.length - 1)]
		if(playing_note){
			frequency = playing_note.frequency
			const rest_time = min(this.interval_time * 0.2, 3)
			const lead_time = 0 // min(this.interval_time * 0.5, 2)
			const remaining_time = this.interval_time * (1 - wait_ratio < 1 ? wait_ratio : 0) - rest_time
			// console.log('play', this.interval_time, rest_time, wait_ratio, remaining_time)
			playing_note.press(remaining_time, false, lead_time)
		}
		else{
			console.log('no playing_note')
		}
		this.started = true
		redraw_waveform = true

		if(show_seq){
			// if(sheet_music_display_mode){
			// 	if(playing_note.x_pos)
			// }
			// else 
			if(tempo > tempo_scroll_limit //)){ 
				|| this.sequence_note_index == this.notes_sequence.length - 1 
				|| this.sequence_note_index == 0){
				// console.log(this.sequence_note_index)
				this.generate_sequence_display(this.sequence_note_index, this.next_sequence_note_index)
			}
		}

		// reset position when reaching end
		if (this.current_note_index == this.notes_sequence.length - 1) {
			this.current_note_index = 0
			this.next_sequence_note_index = 1
			this.index_offset = 0
			this.started = false
			// reset timing so that repeat doesn't immediately advance; start the wait anew
			// Use play_clock (tick counter) to match elapsed_time computation
			this.time = play_clock
			if (this.repeat) {
				if (dir_override >= 0){
					this.sequence_note_index = 0
					this.next_sequence_note_index = 1
				} 
				if (dir_override == -1 || 
					(this.reversal && (dir_override == 0 || dir_override == 2))){
						this.sequence_note_index = this.notes_sequence.length - 1
						this.next_sequence_note_index = this.notes_sequence.length - 2
					}
			}

			// change direction if needed
			if ((this.dir == 1 && this.reversal) || this.repeat) {
				if ((dir_override == 0 && this.dir == -1) || 
				(this.reversal && (dir_override == 0 || dir_override == 2))) {
					this.dir *= -1
					if (this.dir == 1) {
						this.sequence_note_index = 0
						this.next_sequence_note_index = this.dir
					} 
				}
			} else {
				allow_continue = false
				this.playing_scale = false
				playing = false
				playing_note = null
				playing_paused = false
				PLAY_button.style('backgroundColor', 'rgb(240,240,240)')
			}

			// Ensure seq display indices are kept consistent when reversal is enabled but repeat is off
			if (!this.repeat && this.reversal) {
				if (this.dir == 1) {
					this.sequence_note_index = 0
					this.next_sequence_note_index = 1
				} else {
					this.sequence_note_index = this.notes_sequence.length - 1
					this.next_sequence_note_index = max(0, this.notes_sequence.length - 2)
				}
			}
		}
	}

	create_fingering_pattern() {
		fingering_pattern = []
		if (note_count != 12) scale_pattern = Array(note_count).fill(1)
		else scale_pattern = scale_obj.pattern
		notes_arr = shift_array(instrument_obj.shift_amount)

		octave_start = notes_arr.indexOf(key_name)
		if(octave_start === -1) octave_start = 0

		let position = octave_start

		if (mode_shift) {
			for (let i = 0; i < mode_shift; i++) {
				octave_start += scale_pattern[i]
			}
		}
		
		let start = false
		let ind = 0
		// find the index position of the first active note in the full fingering chart.
		while (start == false) {
			position += scale_pattern[ind]
			if (position > note_count - 1) {
				position -= note_count
				start = true
			}
			ind += 1
			if (ind == scale_pattern.length) ind = 0
		}

		drone_freq = 0
		this.on_notes = 0
		// set notes in full fingering chart to 0 if off, 1 if on, 2 if on and the root note
		for (let i = 0; i < this.chart_notes_count; i++) {
			let val = 0
			if (i == position) {
				if (i == octave_start || (i - octave_start) % note_count == 0) {
					val = 2
					if (drone_freq == 0) {
						let multiplier = 0.25
						const target_freq = this.freq_list[i]
						while(drone_freq < 40){
							drone_freq = target_freq * multiplier
							multiplier *= 2
						}
					}
				} else val = 1
				position += scale_pattern[ind]
				ind += 1
				if (ind == scale_pattern.length) ind = 0
			}
			if (val != 0) this.on_notes++
			fingering_pattern[i] = val
		}
		this.scale_note_names_sharp = []
		this.scale_note_names_flat = []
		accidental_count = 0
		for (let i = 0; i < 12; i++) {
			let i2 = (i + octave_start) % 12
			if (fingering_pattern[i2] > 0){
				if(notes_arr[i2].length > 1){
					accidental_count++
					this.scale_note_names_flat.push(notes_arr[i2].slice(3))
					this.scale_note_names_sharp.push(notes_arr[i2].slice(0,2))
				}	
				else{
					this.scale_note_names_flat.push(notes_arr[i2])
					this.scale_note_names_sharp.push(notes_arr[i2])
				}
			}
		}
		
		if(accidental_count == 0){
			this.accidental_type = 'ALL'
		}
		else if(accidental_count == 5 
			&& duplicates_check(this.scale_note_names_sharp) 
			&& duplicates_check(this.scale_note_names_flat)){
	    let duplicates = true
			this.accidental_type = 'ALL'
			let all_checked = false
			let count = 0
			while(duplicates && all_checked == false && count < 10){
				if(count == 9) console.log('count exceeded')
				count ++
				if(duplicates_check(this.scale_note_names_sharp) && duplicates_check(this.scale_note_names_flat)){
					accidental_count++
					// console.log("accidental count = " + accidental_count)
					modify_notes_for_accidental(this.scale_note_names_sharp,'♯')
					modify_notes_for_accidental(this.scale_note_names_flat,'♭')
					// if(modified == false) all_checked = true
				}
				else if(duplicates_check(this.scale_note_names_flat) == false && !default_sharp){
					this.accidental_type = '♭'
					// console.log('sharp')
					accidental_notes = order_of_flats.slice(0,accidental_count)
					duplicates = false
				}
				else if(duplicates_check(this.scale_note_names_sharp) == false && default_sharp){
					this.accidental_type = '♯'
					// console.log('flat')
					accidental_notes = order_of_sharps.slice(0,accidental_count)
					duplicates = false
				}
				// else duplicates = false
				if(accidental_count == this.scale_note_names_sharp.length || accidental_count == 7){
					all_checked = true

				}
			}
		}
		else{
				// console.log('sharp = ' + this.scale_note_names_sharp)
				// console.log('flat = ' + this.scale_note_names_flat)
			if(duplicates_check(this.scale_note_names_sharp)){
				this.accidental_type = '♭'
				accidental_notes = order_of_flats.slice(0,accidental_count)
			}
			else{ // if(duplicates_check(this.scale_note_names_flat)){
				this.accidental_type = '♯'
				accidental_notes = order_of_sharps.slice(0,accidental_count)
			}
		}
		// console.log(accidental_notes)
		this.generate_sequence()
		if(sheet_music_display_mode) this.generate_sequence_display()
		scale_notes_length_temp = scale_pattern.length * this.override_OTP
	}

	create_frequencies() {
		const lowest_note = instrument_obj.lowest + (instrument_obj.transposition ? instrument_obj.transposition : 0)
		let current_freq
		this.freq_list = []
		this.midi_note_list = []
		for (let i = 0; i < this.chart_notes_count; i++) {
			current_freq = round(tuning * Math.pow(2, (lowest_note + i) / note_count),3)
			this.freq_list.push(current_freq)
			this.midi_note_list.push(lowest_note + i + 69)
		}
	}
	
	create_notes(update_label, update_color, source) {
		// if(source) console.log(source)
		this.note_height = (instrument_type == 'brass' && condensed_notes == false) ? chart_h / 2 : chart_h
		this.bend_threshold = int(this.note_height / (15 - 7 * mobile))
		if(instrument_type == 'Irish whistle') this.divide = chart_y + this.note_height * 0.75
		else this.divide = chart_y + this.note_height * 0.5
		chart_end = 0
		note_span = null
		this.notes = []
		this.all_notes = []
		if (!condensed_notes) this.width_factor = 1
		else this.width_factor = min(2, 28 / this.on_notes)
		// else this.width_factor = min(2, 28/(Math.ceil(this.on_notes/2)*2))
		// else this.width_factor = min(2, Math.floor(28/this.on_notes*4)/4)
		const w = int(U * this.width_factor)
		let x = 0
		let y = 0
		if(update_label || update_color){
			fill(0)
			noStroke()
			textAlign(CENTER, TOP)
			textSize(w / 4)

			push()
			// clear the old notes --------------
			rectMode(CORNERS)
			fill(255)
			rect(chart_x * 1.025, this.y + this.note_height, W, H) // clear below the chart
			// clear out chart area
			if (!stylo_mode) rect(chart_x * 1.025, chart_y, chart_x2, chart_y + chart_h)
			pop()
		}
		
		color_count = 0
		if (instrument_obj.key === 'F') color_count += 3
		let chart_index = 0
		let key_sig_note = false
		let key_sig
		this.first_scale_note_index = null
		let wrapped = false
		let divide2 = this.divide
		for (let i = 0; i < this.chart_notes_count; i++) {
			if(!condensed_notes && !wrapped && i > this.wrap_point){
				y += this.note_height
				divide2 += this.note_height
				x -= w * 12
				wrapped = true
			}
			const freq = this.freq_list[i]
			const midi_note = this.midi_note_list[i]
			this.all_notes.push(new note(this.x + x, this.y + y, w, this.note_height, divide2, [1,1,1],//col_set[1], 
				freq, midi_note, i, i + 1, 0, 0, this.accidental_type, wrapped))
				key_sig_note = false
				if (fingering_pattern[i] == 0) {
					if (condensed_notes) {
						if (str(notes_arr[i % note_count]).length === 1) color_count++
						continue
					}
				}
				else{ 
					if(this.first_scale_note_index == null){
						this.first_scale_note_index = i
					}
					this.last_scale_note_index = i
					
					if(fingering_pattern[i] == 2) key_sig_note = true
				}
				chart_index++
			this.notes.push(new note(this.x + x, this.y + y, w, this.note_height, divide2, col_set[fingering_pattern[i]], 
				freq, midi_note, i, chart_index, update_label, update_color, this.accidental_type, wrapped))
			if(key_sig_note) key_sig = this.notes[this.notes.length - 1].note_display_name
			x += w
			chart_end = max(chart_end, this.x + x + w * 0.0125)
		}
		if(update_label || update_color){
			push()
			strokeWeight(max(1,int(U / 12)))
			strokeCap(SQUARE)
			stroke(0)
			const y0 = Math.ceil(this.y - U * 1.475)
			const y1 = int(this.y + U * 0.035)
			line(this.x, y0, chart_end, y0) // upper horizontal divider line
			line(this.x, y1, chart_end, y1) // lower horizontal divider line
			pop()
		}
		this.key_signature = [key_sig, accidental_count]
		note_span = this.last_scale_note_index - this.first_scale_note_index

		this.scale_notes = []
		this.octave_scale_notes = []
		scale_offset = 0
		let octave_started = false
		let octave_ended = false
		let scale_note_count = 0
		const lowest_start = instrument_obj.lowest_octave_scale_note_index ? instrument_obj.lowest_octave_scale_note_index : 0
		for (let note of this.notes) {
			if (note.note_val > 0 && note.index >= lowest_start) {
				if(octave_started && !octave_ended){
					if(note.note_val > 0){
						this.octave_scale_notes.push(note)
						if(note.note_val == 2) octave_ended = true
					} 
				}
				if (note.note_val == 2 && octave_started == false) {
					// find first note in scale and which it is in the order
					octave_started = true
					scale_offset = scale_note_count
					this.octave_scale_notes.push(note)
				}
				this.scale_notes.push(note)
				scale_note_count++
			}
		}
		this.octave_scale_letters_set = []
		for (let i = 0; i < this.octave_scale_notes.length - 1; i++){
			this.octave_scale_letters_set.push(this.octave_scale_notes[i].note_display_name[0])
		}
		// This determines whether a key signature can be generated. And possibly can use this to simplify other stuff.
		this.scale_has_duplicate_letters = duplicates_check(this.octave_scale_letters_set)
	}

	draw() {
		if (this.playing_scale) this._handlePlayingScale()
		// -------------------------------------------------------------------------------
		if(update_chart || redraw_notes) {
			if (update_chart) {
				for (let note of this.notes) {
					note.draw()
				}
				if(chart_end != 0) {
					push()
					fill(255)
					noStroke()
					rectMode(CORNERS)
					rect(chart_end, chart_above - 0.058 * U, 55 * U, chart_y + chart_h) // clear old notes when chart is condensed to only highlighted notes
					pop()
				}
				update_chart = false
			} else if (redraw_notes) {
				for (let note of this.notes) {
					if (note.redraw) {
						note.draw()
						note.redraw = false
					}
				}
				redraw_notes = false
			}

			frequency_temp = frequency
		}
	}

	press_note() {
		if (mouseY < chart_y - chart_above || mouseY > chart_y + chart_h) return
		for (let note of this.notes) {
			if (note.contains(mouseX, mouseY)) {
				if (mode_shift_temp_index == null &&
					(mouseY < note.divide || (mouseY > note.divide && note.playable))) {
					if (chart.playing_scale) chart.playing_scale = false
					frequency_temp = note.frequency
					note_index_temp = note.index
					if(starting_y == null) starting_y = mouseY
					if (note_index != note_index_temp || pressed_note == null) {
						if (pressed_note) pressed_note.release()
						if(stylo_mode || note_count != 12) note.press(0, mouseY/U < 10)
						else note.press(0, 0)
						pressed_note = note
						frequency = frequency_temp
						note_index = note_index_temp
						redraw_waveform = true
						playing_note = null
						bend_started = false
						midi_pitch_bend = 0
						if(main_output_channel) main_output_channel.sendPitchBend(0)
						starting_y = null
					}
					else if(stylo_mode || note_count != 12){
						note_start_time = ~~millis() // prevent vibrato while doing pitch bend
						if(bend_started){
							const Y_move = mouseY - starting_y
							const bend_up = Y_move < 0
							const pitch_bend_factor = Y_move / this.note_height * 3

							pitch_bend_amount = min(abs(pitch_bend_factor), 1) * (bend_up? note.freq_bend_above : note.freq_bend_below)
							frequency = note.frequency + pitch_bend_amount
							play_oscillator(note, frequency)
							redraw_waveform = true

							if(main_output_channel){
								midi_pitch_bend = -constrain(pitch_bend_factor, -1, 1)
								main_output_channel.sendPitchBend(midi_pitch_bend)
							}
						}
						else {
							if(abs(mouseY - starting_y) > this.bend_threshold){
								starting_y = mouseY
								bend_started = true
							}
						} 
					}
				}
			} else if (pressed_note == null && note.contains_above(mouseX, mouseY)) { // 
				// mode_shift_reference = note.note_name
				mode_shift_reference_index = note.index
				mode_shift_temp_index = note.index
				if(note.note_val == 2) draggable = true
				else draggable = false
			} else note.is_pressed = 0
		}
	}
	
	// generate_randomized_sequence(){
	// 	update_seq_display = false
	// 	// console.log('test')
	// 	// return
	// 	let notes_sequence_temp = []
	// 	let scale_length = int((scale_pattern.length * this.OTP)*2.5)
	// 	let number_of_sequences_to_sample = int(random(int(scale_pattern.length/2),scale_pattern.length+1))
	// 	let notes_per_sequence = int(random(2,7))
	// 	let sequences_to_sample = []
	// 	let count = 0
	// 	while(sequences_to_sample.length < number_of_sequences_to_sample && count < 100){
	// 		let next_seq = int(random(0,15)) // excludes 15 and 16
	// 		if(sequences_to_sample.length > 0 && sequences_to_sample[sequences_to_sample.length-1] == next_seq) continue
	// 		if(sequences_to_sample.length > 1 && sequences_to_sample[sequences_to_sample.length-2] == next_seq) continue
	// 		sequences_to_sample.push(next_seq)
	// 		count++
	// 	}
	// 	if(count > 99){
	// 		console.log('ERROR'); 
	// 		return
	// 	}
	// 	console.log('sequences_to_sample = ' + sequences_to_sample)
	// 	// return
	// 	let sequences_index = 0
	// 	let seq_notes_count = 0
	// 	count = 0
	// 	while(notes_sequence_temp.length < scale_length && count < 100){
	// 	// while(sequences_index < sequences_to_sample.length){
	// 		console.log(sequences_index)
	// 		sequence_number=sequences_to_sample[sequences_index]
	// 		this.generate_sequence()
	// 		if(this.notes_sequence.length == 0){ console.log('len = 0'); continue}
	// 		// if(isNaN(notes_sequence_temp.length%this.notes_sequence.length)) console.log('ERROR NaN ' + notes_sequence_temp.length + ' ' + this.notes_sequence.length); continue
	// 		// let sequence_slice = this.notes_sequence.slice(notes_sequence_temp.length%this.notes_sequence.length, notes_per_sequence)
	// 		let sequence_slice = this.notes_sequence.slice(notes_sequence_temp.length, notes_per_sequence)
	// 		console.log(sequence_slice)
	// 		notes_sequence_temp.push(...sequence_slice)
	// 		// seq_notes_count += notes_per_sequence
	// 		sequences_index++
	// 		if(sequences_index == sequences_to_sample.length) sequences_index = 0
	// 		count++
	// 	}
	// 	console.log('count = ' + count + 'notes_sequence_temp = ' + notes_sequence_temp)
	// 	update_seq_display = true
	// 	// if(sequence_number == 17){
	// 	this.generate_note_lengths()
	// 	if(show_seq) this.generate_sequence_display()
	// 	// }
	// }
	
	generate_sequence() {
		// console.log('generate sequence')
		// maybe have different sets of patterns for 5, 6, 7, and 8 note scales?
		this.override_OTP = (sequence_number >= 16)? 1 : this.OTP
		let scale_length = scale_pattern.length * this.override_OTP
		this.notes_sequence = []
		let pattern = []
		this.default_reversal_setting = true
		if(dir_override == 0 || dir_override == 2) this.reversal = true
		let X = this.override_OTP
		let Y = scale_pattern.length
		let end = 0

		switch (sequence_number) {
			case 1: // continuous
				this.notes_sequence = [...Array(scale_length + 1).keys()]
				break
			case 2: // thirds alternating
				for (let i = 0; i < scale_length * 2 - 1; i++) {
					this.notes_sequence.push(i % 2 + Math.ceil(i / 2))
				}
				this.notes_sequence.push(scale_length)
				break
			case 3: // reverse ascending descending doubles = good for minor pentatonic
				for (let i = 0; i < (scale_length) * 2; i++) {
					this.notes_sequence.push(scale_length - (1 - i % 2 + Math.floor(i / 2)))
				}
				this.notes_sequence.push(0)
				this.reversal = false
				this.default_reversal_setting = false
				break
			case 4:
				for (let i = 0; i < (scale_length - 1) * 3; i++) {
					this.notes_sequence.push((i % 3) + Math.floor(i / 3))
				}
				break
			case 5: // treasure reveal on whole tone scale
				for (let i = 0; i < (scale_length - 2) * 4; i++) {
					this.notes_sequence.push((i % 4) + Math.floor(i / 4))
				}
				break
			case 6: // ascending descending triplets = [2,1,0, 3,2,1, 4,3,2, ... 9,8,7]
				for (let i = 0; i < (scale_length) * 3; i++) {
					this.notes_sequence.push(2 - i % 3 + Math.floor(i / 3))
				}
				this.notes_sequence.push(scale_length)
				this.reversal = false
				this.default_reversal_setting = false
				break
			case 7: // ascending descending thirds triplets
				for (let i = 0; i < (scale_length - 2) * 3; i++) {
					this.notes_sequence.push(2 * (2 - i % 3) + Math.floor(i / 3))
				}
				this.notes_sequence.push(scale_length)
				break
			case 8: // thirds triplets = [0,2,4, 1,3,5, 2,4,6, ... 7,9,11]
				for (let i = 0; i < (scale_length - 2) * 3; i++) {
					this.notes_sequence.push(2 * (i % 3) + Math.floor(i / 3))
				}
				this.notes_sequence.push(scale_length)
				break
			case 9: // 1,2,3,5
				pattern = [0, 1, 2, 4]
				for (let i = 0; i < (scale_length - 2) * 4; i++) {
					let f = Math.floor(i / 4)
					f += pattern[i % 4]
					this.notes_sequence.push(f)
				}
				this.notes_sequence.push(scale_length)
				break
			case 10: // descending pentatonic scale run 2
				pattern = [0, 1, 3, 4]
				let p = pattern.length
				end = p * (scale_length / 2 - 1)
				if (scale_length == 5 || scale_length == 7 && this.override_OTP == 1) end += p
				for (let i = 0; i < end; i++) {
					let f = scale_length - 2 * Math.floor(i / 4)
					f -= pattern[i % 4]
					this.notes_sequence.push(f)
				}
				this.reversal = false
				this.default_reversal_setting = false
				break
			case 11: // triads
				pattern = [0, 2, 4, 5, 3, 1]
				for (let i = 0; i < 2 * X * Y + X * (Y - 5) + 1; i++) {
					let f = 2 * Math.floor(i / 6)
					f += pattern[i % 6]
					this.notes_sequence.push(f)
				}
				break
			case 12: // fourths alternating
				for (let i = 0; i < scale_length * 2; i++) {
					this.notes_sequence.push(2 * (i % 2) + Math.ceil(i / 2))
				}
				this.notes_sequence.push(scale_length)
				break
			case 13:
				pattern = [0, 1, 2, 0, -1, -2]
				for (let i = 0; i < (scale_length - 1) * pattern.length; i++) {
					let f = scale_length - Math.floor(i / 6)
					f += pattern[i % 6]
					this.notes_sequence.push(f)
				}
				this.reversal = false
				this.default_reversal_setting = false
				break
			case 14: // alternating inwards
				let j = scale_length
				let k = 0
				end = scale_length * 2 + 1
				for (let i = 0; i < end; i++) {
					if (i < scale_length) {
						if (i % 2 == 0) {
							this.notes_sequence.push(k)
							k++
						} else {
							this.notes_sequence.push(j)
							j--
						}
					} else {
						if (i == scale_length) {
							if (scale_length % 2 == 0) j++
							else k--
						}
						if (i % 2 == 0) {
							this.notes_sequence.push(k)
							k--
						} else {
							this.notes_sequence.push(j)
							j++
						}
					}
				}
				this.reversal = false
				this.default_reversal_setting = false
				break
			case 15: // fourths triplets
				for (let i = 0; i < scale_length * 3; i++) {
					this.notes_sequence.push(3 * (i % 3) + Math.floor(i / 3))
				}
				this.notes_sequence.push(scale_length)
				break
			case 16: // octaves practice
				for (let i = 0; i < scale_length * 2 + 1; i++) {
					this.notes_sequence.push((scale_length - 1) * (i % 2) + Math.ceil(i / 2))
				}
				break
			case 17: // trill notes
				for (let i = 0; i < scale_length * 2; i++) {
					this.notes_sequence.push(i % 2)
				}
				this.reversal = false
				this.default_reversal_setting = false
				break
		}
		if(dir_override == 2){
			this.reversal = true
		}
		this.generate_note_lengths()
		if(show_seq && update_seq_display) this.generate_sequence_display()
	}

	generate_note_lengths() {
		this.notes_sequence_lengths = []
		let B = this.beat
		// let beats = 0
		for (let i = 0; i < this.notes_sequence.length; i++) {
			let note_length = B
			if(swing_factor){
				if(i % 2 == 0) note_length = B * (1 + swing_factor)
				else note_length = B * (1 - swing_factor)
			}
			if (tempo > 60 && (i == this.notes_sequence.length - 1) && sequence_number < 17) {
				note_length = this.notes_sequence_lengths[0] + this.notes_sequence_lengths[1]
			} 
			// else {
			// 	if (randomize == true) {
			// 		if (Math.random() < 0.5 && i > 0) note_length = this.notes_sequence_lengths[i - 1]
			// 		else note_length = int(random(4, 33)) / 8 * B
			// 		beats += note_length
			// 		let diff = beats - this.beats_per_measure
			// 		if (diff < 0 && diff > -0.5) {
			// 			note_length += diff
			// 			beats = 0
			// 		}
			// 		if (diff > 0) {
			// 			note_length -= diff
			// 			beats = 0
			// 		}
			// 	} else note_length = B
			// }
			this.notes_sequence_lengths.push(round(note_length, 4))
		}
		if(sequence_number == 17){
			this.notes_sequence_lengths = this.notes_sequence_lengths.map((x) => x * 0.5)
		}
		this.interval_time = this.notes_sequence_lengths[0]
	}

	play_scale(restart = false) {
		// console.log('chart.play_scale, restart = ' + restart)
		playing_paused = false
		if (scale_pattern.length * this.override_OTP != scale_notes_length_temp) {
			this.generate_sequence()
			scale_notes_length_temp = scale_pattern.length * this.override_OTP
		}
		if(restart){
			if(dir_override < 0){
				this.sequence_note_index = this.notes_sequence.length - 1
				this.next_sequence_note_index = this.sequence_note_index - 1
			} 
			else{
				this.sequence_note_index = 0
				this.next_sequence_note_index = 1
			} 
			allow_continue = true
			this.current_note_index = 0
			if(dir_override == -1){
				this.dir = -1
			}	
			else{
				this.dir = 1
			}
		} 
		seq_display.x_diff = 0
		chart.time = 0
		// use play_clock (tick counter) to stay consistent with _handlePlayingScale timing
		this.time = play_clock
		if (this.playing_scale == false) {
			if (playing_note) playing_note.release()
			this.playing_scale = true
			playing = true
			this.started = false
		}
	}

	generate_sequence_display(playing_note_index = null, next_playing_note_index = null){

		if(!show_seq) return
		
		if(playing_note_index == null){ // update the whole sequence chart
			const M = U * (0.35 - 0.1 * (this.override_OTP - 1))
			const inner_x0 = seq_display.x0 + M
			const inner_x1 = seq_display.x1 - M
			const inner_y0 = seq_display.y0 + M
			const inner_y1 = seq_display.y1 - M
			seq_display.inner_x0 = inner_x0
			seq_display.inner_x1 = inner_x1
			seq_display.inner_y0 = inner_y0
			seq_display.inner_y1 = inner_y1
			
			const N = this.notes_sequence.length
			let x_step = (inner_x1 - inner_x0) / (N - 1)
			if(swing_factor && N % 2 == 0) x_step -= (x_step * swing_factor) / N
			seq_display.x_step = x_step
			
			const SF = (this.override_OTP == 1) ? 1 : 0.5
			const x_step1 = x_step * (1 + swing_factor)
			const x_step2 = x_step * (1 - swing_factor)

			const min_f = Math.min(...this.notes_sequence)
			const max_f = Math.max(...this.notes_sequence)
			seq_display.min_f = min_f
			seq_display.max_f = max_f
			const f_span = max(1, max_f - min_f)

			const y_step = (inner_y1 - inner_y0) / f_span
			const diam = min(x_step * 1.5, y_step * 1.2, 1.8 * M) * 0.9
			seq_display.diam1 = diam
			seq_display.diam2 = diam * 0.75
    	const wt2 = min(5 * SF * 15 * U / 350, diam * 0.5)
			seq_display.wt2 = wt2
			let x = inner_x0
			
			push()
			fill(255)
			noStroke()
			rectMode(CORNERS)
			strokeCap(ROUND)
			rect(seq_display.x0 - 1, seq_display.y0 - 1, seq_display.x1 + 1, seq_display.y1 + 1) // clear old chart
			stroke(30)
			const wt1 = min(30 * SF * U / 350, diam * 0.15)

			strokeWeight(wt1)
			fill(30)

			if(sheet_music_display_mode && chart){
				// this.note_positions = []
				let x_pos, x_spacing_1, x_spacing_2
				if(scale_pattern.length == 12){
					x_pos = U * 0.32
					x_spacing_1 = U * 1.19
					x_spacing_2 = U * 0.79
				}
				else{ 
					x_pos = U * 0.35
					x_spacing_1 = U * 1.25
					x_spacing_2 = U * 0.85
				}
				let previous_note_display_name = ''
				strokeWeight(max(1, round(U * 0.04)))
				stroke(0)
				for(let i = 0; i < 5; i++){ // staff lines
					const y_pos_line = staff_dims.y_pos_staff - i * staff_dims.S
					line(~~(seq_display.x0 - 1), ~~y_pos_line, ~~(seq_display.x1 - M), ~~y_pos_line)
				}
				for(let note of this.octave_scale_notes){
					const note_display_name	= note.note_display_name
					let natural = false
					if(previous_note_display_name.length == 2 && previous_note_display_name[0] == note_display_name){
						natural = true
					}
					const x_spacing = (natural || note_display_name.length > 1) ? x_spacing_1 : x_spacing_2
					x_pos += x_spacing
					note.x_pos = x_pos
					note.generate_engraving(false, false, x_pos, natural)
					previous_note_display_name = note_display_name
					if(x_pos > inner_x1) break
				}
				pop()
				return 
			} 

			let col3 = color(...col2, 170)
			let col4 = color(...col1, 170)
			let sequence_note_count = 0
			let final_x = 0
			let y_octaves = []

			// vertical grid lines
			while(x <= inner_x1 + M) {
				final_x = x
				const f = this.notes_sequence[min(sequence_note_count, this.notes_sequence.length - 1)]
				const y = map(f, max_f, min_f, inner_y0, inner_y1)
				line(x, inner_y0, x, inner_y1)
				push()
				if (f % scale_pattern.length == 0) {
					fill(col3)
					y_octaves.push(y)
				}
				else{
					fill(col4)
				}
				noStroke()
				circle(x, y, seq_display.diam2)
				circle(x, y, diam)
				pop()
				if(swing_factor){
					if(sequence_note_count % 2 == 0) x += x_step1
					else x += x_step2
				}
				else x += x_step
				sequence_note_count++
			}

			// horizontal grid lines
			for (let y = inner_y0; y <= inner_y1 + 1; y += y_step) {
				line(inner_x0, y, final_x, y)
			}
			
			// octave lines highlights
			stroke(col3)
			strokeWeight(wt2)
			let y_octaves_unique = [...new Set(y_octaves)]
			for(let y of y_octaves_unique){
				line(inner_x0, y, final_x, y)
			}

			pop()
			update_seq_display = false
			sequence_chart_buffer = better_get(~~seq_display.x0, ~~seq_display.y0, seq_display.w, seq_display.h)
		}
		else{ // only update the playing note
			if(sheet_music_display_mode) return
			image(sequence_chart_buffer, ~~seq_display.x0, ~~seq_display.y0, seq_display.w, seq_display.h)
			push()
			const pni = playing_note_index
			const npni = next_playing_note_index
			const x_step = seq_display.x_step
			seq_display.x = seq_display.inner_x0 + pni * x_step
			seq_display.x_next = seq_display.inner_x0 + npni * x_step
			if (swing_factor){
				if(pni % 2 == 1) seq_display.x += x_step * swing_factor
				else seq_display.x_next += x_step * swing_factor
			}
			if(seq_display.x_next > seq_display.x1 || seq_display.x_next < seq_display.x0 || !chart.started){
				seq_display.x_diff = 0
			} 
			else seq_display.x_diff = seq_display.x_next - seq_display.x
			let f = this.notes_sequence[min(pni, this.notes_sequence.length - 1)]
			if(isNaN(f)) f = 0
			seq_display.y = map(f, seq_display.max_f, seq_display.min_f, seq_display.inner_y0, seq_display.inner_y1)
			if(chart.dir == 1) stroke(255,80,50,120)
			else stroke(50,80,255,120)
			strokeWeight(seq_display.wt2)
			strokeCap(ROUND)
			line(seq_display.x, seq_display.inner_y0, seq_display.x, seq_display.inner_y1)
			pop()
			push()
			let COL
			if (f % scale_pattern.length == 0) {
				COL = [100, 230, 0, 170]
			}
			else {
				COL = [20, 180, 230, 170]
			}
			fill(COL)
			noStroke()
			circle(seq_display.x, seq_display.y, seq_display.diam1)
			pop()
		}
	}
}

function duplicates_check(arr) {
	let check_arr = []
	for (let i = 0; i < arr.length; i++) {
    check_arr[i] = arr[i][0]
	}
	return new Set(check_arr).size !== check_arr.length
	// returns true if the set (which contains no duplicates) is not the same length as the original array.
}

function modify_notes_for_accidental(arr,acc){
	// before modifying a note, need to check if there is already one in there.
	let check_index = accidental_count - 1
	let letters = 'ABCDEFG'
	let order = (acc == '♯')? order_of_sharps : order_of_flats
	let offset = (acc == '♯')? 1 : -1
	let note_to_modify_to = order[check_index]
	let note_to_modify_to_index = letters.indexOf(note_to_modify_to)
	let note_to_modify = letters[note_to_modify_to_index + offset]
	if(contains(arr,note_to_modify_to,true)) check_index++
	else{
		for(let i=0; i < arr.length; i++){
			if(arr[i] == note_to_modify){
				arr[i] = note_to_modify_to + acc
				return true
			}
		}
	}
	return false
}

function contains(a, check_item, first=false) {
	for (let i = 0; i < a.length; i++) {
  	let test_item = a[i]
  	if(first) test_item = a[i][0]
		if (test_item === check_item) {
    return true
  	}
  }
  return false
}