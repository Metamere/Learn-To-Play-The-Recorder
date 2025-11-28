const instruments_arr = [
	{name: "Sub-contrabass", lowest: -40, key: 'F1'}, // or double contrabass or octocontrabass
	{name: "Sub-great bass", lowest: -33, key: 'C2'}, // or Contra great bass
	{name: "Contrabass", lowest: -28, key: 'F2'}, // or Sub-bass
	{name: "Great Bass", lowest: -21, key: 'C3'}, // aka Quart-bass
	{name: "Bass", lowest: -16, key: 'F3'}, // aka Basset
	{name: "Tenor", lowest: -9, key: 'C4'},
	{name: "Alto", lowest: -4, key: 'F4'}, // or Treble
	{name: "Soprano", lowest: 3, key: 'C5'},  // or Descant
	{name: "Sopranino", lowest: 8, key: 'F5'},
	{name: "Sopranissimo", lowest: 15, key: 'C6'} // or Garklein (German for "quite small") or Piccolo
]

const recorder_fingerings = [
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
[2,1,2,1,1,0,1,1,1], // C♯ D♭   F♯ // Gb close bell
[2,1,0,1,1,0,1,2],  // D,      G // need to change for lower instruments
[2,0,1,1,0,1,1,0]  // D♯ E♭,  G♯ A♭ // need to exclude for bass instruments
]

const bass_alt_fingering = [1,1,1,0,1,1,0,0]

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

function C_to_F(array_C){
	return [...array_C.slice(5).concat(array_C.slice(0,5))]
}

const notes_arr_F = C_to_F(notes_arr_C)

const major_key_signatures_C = [
	["C",0],    ["D♭",5], ["D",2], ["E♭",3], ["E",4],  ["F",1],
	["F♯/G♭",6], ["G",1], ["A♭",4], ["A",3], ["B♭",2], ["B",5]
]

// const major_accidental_counts_list_C = [0, 5, 2, 3, 4, 1,
// 																         6, 1, 4, 3, 2, 5]

// const minor_accidental_counts_list_C = [3, 4, 1, 6, 1, 4,
// 																         3, 2, 5, 0, 5, 2]

const order_of_flats_full =  ['B', 'E','A', 'D', 'G', 'C', 'F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭']
const order_of_sharps_full = ['F', 'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'D♯', 'A♯']

const order_of_flats =  'BEADGCF'
const order_of_sharps = 'FCGDAEB'

// const major_accidental_list_C = [
// 	'natural', 'flat', 'sharp', 'flat', 'sharp', 'flat',
// 	'either',	 'sharp','flat',  'sharp','flat',  'sharp'
// ]

const minor_key_signatures_C = [
	["c",3], ["c♯",4], ["d",1],  ["d♯/e♭",6], ["e",1],  ["f",4],
	["f♯",3],["g",2],  ["g♯",5], ["a",0],     ["b♭",5], ["b",2]
]

// const minor_accidental_list_C = [
// 	'flat', 'sharp','flat', 'either', 'sharp','flat',
// 	'sharp','flat', 'sharp','natural','flat', 'sharp'
// ]

const major_key_signatures_F = C_to_F(major_key_signatures_C)
const minor_key_signatures_F = C_to_F(minor_key_signatures_C)

// const major_accidental_counts_list_F = C_to_F(major_accidental_counts_list_C)
// const minor_accidental_counts_list_F = C_to_F(minor_accidental_counts_list_C)

// const major_accidental_list_F = C_to_F(major_accidental_list_C)
// const minor_accidental_list_F = C_to_F(minor_accidental_list_C)

// const derived_scale_mapping = [
// [['Major',0],['Palinese Pelog',4],['Major Hexatonic',0],['Bebop Major',0]],
// [['Major',1],['Balinese Pelog',1],['Kokin-joshi',4]],
// [['Major',2],['Kokin-joshi',0,]],
// [['Major',3],['Hon-kumoi-joshi',1]],
// [['Major',4],['Mixolydian Pentatonic',0]],
// [['Major',5],['Hon-kumoi-joshi',2]],
// [['Major',6],['Kokin-joshi',3]]
// ]
/*
-need to figure out a way to generate this list programatically when the scale family toggle is activated.
then the prev, next would move within this list? or just use the scale up and down?
-would need to compare each mode of a scale with every other scale's modes (except the chromatic scale), 
unless the set to compare can be pruned first. Any other scales that won't match up with others?
What would be the criteria? One of the scales is a subset of the other, 
meaning the one with the fewer notes has all of its notes contained in the larger one.
Could also have where one note is different from the other. 
Would need to exclude comparisons of modes within each scale.
Maybe just run it for the currently selected scale when the button is pressed.
have an "alternate history" list that would be gone through when button is active, and alternate_history is true.
*/

// note: if adding a new scale, the numbers must add up to the note count so that it starts at the same note on each octave
const scales_arr = [
  {name: 'Balinese Pelog', 
	 pattern: [1,2,4,1,4],
	 mode_names: ['I · Phrygian Pentatonic', 
								'II · Raga Vaijayanti',
								'III · Raga Khamaji Durga', 
								'IV · African Pentatonic 4',
								'V · Ionian Pentatonic'],
	 alt: [['Subset of Phrygian mode',
					'Pelog = beautiful'],
				 [''],
				 [''],
				 [''],
				 ['']]
	},
  {name: 'Hon-kumoi-joshi', 
	 pattern: [1,4,2,1,4],
	 mode_names: ['I · Hon-kumoi-joshi',
		 						'II · Lydian Pentatonic',
								'III · Aeolian Pentatonic',
								'IV · Iwato', 
								'V · Raga Bhinna Shadja'],
	 alt: [['Sakura scale',
				 'Raga Salanganata'],
				 ['Hirajoshi',
					'Raga Amritavarshini'],
				 ['Yona Nuki minor'],
				 [''],
				 ['']]
	},
	{name: 'Kokin-joshi', 
	 pattern: [1,4,2,3,2],
	 mode_names: ['I · Kokin-joshi', 
								'II · Raga Hindol',
								'III · Han-kumoi', 
								'IV · Locrian Pentatonic',
								'V · Dorian Pentatonic'],
	 alt: [['Subset of Phrygian mode',
					'Miyakobushi',
				 'In Sen, Han-Iwato'],
				 [''],
				 ['Raga Shobhavari'], 
				 ['Raga Jayakauns'],
				 ['Kumoi',
					'Raga Shivranjani']]
	},
	{name: 'Mixolydian Pentatonic', 
	 pattern: [4,1,2,3,2],
	 mode_names: ['I · Mixolydian Pentatonic', 
								'II · Raga Chhaya Todi',
								'III · Raga Desh', 
								'IV · Raga Chandrakauns',
								'V · Raga Shree Kalyan'],
	 alt: [['Subset of Mixolydian mode',
					'Raga Savethri'],
				 [''],
				 [''], 
				 [''],
				 ['']]
	},  
  {name: 'Dominant Pentatonic', 
	 pattern: [2,2,3,3,2],
	 mode_names: ['I · Dominant Pentatonic',
								'II · Staditonic',
								'III · Raga Harikauns',
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
	 alt: [['Ryosen, Man Jue,',
				 'Raga Bhopali'],
				 ['Qing Yu', 
					'Rāga Madhyamavati'],
				 ['Quan Ming, Jiao, Yi Ze', 
					'Rāga Hindola'],
				 ['Ritusen, Zheng', 
					'Rāga Devakriya'],
				['Min\'yo scale', 
					'Rāga Dhani']
				]
	},
  {name: 'minor pentatonic', 
	 pattern: [3,2,2,3,2],
	 mode_names: ['I · minor pentatonic',
								'II · Major Pentatonic', 
								'III · Suspended Pentatonic',
								'IV · Man Gong',
								'V · Scottish Pentatonic'],
	 alt: [['Min\'yo scale', 
					'Rāga Dhani'],
				 ['Ryosen, Man Jue,',
				 'Raga Bhopali'],
				 ['Qing Yu', 
					'Rāga Madhyamavati'],
				 ['Quan Ming, Jiao, Yi Ze', 
					'Rāga Hindola'],
				 ['Ritusen, Zheng', 
					'Rāga Devakriya']]
	},
	// 4,1,2,3,2 = Hindu, Indian, or Mixolydian Pentatonic
  {name: 'Blues', 
	 pattern: [3,2,1,1,3,2],
	 alt: [['Hexatonic Blues,', 
					'minor Pentatonic +1',
				  'Raga Nileshwari'],
				 ['Gycrimic'],
				 ['Pyrimic'],
				 ['Raga Hamsanandi','Lydimic'],
				 ['Mixolimic'],
				 ['Dadimic']]
	},
  {name: 'Augmented', 
	 pattern: [3,1,3,1,3,1],
	mode_names: ['I · Augmented Hexatonic',
		 					 'II · Augmented Inverse'],
	 alt: [['minor third / half step scale',
				  'Raga Devamani'],
				 ['Six Tone Symmetrical']]
	},
  {name: 'Tritone', 
	 pattern: [1,3,2,1,3,2],
	 mode_names: ['I · Stylimic',
		 						'II · Aeradimic',
								'III · Zyrimic'],
	 alt: [['Raga Indupriya','Stylimic'],
				 ['Messiaen Mode 2,', 'Truncation 1'],
				 ['Raga Neelangi']]
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
	 alt: [['The whole tone scale with',
				'one degree altered.',
				'Alexander Scriabin\'s',
				'\"mystic chord\"']]
	},
	{name: 'Raga Sarasvati', 
	 pattern: [2,4,1,2,1,2],
	 mode_names: ['I · Raga Sarasvati',
		 						'II · Raga Kamalamanohari',
								'III · Barimic', 
								'IV · Raga Sindhura Kafi',
								'V · Sagimic',
								'VI · Aelothimic'],
	 alt: [['Socrimic'],
				 ['Modimic'],
		 		 [''],
				 ['Poptimic'],
				 [''],
				 ['']]
	},	
	{name: 'Raga Suddha Bangala', 
	 pattern: [2,1,2,2,2,3],
	 mode_names: ['I · Raga Suddha Bangala',
		 						'II · Raga Gandharavam ',
								'III · Raga Mruganandana', 
								'IV · Zeracrimic',
								'V · Raga Navamanohari',
								'VI · Phracrimic'],
	 alt: [['Gauri Velavali','Aerathimic'],
				 ['Sabai Silt', 'Sarimic'],
		 		 ['Zoptimic'],
				 [''],
				 ['Khmer Hexatonic 3', 'Byptimic'],
				 ['']]
	},
	{name: 'Major Hexatonic', 
	 pattern: [2,2,1,2,2,3],
	 mode_names: ['I · Major Hexatonic',
		 						'II · minor hexatonic',
								'III · Ritsu Onkai', 
								'IV · Lydian Hexatonic',
								'V · Mixolydian Hexatonic',
								'VI · Phrygian Hexatonic'],
	 alt: [['Diatonic Hexachord',
					'Raga Kambhoji',
					'Scottish Hexatonic'],
				 ['Raga Manirangu', 
					'Palasi'],
		 		 ['Raga Suddha Todi'],
				 ['Raga Kumud'],
				 ['Raga Darbar'],
				 ['Raga Gopikavasantam']]
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
	 alt: [['Ionian mode of',
					'the diatonic scale.', 
					'Cheerful, upbeat, light.'], // I
				 ['Solemn, profound,',
					'mysterious.',
					'Raga Bageshri' ], // II
				 ['Intense, ominous.',
					'Raga Asavari',
				  'Flamenco, Zokuso'], // III
				 ['Contemplative, warm.',
					'Raga Shuddh Kalyan', 
					'Kung, Ping, Gu'], // IV
				 ['Satisfied, hopeful.',
					'Raga Harini'], // V
				 ['Pensive, sad, dark, heavy.',
					'Raga Jaunpuri, minor scale', 
					'Melodic minor descending'], // VI
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
					'Raga Atana, Zè'],
				 ['Raga Bageshri'],
				 ['Raga Asavari','Zokuso'],
				 ['Raga Shuddh Kalyan', 
					'Kung, Ping, Gu'],
				 ['Raga Harini']]
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
				 'In classical use, often',  // Raga Patdip, Minor-Major
				 'descends as natural minor.'], // Melodic Minor Ascending
				 ['Phrygian ♯6',
					'Jazz minor inverse', 
					'Raga Natabharanam'],
				 ['Lydian Augmented'],
				 ['Lydian Dominant',
					'Overtone Scale',
				  'Raga Bhusavati'],
				 ['Mixolydian ♭6',
				 'Melodic Major, Hindu',
				 'Raga Charukeshi'],
				 ['Half Diminished', 
					'Locrian ♯2'],
				 ['Altered Scale,',
					'Diminished Whole-tone']]
	},
		// {name: 'Neapolitan Major', // Should I include these two Neapolitan scales? Not sure. Similar, and not great.
		// pattern: [1,2,2,2,2,2,1],
		// alt:[['']]},
		// {name: 'Neapolitan minor', 
		// pattern: [1,2,2,2,1,3,1],
		//  alt:[['']]},		
	// {name: 'Harmonic Major',
		// pattern: [2,2,1,2,1,3,1],
		//  alt:[['Raga Haripriya, Ethiopian', 'Tabahaniotikos, Mela Sarasangi']]},
  {name: 'harmonic minor', 
	 pattern: [2,1,2,2,1,3,1],
	 mode_names: ['I · harmonic minor',
								'II · Locrian ♮6',
								'III · Major Augmented',
								'IV · Lydian Diminished',
								'V · Phrygian Dominant',
								'VI · Aeolian Harmonic',
								'VII · Ultralocrian'],
	 alt: [['Raga Kiranavali'],
				 ['Thyptian'], // II
				 ['Ionian ♯5', 'Phrothian'], // III
				 ['Ukrainian Dorian', 
					'Raga Desisimharavam', 
					'Misheberekh'], // IV
				 ['Dorian Flamenco, Persian', 
					'Dominant ♭2 ♭6 (jazz)',
					'Raga Jogiya, Spanish Romani', 
					'Freygish, Ahava Rabboh'], // V
				 ['Lydian ♯2', 
					'Raga Kusumakaram'], // VI
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
								'VII · Nohkan flute scale'
							 ],
	 alt: [['Raga Nasamani', 
					'Mela Nasikabhusani'],
				 ['Ultralocrian 𝄫6'],
				 ['Locrian ♮2 and ♮7'],
				 ['Zyptian'],
				 ['Katothian'],
				 ['Mela Sadvidhamargini'],
				 ['Lydian Augmented ♯3']]
	},
  {name: 'Raga Lalita', // slight variation of Double Harmonic Major or Byzantine scale
	 pattern: [1,3,1,1,2,3,1],
	 mode_names: ['I · Raga Lalita', 
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
	 alt: [['Byzantine, Raga Paraj,', 
				 'Mela Mayamalavagaula' ,
				 'Hungarian Romani Major'],
				 ['Raga Rasamanjari'],
				 ['Ionodian'],
		 		 ['Flamenco mode', 
		  	  'Hungarian/Gypsy minor', 
			    'Egyptian Heptatonic',
				  'Raga Madhava Manohari'],
				 ['Raga Ahira-Lalita',
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
				 'Raga Madhava Manohari'],
				 ['Raga Ahira-Lalita',
					'"Oriental"',],
				 ['Docrian'],
				 ['Epadian'],
				 ['Byzantine, Raga Paraj,', 
				 'Mela Mayamalavagaula' ,
				 'Hungarian Romani Major'],
				 ['Raga Rasamanjari'],
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
	 alt: [['Verdi\'s Scala Enigmatica'],				
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
					'Raga Khamaj',
					'Chinese Eight-Tone'],
				 ['Raga Mukhari',
					'Dorian/Aeolian Mixed'],
				 ['Phrygian/Locrian Mixed'],
				 ['Ichikotsuchô',
					'Raga Yaman Kalyan',
					'Major/Lydian Mixed'],
				 ['Minor Bebop',
					'Dorian Bebop',
					'Raga Zilla'],
				 ['Quartal Octamode',
					'Phrygian/Aeolian Mixed'],
				 ['Godyllic', 'minor'],
				 ['Prokofiev', 'minor']]
	},
	// {name: 'bebop minor', 
	//  pattern: [2,1,1,1,2,2,1,2],
	//  alt: [['Dorian Bebop','Raga Zilla','Mixodyllic'],
	// 			 ['Quartal Octamode'],
	// 			 ['Godyllic'],
	// 			 ['Prokofiev'],
	// 			 ['Dominant Bebop'],
	// 			 ['Raga Mukhari'],
	// 			 ['Phrygian/Locrian'],
	// 			 ['Ichikotsuchô','Raga Yaman Kalyan']]
	// },
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
	// {name: 'bebop harmonic minor', 
	//  pattern: [2,1,2,2,1,2,1,1],
	//  alt: [['Merges the notes from',
	// 			 'the relative natural minor',
	// 			 'and harmonic minor scales.']]
	// },
  {name: '7th ♭5 diminished', 
	 pattern: [2,2,1,1, 2,2,1,1],
	 alt: [['Derived from the', 
					'Whole Tone scale.', 
					'Messiaen Mode 6'],
				 [''],
				 [''],
				 [''],
				 [''],
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
var modes_arr = [...mode_numerals]

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
10,	minor seventh, m7
11,	Major seventh, M7
12, Perfect octave, P8

The commonly held consonant intervals in musical composition are as follows:
Minor 3rd, Major 3rd, Perfect 4th, Perfect 5th, Minor 6th, Major 6th and Octave [11]. 
The commonly held dissonant intervals are: Minor 2nd, Major 2nd, 
Tritone (the interval between the 4th and the 5th), Minor 7th and Major 7th [12].
*/