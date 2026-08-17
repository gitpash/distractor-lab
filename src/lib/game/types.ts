export type OrientKey = 'horiz' | 'diag1' | 'vert' | 'diag2';

export interface PatchParams {
  orient?: OrientKey;
  angle?: number;
  contrast: number;
  spatialFreq: number;
  sigma: number;
  noise: number;
  phase: number;
}

export interface LateralMaskingTrialPatch {
  type: 'lateral';
  orient?: OrientKey;
  angle?: number;
  targetContrast: number;
  flankerContrast: number;
  spatialFreq: number;
  sigma: number;
  flankerDistance: number;
  phase: number;
}

export interface Trial {
  patches: (PatchParams | LateralMaskingTrialPatch)[];
  correct: OrientKey | number;
}

export type GamePhase = 'idle' | 'fixation' | 'stimulus' | 'blank' | 'waiting' | 'feedback' | 'done';

export interface GameState {
  running: boolean;
  phase: GamePhase;
  trial: number;
  correct: number;
  total: number;
  difficulty: number;
  currentMode: string;
  currentTrial: Trial | null;
  waitingForResponse: boolean;
  hitWindow: boolean[];
  hitWindowSize: number;
  numTrials: number;
  startTime: number;
  lastAnswerCorrect: boolean | null;
  lastAnswerKey: string | null;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  stimulusDuration: number; // ms, adaptive: 80-320ms
  isi: number; // ms, inter-stimulus interval: 500ms
}

export interface HistoryEntry {
  date: string;
  mode: string;
  modeTitle: string;
  accuracy: number;
  trials: number;
  difficulty: number;
  difficultyLabel: string;
  elapsed: number;
}
