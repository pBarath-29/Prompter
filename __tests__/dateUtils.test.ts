import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentMonthYear, isNewMonth, isNewDay } from '../utils/dateUtils';

describe('getCurrentMonthYear', () => {
  it('returns a string in YYYY-MM format', () => {
    const result = getCurrentMonthYear();
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });

  it('zero-pads single-digit months', () => {
    // Mock January (month 0)
    const jan = new Date('2025-01-15');
    vi.setSystemTime(jan);
    expect(getCurrentMonthYear()).toBe('2025-01');
  });

  it('returns correct value for December', () => {
    const dec = new Date('2025-12-25');
    vi.setSystemTime(dec);
    expect(getCurrentMonthYear()).toBe('2025-12');
  });

  it('never returns month "0" (the old bug)', () => {
    // January used to produce "2025-0" — verify it never happens
    vi.setSystemTime(new Date('2025-01-01'));
    const result = getCurrentMonthYear();
    const month = result.split('-')[1];
    expect(month).not.toBe('0');
    expect(Number(month)).toBeGreaterThanOrEqual(1);
  });
});

describe('isNewMonth', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true when lastReset is a different month', () => {
    expect(isNewMonth('2025-05')).toBe(true);
  });

  it('returns false when lastReset is the current month', () => {
    expect(isNewMonth('2025-06')).toBe(false);
  });

  it('returns true when lastReset is empty string', () => {
    expect(isNewMonth('')).toBe(true);
  });
});

describe('isNewDay', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-06-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false when lastDate matches today', () => {
    expect(isNewDay('2025-06-15')).toBe(false);
  });

  it('returns true when lastDate is yesterday', () => {
    expect(isNewDay('2025-06-14')).toBe(true);
  });

  it('returns true when lastDate is empty', () => {
    expect(isNewDay('')).toBe(true);
  });
});
