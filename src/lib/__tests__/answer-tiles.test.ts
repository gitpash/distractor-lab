import { describe, it, expect } from 'vitest';

// Button-to-key mapping from AnswerTiles
const BUTTON_MAP = [
    { pos: "top", key: "horiz", angle: 0 },
    { pos: "left", key: "diag1", angle: 45 },
    { pos: "right", key: "diag2", angle: 135 },
    { pos: "bottom", key: "vert", angle: 90 },
];

const ORIENTATIONS = {
    horiz: { angle: 0 },
    diag1: { angle: 45 },
    vert: { angle: 90 },
    diag2: { angle: 135 },
};

describe('AnswerTiles button mapping', () => {
    it('top = horizontal (—)', () => {
        const btn = BUTTON_MAP.find(b => b.pos === "top");
        expect(btn?.key).toBe("horiz");
        expect(btn?.angle).toBe(ORIENTATIONS.horiz.angle);
    });

    it('bottom = vertical (|)', () => {
        const btn = BUTTON_MAP.find(b => b.pos === "bottom");
        expect(btn?.key).toBe("vert");
        expect(btn?.angle).toBe(ORIENTATIONS.vert.angle);
    });

    it('left = diag1 45° (╱)', () => {
        const btn = BUTTON_MAP.find(b => b.pos === "left");
        expect(btn?.key).toBe("diag1");
        expect(btn?.angle).toBe(45);
    });

    it('right = diag2 135° (╲)', () => {
        const btn = BUTTON_MAP.find(b => b.pos === "right");
        expect(btn?.key).toBe("diag2");
        expect(btn?.angle).toBe(135);
    });

    it('all keys unique', () => {
        expect(new Set(BUTTON_MAP.map(b => b.key)).size).toBe(4);
    });

    it('all angles unique', () => {
        expect(new Set(BUTTON_MAP.map(b => b.angle)).size).toBe(4);
    });
});
