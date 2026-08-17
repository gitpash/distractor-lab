export default {
	app: {
		title: "Gabor Vision Trainer",
		subtitle: "Train contrast sensitivity and visual acuity. Identify stripe orientation in Gabor patterns. Difficulty adapts automatically.",
	},
	modes: {
		classic: {
			title: "Classic",
			subtitle: "Contrast",
			desc: "Adaptive contrast",
			diffLabel: "Contrast",
		},
		frequency: {
			title: "Frequency",
			subtitle: "Space",
			desc: "Stripe width",
			diffLabel: "Frequency",
		},
		noise: {
			title: "Noise",
			subtitle: "Signal/noise",
			desc: "Stripes in noise",
			diffLabel: "Noise",
		},
		fine: {
			title: "Fine",
			subtitle: "2AFC",
			desc: "Which tiled more?",
			diffLabel: "Angle difference",
		},
		combo: {
			title: "Combo",
			subtitle: "Mix",
			desc: "Random stimulus",
			diffLabel: "Contrast",
		},
		lateral: {
			title: "Lateral",
			subtitle: "Masking",
			desc: "Collinear flankers",
			diffLabel: "Target contrast",
		},
	},
	settings: {
		trials: "Trials:",
	},
	actions: {
		start: "Start",
		skip: "Skip",
		demo: "Show Orientations",
		playAgain: "Play Again",
		home: "Home",
	},
	orientations: {
		horiz: "Horizontal",
		diag1: "45°",
		vert: "Vertical",
		diag2: "135°",
		left: "Left",
		right: "Right",
	},
	game: {
		trialCounter: "Trial {current}/{total}",
		accuracy: "Accuracy",
	},
	results: {
		title: "Training Complete!",
		accuracy: "accuracy",
		trials: "Trials",
		difficulty: "Final difficulty",
		time: "Time",
	},
	history: {
		title: "Progress",
		clear: "Clear history",
	},
	calibration: {
		title: "Calibration",
		description: "We'll measure your contrast sensitivity at different spatial frequencies. This helps personalize your training.",
		frequencies: "Spatial frequencies",
		orientations: "Orientations",
		total: "Total",
		trials: "trials",
		point: "Point",
		threshold: "Threshold",
	},
};
