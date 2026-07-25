import { render } from '@xui/testing';
import { XuiCarouselImports } from '../index';
import { XuiCarousel } from './carousel';

const IMPORTS = [XuiCarouselImports];
const setup = (attrs = '', props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-carousel ${attrs} [(index)]="props().index">
       <xui-carousel-item>One</xui-carousel-item>
       <xui-carousel-item>Two</xui-carousel-item>
       <xui-carousel-item>Three</xui-carousel-item>
     </xui-carousel>`,
    { imports: IMPORTS, props: { index: 0, ...props } }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-carousel').componentInstance as XuiCarousel;
  return { ...result, cmp };
};

const dots = () => [...document.querySelectorAll('xui-carousel [aria-label^="Go to slide"]')] as HTMLElement[];
const track = () => document.querySelector('xui-carousel .flex') as HTMLElement;

describe('XuiCarousel', () => {
  it('renders a slide and a dot per item', () => {
    const { detect } = setup();
    detect();

    expect(document.querySelectorAll('xui-carousel .shrink-0').length).toBe(3);
    expect(dots()).toHaveLength(3);
  });

  it('translates the track to the active index', () => {
    const { detect } = setup('', { index: 1 });
    detect();

    expect(track().style.transform).toBe('translateX(-100%)');
  });

  it('advances and wraps with next/prev when looping', () => {
    const { detect, cmp } = setup('', { index: 2 });
    detect();

    cmp.next();
    detect();
    expect(cmp.index()).toBe(0); // wrapped

    cmp.prev();
    detect();
    expect(cmp.index()).toBe(2); // wrapped back
  });

  it('clamps at the ends when loop is off', () => {
    const { detect, cmp } = setup('[loop]="false"', { index: 2 });
    detect();

    cmp.next();
    detect();
    expect(cmp.index()).toBe(2);
  });

  it('jumps to a slide when its dot is clicked', () => {
    const { detect, cmp } = setup();
    detect();

    dots()[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    detect();
    expect(cmp.index()).toBe(2);
  });

  it('autoplays through slides on a timer, paused by hover', () => {
    jest.useFakeTimers();
    try {
      const { detect, cmp } = setup('autoplay [interval]="1000"');
      detect();

      jest.advanceTimersByTime(1000);
      detect();
      expect(cmp.index()).toBe(1);

      // Hovering pauses.
      cmp['paused'].set(true);
      detect();
      jest.advanceTimersByTime(3000);
      detect();
      expect(cmp.index()).toBe(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
