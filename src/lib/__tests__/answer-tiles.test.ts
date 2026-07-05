import { describe, it, expect } from 'vitest';

// Button-to-key mapping from AnswerTiles
const BUTTON_MAP = [
    { pos: "top", key: "horiz", angle: 0 },
    { pos: "left", key: "diag2", angle: 135 },
    { pos: "right", key: "diag1", angle: 45 },
    { pos: "bottom", key: "vert", angle: 90 },
];

// Orientation angle definitions from game-builder
const ORIENTATIONS = {
    horiz: { angle: 0 },
    diag1: { angle: 45 },
    vert: { angle: 90 },
    diag2: { angle: 135 },
};

describe('AnswerTiles button mapping', () => {
    it('top button = horizontal (0°)', () => {
        const btn = BUTTON_MAP.find(b => b.pos === "top");
        expect(btn?.key).toBe("horiz");
        expect(btn?.angle).toBe(ORIENTATIONS.horiz.angle);
    });

    it('bottom button = vertical (90°)', () => {
        const btn = BUTTON_MAP.find(b => b.pos === "bottom");
        expect(btn?.key).toBe("vert");
        expect(btn?.angle).toBe(ORIENTATIONS.vert.angle);
    });

    it('left button = diagonal 135° (╲)', () => {
        const btn = BUTTON_MAP.find(b => b.pos === "left");
        expect(btn?.key).toBe("diag2");
        expect(btn?.angle).toBe(ORIENTATIONS.diag2.angle);
    });

    it('right button = diagonal 45° (╱)', () => {
        const btn = BUTTON_MAP.find(b => b.pos === "right");
        expect(btn?.key).toBe("diag1");
        expect(btn?.angle).toBe(ORIENTATIONS.diag1.angle);
    });

    it('all 4 buttons map to unique keys', () => {
        const keys = BUTTON_MAP.map(b => b.key);
        expect(new Set(keys).size).toBe(4);
    });

    it('all 4 buttons map to unique angles', () => {
        const angles = BUTTON_MAP.map(b => b.angle);
        expect(new Set(angles).size).toBe(4);
    });
});
