export const CANVAS_SIZE = 300;

export function renderPatch(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  params: {
    orientation?: number;
    contrast?: number;
    spatialFreq?: number;
    phase?: number;
    sigma?: number;
    noise?: number;
    cx?: number;
    cy?: number;
    radius?: number;
  }
) {
  const {
    orientation = 0,
    contrast = 0.8,
    spatialFreq = 0.04,
    phase = 0,
    sigma = 30,
    noise = 0,
    cx = 150,
    cy = 150,
    radius = 100,
  } = params;

  const theta = (orientation * Math.PI) / 180;
  const sigma2x2 = 2 * sigma * sigma;
  const r2 = radius * radius;
  const yMin = Math.max(0, Math.floor(cy - radius));
  const yMax = Math.min(h, Math.ceil(cy + radius));
  const xMin = Math.max(0, Math.floor(cx - radius));
  const xMax = Math.min(w, Math.ceil(cx + radius));

  for (let y = yMin; y < yMax; y++) {
    for (let x = xMin; x < xMax; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 > r2) continue;

      const rn = dx * Math.sin(theta) + dy * Math.cos(theta);
      const grating = Math.cos(2 * Math.PI * spatialFreq * rn + phase);
      const gaussian = Math.exp(-dist2 / sigma2x2);

      let val = 128 + 128 * contrast * grating * gaussian;
      if (noise > 0) val += (Math.random() * 2 - 1) * noise * 100;
      val = Math.max(0, Math.min(255, Math.round(val)));

      const idx = (y * w + x) * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = val;
    }
  }
}

export function showBlank(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

// ── Lateral Masking ─────────────────────────────────────────────────
// Renders a target Gabor flanked by two collinear high-contrast Gabors.
// Flanker distance is measured in wavelengths (λ = 1 / spatialFreq).
// Based on Polat & Sagi (1993, 1994) lateral masking paradigm.

export interface LateralMaskingParams {
  orientation: number;
  targetContrast: number;
  flankerContrast: number;
  spatialFreq: number;
  phase: number;
  sigma: number;
  flankerDistance: number; // in units of λ (wavelength)
  cx?: number;
  cy?: number;
}

export function renderLateralMasking(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  params: LateralMaskingParams
) {
  const {
    orientation,
    targetContrast,
    flankerContrast,
    spatialFreq,
    phase,
    sigma,
    flankerDistance,
    cx = w / 2,
    cy = h / 2,
  } = params;

  const lambda = 1 / spatialFreq; // wavelength in pixels
  const dist = flankerDistance * lambda; // pixel distance along orientation axis
  const theta = (orientation * Math.PI) / 180;

  // Flanker centers along the collinear axis
  const dx = dist * Math.sin(theta);
  const dy = dist * Math.cos(theta);

  const radius = sigma * 1.8; // Gaussian extends ~1.8σ

  // Render flankers first (behind target)
  renderPatch(data, w, h, {
    orientation,
    contrast: flankerContrast,
    spatialFreq,
    phase,
    sigma,
    noise: 0,
    cx: cx - dx,
    cy: cy - dy,
    radius,
  });
  renderPatch(data, w, h, {
    orientation,
    contrast: flankerContrast,
    spatialFreq,
    phase,
    sigma,
    noise: 0,
    cx: cx + dx,
    cy: cy + dy,
    radius,
  });

  // Render target on top
  renderPatch(data, w, h, {
    orientation,
    contrast: targetContrast,
    spatialFreq,
    phase,
    sigma,
    noise: 0,
    cx,
    cy,
    radius,
  });
}
