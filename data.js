// lowest: sets frequency of the first note of the chart, based on the number of semitones offset from A4,
// which is where the standard tuning point is set
// shift_amount: sets the note name of the first note of the chart, based on the semitones offset from C in the standard notation (e.g. notes_arr_C)
// C0: -57, C1: -45, C2: -33, C3: -21, C4: -9, C5: 3, C6: 15, C7: 27, C8: 39 (highest note on 88 key piano, with the first being A0 at -48)
// key: the default key for the instrument

const recorder_instruments_arr = [
	{name: "Sopranissimo", lowest: 15, key: 'C', shift_amount: 0}, // or Garklein (German for "quite small") or Piccolo
	{name: "Sopranino", lowest: 8, key: 'F', shift_amount: 5},
	{name: "Soprano", lowest: 3, key: 'C', shift_amount: 0},  // or Descant
	{name: "Alto", lowest: -4, key: 'F', shift_amount: 5}, // or Treble
	{name: "Tenor", lowest: -9, key: 'C', shift_amount: 0},
	{name: "Bass", lowest: -16, key: 'F', shift_amount: 5, bass_instrument: true}, // aka Basset
	{name: "Great Bass", lowest: -21, key: 'C', shift_amount: 0, bass_instrument: true}, // aka Quart-bass
	{name: "Contrabass", lowest: -28, key: 'F', shift_amount: 5, bass_instrument: true}, // or Sub-bass
	{name: "Sub-great bass", lowest: -33, key: 'C', shift_amount: 0, bass_instrument: true}, // or Contra great bass
	{name: "Sub-contrabass", lowest: -40, key: 'F', shift_amount: 5, bass_instrument: true}, // or double contrabass or octocontrabass
]
// shift amount determines which note the chart starts on, lowest determines the frequency, key the starting key and octave number
// could lowest note determine the octave number? should these have a transposition of -12?

const brass_instruments_arr = [
	{name: "C Trumpet", lowest_octave_scale_note_index: 3, lowest: -15, shift_amount: 6, octave_offset: -1, wrap_point: 22, transposition: 0}, // also cornet
	{name: "B♭ Trumpet", lowest_octave_scale_note_index: 3, lowest: -15, shift_amount: 6, octave_offset: -1, wrap_point: 22, transposition: -2}, // also cornet
	{name: "Baritone TC", lowest_octave_scale_note_index: 5, lowest: -26, shift_amount: 4, octave_offset: -1, wrap_point: 22, transposition: -2, bass_instrument: false}, // tenor clef sheet music
	{name: "Baritone BC", lowest_octave_scale_note_index: 5, lowest: -26, shift_amount: 4, octave_offset: -1, wrap_point: 22, transposition: -2, bass_instrument: true}, // bass clef sheet music
	// {name: "Euphonium 4-NC", lowest: -25, shift_amount: 5, octave_offset: -1, wrap_point: 22, transposition: -2, bass_instrument: true}, // also bass trumpet
	{name: "Euphonium", lowest_octave_scale_note_index: 5, lowest: -26, shift_amount: 4, octave_offset: -1, wrap_point: 23, transposition: -2, bass_instrument: true}, // also bass trumpet
	{name: "Tuba", lowest_octave_scale_note_index: 5, lowest: -39, shift_amount: 4, octave_offset: -1, wrap_point: 22, transposition: -2, bass_instrument: true}, // a.k.a. contrabass tuba
]
// accounting for transposition, so that for B♭ instrument, playing the same fingering for a C note on the staff makes the sound of B♭.

const Irish_whistles_arr = [
	{name: "E♭ Whistle", lowest: 15, key: 'E♭', shift_amount: 3},
	{name: "D Whistle", lowest: 14, key: 'D', shift_amount: 2},
	{name: "C Whistle", lowest: 12, key: 'C', shift_amount: 0},
	{name: "B♭ Whistle", lowest: 11, key: 'B♭', shift_amount: -2},
	{name: "A Whistle", lowest: 10, key: 'A', shift_amount: -3},
	{name: "G Low Whistle", lowest: 7, key: 'G', shift_amount: 7},
	{name: "F Low Whistle", lowest: 5, key: 'F', shift_amount: 5},
	{name: "E Low Whistle", lowest: 4, key: 'E', shift_amount: 4},
	{name: "D Low Whistle", lowest: 2, key: 'D', shift_amount: 2},
]
const tin_whistle_fingering_data = [ // diatonic scale
	[1,1,1,1,1,1], // D5
	[],
	[1,1,1,1,1,0], // E
	[],
	[1,1,1,1,0,0], // F♯
	[1,1,1,0,0,0], // G
	[],
	[1,1,0,0,0,0], // A
	[],
	[1,0,0,0,0,0], // B
	[0,1,1,1,1,0], // C — special fingering. there are several possibilities, 
	// and may be different for better pitch on different sizes or makes.
	[0,0,0,0,0,0], // C♯
	[0,1,1,1,1,1], // D6
	[],
	[1,1,1,1,1,0], // E
	[],
	[1,1,1,1,0,0], // F♯
	[1,1,1,0,0,0], // G
	[],
	[1,1,0,0,0,0], // A
	[],
	[1,0,0,0,0,0], // B
]

const recorder_fingering_data = [
[1,1,1,1,1,1,1,1], // C,      F
[1,1,1,1,1,1,1,2], // C♯ D♭   F♯ G♭
[1,1,1,1,1,1,1,0], // D,      G
[1,1,1,1,1,1,2,0], // D♯ E♭   G♯ A♭
[1,1,1,1,1,1,0,0], // E       A
[1,1,1,1,1,0,1,1], // F       A♯ B♭
[1,1,1,1,0,1,1,0], // F♯ G♭   B
[1,1,1,1,0,0,0,0], // G       C
[1,1,1,0,1,1,2,0], // G♯ A♭   C♯ D♭ // this sometimes has the ring finger off with the bass recorder
[1,1,1,0,0,0,0,0], // A       D
[1,1,0,1,1,0,0,0], // A♯ B♭   D♯ E♭
[1,1,0,0,0,0,0,0], // B       E

[1,0,1,0,0,0,0,0], // C,      F
[0,1,1,0,0,0,0,0], // C♯ D♭   F♯ G♭
[0,0,1,0,0,0,0,0], // D,      G
[0,0,1,1,1,1,1,0], // D♯ E♭   G♯ A♭
[2,1,1,1,1,1,0,0], // E       A
[2,1,1,1,1,0,1,0], // F       A♯ B♭
[2,1,1,1,0,1,0,0], // F♯ G♭   B
[2,1,1,1,0,0,0,0], // G       C
[2,1,1,0,1,0,0,0], // G♯ A♭   C♯ D♭
[2,1,1,0,0,0,0,0], // A       D
[2,1,1,0,1,1,1,0], // A♯ B♭   D♯ E♭ == guides show this as [2,1,1,0,1,1,1,1], but that doesn't sound right on my Yamaha recorders
[2,1,1,0,1,1,0,0], // B       E
// see recorder manual for higher notes. 
// They vary by manufacturer and may require experimentation, such as closing the bell, etc.
// also, larger instruments may require different fingerings
	
[2,1,0,0,1,1,0,0], // C,      F
[2,1,2,1,1,0,1,1,1], // C♯ D♭   F♯ Gb // close bell
[2,1,0,1,1,0,1,2],  // D,      G // need to change for lower instruments
[2,0,1,1,0,1,1,0]  // D♯ E♭,  G♯ A♭ // need to exclude for bass instruments
]

const bass_alt_fingering = [1,1,1,0,1,1,0,0]

// note names are for C trumpet. Also Cornet.
const trumpet_fingering_data = [
[1,1,1], // F♯ G♭ - extend 3rd valve slide
[1,0,1], // G3 - extend 3rd valve slide
[0,1,1], // G♯ A♭
[1,1,0], // A3
[1,0,0], // A♯ B♭
[0,1,0], // B3
[0,0,0], // C4
[1,1,1], // C♯ D♭ - extend 3rd valve slide
[1,0,1], // D4 - extend 3rd valve slide
[0,1,1], // D♯ E♭
[1,1,0], // E4

[1,0,0], // F4
[0,1,0], // F♯ G♭
[0,0,0], // G4
[0,1,1], // G♯ A♭
[1,1,0], // A4
[1,0,0], // A♯ B♭
[0,1,0], // B4
[0,0,0], // C5
[1,1,0], // C♯ D♭
[1,0,0], // D5
[0,1,0], // D♯ E♭
[0,0,0], // E5

// same as previous octave
[1,0,0], // F5
[0,1,0], // F♯ G♭
[0,0,0], // G5
[0,1,1], // G♯ A♭
[1,1,0], // A5
[1,0,0], // A♯ B♭
[0,1,0], // B5
[0,0,0], // C6
[1,1,0], // C♯ D♭
[1,0,0], // D6
[0,1,0], // D♯ E♭
[0,0,0], // E6
]

// B♭ transposed instrument. Compensating, 4 valve. Same for Baritone.
const euphonium_fingering_data = [
[0,1,1,0], // E
[1,0,1,0, 0,0,0,1], // F
[0,1,1,0], // F♯ G♭
[1,1,0,0, 0,0,1,0], // G
[1,0,0,0], // G♯ A♭
[0,1,0,0], // A
[0,0,0,0], // A♯ B♭
[1,1,1,1], // B
[1,0,1,1], // C
[0,1,1,1], // C♯ D♭
[1,1,0,1], // D
[1,0,0,1], // D♯ E♭

[0,1,0,1], // E
[1,0,1,0, 0,0,0,1], // F
[0,1,1,0], // F♯ G♭
[1,1,0,0], // G
[1,0,0,0], // G♯ A♭
[0,1,0,0], // A
[0,0,0,0], // A♯ B♭
[1,1,1,0, 0,1,0,1], // B
[1,0,1,0, 0,0,0,1], // C
[0,1,1,0], // C♯ D♭
[1,1,0,0, 0,0,1,0], // D
[1,0,0,0], // D♯ E♭

[0,1,0,0], // E
[0,0,0,0], // F
[0,1,1,0], // F♯ G♭
[1,1,0,0], // G
[1,0,0,0], // G♯ A♭
[0,1,0,0], // A
[0,0,0,0, 0,1,1,0], // A♯ B♭
[1,1,0,0, 0,0,1,0], // B
[1,0,0,0, 0,0,0,1], // C
[0,1,1,0], // C♯ D♭
[1,1,0,0, 0,0,1,0], // D
[1,0,0,0], // D♯ E♭
]

// B♭ transposed instrument. Compensating, 4 valve.
const tuba_fingering_data = [
[0,1,0,1], // E
[0,0,0,1], // F
[0,1,1,0], // F♯ G♭
[1,1,0,0, 0,0,1,0], // G
[1,0,0,0], // G♯ A♭
[0,1,0,0], // A
[0,0,0,0], // A♯ B♭
[0,1,0,1, 1,1,1,0], // B
[0,0,0,1, 1,0,1,0], // C
[0,1,1,0], // C♯ D♭
[1,1,0,0, 0,0,1,0], // D
[1,0,0,0], // D♯ E♭

[0,1,0,0], // E
[0,0,0,0], // F
[0,1,1,0], // F♯ G♭
[1,1,0,0, 0,0,1,0], // G
[1,0,0,0], // G♯ A♭
[0,1,0,0], // A
[0,0,0,0], // A♯ B♭
[1,1,0,0, 0,0,1,0], // B
[1,0,0,0], // C
[0,1,0,0, 0,1,1,0], // C♯ D♭
[0,0,0,0, 1,1,0,0], // D
[1,0,0,0], // D♯ E♭

[0,1,0,0], // E
[0,0,0,0], // F
[0,1,1,0], // F♯ G♭
[1,1,0,0, 0,0,1,0], // G
[1,0,0,0], // G♯ A♭
[0,1,0,0], // A
[0,0,0,0], // A♯ B♭
]

// const euphonium_nc_fingering_data = [
// [0,1,1,0], // G
// [1,1,0,0], // G♯ A♭
// [1,0,0,0], // A
// [0,1,0,0], // A♯ B♭
// [0,0,0,0], // C
// [], // N/A on non-compensated euphoniums
// [1,1,1,1], // 
// [1,0,1,1], // 
// [0,1,1,1], // 
// [1,1,0,1], // 

// [0,1,0,1], // 
// [0,1,0], // 
// [0,0,0], // 
// [0,1,1], // 
// [1,1,0], // 
// [1,0,0], // 
// [0,1,0], // 
// [0,0,0], // 
// [1,1,0], // 
// [1,0,0], // 
// [0,1,0], // 
// [0,0,0], // 

// // same as previous octave
// ]

const notes_arr_C = [
	"C",             
	"C♯ D♭",
	"D",
	"D♯ E♭",
	"E",
	"F",
	"F♯ G♭",
	"G",
	"G♯ A♭",
	"A", 
	"A♯ B♭",
	"B"
]

// to create a note array that starts at F, use notes_arr = shift_array(5)
function shift_array(amount = 0){
	if(amount) return [...notes_arr_C.slice(amount).concat(notes_arr_C.slice(0,amount))]
	return notes_arr_C
}

const order_of_flats =  'BEADGCF'
const order_of_sharps = 'FCGDAEB'

// Map each note to its chromatic index
const note_to_index = {
  "C": 0,
  "C♯": 1, "D♭": 1,
  "D": 2,
  "D♯": 3, "E♭": 3,
  "E": 4,
  "F": 5,
  "F♯": 6, "G♭": 6,
  "G": 7,
  "G♯": 8, "A♭": 8,
  "A": 9,
  "A♯": 10, "B♭": 10,
  "B": 11
};

// Map index back to notes (sharp and flat versions)
const index_to_note = [
  { natural: "C" },
  { sharp: "C♯", flat: "D♭" },
  { natural: "D" },
  { sharp: "D♯", flat: "E♭" },
  { natural: "E" },
  { natural: "F" },
  { sharp: "F♯", flat: "G♭" },
  { natural: "G" },
  { sharp: "G♯", flat: "A♭" },
  { natural: "A" },
  { sharp: "A♯", flat: "B♭" },
  { natural: "B" }
];

// const major_key_signatures_C = [
// 	["C",0],     // C • D • E • F • G • A • B
// 	["D♭",5],    // D♭• E♭• F • G♭• A♭• B♭• C
// 	["D",2],     // D • E • F♯• G • A • B • C♯
// 	["E♭",3], 	 // E♭• F • G • A♭• B♭• C • D
// 	["E",4],     // E • F♯• G♯• A • B • C♯• D♯
// 	["F",1],     //	F • G • A • B♭ • C • D • E
// 	["F♯/G♭",6], // F♯• G♯• A♯• B • C♯• D♯• E♯ 
// 	["G",1],     // G • A • B • C • D • E • F♯
// 	["A♭",4],    // A♭• B♭• C • D♭• E♭• F • G
// 	["A",3],     // A • B • C♯• D • E • F♯• G♯
// 	["B♭",2],    // B♭ • C • D • E♭ • F • G • A
// 	["B",5]      // B • C♯• D♯• E • F♯• G♯• A♯
// ]

// const major_accidental_counts_list_C = [0, 5, 2, 3, 4, 1,
// 																         6, 1, 4, 3, 2, 5]

// const minor_accidental_counts_list_C = [3, 4, 1, 6, 1, 4,
// 																         3, 2, 5, 0, 5, 2]

// const order_of_flats_full =  ['B', 'E','A', 'D', 'G', 'C', 'F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭']
// const order_of_sharps_full = ['F', 'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'D♯', 'A♯']

// note: if adding a new scale, the numbers must add up to the note count so that it starts at the same note on each octave
const scales_arr = [
  {name: 'Balinese Pelog', 
	 pattern: [1,2,4,1,4],
	 mode_names: ['I · Phrygian Pentatonic', 
								'II · Rāga Vaijayanti',
								'III · Rāga Khamaji Durga', 
								'IV · African Pentatonic 4',
								'V · Ryukyu'],
	 alt: [['Subset of Phrygian mode',
					'Pelog = beautiful'],
				 [''],
				 [''],
				 [''],
				 ['Rāga Gambhiranata'],['Ionian Pentatonic']]
	},
  {name: 'Hon-kumoi-joshi', 
	 pattern: [1,4,2,1,4],
	 mode_names: ['I · Hon-kumoi-joshi',
		 						'II · Lydian Pentatonic',
								'III · Aeolian Pentatonic',
								'IV · Iwato', 
								'V · Rāga Bhinna Shadja'],
	 alt: [['Sakura scale',
				 'Rāga Salanganata'],
				 ['Hirajoshi',
					'Rāga Amritavarshini'],
				 ['Yona Nuki minor'],
				 [''],
				 ['']]
	},
	{name: 'Kokin-joshi', 
	 pattern: [1,4,2,3,2],
	 mode_names: ['I · Kokin-joshi', 
								'II · Rāga Hindol',
								'III · Han-kumoi', 
								'IV · Locrian Pentatonic',
								'V · Dorian Pentatonic'],
	 alt: [['Subset of Phrygian mode',
					'Miyakobushi',
				 'In Sen, Han-Iwato'],
				 [''],
				 ['Rāga Shobhavari'], 
				 ['Rāga Jayakauns'],
				 ['Kumoi',
					'Rāga Shivranjani']]
	},
	{name: 'Mixolydian Pentatonic', 
	 pattern: [4,1,2,3,2],
	 mode_names: ['I · Mixolydian Pentatonic', 
								'II · Rāga Chhaya Todi',
								'III · Rāga Desh', 
								'IV · Rāga Chandrakauns',
								'V · Rāga Shree Kalyan'],
	 alt: [['Subset of Mixolydian mode',
					'Rāga Savethri'],
				 [''],
				 [''], 
				 [''],
				 ['']]
	},  
  {name: 'Dominant Pentatonic', 
	 pattern: [2,2,3,3,2],
	 mode_names: ['I · Dominant Pentatonic',
								'II · Staditonic',
								'III · Rāga Harikauns',
								'IV · Sylitonic',
								'V · Thonitonic'],
	 alt: [['Phropitonic'],
				 [''],
				 ['Kataritonic'],
				 ['Minor Added Sixth', 'Pentatonic'],
				 ['Kung']]
	},  
	{name: 'Major Pentatonic', 
	 pattern: [2,2,3,2,3],
	 mode_names: ['I · Major Pentatonic',
								'II · Suspended Pentatonic',
								'III · Man Gong',
								'IV · Scottish Pentatonic',
								'V · minor pentatonic'],
	 alt: [
				 ['Ryosen, Gong, Tizita Major',
				 'Rāga Deshkar, Rāga Kokila',
				 'Rāga Mohanam'],
				 ['Qing Yu', 
					'Rāga Madhyamavati'],
				 ['Quan Ming, Jiao, Yi Ze', 
					'Rāga Hindola'],
				 ['Ritusen, Zheng', 
					'Rāga Devakriya'],
				 ["Min'yo scale, Gu Xian", 
					'Rāga Dhani, Rāga Abheri'],
				]
	},
  {name: 'minor pentatonic', 
	 pattern: [3,2,2,3,2],
	 mode_names: ['I · minor pentatonic',
								'II · Major Pentatonic', 
								'III · Suspended Pentatonic',
								'IV · Man Gong',
								'V · Scottish Pentatonic'],
	 alt: [
				 ["Min'yo scale, Gu Xian", 
					'Rāga Dhani, Rāga Abheri'],
				 ['Ryosen, Gong, Tizita Major',
				 'Rāga Deshkar, Rāga Kokila',
				 'Rāga Mohanam'],
				 ['Qing Yu', 
					'Rāga Madhyamavati'],
				 ['Quan Ming, Jiao, Yi Ze', 
					'Rāga Hindola'],
				 ['Ritusen, Zheng', 
					'Rāga Devakriya']
				]
	},
  {name: 'Blues', 
	 pattern: [3,2,1,1,3,2],
	 mode_names: ['I · Blues Hexatonic',
		 						'II · Blues Major',
								'III · Rāga Marva', 
								'IV · Rāga Hamsanandi',
								'V · Rāga Tulsikauns',
								'VI · Dadimic'],
	 alt: [['Blues Hexatonic,', 
					'minor pentatonic + 1',
				  'Rāga Nileshwari'],
				 ['Blues Major, Gycrimic', 
					'Rāga Lagan Gandhar'],
				 ['Rāga Marva', 'Rāga Pancama'],
				 ['Rāga Hamsanandi','Lydimic'],
				 ['Rāga Tulsikauns', 'Mixolimic'],
				 ['Dadimic']]
	},
  {name: 'Augmented', 
	 pattern: [3,1,3,1,3,1],
	mode_names: ['I · Augmented Hexatonic',
		 					 'II · Augmented Inverse'],
	 alt: [['minor third / half step scale',
				  'Rāga Devamani'],
				 ['Six Tone Symmetrical']]
	},
  {name: 'Tritone', 
	 pattern: [1,3,2,1,3,2],
	 mode_names: ['I · Stylimic',
		 						'II · Aeradimic',
								'III · Zyrimic'],
	 alt: [['Rāga Indupriya'],
				 ['Messiaen Mode 2,', 'Truncation 1'],
				 ['Rāga Neelangi']]
	},
  {name: '2S Tritone', 
	 pattern: [1,1,4,1,1,4],
	 mode_names: ['I · Stadimic',
								'II · Thodimic',
								'III · Thonimic'],
	 alt: [['Two-semitone tritone scale','Stadimic'],
				 ['Messiaen Mode 5'],
				 ['']]
	},
  {name: 'Whole Tone', 
	 pattern: [2,2,2,2,2,2],
	 alt: [['Play sequence 5 when', 
					'opening a treasure chest.']]
	},
  {name: 'Prometheus', 
	 pattern: [2,2,2,3,1,2],
		mode_names: ['I · Prometheus',
							'II · Bythimic',
							'III · Padimic', 
							'IV · Boptimic',
							'V · Stogimic',
							'VI · Inuit Hexatonic II'],
	 alt: [['The whole tone scale with',
				'one degree altered.',
				"Alexander Scriabin's",
				'\"mystic chord\"'],
				[''],[''],[''],[''],['']]
	},
	{name: 'Rāga Sarasvati', 
	 pattern: [2,4,1,2,1,2],
	 mode_names: ['I · Rāga Sarasvati',
		 						'II · Rāga Kamalamanohari',
								'III · Barimic', 
								'IV · Rāga Sindhura Kafi',
								'V · Sagimic',
								'VI · Aelothimic'],
	 alt: [['Socrimic'],
				 ['Modimic'],
		 		 [''],
				 ['Poptimic'],
				 [''],
				 ['']]
	},	
	{name: 'Rāga Suddha Bangala', 
	 pattern: [2,1,2,2,2,3],
	 mode_names: ['I · Rāga Suddha Bangala',
		 						'II · Rāga Gandharavam ',
								'III · Rāga Mruganandana', 
								'IV · Zeracrimic',
								'V · Rāga Navamanohari',
								'VI · Phracrimic'],
	 alt: [['Gauri Velavali','Aerathimic'],
				 ['Sabai Silt', 'Sarimic'],
		 		 ['Zoptimic'],
				 [''],
				 ['Khmer Hexatonic 3', 'Byptimic'],
				 ['']]
	},
	{name: 'Lydian Hexatonic', 
	 pattern: [2,2,3,2,2,1],
	 mode_names: ['I · Lydian Hexatonic',
								'II · Mixolydian Hexatonic',
								'III · Phrygian Hexatonic',
								'IV · Major Hexatonic',
		 						'V · minor hexatonic',
								'VI · Ritsu Onkai', 
],
	 alt: [['Rāga Kumud'],
				 ['Rāga Darbar'],
				 ['Rāga Gopikavasantam'],
				 ['Diatonic Hexachord',
					'Rāga Kambhoji',
					'Scottish Hexatonic'],
				 ['Rāga Manirangu', 
					'Palasi'],
		 		 ['Rāga Suddha Todi']]
	},
  {name: 'Major', 
	 pattern: [2,2,1,2,2,2,1],
	 mode_names: ['I · Ionian',    // major
								'II · Dorian',   // minor
								'III · Phrygian',// minor
								'IV · Lydian',   // major
								'V · Mixolydian',// major
								'VI · Aeolian',  // minor
								'VII · Locrian'],// minor
	 alt: [['Cheerful, upbeat, light.',
			   'Ionian, Maqam Cargah',
			   'Ararai, Peruvian Major'], // I
				 ['Solemn, profound,',
					'mysterious.',
					'Rāga Bageshri' ], // II
				 ['Intense, ominous.',
					'Rāga Asavari',
				  'Flamenco, Zokuso'], // III
				 ['Contemplative, warm.',
					'Rāga Shuddh Kalyan', 
					'Kung, Ping, Gu'], // IV
				 ['Satisfied, hopeful.',
					'Rāga Harini'], // V
				 ['Pensive, sad, dark, heavy.',
					'natural minor, Cushak,',
					'Rāga Adana, Ezel, Se'], // VI
				 ['Cold, spooky, conflicted.',
					'Yishtabach',
					'Thang Klang, Thang luk']] // VII
	},
  {name: 'natural minor', 
	 pattern: [2,1,2,2,1,2,2],
	 mode_names: ['I · Aeolian',
								'II · Locrian',
								'III · Ionian',
								'IV · Dorian',
								'V · Phrygian',
								'VI · Lydian',
								'VII · Mixolydian'],
	 alt: [['Aeolian mode of',
					'the diatonic scale'], 
				 ['Yishtabach',
					'Thang Klang, Thang luk'],
				 ['Ionian mode, Major',
					'Rāga Atana, Zè'],
				 ['Rāga Bageshri'],
				 ['Rāga Asavari','Zokuso'],
				 ['Rāga Shuddh Kalyan', 
					'Kung, Ping, Gu'],
				 ['Rāga Harini']]
	},
	{name: 'Jazz minor', 
	 pattern: [2,1,2,2,2,2,1],
	 mode_names: ['I · melodic minor',
								'II · Dorian ♭2',
								'III · Lydian ♯5',
								'IV · Acoustic',
								'V · Major-Minor',
								'VI · minor locrian',
								'VII · Superlocrian'],
	 alt: [['The melodic minor scale',
				 'In classical use, often',  // Rāga Patdip, Minor-Major
				 'descends as natural minor.'], // Melodic Minor Ascending
				 ['Phrygian ♯6',
					'Jazz minor inverse', 
					'Rāga Natabharanam'],
				 ['Lydian Augmented'],
				 ['Lydian Dominant',
					'Overtone Scale',
				  'Rāga Bhusavati'],
				 ['Mixolydian ♭6',
				 'Melodic Major, Hindu',
				 'Rāga Charukeshi'],
				 ['Half Diminished', 
					'Locrian ♯2'],
				 ['Altered Scale,',
					'Diminished Whole-tone']]
	},
  {name: 'harmonic minor', 
	 pattern: [2,1,2,2,1,3,1],
	 mode_names: ['I · harmonic minor',
								'II · Locrian ♮6',
								'III · Major Augmented',
								'IV · Lydian Diminished',
								'V · Phrygian Dominant',
								'VI · Aeolian Harmonic',
								'VII · Ultralocrian'],
	 alt: [['Rāga Kiranavali'],
				 ['Thyptian'], // II
				 ['Ionian ♯5', 'Phrothian'], // III
				 ['Ukrainian Dorian', 
					'Rāga Desisimharavam', 
					'Misheberekh'], // IV
				 ['Dorian Flamenco, Persian', 
					'Dominant ♭2 ♭6 (jazz)',
					'Rāga Jogiya, Spanish Romani', 
					'Freygish, Ahava Rabboh'], // V
				 ['Lydian ♯2', 
					'Rāga Kusumakaram'], // VI
				 ['Superlocrian Diminished', 
					'Superlocrian 𝄫']] // VII
	},  
  {name: 'Hungarian Major', 
	 pattern: [3,1,2,1,2,1,2],
	 mode_names: ['I · Hungarian Major', 
								'II · Alternating Heptamode',
								'III · Harmonic minor ♭5',
								'IV · Altered Dominant ♮6',
								'V · jazz minor ♯5',
								'VI · Ukrainian Dorian ♭2',
								'VII · Nohkan flute scale'],
	 alt: [['Rāga Nasamani', 
					'Mela Nasikabhusani'],
				 ['Ultralocrian 𝄫6'],
				 ['Locrian ♮2 and ♮7'],
				 ['Zyptian'],
				 ['Katothian'],
				 ['Mela Sadvidhamargini'],
				 ['Lydian Augmented ♯3']]
	},
  {name: 'Rāga Lalita', // slight variation of Double Harmonic Major or Byzantine scale
	 pattern: [1,3,1,1,2,3,1],
	 mode_names: ['I · Rāga Lalita', 
							'II · Mela Calanata',
							'III · Chrom. Phrygian Inv.',
							'IV · Todi That',
							'V · Chrom. Mixolydian Inv.',
							'VI · Chrom. Hypodorian Inv.',
							'VII · Chrom. Hypophrygian Inv.'],	 
	 alt: [['Persian scale'],
				 [''],
				 ['Chromatic Phrygian Inverse'],
				 [''],
				 ['Chromatic Mixolydian', 'Inverse'],
				 ['Chromatic Hypodorian', 'Inverse'],
				 ['Chromatic Hypophrygian', 'Inverse']]
	}, 
  {name: 'Double Harmonic Major', 
	 pattern: [1,3,1,2,1,3,1],
	 mode_names: ['I · Double Harmonic Major',
								'II · Lydian ♯2 ♯6',
								'III · Ultraphrygian',
								'IV · Double Harmonic minor',
								'V · Asian',
								'VI · Ionian Augmented ♯2',
								'VII · Locrian 𝄫3 𝄫7'
							 ],
	 alt: [['Byzantine, Rāga Paraj,', 
				 'Mela Mayamalavagaula' ,
				 'Hungarian Romani Major'],
				 ['Rāga Rasamanjari'],
				 ['Ionodian'],
		 		 ['Flamenco mode', 
		  	  'Hungarian/Gypsy minor', 
			    'Egyptian Heptatonic',
				  'Rāga Madhava Manohari'],
				 ['Rāga Ahira-Lalita',
					'"Oriental"',],
				 ['Hungarian Romani minor 3rd',
					'Docrian'],
				 ['Epadian']]
	},
	{name: 'Double harmonic minor', 
	 pattern: [2,1,3,1,1,3,1],
	 mode_names: ['I · Double harmonic minor', 
								'II · Asian',
								'III · Ionian Augmented ♯2',
								'IV · Locrian 𝄫3 𝄫7',
								'V · Double Harmonic Major',
								'VI · Lydian ♯2 ♯6',
								'VII · Ultraphrygian'],
	 alt: [['Flamenco mode', 
				 'Hungarian/Gypsy minor', 
				 'Egyptian Heptatonic',
				 'Rāga Madhava Manohari'],
				 ['Rāga Ahira-Lalita',
					'"Oriental"',],
				 ['Docrian'],
				 ['Epadian'],
				 ['Byzantine, Rāga Paraj,', 
				 'Mela Mayamalavagaula' ,
				 'Hungarian Romani Major'],
				 ['Rāga Rasamanjari'],
				 ['Ionodian']]
	},
  {name: 'Enigmatic', 
	 pattern: [1,3,2,2,2,1,1],
	 mode_names: ['I · Vishvambhari', 
							'II · Phraptian',
							'III · Mela Kantamani',
							'IV · Katythian',
							'V · Madian',
							'VI · Aerygian',
							'VII · Mela Manavati'],
	 alt: [["Verdi's Scala Enigmatica"],				
				[''],
				[''],
				[''],
				[''],
				[''],
				['']]
	},
  {name: 'Bebop Major', 
	 pattern: [2,2,1,2,1,1,2,1],
	 mode_names: ['I · Bebop Major', 
							  'II · Blues Scale II',
							  'III · Spanish Phrygian',
							  'IV · Gycryllic',
							  'V · Lyryllic',
							  'VI · Magen Abot 2',
							  'VII · Bebop harmonic minor',
							  'VIII · Moptyllic'],
	 alt: [['Derived from the', 'Ionian mode.'],
				 ['minor'],
				 [''],
				 [''],
				 [''],
				 ['minor'],
				 ['Merges the notes from',
				  'the relative natural minor',
					'and harmonic minor scales.'],
				 ['minor']]
	},
  {name: 'Bebop Dominant', 
	 pattern: [2,2,1,2,2,1,1,1],
	 alt: [['Major/Mixolydian Mixed',
					'Rāga Khamaj',
					'Chinese Eight-Tone'],
				 ['Rāga Mukhari',
					'Dorian/Aeolian Mixed'],
				 ['Phrygian/Locrian Mixed'],
				 ['Ichikotsuchô',
					'Rāga Yaman Kalyan',
					'Major/Lydian Mixed'],
				 ['Minor Bebop',
					'Dorian Bebop',
					'Rāga Zilla'],
				 ['Quartal Octamode',
					'Phrygian/Aeolian Mixed'],
				 ['Godyllic', 'minor'],
				 ['Prokofiev', 'minor']]
	},
  {name: 'Bebop melodic minor', 
	 pattern: [2,1,2,2,1,1,2,1],
	 mode_names: ['I · Ionacryllic', 
							  'II · Stylyllic',
							  'III · Dalyllic',
							  'IV · Ionyphyllic',
							  'V · Zaptyllic',
							  'VI · Garyllic',
							  'VII · Gathyllic',
							  'VIII · Mixopyryllic'],
	 alt: [['Derived from the', 
					'Jazz minor scale.', 
				 'Major 6th diminished scale'],
				 [''],
				 [''],
				 [''],
				 [''],
				 ['Shostakovich'],
				 [''],
				 ['']]
	},
  {name: '7th ♭5 diminished', 
	 pattern: [2,2,1,1, 2,2,1,1],
		mode_names: ['I · Messiaen Mode 6', 
							'II · Epotyllic',
							'III · Epidyllic',
							'IV · Van der Horst Octatonic'],
	 alt: [['Derived from the', 
					'Whole Tone scale.'],
				 [''],
				 [''],
				 ['']]
	},
  {name: 'Dominant diminished', 
	 pattern: [1,2,1,2,1,2,1,2],
	 mode_names: ['I · half-whole', 
							  'II · whole-half'],
	 alt: [['Diminished Blues',
					'The first six notes',
				  'approximate the Istrian scale.'],
				 ['Auxiliary diminished',
					'Fully diminished scale',
				  'Korsakovian scale']]
	}, 
	
  {name: 'Chromatic', 
	 pattern: [1,1,1,1,1,1, 1,1,1,1,1,1],
	 alt: [['Chroma is Greek for color.', 
				  'Chromaticism means adding',
				  'notes to add color',
					'to a diatonic scale.']]
	}
]

scale_types_arr = ['Pentatonic', 'Hexatonic', 'Heptatonic', 'Octatonic'] //, 'nonatonic'  ]

scale_pattern_7 = [1,1,2,2,1]
																		 
const mode_numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
let modes_arr = [...mode_numerals]

// The three major modes are: Ionian, Lydian and Mixolydian (dominant 7)
// the four minor modes are: Dorian, Phrygian, Aeolian and Locrian.
// Major modes are major because the third note 
// in their scale is a major 3rd above the tonic
// and the minor modes are minor as the third note in 
// their scale is a minor third above the tonic.

/* Intervals
0,  Perfect Unison, P1
1,  minor second, m2, semitone, half step
2,  Major second, M2, tone, whole tone, whole step
3,  minor third, m3, trisemitone
4,  Major third, M3
5,  Perfect fourth, P4
6,  ---- Tritone, TT
7,  Perfect fifth, P5
8,  minor sixth, m6
9,  Major sixth, M6
10, minor seventh, m7
11, Major seventh, M7
12, Perfect octave, P8

The commonly held consonant intervals in musical composition are as follows:
Minor 3rd, Major 3rd, Perfect 4th, Perfect 5th, Minor 6th, Major 6th and Octave [11]. 
The commonly held dissonant intervals are: Minor 2nd, Major 2nd, 
Tritone (the interval between the 4th and the 5th), Minor 7th and Major 7th [12].
*/