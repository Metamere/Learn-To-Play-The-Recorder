let val = 400
var col0 = [200] // gray
var col1 = [50, 0.2 * val, 0.5 * val] // standard highlight
var col2 = [0.55 * val * 0.88, 0.37 * val * 0.88, 0] // octave indication //

var f_span, octave_start, fingering_pattern, drone_freq
var instrument_obj, notes_arr, scale_arr_index
var chart_end = 0
var scale_notes_length_temp = 0
var note_draw_count1 = 0
var note_draw_count2 = 0
var redraw_notes = true
var lowest_note = -1000
var color_count = 0
var draggable = false
var accidental_notes = ''
var	accidental_count = 0
var update_seq_display, note_span, bend_factor
var note_index, note_index_temp

const seq_display = {}

var sequence_number = 1
const seq_arr = [];
let n = 16;
while (n--) seq_arr[n] = n + 1

class fingering_chart {
	
	constructor(x, y) {
		bend_factor = pow(2, pitch_bend_semitones/note_count)
		this.x = x;
		this.y = y;
		this.above = this.y - U * 1.45
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
		this.display_staff = false

		this.repeat = false
		this.notes_sequence = []
		this.notes_sequence_lengths = []
		this.scale_notes = []
		// this.scale_note_names = []
		this.scale_note_names_sharp = []
		this.scale_note_names_flat = []
		this.accidental_type = 'ALL'
		this.OTP = octaves_to_play
		this.override_OTP = octaves_to_play

		this.create_frequencies()
		this.create_fingering_pattern()
		// this.note_width = U*this.width_factor

		this.create_notes(true, true)
		if (note_count < 12) {
			this.OTP = max(2, octaves_to_play) // Change to more octaves for 5-TET
			octaves_to_play = this.OTP
		}
		// this.OTP = (note_count < 12) ? 2 : 1 // octaves to play.
		this.beat = 60 / tempo
		this.beats_per_measure = 4
		this.interval_time = this.beat
		this.current_note_index = 0
		this.dir = 1
		this.time = 0
		this.playing_scale = false
		playing = false
		this.index_offset = 0
		this.started = false
		this.reversal = true
		this.reversal_mode = 2 // 2,1,-1
		this.first_scale_note = null
		this.last_scale_note = null
		update_seq_display = true
	}

	create_fingering_pattern() {
		fingering_pattern = []
		if (note_count != 12) scale_pattern = Array(note_count).fill(1)
		else scale_pattern = scale_obj.pattern
		let sig_arr
		// let acc_arr
		if (instrument_obj.key[0] == 'F') {
			notes_arr = notes_arr_F
			if (mode_scale_type == 'Major') {
				sig_arr = major_key_signatures_F
				// acc_arr = minor_accidental_counts_list
				// acc_arr = major_accidental_list_F
			} else {
				sig_arr = minor_key_signatures_F
				// acc_arr = minor_accidental_list_F
			}
		} 
		else {
			notes_arr = notes_arr_C
			if (mode_scale_type == 'Major') {
				sig_arr = major_key_signatures_C
				// acc_arr = major_accidental_list_C
			} else {
				sig_arr = minor_key_signatures_C
				// acc_arr = minor_accidental_list_C
			}
		}

		octave_start = notes_arr.indexOf(key_name)
		this.key_sig2 = sig_arr[octave_start]
		// sig_arr[notes_arr.indexOf(key_name)]
		// if(diatonic){
		// 	this.key_signature = sig_arr[octave_start % 12]
		// }
		let position = octave_start

		if (mode_shift > 0) {
			for (let i = 0; i < mode_shift; i++) {
				octave_start += scale_pattern[i]
			}
			// this.key_name = sig_arr[octave_start % 12]
		}
		
		this.key_signature = sig_arr[octave_start % 12]
		// else this.key_name = this.key_signature
		// this.accidental_type = acc_arr[octave_start % 12]
		let start = false
		// let index_start = min(scale_pattern.length - 1, mode_shift)
		let ind = 0
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
		this.shifted_scale_pattern = []
		for (let i = 0; i < this.length; i++) {
			let val = 0
			if (i == position) {
				if (i == octave_start || (i - octave_start) % note_count == 0) {
					val = 2
					if (drone_freq == 0) {
						let multiplier = (this.freqList[i] * 0.5 > 55) ? 0.25 : 0.5
						drone_freq = this.freqList[i] * multiplier
					}
				} else val = 1
				position += scale_pattern[ind]
				ind += 1
				if (ind == scale_pattern.length) ind = 0
			}
			if (val != 0) this.on_notes++
			fingering_pattern[i] = val
		}
		// this.scale_note_names = []
		this.scale_note_names_sharp = []
		this.scale_note_names_flat = []
		// if (this.key_signature.length > 2) accidental_count = 6
		// else {
			accidental_count = 0
			for (let i = 0; i < 12; i++) {
				if (fingering_pattern[i] > 0){
					if(notes_arr[i].length > 1){
						accidental_count++
						this.scale_note_names_flat.push(notes_arr[i].slice(3))
						this.scale_note_names_sharp.push(notes_arr[i].slice(0,2))
					}	
					else{
						this.scale_note_names_flat.push(notes_arr[i])
						this.scale_note_names_sharp.push(notes_arr[i])
					}
					// this.scale_note_names.push(notes_arr[i][0])
				}
			// }
		}
		// if(debug_mode){
		// 	print('new test')
		// 	print("accidental count = " + accidental_count)
		// 	print(this.scale_note_names_sharp)
		// 	print('dupe check sharp = ' + duplicates_check(this.scale_note_names_sharp) )
		// 	print(this.scale_note_names_flat)
		// 	print('dupe check flat = ' + duplicates_check(this.scale_note_names_flat) )
		// }
		
		if( /*(scale_name != 'Major' && scale_name != 'natural minor') || */ accidental_count == 0){
			this.accidental_type = 'ALL'
			// accidental_notes = 'ALL'
		}
		else if(accidental_count == 5 && (duplicates_check(this.scale_note_names_sharp) && duplicates_check(this.scale_note_names_flat))){
	    let duplicates = true
			this.accidental_type = 'ALL'
			let all_checked = false
			// let scale_note_count = this.scale_note_names.length
			// let new_accidental = ''
			// let modified = false
			let count = 0
			while(duplicates && all_checked == false && count < 10){
				if(count == 9) print('count exceeded')
				count ++
				if(duplicates_check(this.scale_note_names_sharp) && duplicates_check(this.scale_note_names_flat)){
					accidental_count++
					// print("accidental count = " + accidental_count)
					modify_notes_for_accidental(this.scale_note_names_sharp,'♯')
					modify_notes_for_accidental(this.scale_note_names_flat,'♭')
					// if(modified == false) all_checked = true
					if(debug_mode){
						print(this.scale_note_names_sharp)
						print('dupe check sharp = ' + duplicates_check(this.scale_note_names_sharp) )
						print(this.scale_note_names_flat)
						print('dupe check flat = ' + duplicates_check(this.scale_note_names_flat) )
					}
				}
				else if(duplicates_check(this.scale_note_names_flat) == false && !default_sharp){
					this.accidental_type = '♭'
					// print('sharp')
					accidental_notes = order_of_flats.slice(0,accidental_count)
					duplicates = false
				}
				else if(duplicates_check(this.scale_note_names_sharp) == false && default_sharp){
					this.accidental_type = '♯'
					// print('flat')
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
				// print('sharp = ' + this.scale_note_names_sharp)
				// print('flat = ' + this.scale_note_names_flat)
			if(duplicates_check(this.scale_note_names_sharp)){
				this.accidental_type = '♭'
				accidental_notes = order_of_flats.slice(0,accidental_count)
			}
			else{ // if(duplicates_check(this.scale_note_names_flat)){
				this.accidental_type = '♯'
				accidental_notes = order_of_sharps.slice(0,accidental_count)
			}
		}
		// print(accidental_notes)
		this.generate_sequence()
		scale_notes_length_temp = scale_pattern.length * this.override_OTP
	}

	create_frequencies() {
		lowest_note = instrument_obj.lowest

		let current_freq
		this.freqList = [];
		for (let i = 0; i < this.length; i++) {
			current_freq = tuning * Math.pow(2, (lowest_note + i) / note_count);
			this.freqList.push(current_freq);
		}
	}

	create_notes(update_label, update_color) {
		note_span = null
		this.notes = [];
		if (!condensed_notes) this.width_factor = 1
		else this.width_factor = min(2, 28 / this.on_notes)
		// else this.width_factor = min(2, 28/(Math.ceil(this.on_notes/2)*2))
		// else this.width_factor = min(2, Math.floor(28/this.on_notes*4)/4)
		let w = U * this.width_factor
		var x = 0;
		let h = this.note_height
		var y = 0;
		fill(0);
		noStroke();
		textAlign(CENTER, TOP);
		textSize(w / 4);

		let COL
		color_count = 0
		if (instrument_obj.key[0] === 'F')
			color_count += 3
		push()
		fill(255)
		// clear the old notes --------------
		rectMode(CORNERS)
		if (chart_end != 0 && update_label) rect(chart_x * 1.025, chart_above + y, W, chart_y + y)
		if (chart_end != 0 && update_color) rect(chart_x * 1.025, chart_y + y, W, chart_y + chart_h + y)
		pop()
		let scale_index = 0
		let key_sig_note = false
		let key_sig
		this.first_scale_note_index = null
		for (let i = 0; i < this.length; i++) {
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
			let freq = this.freqList[i]
			scale_index++
			this.notes.push(new note(this.x + x, this.y + y, w, h, COL, freq, i, scale_index, update_label, update_color, this.accidental_type));
			if(!diatonic && key_sig_note) key_sig = this.notes[this.notes.length-1].note_display_name
			x += w;
		}
		chart_end = this.x + x + w * 0.0125 // * 0.05?
		push()
		strokeWeight(int(U / 14))
		strokeCap(SQUARE)
		stroke(0)
		line(this.x, this.y - U * 1.475, chart_end, this.y - U * 1.475) // upper horizontal divider line
		line(this.x, this.y + U * 0.035, chart_end, this.y + U * 0.035) // lower horizontal divider line
		pop()
		if(!diatonic) this.key_signature = [key_sig,accidental_count]
		note_span = this.last_scale_note_index - this.first_scale_note_index
		// print(note_span)
	}

	draw() {
		if (this.playing_scale) {
			let elapsed_time = millis() * 0.001 - this.time
			if (elapsed_time > this.interval_time) {
				redraw_notes = true
				this.time = millis() * 0.001

				if (this.started) this.current_note_index++
				this.interval_time = this.notes_sequence_lengths[this.current_note_index]

				if (playing_note) playing_note.mouseReleased()

				let index1 = this.notes_sequence[this.current_note_index]
				let index2 = index1 + scale_offset
				if (this.dir == -1) index2 = this.override_OTP * scale_pattern.length - index1 + scale_offset

				if (index2 > this.scale_notes.length - 1) this.index_offset = -scale_pattern.length // if it goes too high, bounce it lower
				if (index2 + this.index_offset < 0) this.index_offset = min(0, this.index_offset) + scale_pattern.length // this.OTP* // if it goes too low, bounce it higher

				this.started = true
				playing_note = this.scale_notes[min(max(index2 + this.index_offset, 0), this.scale_notes.length - 1)]
				frequency = playing_note.frequency

				playing_note.mousePressed(this.interval_time * 0.8) // plays notes for 80% of the time interval
				// pressedNote = playing_note;
				redraw_waveform = true

				if (this.current_note_index == this.notes_sequence.length - 1) {
					this.current_note_index = 0 //pattern_restart_point 
					this.index_offset = 0
					this.started = false

					if ((this.dir == 1 && this.reversal) || this.repeat) {
						if (this.reversal && !dir_override){ 
							this.dir *= -1
							// if(sequence_slider_shown)
						  document.getElementById("REVM").innerHTML = 'DIR = ' + this.dir
							if(this.dir == 1) REVERSE_MODE_button.style('backgroundColor', 'rgb(150,215,105)')
							else REVERSE_MODE_button.style('backgroundColor', 'rgb(115,170,255)')
						}
					} else {
						this.playing_scale = false
						playing = false
						playing_note = null
					}
				}
			}
		}
		// -------------------------------------------------------------------------------
		if(update_chart || redraw_notes) {
			if (update_chart) {
				// note_draw_count1++
				for (let note of this.notes) {
					note.draw()
				}
				// if(debug_mode) {
				// 	push()
				// 	stroke(0, 70)
				// 	strokeWeight(5)
				// 	line(0, chart_y + chart_h / 2, W, chart_y + chart_h / 2)
				// 	pop()
				// }
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
						//if (note.frequency == frequency || note.frequency == frequency_temp || note.redraw == true){
						// if(this.playing_scale == false && note.frequency == frequency_temp){ note.isPressed = 0 }
						note.draw()
						note.redraw = false
						// note_draw_count2++
					}
				}
				redraw_notes = false
			}

			// redraw_notes = false
			frequency_temp = frequency

			if(debug_mode){
				let f = frameCount / 10
				push()
				colorMode(HSB)
				fill(f % 100, 100, 100, 100)
				ellipse(debug_indicator_location[0], debug_indicator_location[1], abs(U * sin(f / 10)), -abs(U * cos(f / 10))) // to indicate if it is redrawing the chart
				ellipse(mouseX, mouseY, abs(U * sin(f / 10)), -abs(U * cos(f / 10))) // to indicate if it is redrawing the chart
				pop()
			}
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
					if (note_index != note_index_temp || pressedNote == null) {
						if (pressedNote) pressedNote.mouseReleased()
						note.mousePressed()
						pressedNote = note;
						frequency = frequency_temp
						note_index = note_index_temp
						redraw_waveform = true
						playing_note = null
						bend_started = false
						starting_y = null
					}
					else if(stylo_mode){
						note_start_time = ~~millis()
						const ht = this.note_height
						const Y_move = abs(mouseY - starting_y)
						const bend_up = mouseY - starting_y < 0
						if(Y_move > this.bend_threshold || bend_started){
							const pitch_bend_factor = min(Y_move/ht*2.5,1)
							// console.log(pitch_bend_factor)
							bend_started = true
							pitch_bend_amount = pitch_bend_factor * (bend_up? note.freq_bend_above : note.freq_bend_below)
							const frequency_temp = lerp(frequency, note.frequency + pitch_bend_amount, 0.2)
							frequency = frequency_temp
							play_oscillator(frequency)
							redraw_waveform = true
						}
					}
				}
			} else if (pressedNote == null && note.contains_above(mouseX, mouseY)) { // 
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
	// 	// print('test')
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
	// 		print('ERROR'); 
	// 		return
	// 	}
	// 	print('sequences_to_sample = ' + sequences_to_sample)
	// 	// return
	// 	let sequences_index = 0
	// 	let seq_notes_count = 0
	// 	count = 0
	// 	while(notes_sequence_temp.length < scale_length && count < 100){
	// 	// while(sequences_index < sequences_to_sample.length){
	// 		print(sequences_index)
	// 		sequence_number=sequences_to_sample[sequences_index]
	// 		this.generate_sequence()
	// 		if(this.notes_sequence.length == 0){ print('len = 0'); continue}
	// 		// if(isNaN(notes_sequence_temp.length%this.notes_sequence.length)) print('ERROR NaN ' + notes_sequence_temp.length + ' ' + this.notes_sequence.length); continue
	// 		// let sequence_slice = this.notes_sequence.slice(notes_sequence_temp.length%this.notes_sequence.length, notes_per_sequence)
	// 		let sequence_slice = this.notes_sequence.slice(notes_sequence_temp.length, notes_per_sequence)
	// 		print(sequence_slice)
	// 		notes_sequence_temp.push(...sequence_slice)
	// 		// seq_notes_count += notes_per_sequence
	// 		sequences_index++
	// 		if(sequences_index == sequences_to_sample.length) sequences_index = 0
	// 		count++
	// 	}
	// 	print('count = ' + count + 'notes_sequence_temp = ' + notes_sequence_temp)
	// 	update_seq_display = true
	// 	// if(sequence_number == 17){
	// 	this.generate_note_lengths()
	// 	if(show_seq) this.generate_sequence_display()
	// 	// }
	// }
	
	generate_sequence() {
		// maybe have different sets of patterns for 5, 6, 7, and 8 note scales?
		this.override_OTP = (sequence_number == 16)? 1:this.OTP
		let scale_length = scale_pattern.length * this.override_OTP
		this.notes_sequence = []
		let pattern = []
		this.reversal = true
		let X = this.override_OTP
		let Y = scale_pattern.length
		let end = 0

		switch (sequence_number) {
			case 1: // continuous
				this.notes_sequence = [...Array(scale_length + 1).keys()]
				break
			case 2: // thirds alternating
				for (i = 0; i < scale_length * 2 - 1; i++) {
					this.notes_sequence.push(i % 2 + Math.ceil(i / 2))
				}
				this.notes_sequence.push(scale_length)
				break
			case 3: // reverse ascending descending doubles = good for minor pentatonic
				for (i = 0; i < (scale_length) * 2; i++) {
					this.notes_sequence.push(scale_length - (1 - i % 2 + Math.floor(i / 2)))
				}
				this.notes_sequence.push(0)
				this.reversal = false
				break
			case 4: // replacement for sequence 4?
				for (i = 0; i < (scale_length - 1) * 3; i++) {
					this.notes_sequence.push((i % 3) + Math.floor(i / 3))
				}
				// this.reversal = false
				break
				// case 4: // ascending triplets = [0,1,2, 1,2,3, 2,3,4, ... 7,8,9]
				// 	for(i=0;i<(scale_length+1)*3-2;i++){
				// 		this.notes_sequence.push(i%3 + Math.floor(i/3))
				// 	}
				// 	break
			case 5: // treasure reveal on whole tone scale
				for (i = 0; i < (scale_length - 2) * 4; i++) {
					this.notes_sequence.push((i % 4) + Math.floor(i / 4))
				}
				// this.reversal = false
				break
			case 6: // ascending descending triplets = [2,1,0, 3,2,1, 4,3,2, ... 9,8,7]
				for (i = 0; i < (scale_length) * 3; i++) {
					this.notes_sequence.push(2 - i % 3 + Math.floor(i / 3))
				}
				this.notes_sequence.push(scale_length)
				break
			case 7: // ascending descending thirds triplets
				for (i = 0; i < (scale_length - 2) * 3; i++) {
					this.notes_sequence.push(2 * (2 - i % 3) + Math.floor(i / 3))
				}
				this.notes_sequence.push(scale_length)
				break
			case 8: // thirds triplets = [0,2,4, 1,3,5, 2,4,6, ... 7,9,11]
				for (i = 0; i < (scale_length - 2) * 3; i++) {
					this.notes_sequence.push(2 * (i % 3) + Math.floor(i / 3))
				}
				this.notes_sequence.push(scale_length)
				break
			case 9: // 1,2,3,5
				pattern = [0, 1, 2, 4]
				for (i = 0; i < (scale_length - 2) * 4; i++) {
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
				// if(scale_length == 5 || scale_length == 7) end = scale_length*2
				// // else if(scale_length == 8) end = pattern.length * (this.OTP + 2)
				// // else if(scale_length == 6) end = pattern.length * (this.OTP + 1)
				// else end = pattern.length * (this.OTP * 3 - 1)
				for (i = 0; i < end; i++) {
					let f = scale_length - 2 * Math.floor(i / 4)
					f -= pattern[i % 4]
					this.notes_sequence.push(f)
				}
				this.reversal = false
				break
			case 11: // triads
				pattern = [0, 2, 4, 5, 3, 1]
				for (i = 0; i < 2 * X * Y + X * (Y - 5) + 1; i++) {
					let f = 2 * Math.floor(i / 6)
					f += pattern[i % 6]
					this.notes_sequence.push(f)
				}
				break
			case 12: // fourths alternating
				for (i = 0; i < scale_length * 2; i++) {
					this.notes_sequence.push(2 * (i % 2) + Math.ceil(i / 2))
				}
				this.notes_sequence.push(scale_length)
				break
			case 13:
				pattern = [0, 1, 2, 0, -1, -2]
				for (i = 0; i < (scale_length - 1) * pattern.length; i++) {
					let f = scale_length - Math.floor(i / 6)
					f += pattern[i % 6]
					this.notes_sequence.push(f)
				}
				this.reversal = false
				break
			case 14: // alternating inwards
				let j = scale_length
				let k = 0
				end = scale_length * 2 + 1
				for (i = 0; i < end; i++) {
					if (i < scale_length) {
						if (i % 2 == 0) {
							this.notes_sequence.push(k);
							k++
						} else {
							this.notes_sequence.push(j);
							j--
						}
					} else {
						if (i == scale_length) {
							if (scale_length % 2 == 0) j++
							else k--
						}
						if (i % 2 == 0) {
							this.notes_sequence.push(k);
							k--
						} else {
							this.notes_sequence.push(j);
							j++
						}
					}
				}
				this.reversal = false
				break
			case 15: // fourths triplets
				for (i = 0; i < scale_length * 3; i++) {
					this.notes_sequence.push(3 * (i % 3) + Math.floor(i / 3))
				}
				this.notes_sequence.push(scale_length)
				break
			case 16: // octaves practice
				for (i = 0; i < scale_length * 2 + 1; i++) {
					this.notes_sequence.push((scale_length - 1) * (i % 2) + Math.ceil(i / 2))
				}
				// this.OTP = 1
				// if (note_count < 12) {
				// 	octaves_to_play = this.OTP
				// 	OCT_RADIO.value(str(octaves_to_play))
				// }
				break
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
			if (tempo > 60 && (i == this.notes_sequence.length - 1)) {
				note_length = 2 * B
			} else {
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
			this.notes_sequence_lengths.push(note_length)
		}
		this.interval_time = this.notes_sequence_lengths[0]
	}

	play_scale(seq_number = 0) {
		if (scale_pattern.length * this.override_OTP != scale_notes_length_temp) { // || seq_number > 0){
			// if(seq_number == 0) seq_number = 1
			this.generate_sequence()
			scale_notes_length_temp = scale_pattern.length * this.override_OTP
		}
		if(dir_override){
			this.dir = dir_override
			if(this.dir == 1) REVERSE_MODE_button.style('backgroundColor', 'rgb(170,255,165)')
			else REVERSE_MODE_button.style('backgroundColor', 'rgb(175,220,255)')
		}	
		else{
			this.dir = 1
			REVERSE_MODE_button.style('backgroundColor', 'rgb(150,215,105)')
		}
		document.getElementById("REVM").innerHTML = 'DIR = ' + this.dir
		this.scale_notes = []
		this.current_note_index = 0
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
		
		// update_chart = true
	}

	generate_sequence_display() {

		let N = this.notes_sequence.length
		let x1 = chart_x2 - 14 * U
		let x2 = chart_x2
		let SF = (this.override_OTP == 1) ? 1 : 0.5
		let M = U * (0.4 - 0.15 * (this.override_OTP - 1))
		let x_step = (x2 - x1 - 2 * M) / (N - 1)

		let y1 = 1 * U
		let y2 = chart_y - 1.565 * U

		seq_display.x0 = x1
		seq_display.y0 = y1
		seq_display.x1 = x1 + M
		seq_display.y1 = y1 + M
		seq_display.x2 = x2 - M
		seq_display.y2 = y2 - M
		seq_display.x3 = x2
		seq_display.y3 = y2
		seq_display.w = x2 - x1
		seq_display.h = y2 - y1

		push()
		fill(255)
		noStroke()
		rectMode(CORNERS)
		strokeCap(ROUND)
		rect(x1 - 1, y1 - 1, x2 + 1, y2 + 1)
		stroke(30)
		strokeWeight(30 * SF * U / 350)
		let min_f = Math.min(...this.notes_sequence)
		let max_f = Math.max(...this.notes_sequence)
		f_span = max(1, max_f - min_f)
		let y_step = (y2 - y1 - 2 * M) / f_span
		let diam = min(x_step * 1.5, y_step * 1.2, 1.95 * M)
		fill(30)
		// circle(x2 - M, y1 + M, diam)

		let count = 0
		let min_y = 0
		for (let x = x1 + M; x <= x2 - M / 2; x += x_step) {
			let f = this.notes_sequence[min(count, this.notes_sequence.length - 1)]
			let y = map(f, max_f, min_f, y1 + M, y2 - M)
			line(x, y1 + M, x, y2 - M)
			push()
			if (f % scale_pattern.length == 0) {
				fill(col2)
				stroke(col2)
				strokeWeight(5 * SF * 15 * U / 350)
				line(x1 + M, y, x2 - M, y)
			}
			noStroke()
			circle(x, y, diam)
			pop()
			line(x1 + M, y, x2 - M, y)
			count++
			min_y = min(y, min_y)
		}
		pop()
		update_seq_display = false
	}
}

function duplicates_check(arr) {
	let check_arr = []
	for (var i = 0; i < arr.length; i++) {
    check_arr[i] = arr[i][0];
	}
	// print(arr, check_arr)
	// check_arr = arr.map((index) => arr[index].charAt[0]);
	return new Set(check_arr).size !== check_arr.length
	// returns true if the set (which contains no duplicates) is not the same length as the original array.
}

function modify_notes_for_accidental(arr,acc){
	// before modifying a note, need to check if there is already one in there.
	// let modified = false
	let check_index = accidental_count - 1
	let letters = 'ABCDEFG'
	let order = (acc == '♯')? order_of_sharps : order_of_flats
	let offset = (acc == '♯')? 1:-1
	// while (modified == false && check_index < 7){
	// for(let i = check_index; i < 7; i++){
		let note_to_modify_to = order[check_index]// order[i]
		let note_to_modify_to_index = letters.indexOf(note_to_modify_to)
		let note_to_modify = letters[note_to_modify_to_index + offset]
		if(contains(arr,note_to_modify_to,true)) check_index++
		else{
			for(let i=0; i < arr.length; i++){
				if(arr[i] == note_to_modify){
					arr[i] = note_to_modify_to + acc
					// print(note_to_modify + ' becomes ' + note_to_modify_to + acc)
					return true
				}
			}
		}
	// }
	return false
}

function contains(a, check_item, first=false) {
	for (var i = 0; i < a.length; i++) {
  	let test_item = a[i]
  	if(first) test_item = a[i][0]
		if (test_item === check_item) {
		// print(a[i] + ' ' + check_note)
    return true;
  	}
  }
  return false;
}