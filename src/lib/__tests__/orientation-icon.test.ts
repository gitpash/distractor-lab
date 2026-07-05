import { describe, it, expect } from 'vitest';

// Pure math extracted from OrientationIcon — test the coordinate calculation
// The icon shows the stripe DIRECTION (not perpendicular)
// 0°=horiz(—), 90°=vert(|), 45°=diag1(╲), 135°=diag2(╱)
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

    it('0° = horizontal line (—)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(0, size);
        // horizontal: x changes, y stays at center
        expect(x1).toBeCloseTo(cx + r);
        expect(y1).toBeCloseTo(cy);
        expect(x2).toBeCloseTo(cx - r);
        expect(y2).toBeCloseTo(cy);
    });

    it('90° = vertical line (|)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(90, size);
        // vertical: y changes, x stays at center
        expect(x1).toBeCloseTo(cx);
        expect(y1).toBeCloseTo(cy + r);
        expect(x2).toBeCloseTo(cx);
        expect(y2).toBeCloseTo(cy - r);
    });

    it('45° = diagonal ╲ (top-left to bottom-right)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(45, size);
        // ╲ goes from top-left to bottom-right
        // endpoint 1: bottom-right
        expect(x1).toBeGreaterThan(cx);
        expect(y1).toBeGreaterThan(cy);
        // endpoint 2: top-left
        expect(x2).toBeLessThan(cx);
        expect(y2).toBeLessThan(cy);
    });

    it('135° = diagonal ╱ (bottom-left to top-right)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(135, size);
        // ╱ goes from bottom-left to top-right
        // endpoint 1: bottom-left
        expect(x1).toBeLessThan(cx);
        expect(y1).toBeGreaterThan(cy);
        // endpoint 2: top-right
        expect(x2).toBeGreaterThan(cx);
        expect(y2).toBeLessThan(cy);
    });

    it('line is always centered', () => {
        for (const angle of [0, 45, 90, 135]) {
            const { x1, y1, x2, y2 } = calcLineEndpoints(angle, size);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            expect(midX).toBeCloseTo(cx);
            expect(midY).toBeCloseTo(cy);
        }
    });

    it('line length is consistent for all angles', () => {
        const expectedLen = 2 * r; // 2 * 0.4 * size
        for (const angle of [0, 45, 90, 135]) {
            const { x1, y1, x2, y2 } = calcLineEndpoints(angle, size);
            const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            expect(len).toBeCloseTo(expectedLen);
        }
    });
});
