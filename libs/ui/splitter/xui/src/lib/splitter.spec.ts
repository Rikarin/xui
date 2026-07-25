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
