
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

	constructor(x,y,w,h,note_color, frequency, index, scale_index, update_label, update_color, accidental_type){
		this.w = w
		this.h = h
		this.x = x
		this.y = y
		
		this.mid = x + w/2
		this.isPressed = 0
		this.note_color = note_color
		this.note_val = fingering_pattern[index]
		this.frequency = frequency
		this.freq_bend_above = frequency * bend_factor - this.frequency
		this.freq_bend_below = frequency / bend_factor - this.frequency
		this.index = index
		this.scale_index = scale_index
		this.accidental_type = accidental_type
		this.current_octave = int(starting_octave)
		this.wt = U/15
		this.dots = min(7,note_count)
		this.note_name = str(notes_arr[this.index % note_count])
		this.note_display_name = this.note_name
		if(this.note_name == key_name) this.key_note = true
		else this.key_note = false
		if(update_label) this.static_labels()
		if(update_color) this.static_lines()
		this.draw()
		this.redraw = false
	}
	
	static_labels(){
		noStroke()
		push()
		fill(255)
		rectMode(CORNERS)
		rect(this.x + U * 0.03, chart_above, this.x + this.w - U * 0.03, this.y ) // top location

		pop()
		const pos = U * 0.1
		const sub_pos = U * 0.25
		const offset = (starting_note === 'F') ? 5 : 0
		this.octave_offset = int((this.index + offset) / note_count)
		this.current_octave = int(starting_octave) + this.octave_offset
		let invert = false // check whether a white key needs to be flatted or sharped
		if(this.note_name.length === 1 || note_count < 12){
			this.numeral = str(this.current_octave)
			if(accidental_count == 6){
				if(this.note_name == 'F' && accidental_notes == 'FCGDAE'){
					invert = true
					this.note_display_name = 'E♯'
					this.numeral = '♯'
					if(starting_note === 'F') this.octave_offset += 1
				}
				else if(this.note_name == 'B' && accidental_notes == 'BEADGC'){
					invert = true
					this.note_display_name = 'C♭'
					this.numeral = '♭'
					if(starting_note === 'C') this.octave_offset += 1
					// 𝄪 𝄫
				}
			}
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
			if (note_count == 12){
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
				rect(this.mid, this.y - 0.75 * U, this.w * 0.95, U * 1.5)
			}
			pop()
		}
		else if (note_count == 12){
			if(scale_name == 'Chromatic' || this.accidental_type == 'ALL'){
				push()
				colorMode(HSB,70,100,100,100)
				this.indicator_color = color_arr2[['C','D','F','G','A'].indexOf(this.note_name[0])]
				fill(this.indicator_color)
				rectMode(CENTER)
				rect(this.mid, this.y - 0.75 * U, this.w * 0.95, U * 1.5) // full height color fill
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
					rect(this.mid, this.y - 0.75 * U, this.w * 0.95, U * 1.5) 
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
					rect(this.mid, this.y - 0.75 * U, this.w * 0.95, U * 1.5)
				}
				pop()
			}
		}
		this.y_note_index = "CDEFGAB".indexOf(this.note_display_name[0]) + (this.octave_offset) * 7
	}
	
	static_lines(){ // vertical note divider lines
		strokeWeight(this.wt)
		strokeCap(SQUARE)
		stroke(this.note_color)
		line(this.x + this.w, this.y - U * 1.5, this.x + this.w, this.y + this.h) // vertical divider line
		if(this.index == 0){
			line(this.x, 2.76 * U, this.x, this.y + H)  // far left side vertical divider line (next to image)
		}
	}
	
	draw(){
		
		let weight_factor = 1.4
		let COL = this.note_color
		if (this.isPressed){
			weight_factor = 3
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
			const index_number = ((this.index + note_count - octave_start) % note_count)
			let diam
			if(this.isPressed){
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
		let shift_angle = 0.5 * PI
		let note_fingering = recorder_fingerings[this.index]
		// if(instrument_name == "Bass" && this.index == 8){
		// 	note_fingering = bass_alt_fingering
		// }
		noStroke()	
		fill(COL)
		let m1 = U * 0.065
		let m2 = U * 0.028
		if (note_count == 12 && !hide_fingering){
			let inc = 0.09 * this.isPressed
			push()
			fill(255)
			rect(this.x + m2, this.y + m1 * 1.1, int(this.w - m2 * 2), this.h - m1) // clear old shapes out to make it look better
			stroke(COL)
			strokeWeight(this.wt * weight_factor)
			strokeCap(SQUARE)
			let m = U * 0.1
			// horizontal hole group separater lines
			line(this.x + m, this.y + this.h * 0.125, this.x + this.w - m, this.y + this.h * 0.125)
			line(this.x + m, this.y + this.h * 0.5, this.x + this.w - m, this.y + this.h * 0.5)
			line(this.x + m, this.y + this.h * 0.875, this.x + this.w - m, this.y + this.h * 0.875)
			pop()
			
			for(let i = 0; i < 8; i++){
				let shift = 0
				state = note_fingering[i]
				let inc2 = (state > 0)? inc : 0
				circle(this.mid, this.y + this.h * 0.0625 + this.h * 0.125 * i, U * (0.6 + inc2)) 
				if(state == 0 || state == 2){
					push()
					fill(255) // inner hole circle / half circle
					if(i > 0){
						shift = shift_angle
						if(note_fingering.length == 9) shift = -HALF_PI
					} 
					stroke(COL)
					arc(this.mid, this.y + this.h * 0.0625 + this.h * 0.125 * i, 
						U * (0.5 + inc2), U * (0.5 + inc2), state * HALF_PI + shift, TAU + shift, PIE)
					if(i > 5 && state == 0){
						arc(this.mid, this.y + this.h * 0.0625 + this.h * 0.125 * i, 
							U * (0.5 + inc2), U * (0.5 + inc2), shift, PI + shift, PIE)						
					}
					pop()
				}
			}
			if (note_fingering.length == 9 && lowest_note > -16 && hide_fingering == false){ // cover bell indicator
				rect(this.x + U * 0.07, this.y + this.h - U * 0.15, this.w - U * 0.14, U * 0.135, U * 0.1)
			}
		}
		else{ // just a colored box instead of the fingering pattern
			if(!stylo_mode && note_count == 12){
				push()
				fill(255)
				rect(this.x + m2, this.y + m1, this.w - m2 * 2, this.h - m1) // clear old shapes out to make it look better
				pop()
				if(this.note_val > 0) rect(this.x + m1, this.y + this.h * 0.008, this.w - m1 * 2, this.h - m1) 
				else rect(this.x + m1, this.y + m1, this.w - m1 * 2, this.h * 0.495)
			}
			else if(stylo_mode && note_span || note_count != 12){ // draw interval indicators -----------------------------------------------------------
				if(this.isPressed){
					// slight gap to indicate upper zone for staccato
					rect(this.x + m1, this.y + m1, this.w - m1 * 2, 2 * U)
					rect(this.x + m1, this.y + m1 + 2.1 * U, this.w - m1 * 2, this.h * 0.99 - 2.1 * U)
				}
				else{
					rect(this.x + m1, this.y + m1, this.w - m1 * 2, this.h * 0.99)
				}
				if(note_count != 12) return
				fill(0)
				const L = U * 0.06
				let v_spacing = (this.h - L) / note_span
				let v_pos = L + this.y + (this.h - L)*(1 - (this.index-chart.first_scale_note_index)/note_span)
				push()
					rectMode(CORNERS)
					colorMode(HSB,70,100,100,100)
					if(this.x > this.w * 1.5){
						let I = this.index - chart.notes[min(max(this.scale_index - 2,0),chart.notes.length - 1)].index
						fill(interval_colors[I-1])
						rect(this.mid,v_pos, this.mid - this.w * 0.5 + m1,v_pos + v_spacing*I)	
						for(let i = 0; i < I; i++){
							fill(0, 0, 35 * i, 10)
							rect(this.mid,v_pos + v_spacing * i, this.mid - this.w * 0.5 + m1,v_pos + v_spacing * (i + 1))			
						}
					}
					if(this.scale_index < chart.notes.length){
						let I = chart.notes[min(max(this.scale_index, 0),chart.notes.length - 1)].index - this.index
						fill(interval_colors[I - 1])
						rect(this.mid,v_pos, this.mid + this.w * 0.5 - m1,v_pos + v_spacing*(-I))
						for(i = I; i--;){
							fill(0, 0, 35 * i, 10)
							rect(this.mid,v_pos + v_spacing * (i - I), 
								this.mid + this.w * 0.5 - m1,
								v_pos + v_spacing * (i - I + 1)
							)
						}
					}
				pop()
			}
		}
	}
	
	contains(x,y){
		const dx = x - this.x
		const dy = y - this.y
		return (0 <= dx && dx <= this.w && 0 <= dy && dy <= this.h)
	}
	contains_above(x, y){
		const dx = x - this.x
		const dy = y - chart_above
		return (0 <= dx && dx <= this.w && 0 <= dy && dy <= this.y)
	}
	
	mousePressed(duration = 0, staccato = false){
		this.isPressed = 1
		this.redraw = true
		redraw_notes = true
		if(staccato){
			// shorter towards top
			const staccato_duration = constrain(map(mouseY/U, 8, 10, 0.01, 0.25), 0.01, 0.25)
			osc.setADSR(staccato_duration * 0.25,staccato_duration,0.75,0.1)
			play_oscillator(this.frequency, staccato_duration)
			osc.setADSR(0.2,0.2,0.75,0.1)
		} 
		else play_oscillator(this.frequency, duration)
	}
	mouseReleased(){
		this.isPressed = 0
		redraw_notes = true
		this.redraw = true
	}

	generate_engraving(draw_staff=true, ghost_note=false){

		// 𝄞 𝄢 ♯♭♮ 𝄚 ♪ 𝅘𝅥𝅮𝅘𝅥𝅗𝅥𝅝
		// can move this set of calcs to outer, chart creation level
		const x0 = U * 14.4
		const y0 = U * 6.3 // lowest part on screen
		const M = U * 0.15
		const xm = x0 + U
		const w = U * 1.55
		const h = U * 5.25
		const S = U * 0.4
		const x1 = x0 + w
		const y3 = y0 - h
		const y1 = y0 - M
		const y_pos_staff = y1 - U * 1.15
		const y_pos_1 = y_pos_staff + S
		// --------------------------------
		
		// can move to outer, note creation level
		
		const y_pos = y_pos_1 - this.y_note_index * S * 0.5 + bass_instrument * S
		// --------------------------------
		push()
		if(draw_staff){
			noStroke()
			fill(255)
			rectMode(CORNERS) 
			// clear area
			rect(x0 - M/2, y0 + M/2, x1 + M/2, y3 - M/2)

			push()
			// draw clef symbol
				fill(255)
				noStroke()
				rect(x0 - 0.85 * U, y_pos_staff - U * 1.3, x0, y_pos_staff + U * 0.25)  // clear old clef
				fill(0)
				textSize(U * 0.6)
				if(bass_instrument){ 
					textSize(U * 1.2)
					text('𝄢', x0 - 0.45 * U, y_pos_staff - U)
				}
				else{
					textSize(U * 1.4)
					text('𝄞', x0 - 0.42 * U, y_pos_staff - U * 1.2)
				}
			pop()
			
			stroke(0)
			strokeWeight(U * 0.08)
			rect(x0, y0, x1, y3, S) // note rep boundary box with filleted corners
			
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
				const lines_below = round((y_pos - y_pos_staff)/S)
				const index_offset = (this.y_note_index % 2 == 0)? 0 : S/2 
				for(let i=0;i < lines_below; i++){
					let y_pos_S = y_pos - i * S - index_offset
					line(xm - 2.7 * M, y_pos_S , x1 - M * 0.9, y_pos_S)
				}
			}
			else{
				const lines_above = round(((y_pos_staff - S * 4) - y_pos) / S)
				const index_offset = (this.y_note_index % 2 == 0)? 0 : S/2 
				for(let i = 0;i < lines_above; i++){
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
