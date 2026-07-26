import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiSection, XuiSectionCard } from './section';
import { provideXuiSectionConfig } from './section.token';

const IMPORTS = [XuiSection, XuiSectionCard];
const setup = (template: string, props?: Record<string, unknown>, providers: unknown[] = []) =>
  render(template, { imports: IMPORTS, props, providers });

beforeEach(() => {
  // jsdom does not implement the Web Animations API, which XuiCollapse uses.
  Element.prototype.animate = jest.fn(() => ({ finished: Promise.resolve() }) as unknown as Animation);
});

describe('XuiSection', () => {
  it('renders a bordered container', () => {
    const { query } = setup('<xui-section title="Details">Body</xui-section>');

    expectClasses(query('xui-section'), 'bg-surface-raised', 'rounded-lg', 'border');
  });

  it('renders the title and subtitle', () => {
    const { host } = setup('<xui-section title="Details" subtitle="Everything">Body</xui-section>');

    expect(host.textContent).toContain('Details');
    expect(host.textContent).toContain('Everything');
  });

  it('omits the header entirely without a title', () => {
    const { host } = setup('<xui-section>Body</xui-section>');

    expect(host.querySelector('button')).toBeNull();
    expect(host.textContent?.trim()).toBe('Body');
  });

  it('projects a right element into the header', () => {
    const { host } = setup('<xui-section title="Details"><button right-element>Edit</button></xui-section>');

    expect(host.querySelector('[right-element]')?.textContent).toBe('Edit');
  });

  it('projects its content', () => {
    const { host } = setup('<xui-section title="Details"><p>Body</p></xui-section>');

    expect(host.querySelector('p')?.textContent).toBe('Body');
  });

  it('is not a disclosure unless collapsible', () => {
    const { host } = setup('<xui-section title="Details">Body</xui-section>');

    expect(host.querySelector('button')).toBeNull();
  });

  describe('when collapsible', () => {
    it('makes the header a button wired to the panel', () => {
      const { query } = setup('<xui-section title="Details" collapsible>Body</xui-section>');
      const trigger = query('button');
      const panel = query('xui-collapse');

      expectAttributes(trigger, { 'aria-expanded': 'true' });
      expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.id).toBeTruthy();
    });

    it('toggles on click and reports the new state', () => {
      const { query, click } = setup('<xui-section title="Details" collapsible>Body</xui-section>');

      click('button');

      expectAttributes(query('button'), { 'aria-expanded': 'false' });
    });

    it('turns the caret to point at the collapsed panel', () => {
      const { query, click } = setup('<xui-section title="Details" collapsible>Body</xui-section>');
      expectNoClasses(query('ng-icon'), '-rotate-90');

      click('button');

      expectClasses(query('ng-icon'), '-rotate-90');
    });

    it('honours a bound open state', () => {
      const { query } = setup('<xui-section title="Details" collapsible [open]="props().open">Body</xui-section>', {
        open: false
      });

      expectAttributes(query('button'), { 'aria-expanded': 'false' });
    });

    it('still projects its content into the collapse', () => {
      const { host } = setup('<xui-section title="Details" collapsible><p>Body</p></xui-section>');

      // A second `<ng-content>` in the non-collapsible branch would swallow
      // this; the body is rendered through a single template instead.
      expect(host.querySelector('xui-collapse p')?.textContent).toBe('Body');
    });
  });

  it('merges the class input', () => {
    const { query } = setup('<xui-section class="w-96">Body</xui-section>');

    expectClasses(query('xui-section'), 'w-96', 'rounded-lg');
  });

  it('takes its defaults from the injected config', () => {
    const { query } = setup('<xui-section title="Details">Body</xui-section>', undefined, [
      provideXuiSectionConfig({ elevation: 1, compact: true })
    ]);

    expectClasses(query('xui-section'), 'shadow-elevation-1');
    expectClasses(query('xui-section > div'), 'px-3', 'py-2');
  });
});

describe('XuiSectionCard', () => {
  it('pads its content and separates from the next card', () => {
    const { query } = setup('<xui-section-card>Body</xui-section-card>');

    expectClasses(query('xui-section-card'), 'p-4', 'border-b', 'last:border-b-0');
  });

  it('drops the padding when asked', () => {
    const { query } = setup('<xui-section-card [padded]="false">Body</xui-section-card>');

    expectNoClasses(query('xui-section-card'), 'p-4');
  });
});
