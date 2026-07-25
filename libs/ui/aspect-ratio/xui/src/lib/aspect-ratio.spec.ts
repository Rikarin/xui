import { render } from '@xui/testing';
import { XuiAspectRatio } from './aspect-ratio';

describe('XuiAspectRatio', () => {
  it('applies the ratio as a CSS aspect-ratio', () => {
    const { query } = render(`<xui-aspect-ratio [ratio]="16 / 9"><div>x</div></xui-aspect-ratio>`, {
      imports: [XuiAspectRatio]
    });
    const host = query('xui-aspect-ratio')! as HTMLElement;
    expect(host.style.aspectRatio).toBe(String(16 / 9));
  });

  it('defaults to a square', () => {
    const { query } = render(`<xui-aspect-ratio><div>x</div></xui-aspect-ratio>`, { imports: [XuiAspectRatio] });
    expect((query('xui-aspect-ratio')! as HTMLElement).style.aspectRatio).toBe('1');
  });

  it('coerces a string ratio', () => {
    const { query } = render(`<xui-aspect-ratio ratio="2"><div>x</div></xui-aspect-ratio>`, {
      imports: [XuiAspectRatio]
    });
    expect((query('xui-aspect-ratio')! as HTMLElement).style.aspectRatio).toBe('2');
  });
});
