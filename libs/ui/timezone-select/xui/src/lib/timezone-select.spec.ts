import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@xui/testing';
import { XuiTimezoneSelectImports } from '../index';
import { XuiTimezoneSelect } from './timezone-select';

const IMPORTS = [XuiTimezoneSelectImports];

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(`<xui-timezone-select [value]="props().value ?? null" [date]="props().date" />`, {
    imports: IMPORTS,
    props
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-timezone-select')
    .componentInstance as XuiTimezoneSelect;
  return { ...result, cmp };
};

const trigger = () => document.querySelector('xui-timezone-select xui-select button') as HTMLButtonElement;
const options = () => [...document.querySelectorAll('.cdk-overlay-container [role="option"]')] as HTMLElement[];

describe('XuiTimezoneSelect', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove()));

  it('renders a select trigger with a placeholder', () => {
    const { detect } = setup();
    detect();

    expect(trigger()).toBeTruthy();
    expect(trigger().textContent).toContain('Select a time zone');
  });

  it('offers time zones labelled with their GMT offset', () => {
    const { detect, click } = setup({ date: new Date(Date.UTC(2024, 0, 1, 12, 0)) });
    detect();

    click(trigger());
    detect();

    const labels = options().map(o => o.textContent?.trim());
    expect(labels.length).toBeGreaterThan(0);
    // Every label carries a GMT offset in parentheses.
    expect(labels.every(l => /\(GMT[+\-−]?\d?/i.test(l ?? '') || /\(GMT\)/.test(l ?? ''))).toBe(true);
    // A well-known zone should be present.
    expect(labels.some(l => l?.startsWith('Europe/London'))).toBe(true);
  });

  it('shows the current selection on the trigger', () => {
    const { detect } = setup({ value: 'Europe/London', date: new Date(Date.UTC(2024, 0, 1)) });
    detect();

    expect(trigger().textContent).toContain('Europe/London');
  });

  it('updates the value when a zone is chosen', () => {
    const { detect, click, cmp } = setup({ date: new Date(Date.UTC(2024, 0, 1)) });
    detect();
    click(trigger());
    detect();

    const london = options().find(o => o.textContent?.includes('Europe/London'))!;
    london.click();
    detect();

    expect(cmp.value()).toBe('Europe/London');
  });

  describe('as a form control', () => {
    const formSetup = (control: FormControl<string | null>) =>
      render(`<xui-timezone-select [formControl]="props().control" [date]="props().date" />`, {
        imports: [...IMPORTS, ReactiveFormsModule],
        props: { control, date: new Date(Date.UTC(2024, 0, 1)) }
      });

    it('writes the control value onto the trigger', () => {
      const control = new FormControl<string | null>('Europe/London');
      const { detect } = formSetup(control);
      detect();

      expect(trigger().textContent).toContain('Europe/London');

      control.setValue('Asia/Tokyo');
      detect();
      expect(trigger().textContent).toContain('Asia/Tokyo');
    });

    it('propagates a pick back to the control and honours disable()', () => {
      const control = new FormControl<string | null>(null);
      const { detect, click } = formSetup(control);
      detect();

      click(trigger());
      detect();
      const london = options().find(o => o.textContent?.includes('Europe/London'))!;
      london.click();
      detect();

      expect(control.value).toBe('Europe/London');
      // Choosing a zone closes the panel and marks the control touched.
      expect(control.touched).toBe(true);

      control.disable();
      detect();
      expect(trigger().disabled).toBe(true);
    });
  });
});
