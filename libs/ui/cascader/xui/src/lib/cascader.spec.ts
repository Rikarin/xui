import { render } from '@xui/testing';
import { XuiCascader, type XuiCascaderOption } from './cascader';

const OPTIONS: XuiCascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [{ value: 'hangzhou', label: 'Hangzhou', children: [{ value: 'xihu', label: 'West Lake' }] }]
  },
  { value: 'jiangsu', label: 'Jiangsu', children: [{ value: 'nanjing', label: 'Nanjing' }] }
];

const setup = (props: Record<string, unknown> = {}) => {
  const result = render(`<xui-cascader [options]="props().options" [(value)]="props().value" placeholder="Pick" />`, {
    imports: [XuiCascader],
    props: { options: OPTIONS, value: [], ...props }
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-cascader').componentInstance as XuiCascader;
  return { ...result, cmp };
};

const trigger = () => document.querySelector('xui-cascader > button') as HTMLButtonElement;
// The column panel renders in the CDK overlay container, not inside the host.
const columns = () => [...document.querySelectorAll('.cdk-overlay-container ul')];
const optionByLabel = (label: string) =>
  [...document.querySelectorAll('.cdk-overlay-container [role="option"]')].find(
    o => o.textContent?.trim() === label
  ) as HTMLElement;

describe('XuiCascader', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(n => n.remove());
  });

  it('opens a single column of roots', () => {
    const { detect } = setup();
    detect();
    trigger().click();
    detect();

    expect(columns()).toHaveLength(1);
    expect([...columns()[0].querySelectorAll('[role="option"]')].map(o => o.textContent?.trim())).toEqual([
      'Zhejiang',
      'Jiangsu'
    ]);
  });

  it('expands the next column when a parent is chosen', () => {
    const { detect } = setup();
    detect();
    trigger().click();
    detect();

    optionByLabel('Zhejiang').click();
    detect();

    expect(columns()).toHaveLength(2);
    expect(optionByLabel('Hangzhou')).toBeTruthy();
  });

  it('commits the full path when a leaf is chosen and closes', () => {
    const { detect, cmp } = setup();
    detect();
    trigger().click();
    detect();

    optionByLabel('Zhejiang').click();
    detect();
    optionByLabel('Hangzhou').click();
    detect();
    optionByLabel('West Lake').click();
    detect();

    expect(cmp.value()).toEqual(['zhejiang', 'hangzhou', 'xihu']);
    expect(document.querySelector('.cdk-overlay-container ul')).toBeNull();
    expect(trigger().textContent).toContain('Zhejiang / Hangzhou / West Lake');
  });

  it('reopens at the previously committed path', () => {
    const { detect } = setup({ value: ['zhejiang', 'hangzhou'] });
    detect();

    trigger().click();
    detect();

    // Root + Hangzhou column + West Lake column are all visible.
    expect(columns()).toHaveLength(3);
  });
});
