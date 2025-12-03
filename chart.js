let val = 400
let col0 = [200] // gray
let col1 = [50, 0.2 * val, 0.5 * val] // standard highlight
let col2 = [0.55 * val * 0.88, 0.37 * val * 0.88, 0] // octave indication //

let f_span, fingering_pattern, drone_freq
let instrument_obj, notes_arr, scale_arr_index
let chart_end = 0
let scale_notes_length_temp = 0
let redraw_notes = true
let lowest_note = -1000
let color_count = 0
let draggable = false
let accidental_notes = ''
let	accidental_count = 0
let update_seq_display, note_span, bend_factor
let note_index, note_index_temp

const seq_display = {}

const seq_arr = []
let n = 17 // total number of different sequences 
while (n--) seq_arr[n] = n + 1

class fingering_chart {
	
	constructor(x, y) {
		bend_factor = pow(2, pitch_bend_semitones/note_count)
		this.x = x
		this.y = y
		this.above = int(this.y - U * 1.45)
		this.note_height = chart_h
		this.bend_threshold = int(this.note_height / (15 - 7 * mobile))
		this.divide = chart_y + this.note_height * 0.5
		
		bass_instrument = (instrument_obj.lowest <= -16)? true : false
		
		if (note_count < 12){
			this.length = min(28, max(24, 3.5 * note_count, int(28 * note_count / 12)))
			stylo_mode = true
		} 
		else this.length = recorder_fingerings.length - bass_instrument // exclude last note for bass instruments
		this.on_notes = 0

		this.repeat = stored_repeat_state
		this.notes_sequence = []
		this.notes_sequence_lengths = []
		this.scale_notes = []
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

		this.create_notes(true, true)
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
	}

	_handlePlayingScale() {
		let elapsed_time = millis() * 0.001 - this.time
		// Use a capped wait when the sequence hasn't started yet so very low BPM
		// doesn't delay the initial note for too long.
		let wait_time = this.interval_time
		if (!this.started) {
			wait_time = min(this.interval_time, 1.0) // cap to 1 second
		}
		if (!(elapsed_time > wait_time)) return
		
		if (this.started) {
			this.current_note_index++
			this.sequence_note_index += this.dir
		}

		redraw_notes = true
		this.time = millis() * 0.001
		this.interval_time = this.notes_sequence_lengths[this.current_note_index]

		if (playing_note) playing_note.mouseReleased()

		const seq_index = (this.dir == -1) ? (this.notes_sequence.length - 1 - this.current_note_index) : this.current_note_index
		const index1 = this.notes_sequence[seq_index]
		let index2 = index1 + scale_offset

		if (index2 > this.scale_notes.length - 1) this.index_offset = -scale_pattern.length
		if (index2 + this.index_offset < 0) this.index_offset = min(0, this.index_offset) + scale_pattern.length

		this.started = true
		playing_note = this.scale_notes[min(max(index2 + this.index_offset, 0), this.scale_notes.length - 1)]
		if(playing_note){
			frequency = playing_note.frequency
			// console.log(playing_note.note_display_name, playing_note.scale_index - 1, this.sequence_note_index)
			playing_note.mousePressed(this.interval_time * 0.8)
		}
		else{
			console.log('no playing_note')
		}
		redraw_waveform = true

		if(show_seq) this.generate_sequence_display(this.sequence_note_index)

		// reset position when reaching end
		if (this.current_note_index == this.notes_sequence.length - 1) {
				this.current_note_index = 0
				this.index_offset = 0
				this.started = false
				// reset timing so that repeat doesn't immediately advance; start the wait anew
				this.time = millis() * 0.001
			if (this.repeat) {
				if (dir_override >= 0) this.sequence_note_index = 0
				if (dir_override == -1 || 
					(this.reversal && (dir_override == 0 || dir_override == 2))){
						this.sequence_note_index = this.notes_sequence.length - 1
					}
			}

			// change direction if needed
			if ((this.dir == 1 && this.reversal) || this.repeat) {
				if ((dir_override == 0 && this.dir == -1) || 
				(this.reversal && (dir_override == 0 || dir_override == 2))) {
					this.dir *= -1
					if (this.dir == 1) {
						this.sequence_note_index = 0
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
		}
	}

	create_fingering_pattern() {
		fingering_pattern = []
		if (note_count != 12) scale_pattern = Array(note_count).fill(1)
		else scale_pattern = scale_obj.pattern
		let sig_arr
		if (instrument_obj.key[0] == 'F') {
			notes_arr = notes_arr_F
			if (mode_scale_type == 'Major') {
				sig_arr = major_key_signatures_F
			} else {
				sig_arr = minor_key_signatures_F
			}
		} 
		else {
			notes_arr = notes_arr_C
			if (mode_scale_type == 'Major') {
				sig_arr = major_key_signatures_C
			} else {
				sig_arr = minor_key_signatures_C
			}
		}

		octave_start = notes_arr.indexOf(key_name)
		if(!octave_start) octave_start = 0
		this.key_sig2 = sig_arr[octave_start]

		let position = octave_start

		if (mode_shift) {
			for (let i = 0; i < mode_shift; i++) {
				octave_start += scale_pattern[i]
			}
		}
		
		this.key_signature = sig_arr[octave_start % 12]

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
		for (let i = 0; i < this.length; i++) {
			let val = 0
			if (i == position) {
				if (i == octave_start || (i - octave_start) % note_count == 0) {
					val = 2
					if (drone_freq == 0) {
						let multiplier = 0.25
						const target_freq = this.freqList[i]
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
		scale_notes_length_temp = scale_pattern.length * this.override_OTP
	}

	create_frequencies() {
		lowest_note = instrument_obj.lowest

		let current_freq
		this.freqList = []
		for (let i = 0; i < this.length; i++) {
			current_freq = round(tuning * Math.pow(2, (lowest_note + i) / note_count),3)
			this.freqList.push(current_freq)
		}
	}

	create_notes(update_label, update_color) {
		note_span = null
		this.notes = []
		this.all_notes = []
		if (!condensed_notes) this.width_factor = 1
		else this.width_factor = min(2, 28 / this.on_notes)
		// else this.width_factor = min(2, 28/(Math.ceil(this.on_notes/2)*2))
		// else this.width_factor = min(2, Math.floor(28/this.on_notes*4)/4)
		const w = int(U * this.width_factor)
		let x = 0
		fill(0)
		noStroke()
		textAlign(CENTER, TOP)
		textSize(w / 4)

		let COL
		color_count = 0
		if (instrument_obj.key[0] === 'F') color_count += 3
		push()
		// clear the old notes --------------
		fill(255)
		rectMode(CORNERS)
		if (chart_end != 0 && update_label) rect(chart_x * 1.025, chart_above, chart_x2, chart_y)
		if (chart_end != 0 && update_color) rect(chart_x * 1.025, chart_y, chart_x2, chart_y + chart_h)
		pop()
		let scale_index = 0
		let key_sig_note = false
		let key_sig
		this.first_scale_note_index = null
		for (let i = 0; i < this.length; i++) {
			const freq = this.freqList[i]
			this.all_notes.push(new note(this.x + x, this.y, w, this.note_height, [0], freq, i,
				i + 1, 0, 0, this.accidental_type))
			key_sig_note = false
			if (fingering_pattern[i] == 0) {
				if (condensed_notes) {
					if (str(notes_arr[i % note_count]).length === 1) color_count++
					continue
				}
				COL = col0
			}
			else{ 
				if(this.first_scale_note_index == null){
					this.first_scale_note_index = i
				}
				this.last_scale_note_index = i
				
				if(fingering_pattern[i] == 1) COL = col1
				else{ 
					COL = col2
					key_sig_note = true
				}
			}
			// if(freq > 1400) console.log(freq)
			scale_index++
			this.notes.push(new note(this.x + x, this.y, w, this.note_height, COL, freq, i, 
				scale_index, update_label, update_color, this.accidental_type))
			if(!diatonic && key_sig_note) key_sig = this.notes[this.notes.length-1].note_display_name
			x += w
		}
		chart_end = this.x + x + w * 0.0125
		push()
		strokeWeight(int(U / 14))
		strokeCap(SQUARE)
		stroke(0)
		line(this.x, Math.ceil(this.y - U * 1.475), chart_end, Math.ceil(this.y - U * 1.475)) // upper horizontal divider line
		line(this.x, this.y + U * 0.035, chart_end, this.y + U * 0.035) // lower horizontal divider line
		pop()
		if(!diatonic) this.key_signature = [key_sig, accidental_count]
		note_span = this.last_scale_note_index - this.first_scale_note_index
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

	mousePressed() {
		if (mouseY < chart_y - chart_above || mouseY > chart_y + chart_h) return
		for (let note of this.notes) {
			if (note.contains(mouseX, mouseY)) {
				if (mode_shift_temp_index == null &&
					(mouseY < this.divide || (mouseY > this.divide && note.note_val > 0))) {
					if (chart.playing_scale) chart.playing_scale = false
					frequency_temp = note.frequency
					note_index_temp = note.index
					if(starting_y == null) starting_y = mouseY
					if (note_index != note_index_temp || pressed_note == null) {
						if (pressed_note) pressed_note.mouseReleased()
						if(stylo_mode || note_count != 12) note.mousePressed(0, mouseY/U < 10)
						else note.mousePressed(0, 0)
						pressed_note = note
						frequency = frequency_temp
						note_index = note_index_temp
						redraw_waveform = true
						playing_note = null
						bend_started = false
						starting_y = null
					}
					else if(stylo_mode || note_count != 12){
						note_start_time = ~~millis()
						const ht = this.note_height
						const Y_move = abs(mouseY - starting_y)
						const bend_up = mouseY - starting_y < 0
						if(Y_move > this.bend_threshold || bend_started){
							const pitch_bend_factor = min(Y_move / ht * 2.5, 1)
							bend_started = true
							pitch_bend_amount = pitch_bend_factor * (bend_up? note.freq_bend_above : note.freq_bend_below)
							const frequency_temp = lerp(frequency, note.frequency + pitch_bend_amount, 0.2)
							frequency = frequency_temp
							play_oscillator(frequency)
							redraw_waveform = true
						}
					}
				}
			} else if (pressed_note == null && note.contains_above(mouseX, mouseY)) { // 
				// mode_shift_reference = note.note_name
				mode_shift_reference_index = note.index
				mode_shift_temp_index = note.index
				if(note.note_val == 2) draggable = true
				else draggable = false
			} else note.isPressed = 0
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

	generate_note_lengths(randomize = false) {
		this.notes_sequence_lengths = []
		let B = this.beat
		let beats = 0
		let note_length = 0
		for (let i = 0; i < this.notes_sequence.length; i++) {
			if (tempo > 60 && (i == this.notes_sequence.length - 1) && sequence_number < 17) {
				note_length = 2 * B
			} 
			else {
				if (randomize == true) {
					if (Math.random() < 0.5 && i > 0) note_length = this.notes_sequence_lengths[i - 1]
					else note_length = int(random(4, 33)) / 8 * B
					beats += note_length
					let diff = beats - this.beats_per_measure
					if (diff < 0 && diff > -0.5) {
						note_length += diff
						beats = 0
					}
					if (diff > 0) {
						note_length -= diff
						beats = 0
					}
				} else note_length = B
			}
			this.notes_sequence_lengths.push(round(note_length,4))
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
			if(dir_override < 0) this.sequence_note_index = this.notes_sequence.length - 1
			else this.sequence_note_index = 0
			allow_continue = true
			this.current_note_index = 0
			if(dir_override == -1){
				this.dir = -1
			}	
			else{
				this.dir = 1
			}
		} 
		this.scale_notes = []
		let started = false
		scale_offset = 0
		let count = 0
		for (let note of this.notes) {
			if (note.note_val > 0) {
				if (note.note_val == 2 && started == false) {
					// find first note in scale and which it is in the order
					started = true
					scale_offset = count
				}
				this.scale_notes.push(note)
				count++
			}
		}
		this.time = millis() * 0.001
		if (this.playing_scale == false) {
			if (playing_note) playing_note.mouseReleased()
			this.playing_scale = true
			playing = true
			this.started = false
		}
	}

	generate_sequence_display(playing_note_index = null) {
		
		const M = U * (0.35 - 0.1 * (this.override_OTP - 1))

		if(playing_note_index == null){
			const x1 = chart_x2 - 13.5 * U
			const x2 = chart_x2 + 0.1 * U
			const y1 = 0.75 * U
			const y2 = chart_y - 1.55 * U
			
			seq_display.x0 = x1
			seq_display.y0 = y1
			seq_display.x1 = x1 + M
			seq_display.y1 = y1 + M
			seq_display.x2 = x2 - M
			seq_display.y2 = y2 - M
			seq_display.x3 = x2
			seq_display.y3 = y2
			seq_display.w = int(x2 - x1)
			seq_display.h = int(y2 - y1)
		}
		if(!show_seq) return

		const N = this.notes_sequence.length
		const x_step = (seq_display.x3 - seq_display.x0 - 2 * M) / (N - 1)
		const SF = (this.override_OTP == 1) ? 1 : 0.5
		const min_f = Math.min(...this.notes_sequence)
		const max_f = Math.max(...this.notes_sequence)
		const f_span = max(1, max_f - min_f)
		const y_step = (seq_display.y3 - seq_display.y0 - 2 * M) / f_span
		const diam = min(x_step * 1.5, y_step * 1.2, 1.8 * M) * 0.9
    const wt2 = min(5 * SF * 15 * U / 350, diam * 0.5)

		if(playing_note_index == null){

			push()
			fill(255)
			noStroke()
			rectMode(CORNERS)
			strokeCap(ROUND)
			rect(seq_display.x0 - 1, seq_display.y0 - 1, seq_display.x3 + 1, seq_display.y3 + 1)
			stroke(30)
			const wt1 = min(30 * SF * U / 350, diam * 0.15)

			strokeWeight(wt1)
			fill(30)

			let col3 = color(...col2, 170)
			let col4 = color(...col1, 170)
			let count = 0
			const y_avg = (seq_display.y0 + seq_display.y3) / 2

			// horizontal grid lines
			for (let y = seq_display.y1; y <= seq_display.y3 - M/2; y += y_step) {
				line(seq_display.x1, y, seq_display.x2, y)
			}

			let y_oct1 = 0
			let y_oct2 = 0
			for (let x = seq_display.x1; x <= seq_display.x3 - M/2; x += x_step) {
				const f = this.notes_sequence[min(count, this.notes_sequence.length - 1)]
				const y = map(f, max_f, min_f, seq_display.y1, seq_display.y2)
				line(x, seq_display.y1, x, seq_display.y2)
				push()
				if (f % scale_pattern.length == 0) {
					fill(col3)
					push()
					stroke(col3)
					strokeWeight(wt2)
					if(y <= y_avg && y != y_oct1){
						line(seq_display.x1, y, seq_display.x2, y)
						y_oct1 = y
					}
					if(y > y_avg && y != y_oct2){
						line(seq_display.x1, y, seq_display.x2, y)
						y_oct2 = y
					}
					pop()
				}
				else{
					fill(col4)
				}
				noStroke()
				circle(x, y, diam * 0.75)
				circle(x, y, diam)
				pop()
				count++
			}
			pop()
			update_seq_display = false
			sequence_chart_buffer = better_get(~~seq_display.x0, ~~seq_display.y0, seq_display.w, seq_display.h)
		}
		else{
			image(sequence_chart_buffer, ~~seq_display.x0, ~~seq_display.y0, seq_display.w, seq_display.h)
			push()
			const x = seq_display.x1 + playing_note_index * x_step
			let f = this.notes_sequence[min(playing_note_index, this.notes_sequence.length - 1)]
			if(isNaN(f)) f = 0
			const y = map(f, max_f, min_f, seq_display.y1, seq_display.y2)
			if(chart.dir == 1) stroke(255,80,50,120)
			else stroke(50,80,255,120)
			strokeWeight(wt2)
			strokeCap(ROUND)
			line(x, seq_display.y1, x, seq_display.y2)
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
			circle(x, y, diam)
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