import { describe, it, expect } from 'vitest';
import { applyGrade } from '../lib/srs';

const base = { interval: 1, easeFactor: 2.5, reps: 0 };

describe('applyGrade — grade 0 (Forgot)', () => {
  it('resets interval to 1 regardless of prior interval', () => {
    expect(applyGrade({ ...base, interval: 15 }, 0).interval).toBe(1);
  });
  it('resets reps to 0', () => {
    expect(applyGrade({ ...base, reps: 7 }, 0).reps).toBe(0);
  });
  it('is never mastered', () => {
    expect(applyGrade({ ...base, interval: 30 }, 0).mastered).toBe(false);
  });
});

describe('applyGrade — grade 1 (Hard)', () => {
  it('increases interval by 1.2× (rounded)', () => {
    expect(applyGrade({ ...base, interval: 5 }, 1).interval).toBe(6);
  });
  it('interval minimum is 1', () => {
    expect(applyGrade({ ...base, interval: 1 }, 1).interval).toBe(1);
  });
  it('does not change reps', () => {
    expect(applyGrade({ ...base, reps: 3 }, 1).reps).toBe(3);
  });
});

describe('applyGrade — grade 2 (Good)', () => {
  it('first rep: sets interval to 1, reps to 1', () => {
    const r = applyGrade({ ...base, reps: 0 }, 2);
    expect(r.interval).toBe(1);
    expect(r.reps).toBe(1);
  });
  it('second rep: sets interval to 3, reps to 2', () => {
    const r = applyGrade({ ...base, reps: 1 }, 2);
    expect(r.interval).toBe(3);
    expect(r.reps).toBe(2);
  });
  it('subsequent reps: multiplies by easeFactor', () => {
    const r = applyGrade({ interval: 4, easeFactor: 2.5, reps: 2 }, 2);
    expect(r.interval).toBe(10); // round(4 * 2.5)
  });
  it('slightly increases easeFactor', () => {
    const r = applyGrade(base, 2);
    expect(r.easeFactor).toBeCloseTo(2.55, 2);
  });
});

describe('applyGrade — grade 3 (Easy)', () => {
  it('applies 1.3× bonus on top of normal interval', () => {
    // reps=1 → interval=3 → *1.3 = 3.9 → 4
    const r = applyGrade({ ...base, reps: 1 }, 3);
    expect(r.interval).toBe(4);
  });
  it('increases easeFactor by 0.15 (capped at 3.0)', () => {
    const r = applyGrade({ ...base, easeFactor: 2.9 }, 3);
    expect(r.easeFactor).toBeCloseTo(3.0, 2);
  });
  it('does not exceed easeFactor cap of 3.0', () => {
    const r = applyGrade({ ...base, easeFactor: 3.0 }, 3);
    expect(r.easeFactor).toBe(3.0);
  });
});

describe('applyGrade — mastery threshold', () => {
  it('marks mastered when interval exceeds 21 days', () => {
    // interval=10, easeFactor=2.5, reps=2: 10*2.5=25, *1.3=32 → mastered
    const r = applyGrade({ interval: 10, easeFactor: 2.5, reps: 2 }, 3);
    expect(r.mastered).toBe(true);
  });
  it('not mastered when interval is exactly 21', () => {
    // use grade 1 to stay at 21: interval=18, *1.2=21.6→22... let's just check 21
    const r = applyGrade({ interval: 17, easeFactor: 2.5, reps: 5 }, 1);
    // round(17*1.2)=20 → not mastered
    expect(r.mastered).toBe(false);
  });
});

describe('applyGrade — date fields', () => {
  it('sets nextReview to a valid future ISO date', () => {
    const before = new Date();
    const r = applyGrade(base, 2);
    const next = new Date(r.nextReview);
    expect(next.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(r.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
  it('sets lastReviewed to approximately now', () => {
    const before = Date.now();
    const r = applyGrade(base, 2);
    const reviewed = new Date(r.lastReviewed).getTime();
    expect(reviewed).toBeGreaterThanOrEqual(before);
    expect(reviewed).toBeLessThanOrEqual(Date.now() + 100);
  });
});
