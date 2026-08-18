// ── Calibration Phase ────────────────────────────────────────────────
// Full display calibration + cortical deficiency mapping.
// Phase 1: Monitor setup instructions
// Phase 2: Visual gamma check (flicker method)
// Phase 3: Contrast floor check + manual gain
// Phase 4: Threshold measurement at multiple freq × orient
// Based on: Polat U (2009) Vision Research, clinical protocols.

import { ORIENTATIONS } from '$lib';
import { renderPatch, CANVAS_SIZE } from './renderer';
import type { OrientKey } from './types';

export interface CalibrationPoint {
  spatialFreq: number;
  orientation: OrientKey;
  threshold: number;
  trials: number;
  correct: number;
  timestamp: number;
  sigma: number;
}

export interface CalibrationProfile {
  points: CalibrationPoint[];
  weakestFreq: number;
  weakestOrient: OrientKey;
  meanThreshold: number;
  contrastGain: number;
  isComplete: boolean;
}

export type CalibrationPhase =
  | 'setup'        // Phase 1: monitor instructions
  | 'gamma'        // Phase 2: visual gamma check
  | 'floor'        // Phase 3: contrast floor + gain
  | 'thresholds'   // Phase 4: threshold measurement
  | 'complete';

export const CALIBRATION_FREQUENCIES = [0.015, 0.03, 0.06, 0.09];
export const CALIBRATION_ORIENTATIONS: OrientKey[] = ['horiz', 'vert', 'diag1', 'diag2'];
const CALIBRATION_TRIALS_PER_POINT = 10;

export interface CalibrationState {
  running: boolean;
  phase: CalibrationPhase;
  // Phase 2: gamma
  gammaVisible: boolean;
  gammaBrightness: number;
  gammaComplete: boolean;
  // Phase 3: floor
  floorContrast: number;
  floorGain: number;
  floorVisible: boolean;
  floorComplete: boolean;
  // Phase 4: thresholds
  currentFreqIndex: number;
  currentOrientIndex: number;
  currentTrial: number;
  totalTrials: number;
  points: CalibrationPoint[];
  currentThreshold: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  pointCorrect: number;
  waitingForResponse: boolean;
  stimulusDuration: number;
  isi: number;
}

export function createCalibrationState(): CalibrationState {
  const totalTrials = CALIBRATION_FREQUENCIES.length *
    CALIBRATION_ORIENTATIONS.length *
    CALIBRATION_TRIALS_PER_POINT;

  return {
    running: true,
    phase: 'setup',
    gammaVisible: false,
    gammaBrightness: 186, // sRGB midpoint for gamma ~2.2
    gammaComplete: false,
    floorContrast: 0.05,
    floorGain: 1.0,
    floorVisible: false,
    floorComplete: false,
    currentFreqIndex: 0,
    currentOrientIndex: 0,
    currentTrial: 0,
    totalTrials,
    points: [],
    currentThreshold: 0.5, // start at moderate contrast, staircase will find real threshold
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    pointCorrect: 0,
    waitingForResponse: false,
    stimulusDuration: 200,
    isi: 500,
  };
}

// ── Gamma check rendering ─────────────────────────────────────────
// Renders a split screen: left = solid gray, right = 50/50 black/white checkerboard.
// User adjusts brightness until both halves look equally bright.
// Cell size = 2px for better spatial averaging at normal viewing distance.

export function renderGammaCheck(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  brightness: number
) {
  const mid = Math.floor(w / 2);
  const cellSize = 2; // 2px cells — better spatial fusion than 4px

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let val: number;

      if (x < mid) {
        // Left half: solid gray at adjustable brightness
        val = brightness;
      } else {
        // Right half: 50/50 black/white checkerboard
        // Perceived as ~50% gray when viewed from normal distance
        val = ((Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0) ? 255 : 0;
      }

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
}

// Estimate gamma from the matched brightness value.
// At gamma=2.2, the perceived midpoint of a 50/50 checkerboard is ~186.
// Formula: gamma ≈ log(0.5) / log(brightness / 255)
// Returns null if brightness is 0 or 255 (can't estimate).

export function estimateGamma(brightness: number): number | null {
  if (brightness <= 0 || brightness >= 255) return null;
  const midPoint = brightness / 255;
  if (midPoint <= 0 || midPoint >= 1) return null;
  return Math.log(0.5) / Math.log(midPoint);
}

// ── Floor check rendering ─────────────────────────────────────────
// Shows a Gabor at the lowest contrast the staircase will use.
// User adjusts gain until patch is barely visible.

export function renderFloorCheck(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  contrast: number,
  visible: boolean
) {
  // Fill with mid-gray
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = 128;
    data[i + 3] = 255;
  }

  if (visible) {
    renderPatch(data, w, h, {
      orientation: 0,
      contrast,
      spatialFreq: 0.03,
      sigma: 1.0 / 0.03,
      noise: 0,
      phase: 0,
      cx: w / 2,
      cy: h / 2,
      radius: 80,
    });
  }
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
  const sigma = 1.0 / freq;

  return {
    patches: [
      {
        orient,
        contrast: state.currentThreshold,
        spatialFreq: freq,
        sigma,
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

  if (isCorrect) {
    state.pointCorrect++;
    state.consecutiveCorrect++;
    state.consecutiveIncorrect = 0;
    state.currentThreshold = Math.max(0.02, state.currentThreshold * 0.794);
  } else {
    state.consecutiveIncorrect++;
    state.consecutiveCorrect = 0;
    if (state.consecutiveIncorrect >= 3) {
      state.currentThreshold = Math.min(1.0, state.currentThreshold * 1.26);
      state.consecutiveIncorrect = 0;
    }
  }

  const trialsAtThisPoint = state.currentTrial % CALIBRATION_TRIALS_PER_POINT;
  const pointComplete = trialsAtThisPoint === 0;

  if (pointComplete) {
    const freq = getCurrentCalibrationFreq(state);
    const orient = getCurrentCalibrationOrient(state);
    const sigma = 1.0 / freq;

    state.points.push({
      spatialFreq: freq,
      orientation: orient,
      threshold: state.currentThreshold,
      trials: CALIBRATION_TRIALS_PER_POINT,
      correct: state.pointCorrect,
      timestamp: Date.now(),
      sigma,
    });

    state.currentOrientIndex++;
    if (state.currentOrientIndex >= CALIBRATION_ORIENTATIONS.length) {
      state.currentOrientIndex = 0;
      state.currentFreqIndex++;

      if (state.currentFreqIndex >= CALIBRATION_FREQUENCIES.length) {
        state.phase = 'complete';
        state.running = false;
        return { pointComplete: true, allComplete: true };
      }
    }

    state.currentThreshold = 0.5;
    state.consecutiveCorrect = 0;
    state.consecutiveIncorrect = 0;
    state.pointCorrect = 0;
  }

  return { pointComplete, allComplete: false };
}

export function getCalibrationProfile(state: CalibrationState): CalibrationProfile {
  const points = [...state.points];

  let weakestFreq = CALIBRATION_FREQUENCIES[0];
  let maxThreshold = 0;
  for (const point of points) {
    if (point.threshold > maxThreshold) {
      maxThreshold = point.threshold;
      weakestFreq = point.spatialFreq;
    }
  }

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

  const meanThreshold = points.length > 0
    ? points.reduce((sum, p) => sum + p.threshold, 0) / points.length
    : 0.5;

  return {
    points,
    weakestFreq,
    weakestOrient,
    meanThreshold,
    contrastGain: state.floorGain,
    isComplete: state.phase === 'complete',
  };
}

export function formatSpatialFreq(spatialFreq: number): string {
  const cpd = spatialFreq * 96 * 19.7 / 60;
  return cpd.toFixed(1) + ' cpd';
}
