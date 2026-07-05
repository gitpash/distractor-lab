import type { GameState, OrientKey } from './types';
import { MODES } from '$lib';
import { ORIENTATIONS } from '$lib';

export function createGameState(mode: string, numTrials: number): GameState {
  const modeConfig = MODES[mode as keyof typeof MODES];
  return {
    running: true,
    phase: 'idle',
    trial: 0,
    correct: 0,
    total: 0,
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

  // Staircase
  state.hitWindow.push(isCorrect);
  if (state.hitWindow.length > state.hitWindowSize) state.hitWindow.shift();

  const recentAcc = state.hitWindow.filter(Boolean).length / state.hitWindow.length;

  if (recentAcc >= 0.75) {
    state.difficulty = mode.diffLower
      ? Math.max(mode.diffMin, state.difficulty - mode.diffStep)
      : Math.min(mode.diffMax, state.difficulty + mode.diffStep);
  } else if (recentAcc <= 0.4) {
    state.difficulty = mode.diffLower
      ? Math.min(mode.diffMax, state.difficulty + mode.diffStep)
      : Math.max(mode.diffMin, state.difficulty - mode.diffStep);
  }

  state.phase = 'feedback';
}

export function skipTrial(state: GameState) {
  if (!state.waitingForResponse || !state.running) return;

  state.waitingForResponse = false;
  state.total++;
  state.lastAnswerCorrect = null;
  state.lastAnswerKey = null;
  state.hitWindow.push(false);
  if (state.hitWindow.length > state.hitWindowSize) state.hitWindow.shift();

  const mode = MODES[state.currentMode as keyof typeof MODES];
  const recentAcc = state.hitWindow.filter(Boolean).length / state.hitWindow.length;

  if (recentAcc <= 0.4) {
    state.difficulty = mode.diffLower
      ? Math.min(mode.diffMax, state.difficulty + mode.diffStep)
      : Math.max(mode.diffMin, state.difficulty - mode.diffStep);
  }

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
