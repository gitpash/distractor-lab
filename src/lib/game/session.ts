// ── Session Protocol ─────────────────────────────────────────────────
// Manages 30-minute training sessions with structured phases.
// Based on: RevitalVision clinical protocol (30 min, 3-4x/week, 2-4 months).

import type { OrientKey } from './types';

export type SessionPhase = 'warmup' | 'training' | 'cooldown' | 'complete';

export interface SessionConfig {
  totalDurationMs: number;      // 30 minutes = 1,800,000 ms
  warmupDurationMs: number;     // 5 minutes = 300,000 ms
  cooldownDurationMs: number;   // 5 minutes = 300,000 ms
  trainingDurationMs: number;   // 20 minutes = 1,200,000 ms
  warmupFreqStart: number;      // starting spatial freq for warmup (low)
  cooldownFreq: number;         // fixed freq for cooldown assessment
  progressionRate: number;      // how fast to increase freq across sessions (0-1)
}

export interface SessionState {
  running: boolean;
  phase: SessionPhase;
  startTime: number;
  phaseStartTime: number;
  elapsed: number;              // total elapsed ms
  phaseElapsed: number;         // current phase elapsed ms
  currentFreq: number;          // current spatial frequency
  currentSession: number;       // session number (for progression)
  totalSessions: number;        // total sessions planned
  trialCount: number;           // trials in current session
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  totalDurationMs: 30 * 60 * 1000,      // 30 minutes
  warmupDurationMs: 5 * 60 * 1000,      // 5 minutes
  cooldownDurationMs: 5 * 60 * 1000,    // 5 minutes
  trainingDurationMs: 20 * 60 * 1000,   // 20 minutes
  warmupFreqStart: 0.02,                // low frequency (~2 cpd)
  cooldownFreq: 0.03,                   // medium frequency (~4 cpd)
  progressionRate: 0.1,                 // 10% increase per session
};

export function createSessionState(
  sessionNumber: number = 1,
  totalSessions: number = 40
): SessionState {
  return {
    running: true,
    phase: 'warmup',
    startTime: Date.now(),
    phaseStartTime: Date.now(),
    elapsed: 0,
    phaseElapsed: 0,
    currentFreq: DEFAULT_SESSION_CONFIG.warmupFreqStart,
    currentSession: sessionNumber,
    totalSessions,
    trialCount: 0,
  };
}

export function getSessionPhaseDuration(phase: SessionPhase): number {
  switch (phase) {
    case 'warmup': return DEFAULT_SESSION_CONFIG.warmupDurationMs;
    case 'training': return DEFAULT_SESSION_CONFIG.trainingDurationMs;
    case 'cooldown': return DEFAULT_SESSION_CONFIG.cooldownDurationMs;
    case 'complete': return 0;
  }
}

export function updateSessionTimer(state: SessionState): void {
  const now = Date.now();
  state.elapsed = now - state.startTime;
  state.phaseElapsed = now - state.phaseStartTime;
}

export function advanceSessionPhase(state: SessionState): SessionPhase {
  switch (state.phase) {
    case 'warmup':
      state.phase = 'training';
      state.phaseStartTime = Date.now();
      state.phaseElapsed = 0;
      // Progress frequency for training phase
      state.currentFreq = getProgressedFrequency(state);
      break;
    case 'training':
      state.phase = 'cooldown';
      state.phaseStartTime = Date.now();
      state.phaseElapsed = 0;
      state.currentFreq = DEFAULT_SESSION_CONFIG.cooldownFreq;
      break;
    case 'cooldown':
      state.phase = 'complete';
      state.running = false;
      break;
  }
  return state.phase;
}

// Calculate frequency progression based on session number
// Start low, gradually increase across sessions
function getProgressedFrequency(state: SessionState): number {
  const baseFreq = DEFAULT_SESSION_CONFIG.warmupFreqStart;
  const maxFreq = 0.09; // ~12 cpd
  const rate = DEFAULT_SESSION_CONFIG.progressionRate;

  // Linear progression with some randomness
  const progress = Math.min(1, (state.currentSession - 1) / (state.totalSessions * 0.8));
  const targetFreq = baseFreq + (maxFreq - baseFreq) * progress;

  // Add small random variation (±10%)
  const variation = 1 + (Math.random() * 0.2 - 0.1);
  return Math.min(maxFreq, targetFreq * variation);
}

export function shouldAdvancePhase(state: SessionState): boolean {
  const phaseDuration = getSessionPhaseDuration(state.phase);
  return state.phaseElapsed >= phaseDuration;
}

export function getProgressPercent(state: SessionState): number {
  return Math.min(100, (state.elapsed / DEFAULT_SESSION_CONFIG.totalDurationMs) * 100);
}

export function getPhaseProgressPercent(state: SessionState): number {
  const phaseDuration = getSessionPhaseDuration(state.phase);
  if (phaseDuration === 0) return 100;
  return Math.min(100, (state.phaseElapsed / phaseDuration) * 100);
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getSessionSummary(state: SessionState): {
  duration: string;
  trials: number;
  phase: SessionPhase;
  session: number;
  totalSessions: number;
} {
  return {
    duration: formatTime(state.elapsed),
    trials: state.trialCount,
    phase: state.phase,
    session: state.currentSession,
    totalSessions: state.totalSessions,
  };
}
