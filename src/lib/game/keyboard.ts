export function getKeyBinding(e: KeyboardEvent, modeType: '4afc' | '2afc'): string | null {
  const code = e.code;

  if (code === 'Space') return 'skip';

  if (modeType === '2afc') {
    if (code === 'ArrowLeft' || code === 'Digit1' || code === 'KeyA') return 'left';
    if (code === 'ArrowRight' || code === 'Digit2' || code === 'KeyD') return 'right';
    return null;
  }

  // 4afc
  if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'KeyA' || code === 'KeyD') return 'horiz';
  if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS') return 'vert';
  if (code === 'KeyE') return 'diag1';
  if (code === 'KeyQ') return 'diag2';

  return null;
}
