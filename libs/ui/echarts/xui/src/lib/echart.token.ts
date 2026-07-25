import { Injectable, InjectionToken, inject, type ValueProvider } from '@angular/core';
import type { EChartsInitOpts, SetOptionOpts } from 'echarts/core';

/**
 * The slice of the ECharts module this package calls.
 *
 * Deliberately narrow: anything that satisfies it works, so a consumer can hand
 * over the full `echarts` bundle or a custom build with only the charts they
 * use registered.
 */
export type XuiEChartsCore = Pick<typeof import('echarts/core'), 'init' | 'connect'>;

/** Returns ECharts, or a promise for it — `() => import('echarts')` is a promise. */
export type XuiEChartsLoader = () => XuiEChartsCore | Promise<XuiEChartsCore>;

/**
 * How a chart is themed:
 *
 * - `'tokens'` — build the theme from the `@xui/core` design tokens resolved on
 *   the chart element, so charts follow the app's palette and its light/dark
 *   theme without any per-chart styling. The default.
 * - `null` — no theme at all; raw ECharts defaults.
 * - a string — the name of a theme registered with `echarts.registerTheme()`.
 * - an object — an ECharts theme literal.
 */
export type XuiEChartTheme = 'tokens' | string | Record<string, unknown> | null;

export interface XuiEChartConfig {
  /**
   * Where ECharts comes from. This package never imports it directly, so the
   * consumer decides between the whole library and a tree-shaken build:
   *
   * ```ts
   * // the lot, code-split into its own chunk
   * provideXuiECharts({ echarts: () => import('echarts') });
   *
   * // or only what this app draws
   * import * as echarts from 'echarts/core';
   * import { BarChart } from 'echarts/charts';
   * import { GridComponent, TooltipComponent } from 'echarts/components';
   * import { CanvasRenderer } from 'echarts/renderers';
   *
   * echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);
   * provideXuiECharts({ echarts: () => echarts });
   * ```
   */
  echarts: XuiEChartsLoader;
  /** Default for every chart's `theme` input. */
  theme: XuiEChartTheme;
  /** Default `echarts.init()` options — renderer, locale, device pixel ratio. */
  initOptions?: EChartsInitOpts;
  /** Default `setOption()` options — `notMerge`, `lazyUpdate`, `replaceMerge`. */
  updateOptions?: SetOptionOpts;
  /** Keep charts sized to their host element. */
  autoResize: boolean;
}

const defaultConfig: Omit<XuiEChartConfig, 'echarts'> = {
  theme: 'tokens',
  autoResize: true
};

const XuiEChartConfigToken = new InjectionToken<XuiEChartConfig>('XuiEChartConfig');

/**
 * Wires ECharts into the app and sets the house defaults for every chart.
 * Required — `<xui-echart>` throws without it, because the package deliberately
 * has no opinion about which ECharts build you ship.
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideXuiECharts({ echarts: () => import('echarts') })]
 * });
 * ```
 */
export function provideXuiECharts(config: Partial<XuiEChartConfig> & Pick<XuiEChartConfig, 'echarts'>): ValueProvider {
  return { provide: XuiEChartConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiEChartConfig(): XuiEChartConfig {
  const config = inject(XuiEChartConfigToken, { optional: true });

  if (!config) {
    throw new Error(
      '@xui/echarts: no ECharts module has been provided. Add ' +
        "provideXuiECharts({ echarts: () => import('echarts') }) to your application providers."
    );
  }

  return config;
}

/**
 * Loads the ECharts module once per application, however many charts ask for it
 * — so `() => import('echarts')` costs a single request and a single parse.
 */
@Injectable({ providedIn: 'root' })
export class XuiECharts {
  private readonly config = injectXuiEChartConfig();
  private pending?: Promise<XuiEChartsCore>;

  load(): Promise<XuiEChartsCore> {
    return (this.pending ??= Promise.resolve(this.config.echarts()).then(module => {
      // A namespace object from `import()` may carry the library on `default`
      // (CommonJS interop) or spread across the namespace itself (ESM).
      const core = module as XuiEChartsCore & { default?: XuiEChartsCore };

      return typeof core.init === 'function' ? core : core.default!;
    }));
  }
}
