// ── Display Calibration ────────────────────────────────────────────
// Measures what this monitor can show, not what the user can see.
// Phase 1: Monitor setup instructions
// Phase 2: Visual gamma check (flicker method)
// Phase 3: Contrast floor — minimum visible contrast
// Phase 4: Quality check — can display show high contrast?
//
// Output: CalibrationProfile { gamma, contrastFloor, contrastCeil, quality }
// Used by training to map difficulty → actual contrast range.

import { renderPatch, CANVAS_SIZE } from './renderer';

// ── Profile ─────────────────────────────────────────────────────

export interface CalibrationProfile {
  gamma: number;
  contrastFloor: number;   // min visible contrast (0.0–1.0)
  contrastCeil: number;    // max usable contrast (0.0–1.0)
  quality: 'good' | 'marginal' | 'poor';
  isComplete: boolean;
}

// ── Parse from sessionStorage (validates shape) ──────────────────

export function loadProfile(): CalibrationProfile | null {
  try {
    const raw = sessionStorage.getItem("calibrationProfile");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (
      typeof obj.gamma !== "number" ||
      typeof obj.contrastFloor !== "number" ||
      typeof obj.contrastCeil !== "number" ||
      !["good", "marginal", "poor"].includes(obj.quality)
    ) {
      return null;
    }
    return obj as CalibrationProfile;
  } catch {
    return null;
  }
}

// ── State ───────────────────────────────────────────────────────

export type CalibrationPhase =
  | 'setup'
  | 'gamma'
  | 'floor'
  | 'check'
;

export interface CalibrationState {
  running: boolean;
  phase: CalibrationPhase;
  // Phase 2: gamma
  gammaBrightness: number;
  gammaComplete: boolean;
  // Phase 3: contrast floor
  floorContrast: number;    // current contrast being shown (0.0–1.0)
  floorFound: boolean;      // user confirmed they see it
  floorComplete: boolean;
  // Phase4: quality check
  checkVisible: boolean;    // is the high-contrast patch visible?
  checkComplete: boolean;
  // Results
  profile: CalibrationProfile | null;
}

export function createCalibrationState(): CalibrationState {
  return {
    running: true,
    phase: 'setup',
    gammaBrightness: 186,
    gammaComplete: false,
    floorContrast: 0.0,
    floorFound: false,
    floorComplete: false,
    checkVisible: true,
    checkComplete: false,
    profile: null,
  };
}

// ── Gamma check rendering ─────────────────────────────────────────
// Split screen: left = solid gray, right = 50/50 checkerboard.
// User adjusts brightness until both halves look equally bright.

export function renderGammaCheck(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  brightness: number
) {
  const mid = Math.floor(w / 2);
  const cellSize = 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let val: number;

      if (x < mid) {
        val = brightness;
      } else {
        val = ((Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0) ? 255 : 0;
      }

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
}

export function estimateGamma(brightness: number): number | null {
  if (brightness <= 0 || brightness >= 255) return null;
  const midPoint = brightness / 255;
  if (midPoint <= 0 || midPoint >= 1) return null;
  return Math.log(0.5) / Math.log(midPoint);
}

// ── Contrast floor rendering ─────────────────────────────────────
// Shows a Gabor at reference frequency with adjustable contrast.
// User increases contrast until patch becomes visible.

const FLOOR_FREQ = 0.04; // reference frequency for floor measurement

export function renderFloorPatch(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  contrast: number
) {
  // Fill with mid-gray
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = 128;
    data[i + 3] = 255;
  }

  const sigma = 1.0 / FLOOR_FREQ;
  renderPatch(data, w, h, {
    orientation: 0,
    contrast,
    spatialFreq: FLOOR_FREQ,
    sigma,
    noise: 0,
    phase: 0,
    cx: w / 2,
    cy: h / 2,
    radius: sigma * 2.5,
  });
}

// ── Quality check rendering ──────────────────────────────────────
// Shows a high-contrast Gabor to verify the display can show it.

export function renderCheckPatch(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  visible: boolean
) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = 128;
    data[i + 3] = 255;
  }

  if (visible) {
    const sigma = 1.0 / FLOOR_FREQ;
    renderPatch(data, w, h, {
      orientation: 0,
      contrast: 0.9,
      spatialFreq: FLOOR_FREQ,
      sigma,
      noise: 0,
      phase: 0,
      cx: w / 2,
      cy: h / 2,
      radius: sigma * 2.5,
    });
  }
}

// ── Quality assessment ───────────────────────────────────────────

export function getQuality(contrastFloor: number): 'good' | 'marginal' | 'poor' {
  if (contrastFloor < 0.30) return 'good';
  if (contrastFloor < 0.45) return 'marginal';
  return 'poor';
}

// ── Build profile from state ─────────────────────────────────────

export function buildProfile(state: CalibrationState): CalibrationProfile {
  const gamma = estimateGamma(state.gammaBrightness) ?? 2.2;
  const contrastFloor = state.floorContrast;
  const contrastCeil = state.checkComplete ? (state.checkVisible ? 1.0 : 0.9) : 1.0;
  const quality = getQuality(contrastFloor);

  return {
    gamma,
    contrastFloor,
    contrastCeil,
    quality,
    isComplete: state.checkComplete,
  };
}

// ── Difficulty → contrast mapping ────────────────────────────────
// Maps a difficulty value [0..100] to actual contrast using the profile.
// contrastFloor = minimum visible, contrastCeil = maximum usable.

export function mapDifficultyToContrast(
  diff: number,
  diffMin: number,
  diffMax: number,
  profile: CalibrationProfile | null
): number {
  if (!profile) {
    // No calibration — use raw percentage (legacy behavior)
    return diff / 100;
  }
  const t = Math.max(0, Math.min(1, (diff - diffMin) / (diffMax - diffMin)));
  return profile.contrastFloor + t * (profile.contrastCeil - profile.contrastFloor);
}
