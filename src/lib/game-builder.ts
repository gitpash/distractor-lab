// =====================================================================
// ORIENTATIONS — single source of truth
// angle = direction stripes RUN (0°=horizontal, 90°=vertical)
// =====================================================================
export const ORIENTATIONS = {
  horiz: { angle: 0, labelKey: "orientations.horiz", symbol: "⸺" },
  diag1: { angle: 45, labelKey: "orientations.diag1", symbol: "╱" },
  vert: { angle: 90, labelKey: "orientations.vert", symbol: "┃" },
  diag2: { angle: 135, labelKey: "orientations.diag2", symbol: "╲" },
};
const ORIENT_KEYS = Object.keys(ORIENTATIONS) as (keyof typeof ORIENTATIONS)[];

const randomOrient = (): keyof typeof ORIENTATIONS =>
  ORIENT_KEYS[Math.floor(Math.random() * ORIENT_KEYS.length)];

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
    buildTrial(diff: number, phase: number) {
      const key = randomOrient();
      return {
        patches: [
          {
            orient: key,
            contrast: diff / 100,
            spatialFreq: 0.04,
            sigma: 30,
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
    buildTrial(diff: number, phase: number) {
      const key = randomOrient();
      return {
        patches: [
          {
            orient: key,
            contrast: 0.8,
            spatialFreq: diff / 1000,
            sigma: 30,
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
    buildTrial(diff: number, phase: number) {
      const key = randomOrient();
      return {
        patches: [
          {
            orient: key,
            contrast: 0.8,
            spatialFreq: 0.04,
            sigma: 30,
            noise: diff / 100,
            phase,
          },
        ],
        correct: key,
      };
    },
  } as const,
  fine: {
    title: "Fine",
    subtitle: "2AFC",
    icon: "⇔",
    wide: false,
    desc: "Which tiled more?",
    type: "2afc",
    diffLabel: "Δ angle",
    diffStart: 15,
    diffMin: 1,
    diffMax: 45,
    diffStep: 1,
    diffLower: true, // lower value = harder
    diffFormat: (v: number) => v.toFixed(0) + "°",
    buildTrial(diff: number, phase: number) {
      const refAngle = ORIENTATIONS[randomOrient()].angle;
      const targetAngle = refAngle + diff;
      const tiltedLeft = Math.random() < 0.5;
      return {
        patches: [
          {
            angle: tiltedLeft ? targetAngle : refAngle,
            contrast: 0.8,
            spatialFreq: 0.04,
            sigma: 28,
            noise: 0,
            phase: phase,
          },
          {
            angle: tiltedLeft ? refAngle : targetAngle,
            contrast: 0.8,
            spatialFreq: 0.04,
            sigma: 28,
            noise: 0,
            phase: phase,
          },
        ],
        correct: tiltedLeft ? 0 : 1,
      };
    },
  } as const,
  combo: {
    title: "Combo",
    subtitle: "Mix",
    icon: "⊕",
    wide: true,
    desc: "Random stimulus",
    type: "4afc",
    diffLabel: "Contrast",
    diffStart: 80,
    diffMin: 2,
    diffMax: 100,
    diffStep: 4,
    diffLower: true,
    diffFormat: (v: number) => v.toFixed(0) + "%",
    buildTrial(diff: number, phase: number) {
      const key = randomOrient();
      const r = Math.random();
      let spatialFreq = 0.04,
        noise = 0;
      if (r < 0.33) spatialFreq = 0.02 + Math.random() * 0.07;
      else if (r < 0.66) noise = 0.15 + Math.random() * 0.5;
      return {
        patches: [
          {
            orient: key,
            contrast: diff / 100,
            spatialFreq,
            sigma: 30,
            noise,
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
