import { render } from '@xui/testing';
import { XuiStepsImports } from '../index';
import { XuiSteps } from './steps';

const IMPORTS = [XuiStepsImports];
const setup = (attrs = '', props: Record<string, unknown> = {}) => {
  const result = render(
    `<xui-steps ${attrs} [(current)]="props().current">
       <xui-step title="Cart" />
       <xui-step title="Pay" description="Card" />
       <xui-step title="Done" />
     </xui-steps>`,
    { imports: IMPORTS, props: { current: 1, ...props } }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-steps').componentInstance as XuiSteps;
  return { ...result, cmp };
};

const circles = () => [...document.querySelectorAll('xui-steps button > span:first-child')] as HTMLElement[];

describe('XuiSteps', () => {
  it('derives finish / process / wait from the current index', () => {
    const { detect } = setup('', { current: 1 });
    detect();

    // Step 0 finished (check icon), step 1 in process (primary fill), step 2 waiting.
    expect(circles()[0].querySelector('svg')).not.toBeNull();
    expect(circles()[1].className).toContain('bg-primary');
    expect(circles()[2].textContent?.trim()).toBe('3');
    expect(circles()[2].className).toContain('border-border');
  });

  it('respects a per-step status override', () => {
    const { detect } = render(
      `<xui-steps [current]="0"><xui-step title="A" status="error" /><xui-step title="B" /></xui-steps>`,
      { imports: IMPORTS }
    );
    detect();

    expect(circles()[0].className).toContain('border-error');
    expect(circles()[0].querySelector('svg')).not.toBeNull();
  });

  it('moves current on click only when clickable', () => {
    const { detect, cmp } = setup('clickable', { current: 0 });
    detect();

    (document.querySelectorAll('xui-steps button')[2] as HTMLElement).click();
    detect();
    expect(cmp.current()).toBe(2);
  });

  it('ignores clicks when not clickable', () => {
    const { detect, cmp } = setup('', { current: 0 });
    detect();

    (document.querySelectorAll('xui-steps button')[2] as HTMLButtonElement).disabled;
    expect((document.querySelectorAll('xui-steps button')[2] as HTMLButtonElement).disabled).toBe(true);
    expect(cmp.current()).toBe(0);
  });

  it('stacks vertically in vertical orientation', () => {
    const { detect } = setup('orientation="vertical"');
    detect();

    expect((document.querySelector('xui-steps') as HTMLElement).className).toContain('flex-col');
  });
});
