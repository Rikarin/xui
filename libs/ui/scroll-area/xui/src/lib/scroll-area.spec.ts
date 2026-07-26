import { render } from '@xui/testing';
import { XuiScrollArea } from './scroll-area';
import { provideXuiScrollAreaConfig } from './scroll-area.token';

const viewport = () => document.querySelector('xui-scroll-area > div') as HTMLElement;

describe('XuiScrollArea', () => {
  it('scrolls vertically by default', () => {
    render(`<xui-scroll-area class="h-20"><div class="h-96">tall</div></xui-scroll-area>`, {
      imports: [XuiScrollArea]
    });
    expect(viewport().className).toContain('overflow-y-auto');
    expect(viewport().className).toContain('overflow-x-hidden');
  });

  it('scrolls horizontally when asked', () => {
    render(`<xui-scroll-area orientation="horizontal"><div>wide</div></xui-scroll-area>`, {
      imports: [XuiScrollArea]
    });
    expect(viewport().className).toContain('overflow-x-auto');
    expect(viewport().className).toContain('overflow-y-hidden');
  });

  it('scrolls both axes', () => {
    render(`<xui-scroll-area orientation="both"><div>x</div></xui-scroll-area>`, { imports: [XuiScrollArea] });
    expect(viewport().className).toContain('overflow-auto');
  });

  it('takes its orientation default from the injected config', () => {
    render(`<xui-scroll-area><div>wide</div></xui-scroll-area>`, {
      imports: [XuiScrollArea],
      providers: [provideXuiScrollAreaConfig({ orientation: 'horizontal' })]
    });
    expect(viewport().className).toContain('overflow-x-auto');
    expect(viewport().className).toContain('overflow-y-hidden');
  });
});
