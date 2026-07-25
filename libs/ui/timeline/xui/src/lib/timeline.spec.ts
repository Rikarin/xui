import { expectClasses, render } from '@xui/testing';
import { XuiTimelineImports } from '../index';

const IMPORTS = [XuiTimelineImports];
const items = () => [...document.querySelectorAll('xui-timeline-item')] as HTMLElement[];
const dot = (el: HTMLElement) => el.querySelector('span > span:first-child') as HTMLElement;

describe('XuiTimeline', () => {
  it('renders each item with a dot and its content', () => {
    const { detect } = render(
      `<xui-timeline>
         <xui-timeline-item label="09:00">Created</xui-timeline-item>
         <xui-timeline-item color="success">Done</xui-timeline-item>
       </xui-timeline>`,
      { imports: IMPORTS }
    );
    detect();

    expect(items()).toHaveLength(2);
    expect(items()[0].textContent).toContain('09:00');
    expect(items()[0].textContent).toContain('Created');
    expectClasses(dot(items()[0]), 'bg-primary');
    expectClasses(dot(items()[1]), 'bg-success');
  });

  it('hides the connecting line on the last item', () => {
    const { detect } = render(
      `<xui-timeline><xui-timeline-item>A</xui-timeline-item><xui-timeline-item>B</xui-timeline-item></xui-timeline>`,
      { imports: IMPORTS }
    );
    detect();

    const timeline = document.querySelector('xui-timeline') as HTMLElement;
    expect(timeline.className).toContain('[&>xui-timeline-item:last-child_.xui-tl-line]:hidden');
  });

  it('reverses the axis in right mode', () => {
    const { detect } = render(
      `<xui-timeline mode="right"><xui-timeline-item>A</xui-timeline-item></xui-timeline>`,
      { imports: IMPORTS }
    );
    detect();

    expectClasses(items()[0], 'flex-row-reverse', 'text-end');
  });
});
