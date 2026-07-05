export function getKeyBinding(e: KeyboardEvent, modeType: '4afc' | '2afc'): string | null {
  if (e.key === ' ') return 'skip';

  const k = e.key;

  if (modeType === '2afc') {
    if (k === 'ArrowLeft' || k === '1' || k === 'a' || k === 'A' || k === 'ф' || k === 'Ф') return '0';
    if (k === 'ArrowRight' || k === '2' || k === 'd' || k === 'D' || k === 'в' || k === 'В') return '1';
    return null;
  }

  // 4afc
  if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'a' || k === 'A' || k === 'd' || k === 'D' || k === 'ф' || k === 'Ф' || k === 'в' || k === 'В') return 'horiz';
  if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'w' || k === 'W' || k === 's' || k === 'S' || k === 'ц' || k === 'Ц' || k === 'ы' || k === 'Ы') return 'vert';
  if (k === 'e' || k === 'E' || k === 'у' || k === 'У') return 'diag1';
  if (k === 'q' || k === 'Q' || k === 'й' || k === 'Й') return 'diag2';

  return null;
}
