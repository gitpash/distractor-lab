// =====================================================================
// ORIENTATIONS — single source of truth
// angle = direction stripes RUN (0°=horizontal, 90°=vertical)
// =====================================================================
export const ORIENTATIONS = {
  horiz: { angle: 0, labelKey: "orientations.horiz", symbol: "—" },
  diag1: { angle: 45, labelKey: "orientations.diag1", symbol: "╱" },
  vert: { angle: 90, labelKey: "orientations.vert", symbol: "┃" },
  diag2: { angle: 135, labelKey: "orientations.diag2", symbol: "╲" },
};
const ORIENT_KEYS = Object.keys(ORIENTATIONS) as (keyof typeof ORIENTATIONS)[];

const randomOrient = (): keyof typeof ORIENTATIONS =>
  ORIENT_KEYS[Math.floor(Math.random() * ORIENT_KEYS.length)];

// σ = λ (classic Gabor): sigma equals one wavelength
// Reference: Polat & Sagi (1993), Campbell & Robson (1968)
function sigmaFromFreq(freq: number, k: number = 1.0): number {
  return k / freq; // λ = 1/freq, σ = k·λ
}

import { mapDifficultyToContrast, type CalibrationProfile } from "./calibration";

// Lateral mode spatial frequencies (cycles per pixel)
// Correspond to ~1.5, 3, 4.5, 6, 9, 12 cpd at 50cm/96PPI
const LATERAL_FREQUENCIES = [0.015, 0.03, 0.045, 0.06, 0.09, 0.12];

export const MODES = {
  classic: {
    title: "Classic",
    subtitle: "Contrast",
    icon: "◎",
    wide: false,
    desc: "Adaptive contrast",
    type: "4afc",
    diffLabel: "Contrast",
    diffStart: 80,
    diffMin: 2,
    diffMax: 100,
    diffStep: 4,
    diffLower: true, // lower value = harder
    diffFormat: (v: number) => v.toFixed(0) + "%",
    instruction: undefined,
    buildTrial(diff: number, phase: number, profile: CalibrationProfile | null = null) {
      const key = randomOrient();
      const freq = 0.04;
      const contrast = mapDifficultyToContrast(diff, 2, 100, profile);
      return {
        patches: [
          {
            orient: key,
            contrast,
            spatialFreq: freq,
            sigma: sigmaFromFreq(freq),
            noise: 0,
            phase,
          },
        ],
        correct: key,
      };
    },
  } as const,
  frequency: {
    title: "Frequency",
    subtitle: "Space",
    icon: "≡",
    wide: false,
    desc: "Stripe's width",
    type: "4afc",
    diffLabel: "Frequency",
    diffStart: 40,
    diffMin: 10,
    diffMax: 120,
    diffStep: 5,
    diffLower: false, // higher value = harder
    diffFormat: (v: number) => (v / 1000).toFixed(3),
    instruction: undefined,
    buildTrial(diff: number, phase: number) {
      const key = randomOrient();
      const freq = diff / 1000;
      return {
        patches: [
          {
            orient: key,
            contrast: 0.8,
            spatialFreq: freq,
            sigma: sigmaFromFreq(freq),
            noise: 0,
            phase,
          },
        ],
        correct: key,
      };
    },
  } as const,
  noise: {
    title: "Noise",
    subtitle: "Signal/noise",
    icon: "⊘",
    wide: false,
    desc: "Stripes in noise",
    type: "4afc",
    diffLabel: "Noise",
    diffStart: 30,
    diffMin: 0,
    diffMax: 100,
    diffStep: 5,
    diffLower: false, // higher value = harder
    diffFormat: (v: number) => v.toFixed(0) + "%",
    instruction: undefined,
    buildTrial(diff: number, phase: number) {
      const key = randomOrient();
      const freq = 0.04;
      return {
        patches: [
          {
            orient: key,
            contrast: 0.8,
            spatialFreq: freq,
            sigma: sigmaFromFreq(freq),
            noise: diff / 100,
            phase,
          },
        ],
        correct: key,
      };
    },
  } as const,
  fine: {
    title: "Tilt",
    subtitle: "2AFC",
    icon: "⇔",
    wide: false,
    desc: "Left or right from vertical",
    type: "2afc",
    diffLabel: "Tilt angle",
    diffStart: 15,
    diffMin: 1,
    diffMax: 45,
    diffStep: 1,
    diffLower: true, // lower value = harder
    diffFormat: (v: number) => v.toFixed(0) + "°",
    instruction: "A single patch appears briefly. It is tilted slightly left or right from vertical. Choose the direction.",
    buildTrial(diff: number, phase: number) {
      const tiltedLeft = Math.random() < 0.5;
      const angle = 90 + (tiltedLeft ? -diff : diff); // ±diff from vertical
      const freq = 0.04;
      return {
        patches: [
          {
            angle,
            contrast: 0.8,
            spatialFreq: freq,
            sigma: sigmaFromFreq(freq),
            noise: 0,
            phase,
          },
        ],
        correct: tiltedLeft ? "left" : "right",
      };
    },
  } as const,
  combo: {
    title: "Combo",
    subtitle: "Mix",
    icon: "⊕",
    wide: false,
    desc: "Random stimulus",
    type: "4afc",
    diffLabel: "Contrast",
    diffStart: 80,
    diffMin: 2,
    diffMax: 100,
    diffStep: 4,
    diffLower: true,
    diffFormat: (v: number) => v.toFixed(0) + "%",
    instruction: undefined,
    buildTrial(diff: number, phase: number, profile: CalibrationProfile | null = null) {
      const key = randomOrient();
      const r = Math.random();
      let spatialFreq = 0.04,
        noise = 0;
      if (r < 0.33) spatialFreq = 0.02 + Math.random() * 0.07;
      else if (r < 0.66) noise = 0.15 + Math.random() * 0.5;
      const contrast = mapDifficultyToContrast(diff, 2, 100, profile);
      return {
        patches: [
          {
            orient: key,
            contrast,
            spatialFreq,
            sigma: sigmaFromFreq(spatialFreq),
            noise,
            phase,
          },
        ],
        correct: key,
      };
    },
  } as const,
  // ── Lateral Masking (Polat & Sagi paradigm) ──────────────────────
  // Target Gabor flanked by two collinear high-contrast Gabors.
  // Adaptive variable: target contrast. Flanker contrast fixed high.
  // Frequency rotates across trials for broad cortical training.
  // Based on: Polat U, Sagi D. Vision Research. 1993;33(7):993–999.
  lateral: {
    title: "Lateral",
    subtitle: "Masking",
    icon: "≡",
    wide: false,
    desc: "Collinear flankers",
    type: "4afc",
    diffLabel: "Target",
    diffStart: 50,
    diffMin: 2,
    diffMax: 100,
    diffStep: 3,
    diffLower: true, // lower contrast = harder
    diffFormat: (v: number) => v.toFixed(0) + "%",
    instruction: undefined,
    buildTrial(diff: number, phase: number, profile: CalibrationProfile | null = null) {
      const key = randomOrient();
      // Rotate through frequencies for broad training
      const freq = LATERAL_FREQUENCIES[Math.floor(Math.random() * LATERAL_FREQUENCIES.length)];
      const targetContrast = mapDifficultyToContrast(diff, 2, 100, profile);
      return {
        patches: [
          {
            type: "lateral" as const,
            orient: key,
            targetContrast,
            flankerContrast: 0.8,
            spatialFreq: freq,
            sigma: sigmaFromFreq(freq),
            flankerDistance: 4, // 4λ — within facilitation zone
            phase,
          },
        ],
        correct: key,
      };
    },
  } as const,
} as const;

const objectKeys = <Obj extends {}>(obj: Obj): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[];
};

export const gameModes = objectKeys(MODES);
export type GameMode = (typeof gameModes)[number];
