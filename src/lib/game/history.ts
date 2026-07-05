import type { HistoryEntry } from './types';

const STORAGE_KEY = 'gabor-trainer-history';
const MAX_ENTRIES = 50;

export function saveHistory(entry: HistoryEntry) {
  const h = getHistory();
  h.unshift(entry);
  if (h.length > MAX_ENTRIES) h.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function sparklineSVG(values: number[], width = 80, height = 24): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - ((v - min) / range) * (height - 4)).toFixed(1)}`)
    .join(' ');
  return `<svg width="${width}" height="${height}" class="history-sparkline"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
