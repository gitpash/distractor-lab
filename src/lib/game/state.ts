import type { GameState, OrientKey, Eye } from './types';
import { MODES } from '$lib';
import { ORIENTATIONS } from '$lib';

export function createGameState(mode: string, numTrials: number, eye: Eye = 'both'): GameState {
  const modeConfig = MODES[mode as keyof typeof MODES];
  return {
    running: true,
    phase: 'idle',
    trial: 0,
    correct: 0,
    total: 0,
    invalidTrials: 0,
    difficulty: modeConfig.diffStart,
    currentMode: mode,
    currentTrial: null,
    waitingForResponse: false,
    hitWindow: [],
    hitWindowSize: 8,
    numTrials,
    startTime: Date.now(),
    lastAnswerCorrect: null,
    lastAnswerKey: null,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    stimulusDuration: 200,
    isi: 500,
    eye,
    paused: false,
    replayCount: 0,
    maxReplays: 2,
  };
}

export function nextTrial(state: GameState) {
  if (state.trial >= state.numTrials) {
    state.phase = 'done';
    state.running = false;
    return;
  }

  state.trial++;
  state.waitingForResponse = false;
  state.lastAnswerCorrect = null;
  state.lastAnswerKey = null;
  state.replayCount = 0;

  const mode = MODES[state.currentMode as keyof typeof MODES];
  const phase = Math.random() * Math.PI * 2;
  state.currentTrial = mode.buildTrial(state.difficulty, phase);
  state.phase = 'fixation';
}

export function processAnswer(state: GameState, key: string) {
  if (!state.waitingForResponse || !state.running || !state.currentTrial) return;

  state.waitingForResponse = false;
  state.lastAnswerKey = key;

  const mode = MODES[state.currentMode as keyof typeof MODES];
  const isCorrect =
    mode.type === '2afc'
      ? parseInt(key) === state.currentTrial.correct
      : key === state.currentTrial.correct;

  state.total++;
  state.lastAnswerCorrect = isCorrect;

  if (isCorrect) {
    state.correct++;
  }

  // ── 1-up/3-down staircase (Polat & Sagi paradigm) ────────────────
  // 1 correct → increase difficulty (1-up)
  // 3 consecutive incorrect → decrease difficulty (3-down)
  // Converges to ~79% accuracy for 2AFC tasks.
  // Reference: Watson & Pelli (1983), Polat et al. (2004)

  if (isCorrect) {
    state.consecutiveCorrect++;
    state.consecutiveIncorrect = 0;

    // 1-up: any correct answer → make harder
    state.difficulty = mode.diffLower
      ? Math.max(mode.diffMin, state.difficulty - mode.diffStep)
      : Math.min(mode.diffMax, state.difficulty + mode.diffStep);
  } else {
    state.consecutiveIncorrect++;
    state.consecutiveCorrect = 0;

    // 3-down: 3 consecutive incorrect → make easier
    if (state.consecutiveIncorrect >= 3) {
      state.difficulty = mode.diffLower
        ? Math.min(mode.diffMax, state.difficulty + mode.diffStep)
        : Math.max(mode.diffMin, state.difficulty - mode.diffStep);
      state.consecutiveIncorrect = 0;
    }
  }

  // Update hit window for display purposes
  state.hitWindow.push(isCorrect);
  if (state.hitWindow.length > state.hitWindowSize) state.hitWindow.shift();

  state.phase = 'feedback';
}

export function skipTrial(state: GameState) {
  if (!state.waitingForResponse || !state.running) return;

  state.waitingForResponse = false;
  state.total++;
  state.invalidTrials++;
  state.lastAnswerCorrect = null;
  state.lastAnswerKey = null;

  // Skip does NOT affect staircase — invalid trial, not an error.
  // Only updates hit window for display purposes.
  state.hitWindow.push(false);
  if (state.hitWindow.length > state.hitWindowSize) state.hitWindow.shift();

  state.phase = 'feedback';
}

export function getAccuracy(state: GameState): string {
  if (state.total === 0) return '—';
  return ((state.correct / state.total) * 100).toFixed(0) + '%';
}

export function getProgress(state: GameState): number {
  return (state.trial / state.numTrials) * 100;
}

export function getDifficultyDisplay(state: GameState): string {
  const mode = MODES[state.currentMode as keyof typeof MODES];
  return mode.diffLabel + ': ' + mode.diffFormat(state.difficulty);
}

export function getCorrectAnswerLabel(state: GameState): string {
  if (!state.currentTrial) return '';

  const mode = MODES[state.currentMode as keyof typeof MODES];
  if (mode.type === '2afc') {
    return state.currentTrial.correct === 0 ? 'Left' : 'Right';
  }

  const orientKey = state.currentTrial.correct as OrientKey;
  const o = ORIENTATIONS[orientKey];
  return o.symbol + ' ' + o.labelKey.split('.').pop();
}

// ── Adaptive stimulus timing ────────────────────────────────────────
// Duration adapts based on recent accuracy:
// - High accuracy (>80%) → decrease duration (harder, min 100ms)
// - Low accuracy (<60%) → increase duration (easier, max 200ms)
// Reference: Polat U (2009) Vision Research.
// Typical perceptual learning protocols: 100-200ms exposure.

export function updateStimulusDuration(state: GameState) {
  const recentAcc = state.hitWindow.length > 0
    ? state.hitWindow.filter(Boolean).length / state.hitWindow.length
    : 0.5;

  if (recentAcc > 0.8 && state.stimulusDuration > 100) {
    state.stimulusDuration = Math.max(100, state.stimulusDuration - 15);
  } else if (recentAcc < 0.6 && state.stimulusDuration < 200) {
    state.stimulusDuration = Math.min(200, state.stimulusDuration + 15);
  }
}
