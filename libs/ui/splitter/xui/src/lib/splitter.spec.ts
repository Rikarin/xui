import { render } from '@xui/testing';
import { XuiSplitterImports } from '../index';
import { XuiSplitter } from './splitter';

const IMPORTS = [XuiSplitterImports];
const setup = (template: string) => {
  const result = render(template, { imports: IMPORTS });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-splitter').componentInstance as XuiSplitter;
  return { ...result, cmp };
};

const gutters = () => [...document.querySelectorAll('xui-splitter [role="separator"]')] as HTMLElement[];
const press = (el: HTMLElement, key: string, init: KeyboardEventInit = {}) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));

describe('XuiSplitter', () => {
  it('distributes leftover space to auto panels', () => {
    const { detect, cmp } = setup(
      `<xui-splitter>
         <xui-splitter-panel [defaultSize]="20">A</xui-splitter-panel>
         <xui-splitter-panel>B</xui-splitter-panel>
         <xui-splitter-panel>C</xui-splitter-panel>
       </xui-splitter>`
    );
    detect();

    expect(cmp['sizes']()).toEqual([20, 40, 40]);
  });

  it('renders a gutter between each pair of panels', () => {
    const { detect } = setup(
      `<xui-splitter>
         <xui-splitter-panel>A</xui-splitter-panel>
         <xui-splitter-panel>B</xui-splitter-panel>
         <xui-splitter-panel>C</xui-splitter-panel>
       </xui-splitter>`
    );
    detect();

    expect(gutters()).toHaveLength(2);
  });

  it('resizes the adjacent panels when a gutter is dragged', () => {
    const { detect, cmp } = setup(
      `<xui-splitter>
         <xui-splitter-panel [defaultSize]="50">A</xui-splitter-panel>
         <xui-splitter-panel [defaultSize]="50">B</xui-splitter-panel>
       </xui-splitter>`
    );
    detect();

    const splitter = document.querySelector('xui-splitter') as HTMLElement;
    Object.defineProperty(splitter, 'clientWidth', { value: 200, configurable: true });

    gutters()[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 140 })); // +40px = +20%
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    detect();

    expect(cmp['sizes']()).toEqual([70, 30]);
  });

  it('exposes each gutter as a focusable separator carrying its panel size', () => {
    const { detect } = setup(
      `<xui-splitter>
         <xui-splitter-panel [defaultSize]="30" [min]="10" [max]="80">A</xui-splitter-panel>
         <xui-splitter-panel [defaultSize]="70">B</xui-splitter-panel>
       </xui-splitter>`
    );
    detect();

    const gutter = gutters()[0];
    expect(gutter.tabIndex).toBe(0);
    expect(gutter.getAttribute('aria-orientation')).toBe('vertical');
    expect(gutter.getAttribute('aria-valuenow')).toBe('30');
    expect(gutter.getAttribute('aria-valuemin')).toBe('10');
    expect(gutter.getAttribute('aria-valuemax')).toBe('80');
  });

  it('resizes with the arrow keys', () => {
    const emitted: number[][] = [];
    const { detect, cmp } = setup(
      `<xui-splitter>
         <xui-splitter-panel [defaultSize]="50">A</xui-splitter-panel>
         <xui-splitter-panel [defaultSize]="50">B</xui-splitter-panel>
       </xui-splitter>`
    );
    detect();
    cmp.sizeChange.subscribe(sizes => emitted.push(sizes));

    press(gutters()[0], 'ArrowRight');
    detect();
    expect(cmp['sizes']()).toEqual([51, 49]);

    // Shift takes a 10% stride, and Home collapses to the left panel's minimum.
    press(gutters()[0], 'ArrowLeft', { shiftKey: true });
    detect();
    expect(cmp['sizes']()).toEqual([41, 59]);

    press(gutters()[0], 'Home');
    detect();
    expect(cmp['sizes']()).toEqual([0, 100]);
    expect(emitted.at(-1)).toEqual([0, 100]);
  });

  it('steps along the block axis when vertical', () => {
    const { detect, cmp } = setup(
      `<xui-splitter orientation="vertical">
         <xui-splitter-panel [defaultSize]="50">A</xui-splitter-panel>
         <xui-splitter-panel [defaultSize]="50">B</xui-splitter-panel>
       </xui-splitter>`
    );
    detect();

    expect(gutters()[0].getAttribute('aria-orientation')).toBe('horizontal');

    // Left/right do nothing on a vertical splitter; down/up drive it.
    press(gutters()[0], 'ArrowRight');
    detect();
    expect(cmp['sizes']()).toEqual([50, 50]);

    press(gutters()[0], 'ArrowDown');
    detect();
    expect(cmp['sizes']()).toEqual([51, 49]);
  });

  it('respects a panel minimum while dragging', () => {
    const emitted: number[][] = [];
    const { detect, cmp } = setup(
      `<xui-splitter>
         <xui-splitter-panel [defaultSize]="50" [min]="30">A</xui-splitter-panel>
         <xui-splitter-panel [defaultSize]="50">B</xui-splitter-panel>
       </xui-splitter>`
    );
    detect();
    cmp.sizeChange.subscribe(sizes => emitted.push(sizes));

    const splitter = document.querySelector('xui-splitter') as HTMLElement;
    Object.defineProperty(splitter, 'clientWidth', { value: 200, configurable: true });

    gutters()[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 0 })); // -50% would push A below min
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    detect();

    // A clamps at its 30% minimum.
    expect(cmp['sizes']()[0]).toBe(30);
    expect(emitted.at(-1)).toEqual([30, 70]);
  });
});
