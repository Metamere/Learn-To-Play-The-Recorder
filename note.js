
// const col_amp = [-50,-40,-30]
const color_arr1 = [
	[0,88,67],    // C
	[4,90,85],    // D
	[10.5,89,92], // E
	[20,95,50],   // F
	[35,90,65],   // G
	[41,90,75],   // A
	[57,90,77]]   // B

const color_arr2 = [
	[2,78,95],   // C♯
	[7.5,90,98], // D♯
	[30,90,78],  // F♯
	[38,90,90],  // G♯
	[50,90,92]]  // A♯
		
class note {

	constructor(x,y,w,h,divide, note_color, frequency, midi_note, index, chart_index, update_label, update_color, accidental_type, wrapped){
		this.w = w
		this.h = h
		this.x = x
		this.y = y
		// prevent the note zones from butting right up against each other, where the notes could jitter.
		this.buffer_margin = U * 0.02
		this.divide = divide
		this.above = U * 1.5
		
		this.mid = x + w/2
		this.is_pressed = 0
		this.note_color = note_color
		this.note_val = fingering_pattern[index]
		this.frequency = frequency
		this.midi_note = midi_note //freqToMidi(frequency)
		this.freq_bend_above = frequency * bend_factor - this.frequency
		this.freq_bend_below = frequency / bend_factor - this.frequency
		this.index = index
		this.special_note = (instrument_type == 'Irish whistle' && this.index == 10)
		this.chart_index = chart_index
		this.accidental_type = accidental_type
		this.current_octave = int(starting_octave)
		this.wt = int(U / 15)
		this.dots = min(7, note_count)
		this.note_name = str(notes_arr[this.index % note_count])
		this.note_display_name = this.note_name
		if(this.note_name == key_name) this.key_note = true
		else this.key_note = false
		this.wrapped = wrapped
		this.playable = (this.note_val > 0 && fingering_data[index].length > 0)
		if(update_label) this.static_labels()
		if(update_color) this.static_lines()
		this.draw()
		this.redraw = false
	}
	
	// note name with either an accidental symbol or an octave number
	static_labels(){
		if(!this.wrapped){
			noStroke()
			push()
			// clear out old label
			fill(255)
			rectMode(CORNERS)
			rect(this.x + U * 0.03, this.y - chart_label_height, this.x + this.w - U * 0.03, this.y ) // top location
			pop()
		}
		const pos = U * 0.1
		const sub_pos = U * 0.25
		const offset = instrument_obj.shift_amount
		const offset2 = instrument_obj.octave_offset ? instrument_obj.octave_offset : 0
		this.octave_offset = int((this.index + offset) / note_count) + offset2
		this.current_octave = int(starting_octave) + this.octave_offset - offset2
		let invert = false // check whether a white key needs to be flatted or sharped
		this.y_note_index = "CDEFGAB".indexOf(this.note_display_name[0]) + (this.octave_offset) * 7
		if(this.note_name.length === 1 || note_count < 12){
			this.numeral = str(this.current_octave)
			if(accidental_count == 6){
				if(this.note_name == 'F' && accidental_notes == 'FCGDAE'){
					invert = true
					this.note_display_name = 'E♯'
					this.numeral = '♯'
				}
				else if(this.note_name == 'B' && accidental_notes == 'BEADGC'){
					invert = true
					this.note_display_name = 'C♭'
					this.numeral = '♭' // 𝄪 𝄫
				}
			}
			if(this.wrapped) return
			// colored boxes help to see corresponding notes in higher octave
			push()
			colorMode(HSB,70,100,100,100)
			fill(color_arr1[color_count % this.dots])
			color_count++
			rectMode(CENTER)
				push()
				if(invert){
					stroke(0)
					strokeWeight(U * 0.06)
					rect(this.mid, this.y - 1.12 * U, this.w * 0.66, U * 0.6, 0, 0, pos, pos)
				} 
				else rect(this.mid, this.y - 1.12 * U, this.w * 0.66, U * 0.66, 0, 0, pos, pos)
				pop()
			if (note_count == 12){ // 12-TET
				push()
				fill(0,0,15)
				textSize(U * 0.8)
				text(this.note_display_name[0], this.mid - this.w * 0.165, this.y - 0.85 * U + pos)
				textSize(U * 0.55)
				text(this.numeral, this.mid + U * 0.28, this.y - 0.85 * U + pos + sub_pos)
				pop()
			}
			if(this.note_val == 0){ // gray overlay for notes that are not in the scale
				fill(0,0,80,65)
				rect(this.mid, this.y - 0.75 * U, this.w * 0.95, this.above)
			}
			pop()
		}
		else if (note_count == 12 && !this.wrapped){
			if(scale_name == 'Chromatic' || this.accidental_type == 'ALL'){
				push()
				colorMode(HSB,70,100,100,100)
				this.indicator_color = color_arr2[['C','D','F','G','A'].indexOf(this.note_name[0])]
				fill(this.indicator_color)
				rectMode(CENTER)
				rect(this.mid, this.y - 0.75 * U, this.w * 0.95, this.above) // full height color fill
				if(this.note_name.slice(0,2) == 'A♯') fill(0,0,60)
				else fill(0,0,15)
				textSize(U * 0.8)
				let note_name = this.note_name[0]
				text(note_name, this.mid - this.w * 0.17, this.y - 1.45 * U)
				note_name = this.note_name.charAt(3)
				text(note_name, this.mid - this.w * 0.17, this.y - 0.8 * U + pos)
				textSize(U * 0.7)
				text('♯', this.mid + U * 0.28, this.y - 1.3 * U)
				text('♭', this.mid + U * 0.28, this.y - 0.75 * U + pos)

				if(this.note_val == 0){ // gray overlay
					fill(0,0,80,50)
					rect(this.mid, this.y - 0.75 * U, this.w * 0.95, this.above) 
				}
				pop()
				if(default_sharp) this.note_display_name = this.note_name[0] + '♯'
				else this.note_display_name = this.note_name.charAt(3) + '♭'
			}
			else{
				if(this.accidental_type == '♯') this.note_display_name = this.note_name[0] + '♯'
				else this.note_display_name = this.note_name.charAt(3) + '♭'
				push()
				fill(0,0,15)
				textSize(U * 0.8)
				text(this.note_display_name[0], this.mid - this.w * 0.165, this.y - 1.4 * U)
				textSize(U * 0.7)
				text(this.note_display_name[1], this.mid + U * 0.28, this.y - 1.3 * U)
				pop()
				
				push()
				colorMode(HSB,70,100,100,100)
				this.indicator_color = color_arr2[['C','D','F','G','A'].indexOf(this.note_name[0])]
				fill(this.indicator_color)
				rectMode(CENTER)
				rect(this.mid, this.y - 0.32 * U, this.w * 0.66, U * 0.66, pos, pos, 0, 0) // lower rect
				fill(0,0,80,65)
				if(this.note_val == 0){ // gray overlay
					rect(this.mid, this.y - 0.75 * U, this.w * 0.95, this.above)
				}
				pop()
			}
		}
	}
	
	static_lines(){ // vertical note divider lines
		strokeWeight(this.wt)
		strokeCap(SQUARE)
		stroke(this.note_color)
		const y_start = this.y - (!this.wrapped ? this.above : 0)
		line(this.x + this.w, y_start, this.x + this.w, this.y + this.h) // vertical divider line
		if(this.index == 0){
			line(this.x, 2.76 * U, this.x, this.y + H)  // far left side vertical divider line (next to image)
		}
	}
	
	draw(){
		let weight_factor = 1
		let COL = this.note_color
		if (this.is_pressed){
			weight_factor = 2
			COL = this.note_color.map(x => x * 0.65) //min(240,x + col_amp[this.note_val]))
			if(!stylo_mode && note_count == 12 && this.note_val > 0){
				COL[1] += 100
				COL[2] += 80
			}
			if(display_staff)	this.generate_engraving()
		}

		if(!update_chart && this.redraw){
			// draw dot at corresponding location on pattern representation
			push()
			noStroke()
			const x_start = U * 1.65
			const step_width = U * 0.95
			const index_number = ((this.index + 2 * note_count - octave_start) % note_count)
			let diam
			if(this.is_pressed){
				fill(COL)
				diam = step_width * 0.33
			}	
			else{ // clear old one
				fill(255)
				diam = step_width * 0.36
			} 
			if(index_number == 0){
				circle(x_start, U * 1.4, diam)
				circle(x_start + step_width * note_count, U * 1.4, diam)
			}
			else circle(x_start + step_width * index_number, U * 1.4, diam)
			pop()
		}

		this.redraw = false
		// ----------------------------------------------------------------------
		
		let state
		let increase_open = instrument_type == 'brass'
		let shift_angle = 0.5 * PI
		let note_fingering = fingering_data[this.index]
		noStroke()	
		fill(COL)
		let m1 = U * 0.065
		let m2 = U * 0.028
		const y_inc = chart_h * 0.125
		const empty_note = (note_fingering.length == 0)
		if (note_count == 12 && !hide_fingering && (!this.wrapped || (this.wrapped &&
					note_fingering.slice(0,symbol_count).toString() != fingering_data[this.index - 12].slice(0,symbol_count).toString()))){
			let inc = 0.09 * this.is_pressed
			push()
			fill(255)
			rect(this.x + m2, this.y + m1 * 1.1, this.w - m2 * 2, this.h - m1) // clear old shapes out to make it look better
			stroke(COL)
			const wt2 = this.wt * weight_factor
			strokeWeight(wt2)
			strokeCap(SQUARE)
			let m = U * 0.1
			// horizontal hole group dividing lines -----------------------------
			let split_holes = false
			let symbols_to_display = 0
			if(instrument_type == 'recorder'){
				line(this.x + m, this.y + y_inc, this.x + this.w - m, this.y + y_inc)
				line(this.x + m, this.y + y_inc * 7, this.x + this.w - m, this.y + y_inc * 7)
				split_holes = true
				symbols_to_display = symbol_count
			}
			else if(!empty_note){
				symbols_to_display = condensed_notes ? note_fingering.length : symbol_count
			}
			let y_pos = this.divide // mid point, split where control changes between all notes and only the on notes
			if(instrument_type == 'Irish whistle'){
				line(this.x + m, this.y + y_inc * 3, this.x + this.w - m, this.y + y_inc * 3)
				if(this.playable){
					push()
					noStroke()
					if(this.special_note) fill(...COL, 150)
					else fill(COL)
					rect(this.x + m1, y_pos + m1, this.w - 2 * m1, (this.y + this.h - this.divide - m1))
					pop()
				}
			} 
			else line(this.x + m, y_pos, this.x + this.w - m, y_pos)
			if(!condensed_notes && instrument_type == 'brass'){
				y_pos = this.y + this.h - wt2/2 // bottom of note area
				line(this.x + m, y_pos, this.x + this.w - m, y_pos)
			} 
			pop()
			// ---------------------------------------------------------------------
			for(let i = 0; i < symbols_to_display; i++){ // draw hole / valve representations
				let shift = 0
				state = note_fingering[i]
				let inc2 = (state > 0 || increase_open)? inc : 0
				const y2 = this.y + y_inc * 0.5  + y_inc * i
				const diam2 = U * (0.5 + inc2)
				circle(this.mid, y2, U * (0.6 + inc2)) 
				if(state == 0 || state == 2){
					push()
					fill(255) // inner hole circle / half circle
					if(i > 0){
						shift = shift_angle
						if(note_fingering.length == 9) shift = -HALF_PI
					}
					stroke(COL)
					arc(this.mid, y2, 
						diam2, diam2, state * HALF_PI + shift, TAU + shift, PIE)
					if(split_holes && i > 5 && state == 0){
						arc(this.mid, y2, 
							diam2, diam2, shift, PI + shift, PIE)						
					}
					pop()
				}
			}
			if (note_fingering.length == 9 && instrument_obj.bass_instrument && hide_fingering == false){ 
				// cover bell indicator line
				rect(this.x + U * 0.07, this.y + this.h - U * 0.15, this.w - U * 0.14, U * 0.135, U * 0.1)
			}
			if(fingering_data[this.index].length == 0 && instrument_type == 'Irish whistle'){
				// non-playable notes get filled in instead
				rect(this.x + m1, this.y + m1, this.w - m1 * 2, this.divide - this.y)
			} 
		}
		else{ // just a colored box instead of the fingering pattern
			if(!stylo_mode && note_count == 12){
				push()
				fill(255)
				rect(this.x + m2, this.y + m1, this.w - m2 * 2, this.h - m1) // clear old shapes out to make it look better
				pop()
				if(this.special_note) fill(...COL, 150)
				if(this.note_val > 0) rect(this.x + m1, this.y + this.h * 0.008, this.w - m1 * 2, this.h - m1)
				else rect(this.x + m1, this.y + m1, this.w - m1 * 2, this.divide - this.y)
				if(this.wrapped && !hide_fingering){
					push()
					fill(0,30)
					const w2 = this.w * 0.3
					triangle(this.mid - w2, this.y + U * 1.75, this.mid + w2, this.y + U * 1.75, this.mid, this.y + U * (1.25 - 0.25 * this.is_pressed))
					textSize(this.w * 0.7)
					text(this.current_octave, this.mid, this.y + U * 0.25)
					pop()
				}
			}
			else if(stylo_mode && note_span || note_count != 12){ 
				if(this.is_pressed && !chart.playing_scale && !this.special_note){
					// slight gap to indicate upper zone for staccato
					push()
					// pop()
					const y2 = this.y + 2 * U
					const m2 = this.w * 0.1
					fill(0,20)
					quad(this.mid + m1, this.y + m1, this.mid - m1, this.y + m1, this.x + m2, y2, this.x + this.w - m2, y2)
					fill(0,65)
					rect(this.x + m1, this.y + m1, this.w - m1 * 2, 2 * U)
					rect(this.x + m1, y2 + m1, this.w - m1 * 2, this.h * 0.99 - 2 * U)
					pop()
				}
				else{
					if(this.special_note) fill(...COL, 150)
					rect(this.x + m1, this.y + m1, this.w - m1 * 2, this.h * 0.99)
				}
				if(!this.playable){
					fill(255, 150)
					rect(this.x + m1, this.divide + m1, this.w - m1 * 2, (this.y + this.h - this.divide))
				} 
				if(note_count != 12) return
				
				// draw the interval indicators -----------------------------------------------------------
				fill(0)
				const L = U * 0.06
				let v_spacing = (this.h - L) / note_span
				let v_pos = L + this.y + (this.h - L) * (1 - (this.index-chart.first_scale_note_index)/note_span)
				push()
					rectMode(CORNERS)
					colorMode(HSB,70,100,100,100)
					if(this.chart_index > 1){ // after the first note
						// the interval between the current and previous note
						let I = this.index - chart.notes[constrain(this.chart_index - 2, 0, chart.notes.length - 1)].index
						fill(interval_colors[I - 1])
						rect(this.mid, v_pos, this.mid - this.w * 0.5 + m1, v_pos + v_spacing * I)	
						for(let i = 0; i < I; i++){
							fill(0, 0, 35 * i, 10)
							rect(this.mid, v_pos + v_spacing * i, 
								this.mid - this.w * 0.5 + m1, 
								v_pos + v_spacing * (i + 1))
						}
					}
					if(this.chart_index < chart.notes.length){ // before the last note
						// the interval between the current and next note
						let I = chart.notes[constrain(this.chart_index, 0, chart.notes.length - 1)].index - this.index
						fill(interval_colors[I - 1])
						rect(this.mid, v_pos, this.mid + this.w * 0.5 - m1, v_pos + v_spacing * (-I))
						for(i = I; i--;){
							fill(0, 0, 35 * i, 10)
							rect(this.mid, v_pos + v_spacing * (i - I),
								this.mid + this.w * 0.5 - m1,
								v_pos + v_spacing * (i - I + 1)
							)
						}
					}
				pop()
			}
		}
	}
	
	contains(x, y){
		const dx = x - this.x
		const dy = y - this.y
		return (this.buffer_margin < dx && dx < this.w - this.buffer_margin && 0 < dy && dy <= this.h)
	}
	contains_above(x, y){
		if(this.wrapped) return false
		const dx = x - this.x
		const dy = y - this.y + this.above
		return (this.buffer_margin < dx && dx < this.w - this.buffer_margin && 0 < dy && dy <= this.above)
	}
	
	press(duration = 0, staccato = false){
		this.is_pressed = 1
		this.redraw = true
		redraw_notes = true
		if(staccato){
			// shorter towards top
			const staccato_duration = constrain(map(mouseY/U, 8, 10, 0.01, 0.25), 0.01, 0.25)
			osc.setADSR(staccato_duration * 0.25,staccato_duration,0.75,0.1)
			play_oscillator(this, this.frequency, staccato_duration)
			osc.setADSR(0.2,0.2,0.75,0.1)
		} 
		else play_oscillator(this, this.frequency, duration)
	}
	release(){
		this.is_pressed = 0
		redraw_notes = true
		this.redraw = true
		if(midi_output_enabled && current_midi_note_on != -1) send_midi_note(this, false)
	}

	generate_engraving(draw_staff=true, ghost_note=false){

		// 𝄞 𝄢 ♯♭♮ 𝄚 ♪ 𝅘𝅥𝅮𝅘𝅥𝅗𝅥𝅝
		const x0 = chart.sd.x0
		const y0 = chart.sd.y0
		const M = chart.sd.M
		const M2 = chart.sd.M2
		const xm = chart.sd.xm
		const w = chart.sd.w
		const S = chart.sd.S
		const x1 = chart.sd.x1
		const y3 = chart.sd.y3
		const y_pos_staff = chart.sd.y_pos_staff
		const y_pos = y_pos_staff + S - this.y_note_index * S * 0.5 + chart.bass_instrument * S

		push()
		if(draw_staff){
			noStroke()
			fill(255)
			rectMode(CORNERS) 
			rect(x0 - M2, y3 - M2, x1 + M2, y0 + M2) // clear staff area

			push()  // draw clef symbol
				rect(x0 - 1.2 * U, y3 + U, x0, y0)  // clear clef area
				fill(0)
				if(chart.bass_instrument){ 
					// scaled_text('𝄢', U * 1.2, x0 - U * 0.65, y_pos_staff - U * 1.75)
					textSize(U * (1.65 - 0.5 * mobile))
					text('𝄢', x0 - 0.6 * U, y_pos_staff - U * (1.75 - 0.35 * mobile))
				}
				else{
					// scaled_text('𝄞', U * 1.25, x0 - 0.6 * U, y_pos_staff - U * (1.75))
					textSize(U * (2.25 - 0.7 * mobile))
					text('𝄞', x0 - 0.6 * U, y_pos_staff - U * (1.75 - 0.5 * mobile ))
				}
			pop()
			
			stroke(0)
			strokeWeight(U * 0.08)
			rect(x0, y0, x1, y3, M) // note rep boundary box with filleted corners
			
			strokeWeight(U * 0.04)
			for(let i = 0; i < 5; i++){ // staff lines
				const y_pos_line = y_pos_staff - i * S
				line(x0, y_pos_line, x1, y_pos_line)
			}
		}

		// draw lines above or below staff
		if(y_pos > y_pos_staff + 0.5 * S || y_pos < y_pos_staff - 4.5 * S){
			push()
			stroke(0)
			strokeWeight(U * 0.03)
			if(y_pos > y_pos_staff){ 
				const lines_below = round((y_pos - y_pos_staff) / S)
				const index_offset = (this.y_note_index % 2 == 0) ? 0 : S/2
				for(let i = 0; i < lines_below; i++){
					let y_pos_S = y_pos - i * S - index_offset
					line(xm - 2.7 * M, y_pos_S , x1 - M * 0.9, y_pos_S)
				}
			}
			else{
				const lines_above = round(((y_pos_staff - S * 4) - y_pos) / S)
				const index_offset = (this.y_note_index % 2 == 0) ? 0 : S/2
				for(let i = 0; i < lines_above; i++){
					let y_pos_S = y_pos + i * S + index_offset
					line(xm - 2.7 * M, y_pos_S , x1 - M * 0.9, y_pos_S)
				}
			}
			pop()
		}
		let opacity = ghost_note? 65 : 255
		stroke(0, opacity)
		strokeWeight(U * 0.08)
		fill(255, 0)
		ellipse(xm, y_pos, S * 1.3, S * 0.85)
		// push() // quarter note symbol. Easier to draw manually? especially for inverted.
		// fill(0, opacity)
		// noStroke()
		// textAlign(CENTER,CENTER)
		// textSize(S * 4.8)
		// text('𝅘𝅥',xm, y_pos - S * 0.85)
		// pop()
		if(this.note_display_name.length >= 2){
			noStroke()
			fill(0, opacity)
			let sign = this.accidental_type
			if(this.accidental_type == 'ALL'){
				if(default_sharp /*&& key_sig.length < 2*/) sign = '♯'
				else sign = '♭'
			}
			let acc_offset
			if(sign == '♯'){ 
				acc_offset = [w * 0.25, S * 0.9]
				textSize(S * 2.2)
			}
			else{
				acc_offset = [w * 0.25, 1.55 * S]
				textSize(S * 2.65)
			}
			text(sign, x0 + acc_offset[0], y_pos - acc_offset[1])
		}
		pop()
	} // end note engraving function
	
} // end note class definition

// function scaled_text(input_text, desired_width, x, y){ // seems to not work properly for mobile text scaling
// 	push()
// 	const temp_size = 100
// 	textSize(temp_size)
// 	const text_actual_width = textWidth(input_text)
// 	const final_size = temp_size * desired_width / text_actual_width
// 	textSize(final_size)
// 	text(input_text, x, y)
// 	pop()
// }