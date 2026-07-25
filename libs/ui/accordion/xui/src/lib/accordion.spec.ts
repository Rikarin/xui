import { render } from '@xui/testing';
import { XuiAccordion } from './accordion';
import { XuiAccordionItem } from './accordion-item';

const setup = (attrs = '') => {
  const result = render(
    `<xui-accordion ${attrs}>
       <xui-accordion-item value="a" title="First">Body A</xui-accordion-item>
       <xui-accordion-item value="b" title="Second">Body B</xui-accordion-item>
       <xui-accordion-item value="c" title="Third" disabled>Body C</xui-accordion-item>
     </xui-accordion>`,
    { imports: [XuiAccordion, XuiAccordionItem] }
  );
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-accordion').componentInstance as XuiAccordion;
  const triggers = () => [...document.querySelectorAll('xui-accordion-item button')] as HTMLButtonElement[];
  return { ...result, cmp, triggers };
};

describe('XuiAccordion', () => {
  it('opens a panel on click', () => {
    const { detect, cmp, triggers } = setup();
    detect();
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');

    triggers()[0].click();
    detect();
    expect(cmp.value()).toEqual(['a']);
    expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps a single panel open by default', () => {
    const { detect, cmp, triggers } = setup();
    detect();
    triggers()[0].click();
    detect();
    triggers()[1].click();
    detect();
    expect(cmp.value()).toEqual(['b']);
  });

  it('allows several open panels with multiple', () => {
    const { detect, cmp, triggers } = setup('multiple');
    detect();
    triggers()[0].click();
    detect();
    triggers()[1].click();
    detect();
    expect(cmp.value()).toEqual(['a', 'b']);
  });

  it('toggles a panel closed', () => {
    const { detect, cmp, triggers } = setup();
    detect();
    triggers()[0].click();
    detect();
    triggers()[0].click();
    detect();
    expect(cmp.value()).toEqual([]);
  });

  it('does not toggle a disabled item', () => {
    const { detect, cmp, triggers } = setup();
    detect();
    triggers()[2].click();
    detect();
    expect(cmp.value()).toEqual([]);
  });
});
