import { render } from '@xui/testing';
import { formatDuration } from './countdown';
import { formatStatValue, XuiStatistic } from './statistic';

describe('XuiStatistic', () => {
  const setup = (attrs: string) => render(`<xui-statistic ${attrs} />`, { imports: [XuiStatistic] });

  it('renders the title and value', () => {
    const { query } = setup('title="Active users" [value]="1128"');

    expect(query('xui-statistic').textContent).toContain('Active users');
    expect(query('xui-statistic').textContent).toContain('1,128');
  });

  it('formats numbers with precision and thousands separators', () => {
    const { query } = setup('[value]="112893.5" [precision]="2"');
    expect(query('xui-statistic').textContent).toContain('112,893.50');
  });

  it('renders prefix and suffix', () => {
    const { query } = setup('[value]="42" prefix="$" suffix="/mo"');
    const text = query('xui-statistic').textContent ?? '';
    expect(text).toContain('$');
    expect(text).toContain('/mo');
  });
});

describe('formatStatValue', () => {
  it('groups and rounds numbers', () => {
    expect(formatStatValue(1234567, 0)).toBe('1,234,567');
    expect(formatStatValue(3.14159, 2)).toBe('3.14');
  });

  it('passes strings through untouched', () => {
    expect(formatStatValue('N/A', 2)).toBe('N/A');
  });
});

describe('formatDuration', () => {
  it('formats HH:mm:ss', () => {
    expect(formatDuration((3 * 3600 + 4 * 60 + 5) * 1000, 'HH:mm:ss')).toBe('03:04:05');
  });

  it('supports days and milliseconds tokens', () => {
    expect(formatDuration((2 * 86400 + 5 * 3600) * 1000 + 123, 'D HH:mm:ss.SSS')).toBe('2 05:00:00.123');
  });

  it('clamps at zero', () => {
    expect(formatDuration(0, 'mm:ss')).toBe('00:00');
  });
});
