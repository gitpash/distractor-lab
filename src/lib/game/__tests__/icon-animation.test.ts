import { describe, it, expect } from 'vitest';
import {
  type AnimState,
  type AnimEvent,
  transition,
  getAnimClass,
} from '../icon-animation';

describe('icon animation state machine', () => {
  describe('transitions', () => {
    it('starts in idle', () => {
      expect(transition('idle', { type: 'HOVER_START' })).toBe('hover');
    });

    it('idle → hover on HOVER_START', () => {
      expect(transition('idle', { type: 'HOVER_START' })).toBe('hover');
    });

    it('idle → active on SELECT', () => {
      expect(transition('idle', { type: 'SELECT' })).toBe('active');
    });

    it('hover → idle on HOVER_END when not selected', () => {
      expect(transition('hover', { type: 'HOVER_END', selected: false })).toBe('idle');
    });

    it('hover → active on HOVER_END when selected', () => {
      expect(transition('hover', { type: 'HOVER_END', selected: true })).toBe('active');
    });

    it('hover → active on ANIMATION_END when selected', () => {
      expect(transition('hover', { type: 'ANIMATION_END', selected: true })).toBe('active');
    });

    it('hover → idle on ANIMATION_END when not selected', () => {
      expect(transition('hover', { type: 'ANIMATION_END', selected: false })).toBe('idle');
    });

    it('hover → active on SELECT', () => {
      expect(transition('hover', { type: 'SELECT' })).toBe('active');
    });

    it('active → idle on DESELECT', () => {
      expect(transition('active', { type: 'DESELECT' })).toBe('idle');
    });

    it('active → hover on HOVER_START (interrupt)', () => {
      expect(transition('active', { type: 'HOVER_START' })).toBe('hover');
    });

    it('active stays active on HOVER_END', () => {
      expect(transition('active', { type: 'HOVER_END', selected: true })).toBe('active');
    });
  });

  describe('getAnimClass', () => {
    it('returns empty for idle', () => {
      expect(getAnimClass('idle', 'classic')).toBe('');
    });

    it('returns hover class for hover state', () => {
      expect(getAnimClass('hover', 'classic')).toBe('hover');
    });

    it('returns active class for active state', () => {
      expect(getAnimClass('active', 'classic')).toBe('active');
    });
  });
});
