import { money, relativeTime, signedPercent } from './format';
import { NOW } from './models';

function ago(seconds: number): Date {
  return new Date(NOW.getTime() - seconds * 1000);
}

describe('relativeTime', () => {
  it('steps through the units', () => {
    expect(relativeTime(ago(30))).toBe('30 seconds ago');
    expect(relativeTime(ago(600))).toBe('10 minutes ago');
    expect(relativeTime(ago(7200))).toBe('2 hours ago');
    expect(relativeTime(ago(86400 * 3))).toBe('3 days ago');
    expect(relativeTime(ago(86400 * 21))).toBe('3 weeks ago');
    expect(relativeTime(ago(86400 * 200))).toBe('6 months ago');
    expect(relativeTime(ago(86400 * 800))).toBe('2 years ago');
  });

  it('does not count backwards for a clock skewed into the future', () => {
    expect(relativeTime(new Date(NOW.getTime() + 5000))).toBe('just now');
  });
});

describe('money', () => {
  it('drops the cents unless asked for them', () => {
    expect(money(1234.56)).toBe('€1,235');
    expect(money(1234.56, true)).toBe('€1,234.56');
  });
});

describe('signedPercent', () => {
  it('signs only the positive case, because a negative already reads as one', () => {
    expect(signedPercent(12.4)).toBe('+12.4%');
    expect(signedPercent(-3)).toBe('-3.0%');
    expect(signedPercent(0)).toBe('0.0%');
  });
});
