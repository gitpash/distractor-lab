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
		lateral: {
			title: "Латеральный",
			subtitle: "Маскировка",
			desc: "Коллинеарные флэнкеры",
			diffLabel: "Контраст цели",
		},
	},
	settings: {
		trials: "Испытаний:",
	},
	actions: {
		start: "Начать",
		skip: "Пропустить",
		demo: "Показать ориентации",
		playAgain: "Ещё раз",
		home: "На главную",
	},
	orientations: {
		horiz: "Горизонталь",
		diag1: "45°",
		vert: "Вертикаль",
		diag2: "135°",
		left: "Левый",
		right: "Правый",
	},
	game: {
		trialCounter: "Испытание {current}/{total}",
		accuracy: "Точность",
	},
	results: {
		title: "Тренировка завершена!",
		accuracy: "точность",
		trials: "Триалов",
		difficulty: "Финальная сложность",
		time: "Время",
	},
	history: {
		title: "Прогресс",
		clear: "Очистить историю",
	},
	calibration: {
		title: "Калибровка",
		description: "Мы измерим вашу контрастную чувствительность на разных пространственных частотах. Это поможет персонализировать тренировку.",
		frequencies: "Пространственные частоты",
		orientations: "Ориентации",
		total: "Всего",
		trials: "испытаний",
		point: "Точка",
		threshold: "Порог",
	},
};
