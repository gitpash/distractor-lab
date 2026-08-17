// ── Calibration Phase ────────────────────────────────────────────────
// Maps individual cortical deficiencies before training begins.
// Tests contrast threshold at multiple spatial frequencies and orientations.
// Based on: Polat U (2009) Vision Research, clinical perceptual learning protocols.

import { ORIENTATIONS } from '$lib';
import { renderPatch } from './renderer';
import type { OrientKey } from './types';

export interface CalibrationPoint {
  spatialFreq: number;     // cycles per pixel
  orientation: OrientKey;
  threshold: number;       // contrast threshold (0-1)
  trials: number;          // number of trials at this point
  correct: number;         // correct responses
}

export interface CalibrationProfile {
  points: CalibrationPoint[];
  weakestFreq: number;     // spatial frequency with lowest sensitivity
  weakestOrient: OrientKey; // orientation with lowest sensitivity
  meanThreshold: number;   // average contrast threshold across all points
  isComplete: boolean;
}

// Spatial frequencies to test (in cycles per pixel)
// These correspond to ~1.5, 3, 6, 12 cpd at typical viewing distance
export const CALIBRATION_FREQUENCIES = [0.015, 0.03, 0.06, 0.09];
export const CALIBRATION_ORIENTATIONS: OrientKey[] = ['horiz', 'vert', 'diag1', 'diag2'];
const CALIBRATION_TRIALS_PER_POINT = 10; // 10 trials per frequency-orientation combo

export interface CalibrationState {
  running: boolean;
  phase: 'intro' | 'running' | 'complete';
  currentFreqIndex: number;
  currentOrientIndex: number;
  currentTrial: number;
  totalTrials: number;
  points: CalibrationPoint[];
  currentThreshold: number; // adaptive threshold for current point
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  waitingForResponse: boolean;
  stimulusDuration: number;
}

export function createCalibrationState(): CalibrationState {
  const totalTrials = CALIBRATION_FREQUENCIES.length *
    CALIBRATION_ORIENTATIONS.length *
    CALIBRATION_TRIALS_PER_POINT;

  return {
    running: true,
    phase: 'intro',
    currentFreqIndex: 0,
    currentOrientIndex: 0,
    currentTrial: 0,
    totalTrials,
    points: [],
    currentThreshold: 0.8, // start at high contrast
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    waitingForResponse: false,
    stimulusDuration: 320,
  };
}

export function getCurrentCalibrationFreq(state: CalibrationState): number {
  return CALIBRATION_FREQUENCIES[state.currentFreqIndex];
}

export function getCurrentCalibrationOrient(state: CalibrationState): OrientKey {
  return CALIBRATION_ORIENTATIONS[state.currentOrientIndex];
}

export function buildCalibrationTrial(state: CalibrationState, phase: number) {
  const freq = getCurrentCalibrationFreq(state);
  const orient = getCurrentCalibrationOrient(state);

  return {
    patches: [
      {
        orient,
        contrast: state.currentThreshold,
        spatialFreq: freq,
        sigma: 30,
        noise: 0,
        phase,
      },
    ],
    correct: orient,
  };
}

export function processCalibrationAnswer(
  state: CalibrationState,
  isCorrect: boolean
): { pointComplete: boolean; allComplete: boolean } {
  state.currentTrial++;

  // 1-up/3-down staircase for threshold estimation
  if (isCorrect) {
    state.consecutiveCorrect++;
    state.consecutiveIncorrect = 0;

    // 1-up: make harder
    state.currentThreshold = Math.max(0.02, state.currentThreshold * 0.794);
  } else {
    state.consecutiveIncorrect++;
    state.consecutiveCorrect = 0;

    // 3-down: make easier
    if (state.consecutiveIncorrect >= 3) {
      state.currentThreshold = Math.min(1.0, state.currentThreshold * 1.26);
      state.consecutiveIncorrect = 0;
    }
  }

  // Check if we've done enough trials at this frequency-orientation
  const trialsAtThisPoint = state.currentTrial % CALIBRATION_TRIALS_PER_POINT;
  const pointComplete = trialsAtThisPoint === 0;

  if (pointComplete) {
    // Save this calibration point
    const freq = getCurrentCalibrationFreq(state);
    const orient = getCurrentCalibrationOrient(state);

    state.points.push({
      spatialFreq: freq,
      orientation: orient,
      threshold: state.currentThreshold,
      trials: CALIBRATION_TRIALS_PER_POINT,
      correct: Math.round(state.currentThreshold * CALIBRATION_TRIALS_PER_POINT), // approximate
    });

    // Move to next orientation
    state.currentOrientIndex++;
    if (state.currentOrientIndex >= CALIBRATION_ORIENTATIONS.length) {
      state.currentOrientIndex = 0;
      state.currentFreqIndex++;

      if (state.currentFreqIndex >= CALIBRATION_FREQUENCIES.length) {
        // All calibration complete
        state.phase = 'complete';
        state.running = false;
        return { pointComplete: true, allComplete: true };
      }
    }

    // Reset threshold for next point
    state.currentThreshold = 0.8;
    state.consecutiveCorrect = 0;
    state.consecutiveIncorrect = 0;
  }

  return { pointComplete, allComplete: false };
}

export function getCalibrationProfile(state: CalibrationState): CalibrationProfile {
  const points = [...state.points];

  // Find weakest frequency (highest threshold = lowest sensitivity)
  let weakestFreq = CALIBRATION_FREQUENCIES[0];
  let maxThreshold = 0;
  for (const point of points) {
    if (point.threshold > maxThreshold) {
      maxThreshold = point.threshold;
      weakestFreq = point.spatialFreq;
    }
  }

  // Find weakest orientation
  const orientThresholds: Record<string, number> = {};
  for (const point of points) {
    const o = point.orientation;
    if (!orientThresholds[o]) orientThresholds[o] = 0;
    orientThresholds[o] += point.threshold;
  }
  let weakestOrient: OrientKey = 'horiz';
  let maxOrientThreshold = 0;
  for (const [o, total] of Object.entries(orientThresholds)) {
    if (total > maxOrientThreshold) {
      maxOrientThreshold = total;
      weakestOrient = o as OrientKey;
    }
  }

  // Mean threshold
  const meanThreshold = points.length > 0
    ? points.reduce((sum, p) => sum + p.threshold, 0) / points.length
    : 0.5;

  return {
    points,
    weakestFreq,
    weakestOrient,
    meanThreshold,
    isComplete: state.phase === 'complete',
  };
}

// Format spatial frequency for display (cycles per pixel → approximate cpd)
export function formatSpatialFreq(spatialFreq: number): string {
  // Approximate cpd assuming 50cm viewing distance and 96 PPI
  // cpd = spatialFreq * PPI * viewing_distance_inches / 60
  const cpd = spatialFreq * 96 * 19.7 / 60; // ~19.7 inches = 50cm
  return cpd.toFixed(1) + ' cpd';
}
