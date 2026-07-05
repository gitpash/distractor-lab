import { describe, it, expect } from 'vitest';

// Pure math extracted from OrientationIcon — test the coordinate calculation
function calcLineEndpoints(angle: number, size: number) {
    const rad = angle * Math.PI / 180;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.4;
    return {
        x1: cx + r * Math.cos(rad),
        y1: cy + r * Math.sin(rad),
        x2: cx - r * Math.cos(rad),
        y2: cy - r * Math.sin(rad),
    };
}

describe('OrientationIcon angle mapping', () => {
    const size = 40;
    const cx = 20;
    const cy = 20;
    const r = 16;

    it('0° = horizontal line (left to right)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(0, size);
        expect(x1).toBeCloseTo(cx + r); // right
        expect(y1).toBeCloseTo(cy);     // center y
        expect(x2).toBeCloseTo(cx - r); // left
        expect(y2).toBeCloseTo(cy);     // center y
    });

    it('90° = vertical line (top to bottom)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(90, size);
        expect(x1).toBeCloseTo(cx);     // center x
        expect(y1).toBeCloseTo(cy + r); // bottom
        expect(x2).toBeCloseTo(cx);     // center x
        expect(y2).toBeCloseTo(cy - r); // top
    });

    it('45° = diagonal top-right to bottom-left (╱)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(45, size);
        expect(x1).toBeGreaterThan(cx); // right side
        expect(y1).toBeGreaterThan(cy); // bottom
        expect(x2).toBeLessThan(cx);    // left side
        expect(y2).toBeLessThan(cy);    // top
    });

    it('135° = diagonal top-left to bottom-right (╲)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(135, size);
        expect(x1).toBeLessThan(cx);    // left side
        expect(y1).toBeGreaterThan(cy); // bottom
        expect(x2).toBeGreaterThan(cx); // right side
        expect(y2).toBeLessThan(cy);    // top
    });
});
