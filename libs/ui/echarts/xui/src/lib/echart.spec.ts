import { By } from '@angular/platform-browser';
import { render, type RenderResult } from '@xui/testing';
import { XuiEChart, XuiEChartImports, provideXuiECharts, type XuiEChartsCore } from '../index';

/**
 * The specs run against a stand-in for ECharts rather than the real thing: the
 * unit under test is the wrapper — what it creates, what it merges, what it
 * tears down — and a fake makes each of those directly observable.
 */
class FakeChart {
  readonly optionCalls: [unknown, unknown][] = [];
  readonly handlers = new Map<string, (event: unknown) => void>();
  group = '';
  loading: Record<string, unknown> | null = null;
  disposed = false;
  resizes = 0;

  setOption(option: unknown, updateOptions: unknown): void {
    this.optionCalls.push([option, updateOptions]);
  }

  on(event: string, handler: (event: unknown) => void): void {
    this.handlers.set(event, handler);
  }

  showLoading(options: Record<string, unknown>): void {
    this.loading = options;
  }

  hideLoading(): void {
    this.loading = null;
  }

  resize(): void {
    this.resizes++;
  }

  dispose(): void {
    this.disposed = true;
  }
}

interface FakeCore extends XuiEChartsCore {
  readonly created: { dom: HTMLElement; theme: unknown; chart: FakeChart }[];
  readonly connected: string[];
}

function fakeCore(): FakeCore {
  const created: { dom: HTMLElement; theme: unknown; chart: FakeChart }[] = [];
  const connected: string[] = [];

  return {
    init: ((dom: HTMLElement, theme: unknown) => {
      const chart = new FakeChart();

      created.push({ dom, theme, chart });

      return chart;
    }) as unknown as XuiEChartsCore['init'],
    connect: (group => connected.push(group as string)) as XuiEChartsCore['connect'],
    created,
    connected
  };
}

/** Drains the loader's microtasks, then runs the effects the new instance woke. */
async function settle(result: RenderResult<never>): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
  result.detect();
}

interface Setup<TProps extends object> {
  result: RenderResult<TProps>;
  core: FakeCore;
  chart: FakeChart;
  component: XuiEChart;
}

async function setup<TProps extends object = Record<string, never>>(
  template: string,
  props?: TProps
): Promise<Setup<TProps>> {
  const core = fakeCore();
  const result = render<TProps>(template, {
    imports: [XuiEChartImports],
    providers: [provideXuiECharts({ echarts: () => core })],
    props
  });

  await settle(result as RenderResult<never>);

  return {
    result,
    core,
    chart: core.created[0]?.chart,
    component: result.fixture.debugElement.query(By.directive(XuiEChart)).componentInstance
  };
}

const BAR = `<xui-echart [option]="props().option" />`;
const OPTION = { series: [{ type: 'bar', data: [1, 2, 3] }] };

describe('XuiEChart', () => {
  it('says what to do when ECharts has not been provided', () => {
    expect(() => render(`<xui-echart />`, { imports: [XuiEChartImports] })).toThrow(/provideXuiECharts/);
  });

  it('creates one chart on the host element and applies the option', async () => {
    const { core, chart } = await setup(BAR, { option: OPTION });

    expect(core.created).toHaveLength(1);
    expect(core.created[0].dom.tagName.toLowerCase()).toBe('xui-echart');
    expect(chart.optionCalls).toEqual([[OPTION, {}]]);
  });

  it('merges a changed option into the running chart instead of rebuilding it', async () => {
    const { result, core, chart } = await setup(BAR, { option: OPTION });
    const next = { series: [{ type: 'bar', data: [4, 5, 6] }] };

    result.setProps({ option: next });

    expect(core.created).toHaveLength(1);
    expect(chart.optionCalls).toHaveLength(2);
    expect(chart.optionCalls[1][0]).toBe(next);
    expect(chart.disposed).toBe(false);
  });

  it('passes setOption options through', async () => {
    const { chart } = await setup(`<xui-echart [option]="props().option" [updateOptions]="{ notMerge: true }" />`, {
      option: OPTION
    });

    expect(chart.optionCalls[0][1]).toEqual({ notMerge: true });
  });

  it('hands the instance over as soon as it exists', async () => {
    const seen: unknown[] = [];
    const { chart, component } = await setup<{ option: unknown; onInit: (chart: unknown) => void }>(
      `<xui-echart [option]="props().option" (chartInit)="props().onInit($event)" />`,
      { option: OPTION, onInit: instance => seen.push(instance) }
    );

    expect(seen).toEqual([chart]);
    expect(component.getInstance()).toBe(chart);
  });

  it('disposes the chart with the component', async () => {
    const { result, chart } = await setup(BAR, { option: OPTION });

    result.fixture.destroy();

    expect(chart.disposed).toBe(true);
  });

  describe('theming', () => {
    it('builds a theme from the design tokens by default', async () => {
      const { core } = await setup(BAR, { option: OPTION });
      const theme = core.created[0].theme as { color: string[]; backgroundColor: string };

      expect(theme.color).toHaveLength(8);
      expect(theme.backgroundColor).toBe('transparent');
    });

    it('passes a registered theme name straight through', async () => {
      const { core } = await setup(`<xui-echart theme="dark" />`);

      expect(core.created[0].theme).toBe('dark');
    });

    it('rebuilds when the theme changes, because ECharts themes at creation', async () => {
      const { result, core } = await setup<{ theme: string }>(`<xui-echart [theme]="props().theme" />`, {
        theme: 'dark'
      });

      result.setProps({ theme: 'light' });
      await settle(result as RenderResult<never>);

      expect(core.created).toHaveLength(2);
      expect(core.created[0].chart.disposed).toBe(true);
      expect(core.created[1].theme).toBe('light');
    });
  });

  describe('loading', () => {
    it('shows the spinner while loading and hides it after', async () => {
      const { result, chart } = await setup<{ loading: boolean }>(`<xui-echart [loading]="props().loading" />`, {
        loading: true
      });

      expect(chart.loading).toMatchObject({ spinnerRadius: 12 });

      result.setProps({ loading: false });

      expect(chart.loading).toBeNull();
    });

    it('lets loadingOptions override the themed defaults', async () => {
      const { chart } = await setup(`<xui-echart loading [loadingOptions]="{ text: 'Fetching…' }" />`);

      expect(chart.loading).toMatchObject({ text: 'Fetching…' });
    });
  });

  describe('events', () => {
    it('emits the ECharts event on the matching output', async () => {
      const clicks: unknown[] = [];
      const { chart } = await setup<{ onClick: (event: unknown) => void }>(
        `<xui-echart (chartClick)="props().onClick($event)" />`,
        { onClick: event => clicks.push(event) }
      );
      const event = { seriesIndex: 0, dataIndex: 2 };

      chart.handlers.get('click')!(event);

      expect(clicks).toEqual([event]);
    });

    it('maps the multi-word outputs onto their lower-case ECharts names', async () => {
      const { chart } = await setup(BAR, { option: OPTION });

      expect([...chart.handlers.keys()]).toEqual(
        expect.arrayContaining(['dblclick', 'legendselectchanged', 'magictypechanged', 'brushend', 'globalout'])
      );
    });
  });

  describe('groups', () => {
    it('connects every chart inside a group directive', async () => {
      const core = fakeCore();
      const result = render(
        `
          <div xuiEChartGroup="sales">
            <xui-echart />
            <xui-echart />
          </div>
        `,
        { imports: [XuiEChartImports], providers: [provideXuiECharts({ echarts: () => core })] }
      );

      await settle(result);

      expect(core.created.map(({ chart }) => chart.group)).toEqual(['sales', 'sales']);
      expect(core.connected).toEqual(['sales', 'sales']);
    });

    it('lets a chart pick its own group over the enclosing one', async () => {
      const core = fakeCore();
      const result = render(`<div xuiEChartGroup="sales"><xui-echart group="costs" /></div>`, {
        imports: [XuiEChartImports],
        providers: [provideXuiECharts({ echarts: () => core })]
      });

      await settle(result);

      expect(core.created[0].chart.group).toBe('costs');
    });
  });

  describe('layout', () => {
    it('gives the chart a box to draw in', async () => {
      const { result } = await setup(BAR, { option: OPTION });

      expect(result.query('xui-echart').className).toContain('h-72');
    });

    it('lets a class on the element win over the default height', async () => {
      const { result } = await setup(`<xui-echart class="h-96" />`);

      expect(result.query('xui-echart').className).toContain('h-96');
      expect(result.query('xui-echart').className).not.toContain('h-72');
    });
  });

  it('loads ECharts once for the whole application', async () => {
    let loads = 0;
    const core = fakeCore();
    const result = render(`<xui-echart /><xui-echart /><xui-echart />`, {
      imports: [XuiEChartImports],
      providers: [
        provideXuiECharts({
          echarts: () => {
            loads++;

            return core;
          }
        })
      ]
    });

    await settle(result);

    expect(loads).toBe(1);
    expect(core.created).toHaveLength(3);
  });
});
