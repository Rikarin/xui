import { render } from '@xui/testing';
import { XuiKbd } from './kbd';

describe('XuiKbd', () => {
  it('styles a kbd element', () => {
    const { query } = render(`<kbd xuiKbd>K</kbd>`, { imports: [XuiKbd] });
    const el = query('kbd')!;
    expect(el.className).toContain('rounded');
    expect(el.className).toContain('h-5');
    expect(el.textContent).toBe('K');
  });

  it('applies the size variant', () => {
    const { query } = render(`<kbd xuiKbd size="lg">⌘</kbd>`, { imports: [XuiKbd] });
    expect(query('kbd')!.className).toContain('h-6');
  });

  it('merges a custom class', () => {
    const { query } = render(`<kbd xuiKbd class="uppercase">esc</kbd>`, { imports: [XuiKbd] });
    expect(query('kbd')!.className).toContain('uppercase');
  });
});
