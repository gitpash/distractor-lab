import { describe, it, expect } from 'vitest';

// Pure math extracted from OrientationIcon
// The icon shows the stripe DIRECTION (matching the Gabor patch)
// 0°=horiz(—), 90°=vert(|), 45°=diag1(╱), 135°=diag2(╲)
function calcLineEndpoints(angle: number, size: number) {
    const rad = -angle * Math.PI / 180; // negated for SVG y-axis
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
        expect(x1).toBeCloseTo(cx + r);
        expect(y1).toBeCloseTo(cy);
        expect(x2).toBeCloseTo(cx - r);
        expect(y2).toBeCloseTo(cy);
    });

    it('90° = vertical line (|)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(90, size);
        expect(x1).toBeCloseTo(cx);
        expect(y1).toBeCloseTo(cy - r); // top
        expect(x2).toBeCloseTo(cx);
        expect(y2).toBeCloseTo(cy + r); // bottom
    });

    it('45° = diagonal ╱ (bottom-left to top-right)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(45, size);
        // ╱ goes from bottom-left to top-right
        expect(x1).toBeGreaterThan(cx);
        expect(y1).toBeLessThan(cy);
        expect(x2).toBeLessThan(cx);
        expect(y2).toBeGreaterThan(cy);
    });

    it('135° = diagonal ╲ (top-left to bottom-right)', () => {
        const { x1, y1, x2, y2 } = calcLineEndpoints(135, size);
        // ╲ goes from top-left to bottom-right
        expect(x1).toBeLessThan(cx);
        expect(y1).toBeLessThan(cy);
        expect(x2).toBeGreaterThan(cx);
        expect(y2).toBeGreaterThan(cy);
    });

    it('line is always centered', () => {
        for (const angle of [0, 45, 90, 135]) {
            const { x1, y1, x2, y2 } = calcLineEndpoints(angle, size);
            expect((x1 + x2) / 2).toBeCloseTo(cx);
            expect((y1 + y2) / 2).toBeCloseTo(cy);
        }
    });

    it('line length is consistent for all angles', () => {
        const expectedLen = 2 * r;
        for (const angle of [0, 45, 90, 135]) {
            const { x1, y1, x2, y2 } = calcLineEndpoints(angle, size);
            expect(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)).toBeCloseTo(expectedLen);
        }
    });
});
