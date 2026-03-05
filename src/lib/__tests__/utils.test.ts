import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn()', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-white')).toBe('text-white');
  });

  it('merges multiple classes', () => {
    expect(cn('text-white', 'bg-black')).toBe('text-white bg-black');
  });

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('text-white', 'text-black')).toBe('text-black');
  });

  it('ignores falsy values', () => {
    expect(cn('text-white', false, null, undefined, '')).toBe('text-white');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('returns empty string when no valid inputs', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});
