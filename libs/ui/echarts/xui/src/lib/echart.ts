import type { BooleanInput } from '@angular/cdk/coercion';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  ViewEncapsulation,
  type OutputEmitterRef
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import type { EChartsOption } from 'echarts';
import type { ECElementEvent, EChartsInitOpts, EChartsType, SetOptionOpts } from 'echarts/core';
import { XUI_ECHART_GROUP } from './echart-group';
import { createXuiEChartLoadingOptions, createXuiEChartTheme, readThemeStamp, watchColorScheme } from './echart.theme';
import { injectXuiEChartConfig, XuiECharts, type XuiEChartsCore, type XuiEChartTheme } from './echart.token';

/** Payload of the chart-level outputs — an ECharts action object. */
export type XuiEChartEvent = { type: string } & Record<string, unknown>;

/**
 * Output name → ECharts event name. Every ECharts event is lower case, so the
 * mapping is mechanical; the `chart` prefix keeps `(chartClick)` from colliding
 * with the native `click` on the host element, which would otherwise fire twice.
 */
const EVENTS = [
  'chartClick',
  'chartDblClick',
  'chartMouseDown',
  'chartMouseUp',
  'chartMouseOver',
  'chartMouseOut',
  'chartGlobalOut',
  'chartContextMenu',
  'chartHighlight',
  'chartDownplay',
  'chartSelectChanged',
  'chartLegendSelectChanged',
  'chartDataZoom',
  'chartRestore',
  'chartMagicTypeChanged',
  'chartBrushEnd',
  'chartRendered',
  'chartFinished'
] as const;

/**
 * An Apache ECharts chart as an Angular component.
 *
 * Everything ECharts understands goes through one `option` input, and the
 * wrapper owns the parts that are tedious to get right by hand: it builds the
 * instance once, applies option changes with ECharts' own merge instead of
 * redrawing, keeps the chart sized to its box, themes it from the app's design
 * tokens in both light and dark, and disposes it with the component.
 *
 * ```html
 * <xui-echart [option]="revenue" class="h-80" (chartClick)="drillDown($event)" />
 * ```
 *
 * ```ts
 * revenue: EChartsOption = {
 *   xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
 *   yAxis: { type: 'value' },
 *   series: [{ type: 'bar', data: [820, 932, 901, 1290] }]
 * };
 * ```
 *
 * Provide ECharts once with {@link provideXuiECharts} — the package never
 * imports it, so the choice between the full build and a tree-shaken one stays
 * with the app.
 *
 * Nothing here is a dead end: `chartInit` hands over the `EChartsType` instance
 * the moment it exists, and the same instance is available from `getInstance()`
 * through a template reference (`#chart="xuiEChart"`), so any ECharts API this
 * component does not wrap is still one call away.
 */
@Component({
  selector: 'xui-echart',
  exportAs: 'xuiEChart',
  template: '',
  host: {
    '[class]': 'computedClass()',
    '[attr.role]': 'role()',
    '[attr.aria-label]': 'ariaLabel()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiEChart {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly config = injectXuiEChartConfig();
  private readonly echarts = inject(XuiECharts);
  private readonly parentGroup = inject(XUI_ECHART_GROUP, { optional: true });

  private core?: XuiEChartsCore;
  private observer?: ResizeObserver;
  private unwatchColorScheme?: () => void;
  private resizeFrame = 0;
  private themeStamp = '';
  private destroyed = false;

  /** The chart, once it exists — a signal so effects re-run the moment it does. */
  private readonly chart = signal<EChartsType | null>(null);

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** The chart spec. Changes are merged into the running chart, not redrawn. */
  readonly option = input<EChartsOption>({});

  /**
   * The chart's palette, as an {@link XuiEChartTheme}: `tokens` derives one from the active xUI
   * theme, a string names a registered ECharts theme, and an object is one inline. Changing it
   * rebuilds the chart — ECharts fixes its theme at creation.
   */
  readonly theme = input<XuiEChartTheme>(this.config.theme);

  /** `echarts.init()` options — `renderer`, `locale`, `devicePixelRatio`. Rebuilds the chart. */
  readonly initOptions = input<EChartsInitOpts | undefined>(this.config.initOptions);

  /** `setOption()` options — `notMerge`, `lazyUpdate`, `replaceMerge`. */
  readonly updateOptions = input<SetOptionOpts | undefined>(this.config.updateOptions);

  /** Shows ECharts' loading spinner over the chart — for data still in flight. */
  readonly loading = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Overrides for the loading spinner; merged over the token-derived defaults. */
  readonly loadingOptions = input<Record<string, unknown>>();

  /** Keep the chart sized to its host element as the layout changes. */
  readonly autoResize = input<boolean, BooleanInput>(this.config.autoResize, { transform: booleanAttribute });

  /** Link this chart's interactions to every other chart with the same group name. */
  readonly group = input<string>();

  /**
   * A canvas says nothing to a screen reader. Describe the chart — or better,
   * pair it with a table view and leave this off.
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** The instance, as soon as ECharts has loaded and the chart is on screen. */
  readonly chartInit = output<EChartsType>();

  /** Emits ECharts' `click` — a click on a data item, with the series and data index on the event. */
  readonly chartClick = output<ECElementEvent>();
  /** Emits ECharts' `dblclick` on a data item. */
  readonly chartDblClick = output<ECElementEvent>();
  /** Emits ECharts' `mousedown` on a data item. */
  readonly chartMouseDown = output<ECElementEvent>();
  /** Emits ECharts' `mouseup` on a data item. */
  readonly chartMouseUp = output<ECElementEvent>();
  /** Emits ECharts' `mouseover` as the pointer enters a data item. */
  readonly chartMouseOver = output<ECElementEvent>();
  /** Emits ECharts' `mouseout` as the pointer leaves a data item. */
  readonly chartMouseOut = output<ECElementEvent>();
  /** Emits ECharts' `globalout` as the pointer leaves the chart altogether. */
  readonly chartGlobalOut = output<ECElementEvent>();
  /** Emits ECharts' `contextmenu` on a data item. */
  readonly chartContextMenu = output<ECElementEvent>();
  /** Emits ECharts' `highlight` when a data item is emphasised, whether by the pointer or by a dispatched action. */
  readonly chartHighlight = output<XuiEChartEvent>();
  /** Emits ECharts' `downplay` when a data item's emphasis is removed. */
  readonly chartDownplay = output<XuiEChartEvent>();
  /** Emits ECharts' `selectchanged` when the set of selected data items changes. */
  readonly chartSelectChanged = output<XuiEChartEvent>();
  /** Emits ECharts' `legendselectchanged` when a legend entry is toggled. */
  readonly chartLegendSelectChanged = output<XuiEChartEvent>();
  /** Emits ECharts' `datazoom` as the visible data window changes. */
  readonly chartDataZoom = output<XuiEChartEvent>();
  /** Emits ECharts' `restore` when the toolbox reset returns the chart to its initial state. */
  readonly chartRestore = output<XuiEChartEvent>();
  /** Emits ECharts' `magictypechanged` when the toolbox switches the chart between types. */
  readonly chartMagicTypeChanged = output<XuiEChartEvent>();
  /** Emits ECharts' `brushEnd` when a brush selection is finished. */
  readonly chartBrushEnd = output<XuiEChartEvent>();
  /** Fires on every frame ECharts paints — cheap to ignore, costly to log. */
  readonly chartRendered = output<XuiEChartEvent>();
  /** Fires once a render has settled, animations included. */
  readonly chartFinished = output<XuiEChartEvent>();

  protected readonly role = computed(() => (this.ariaLabel() ? 'img' : null));

  protected readonly computedClass = computed(() =>
    // A chart with no height draws nothing, so it starts with one; `class`
    // wins through tailwind-merge, so `class="h-96"` is all it takes.
    xui('block h-72 w-full', this.class())
  );

  constructor() {
    // Charts are a browser-only affair: this never runs during SSR, and the
    // host renders as an empty element until it does.
    afterNextRender(() => void this.create());

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.teardown();
    });
  }

  /** Push option changes into the running chart. */
  private readonly applyOption = effect(() => {
    const chart = this.chart();
    const option = this.option();

    chart?.setOption(option, untracked(this.updateOptions) ?? {});
  });

  private readonly applyLoading = effect(() => {
    const chart = this.chart();

    if (!chart) {
      return;
    }

    if (this.loading()) {
      chart.showLoading({
        ...createXuiEChartLoadingOptions(this.host),
        ...untracked(this.loadingOptions)
      });
    } else {
      chart.hideLoading();
    }
  });

  /** `theme` and `initOptions` are creation-time settings, so changing one rebuilds. */
  private readonly rebuildOnCreationOptions = effect(() => {
    this.theme();
    this.initOptions();

    if (untracked(this.chart)) {
      void this.recreate();
    }
  });

  /** The ECharts instance, or `null` until it has been created. */
  getInstance(): EChartsType | null {
    return this.chart();
  }

  /** Resize to the host element. Only needed when `autoResize` is off. */
  resize(): void {
    if (this.host.clientWidth && this.host.clientHeight) {
      this.chart()?.resize();
    }
  }

  /** Drop the current option and apply the bound one from scratch. */
  refresh(): void {
    this.chart()?.setOption(this.option(), { notMerge: true });
  }

  /** Remove everything drawn, keeping the instance. */
  clear(): void {
    this.chart()?.clear();
  }

  /** Trigger an ECharts action — `{ type: 'highlight', seriesIndex: 0 }` and friends. */
  dispatch(action: XuiEChartEvent): void {
    this.chart()?.dispatchAction(action);
  }

  /** The chart as a data URL, for downloads and exports. */
  getDataURL(options?: Parameters<EChartsType['getDataURL']>[0]): string | undefined {
    return this.chart()?.getDataURL(options);
  }

  private async create(): Promise<void> {
    const core = (this.core ??= await this.echarts.load());

    // The component can be gone by the time an async import resolves.
    if (this.destroyed) {
      return;
    }

    const chart = core.init(this.host, this.resolveTheme(), this.initOptions());

    this.themeStamp = readThemeStamp(this.host);
    this.bindEvents(chart);
    this.joinGroup(core, chart);
    this.watchSize(chart);
    this.watchTheme();

    this.chart.set(chart);
    this.chartInit.emit(chart);
  }

  private async recreate(): Promise<void> {
    this.teardown();
    this.chart.set(null);
    await this.create();
  }

  private resolveTheme(): string | Record<string, unknown> | null {
    const theme = this.theme();

    return theme === 'tokens' ? createXuiEChartTheme(this.host) : theme;
  }

  private bindEvents(chart: EChartsType): void {
    for (const name of EVENTS) {
      const emitter = this[name] as unknown as OutputEmitterRef<never>;

      chart.on(name.slice('chart'.length).toLowerCase(), (event: unknown) => emitter.emit(event as never));
    }
  }

  private joinGroup(core: XuiEChartsCore, chart: EChartsType): void {
    const group = this.group() ?? this.parentGroup?.name();

    if (!group) {
      return;
    }

    chart.group = group;
    // Idempotent: connecting a group again just picks up whoever joined since.
    core.connect(group);
  }

  private watchSize(chart: EChartsType): void {
    if (!this.autoResize() || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.observer = new ResizeObserver(() => {
      cancelAnimationFrame(this.resizeFrame);
      // Coalesced to one resize per frame — a splitter drag fires the observer
      // far more often than the chart can usefully redraw.
      this.resizeFrame = requestAnimationFrame(() => {
        if (this.host.clientWidth && this.host.clientHeight) {
          chart.resize();
        }
      });
    });

    this.observer.observe(this.host);
  }

  private watchTheme(): void {
    if (this.theme() !== 'tokens') {
      return;
    }

    this.unwatchColorScheme = watchColorScheme(() => {
      const stamp = readThemeStamp(this.host);

      // `<html>` gets classes toggled for all sorts of reasons; only a change
      // to the tokens this chart draws with is worth a rebuild.
      if (stamp !== this.themeStamp) {
        void this.recreate();
      }
    });
  }

  private teardown(): void {
    cancelAnimationFrame(this.resizeFrame);
    this.observer?.disconnect();
    this.observer = undefined;
    this.unwatchColorScheme?.();
    this.unwatchColorScheme = undefined;
    untracked(this.chart)?.dispose();
  }
}
