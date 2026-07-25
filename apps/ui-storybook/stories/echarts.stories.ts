import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiEChart, XuiEChartImports, provideXuiECharts, type XuiEChartEvent } from '@xui/echarts';
import type { EChartsOption } from 'echarts';

/**
 * Apache ECharts behind one component. The whole chart is the `option` input,
 * every ECharts event is an output, and the wrapper owns the fiddly parts:
 * merging option changes instead of redrawing, resizing with the container,
 * theming from the `@xui/core` tokens in light *and* dark, and disposing with
 * the component.
 *
 * ECharts itself is provided by the app, so the choice between the full build
 * and a tree-shaken one stays where it belongs:
 *
 * ```ts
 * provideXuiECharts({ echarts: () => import('echarts') });
 * ```
 */
const meta: Meta<XuiEChart> = {
  title: 'Data display/ECharts',
  component: XuiEChart,
  decorators: [
    applicationConfig({ providers: [provideXuiECharts({ echarts: () => import('echarts') })] }),
    moduleMetadata({ imports: [XuiEChartImports] })
  ]
};

export default meta;
type Story = StoryObj<XuiEChart>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

/** Tight margins — the chart, not the whitespace around it. */
const GRID = { left: 8, right: 16, top: 32, bottom: 8, containLabel: true };

/**
 * One series, so the title carries the identity and no legend box is needed.
 * Bars sit on a category axis with the grid lines left recessive.
 */
export const Bar: Story = {
  render: () => ({
    props: {
      option: {
        grid: GRID,
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: MONTHS },
        yAxis: { type: 'value', name: 'Signups' },
        series: [{ type: 'bar', name: 'Signups', data: [820, 932, 901, 1290, 1330, 1320, 1450, 1610] }]
      } satisfies EChartsOption
    },
    template: `<xui-echart [option]="option" class="max-w-3xl" />`
  })
};

/**
 * Three series take the first three categorical slots, in order. The legend is
 * always present past one series, so identity never rests on colour alone.
 */
export const Series: Story = {
  render: () => ({
    props: {
      option: {
        grid: { ...GRID, top: 48 },
        legend: { top: 0, left: 0, icon: 'roundRect', itemHeight: 8, itemWidth: 8 },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', boundaryGap: false, data: MONTHS },
        yAxis: { type: 'value' },
        series: [
          { type: 'line', name: 'Web', data: [220, 282, 291, 334, 390, 330, 310, 420] },
          { type: 'line', name: 'iOS', data: [150, 232, 201, 154, 190, 330, 410, 380] },
          { type: 'line', name: 'Android', data: [98, 77, 101, 99, 140, 176, 135, 148] }
        ]
      } satisfies EChartsOption
    },
    template: `<xui-echart [option]="option" class="max-w-3xl" />`
  })
};

/**
 * `loading` puts ECharts' own spinner over the chart, themed from the tokens —
 * bind it to whatever tells you the data is still in flight.
 */
export const Loading: Story = {
  render: () => ({
    props: {
      loading: true,
      option: {
        grid: GRID,
        xAxis: { type: 'category', data: MONTHS },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [820, 932, 901, 1290, 1330, 1320, 1450, 1610] }]
      } satisfies EChartsOption
    },
    template: `<xui-echart [option]="option" [loading]="loading" class="max-w-3xl" />`
  })
};

/**
 * `xuiEChartGroup` links every chart inside it: hovering one moves the axis
 * pointer on the others, and a zoom on one zooms them all.
 */
export const LinkedGroup: Story = {
  render: () => ({
    props: {
      visits: {
        grid: { ...GRID, top: 44 },
        title: { text:'Visits', left: 0, textStyle: { fontSize: 13 } },
        tooltip: { trigger: 'axis' },
        axisPointer: { link: [{ xAxisIndex: 'all' }] },
        xAxis: { type: 'category', boundaryGap: false, data: MONTHS },
        yAxis: { type: 'value' },
        series: [{ type: 'line', name: 'Visits', areaStyle: { opacity: 0.12 }, data: [820, 932, 901, 1290, 1330, 1320, 1450, 1610] }]
      } satisfies EChartsOption,
      errors: {
        grid: { ...GRID, top: 44 },
        title: { text:'Errors', left: 0, textStyle: { fontSize: 13 } },
        tooltip: { trigger: 'axis' },
        axisPointer: { link: [{ xAxisIndex: 'all' }] },
        xAxis: { type: 'category', boundaryGap: false, data: MONTHS },
        yAxis: { type: 'value' },
        series: [{ type: 'line', name: 'Errors', data: [12, 18, 9, 24, 31, 15, 11, 8] }]
      } satisfies EChartsOption
    },
    template: `
      <div xuiEChartGroup="traffic" class="grid max-w-3xl gap-4 md:grid-cols-2">
        <xui-echart [option]="visits" class="h-56" />
        <xui-echart [option]="errors" class="h-56" />
      </div>
    `
  })
};

/**
 * Events arrive as outputs, prefixed so they cannot collide with the native DOM
 * events on the host. Anything not wrapped is reachable through the instance —
 * `(chartInit)` hands it over, and `#chart="xuiEChart"` keeps it around.
 */
export const Events: Story = {
  render: () => ({
    props: {
      selected: '—',
      option: {
        grid: GRID,
        tooltip: { trigger: 'item' },
        xAxis: { type: 'category', data: MONTHS },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [820, 932, 901, 1290, 1330, 1320, 1450, 1610] }]
      } satisfies EChartsOption,
      onClick(this: { selected: string }, event: XuiEChartEvent) {
        this.selected = `${event['name']} · ${event['value']}`;
      }
    },
    template: `
      <div class="max-w-3xl">
        <p class="text-foreground-muted mb-2 text-sm">Clicked: <span class="text-foreground">{{ selected }}</span></p>
        <xui-echart [option]="option" (chartClick)="onClick($event)" />
      </div>
    `
  })
};
