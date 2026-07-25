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
});
