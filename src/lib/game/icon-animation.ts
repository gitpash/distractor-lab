export type AnimState = 'idle' | 'hover' | 'active';

export type AnimEvent =
  | { type: 'HOVER_START' }
  | { type: 'HOVER_END'; selected: boolean }
  | { type: 'ANIMATION_END'; selected: boolean }
  | { type: 'SELECT' }
  | { type: 'DESELECT' };

export function transition(state: AnimState, event: AnimEvent): AnimState {
  switch (state) {
    case 'idle':
      if (event.type === 'HOVER_START') return 'hover';
      if (event.type === 'SELECT') return 'active';
      return state;

    case 'hover':
      if (event.type === 'ANIMATION_END') return event.selected ? 'active' : 'idle';
      if (event.type === 'HOVER_END') return event.selected ? 'active' : 'idle';
      if (event.type === 'SELECT') return 'active';
      return state;

    case 'active':
      if (event.type === 'DESELECT') return 'idle';
      if (event.type === 'HOVER_START') return 'hover';
      return state;
  }
}

export function getAnimClass(state: AnimState, _mode: string): string {
  if (state === 'hover') return 'hover';
  if (state === 'active') return 'active';
  return '';
}
