export default {
	app: {
		title: "Тренажер зрения Габора",
		subtitle: "Тренируйте контрастную чувствительность и остроту зрения. Определяйте ориентацию полосок на Gabor-паттернах. Сложность подстраивается автоматически.",
	},
	modes: {
		classic: {
			title: "Классический",
			subtitle: "Контраст",
			desc: "Адаптивный контраст",
			diffLabel: "Контраст",
		},
		frequency: {
			title: "Частота",
			subtitle: "Пространство",
			desc: "Ширина полос",
			diffLabel: "Частота",
		},
		noise: {
			title: "Шум",
			subtitle: "Сигнал/шум",
			desc: "Полосы в шуме",
			diffLabel: "Шум",
		},
		fine: {
			title: "Детальный",
			subtitle: "2АФЗ",
			desc: "Какой был более наклонён?",
			diffLabel: "Разница углов",
		},
		combo: {
			title: "Комбо",
			subtitle: "Смесь",
			desc: "Случайный стимул",
			diffLabel: "Контраст",
		},
	},
	settings: {
		trials: "Испытаний:",
	},
	actions: {
		start: "Начать",
	},
	orientations: {
		horiz: "Горизонталь",
		diag1: "45°",
		vert: "Вертикаль",
		diag2: "135°",
	},
	game: {
		trialCounter: "Испытание {current}/{total}",
	},
};
