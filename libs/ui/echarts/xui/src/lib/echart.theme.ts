/**
 * The `@xui/core` tokens a chart reads, and the value each falls back to when
 * the token layer is not loaded. The fallbacks are the same eight categorical
 * slots `theme.css` ships, so a chart still looks deliberate without it.
 */
const TOKENS = {
  foreground: ['--foreground', '#18181b'],
  foregroundMuted: ['--foreground-muted', '#52525b'],
  foregroundSubtle: ['--foreground-subtle', '#71717a'],
  border: ['--border', '#e4e4e7'],
  borderMuted: ['--border-muted', '#f4f4f5'],
  borderStrong: ['--border-strong', '#d4d4d8'],
  surface: ['--surface', '#ffffff'],
  surfaceOverlay: ['--surface-overlay', '#ffffff'],
  chart1: ['--chart-1', '#2a78d6'],
  chart2: ['--chart-2', '#eb6834'],
  chart3: ['--chart-3', '#1baf7a'],
  chart4: ['--chart-4', '#eda100'],
  chart5: ['--chart-5', '#e87ba4'],
  chart6: ['--chart-6', '#008300'],
  chart7: ['--chart-7', '#4a3aa7'],
  chart8: ['--chart-8', '#e34948']
} as const;

type TokenName = keyof typeof TOKENS;
type Tokens = Record<TokenName, string>;

/**
 * A fingerprint of the tokens currently in force on `host`.
 *
 * Comparing two of these tells a chart whether a class change on `<html>` — or
 * an OS theme flip — actually re-themed it, so it only pays to rebuild when
 * something it draws with really moved.
 */
export function readThemeStamp(host: HTMLElement): string {
  const styles = getComputedStyle(host);

  return [TOKENS.foreground[0], TOKENS.surface[0], TOKENS.chart1[0]]
    .map(token => styles.getPropertyValue(token).trim())
    .join('|');
}

/**
 * Calls `onChange` whenever the resolved theme might have moved: an app-level
 * toggle stamps `.dark` or `[data-theme]` on `<html>`, and with neither present
 * the theme follows the OS. Returns a teardown.
 */
export function watchColorScheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  // Absent under jsdom, which is where most consumers' tests run.
  const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  media?.addEventListener('change', onChange);

  return () => {
    observer.disconnect();
    media?.removeEventListener('change', onChange);
  };
}

/**
 * Builds an ECharts theme from the design tokens resolved on `host`.
 *
 * Everything a chart draws that is not data — axes, grid lines, legend, tooltip
 * — comes from the same tokens as the rest of the app, so a re-theme or a
 * light/dark switch carries the charts with it. Series colours come from the
 * categorical `--chart-1…8` ramp, in that fixed order: slot 1 is always the
 * first series, so a filter that drops a series never repaints the survivors.
 */
export function createXuiEChartTheme(host: HTMLElement): Record<string, unknown> {
  const tokens = readTokens(host);
  const fontFamily = getComputedStyle(host).fontFamily || 'inherit';

  const axis = {
    axisLine: { show: true, lineStyle: { color: tokens.border } },
    axisTick: { show: false },
    axisLabel: { color: tokens.foregroundMuted, fontFamily },
    splitLine: { show: true, lineStyle: { color: tokens.borderMuted } },
    splitArea: { show: false }
  };

  return {
    // Fixed order — never cycled. A ninth series belongs in an "Other" bucket
    // or a second chart, not in a generated hue.
    color: [
      tokens.chart1,
      tokens.chart2,
      tokens.chart3,
      tokens.chart4,
      tokens.chart5,
      tokens.chart6,
      tokens.chart7,
      tokens.chart8
    ],
    // Transparent, so the chart sits on whatever surface hosts it.
    backgroundColor: 'transparent',
    textStyle: { color: tokens.foreground, fontFamily },
    title: {
      textStyle: { color: tokens.foreground, fontFamily, fontWeight: 600 },
      subtextStyle: { color: tokens.foregroundMuted, fontFamily }
    },
    legend: {
      textStyle: { color: tokens.foregroundMuted, fontFamily },
      inactiveColor: tokens.foregroundSubtle,
      pageTextStyle: { color: tokens.foregroundMuted },
      pageIconColor: tokens.foregroundMuted,
      pageIconInactiveColor: tokens.foregroundSubtle
    },
    tooltip: {
      backgroundColor: tokens.surfaceOverlay,
      borderColor: tokens.border,
      borderWidth: 1,
      padding: [6, 10],
      textStyle: { color: tokens.foreground, fontFamily },
      axisPointer: {
        lineStyle: { color: tokens.borderStrong },
        crossStyle: { color: tokens.borderStrong },
        label: { backgroundColor: tokens.foregroundMuted }
      }
    },
    categoryAxis: { ...axis, splitLine: { show: false } },
    valueAxis: axis,
    timeAxis: axis,
    logAxis: axis,
    toolbox: {
      iconStyle: { borderColor: tokens.foregroundMuted },
      emphasis: { iconStyle: { borderColor: tokens.foreground } }
    },
    dataZoom: {
      borderColor: tokens.border,
      textStyle: { color: tokens.foregroundMuted },
      handleStyle: { color: tokens.surface, borderColor: tokens.borderStrong },
      moveHandleStyle: { color: tokens.borderStrong },
      fillerColor: withAlpha(tokens.chart1, 0.15)
    },
    // Recessive marks: thin lines, room to breathe between fills.
    line: { symbol: 'circle', symbolSize: 8, lineStyle: { width: 2 }, smooth: false },
    bar: { itemStyle: { borderRadius: [4, 4, 0, 0], borderColor: tokens.surface, borderWidth: 2 } },
    pie: { itemStyle: { borderColor: tokens.surface, borderWidth: 2 } },
    scatter: { symbolSize: 10 }
  };
}

/** Themed defaults for `showLoading()`, so the loading state matches the app. */
export function createXuiEChartLoadingOptions(host: HTMLElement): Record<string, unknown> {
  const tokens = readTokens(host);

  return {
    text: '',
    color: tokens.chart1,
    maskColor: withAlpha(tokens.surface, 0.6),
    textColor: tokens.foregroundMuted,
    spinnerRadius: 12,
    lineWidth: 2
  };
}

function readTokens(host: HTMLElement): Tokens {
  const styles = getComputedStyle(host);
  const tokens = {} as Tokens;

  for (const [name, [token, fallback]] of Object.entries(TOKENS) as [TokenName, readonly [string, string]][]) {
    tokens[name] = toRenderableColor(styles.getPropertyValue(token).trim(), fallback);
  }

  return tokens;
}

let probe: CanvasRenderingContext2D | null | undefined;

/**
 * Resolves any CSS colour to `#rrggbb`.
 *
 * Tokens are authored in modern colour spaces — `oklch()`, `color-mix()` — which
 * a canvas can paint but ECharts cannot take apart to derive its hover and
 * gradient shades from. Painting one pixel and reading it back hands the browser
 * that conversion.
 */
function toRenderableColor(value: string, fallback: string): string {
  if (!value) {
    return fallback;
  }

  // Formats ECharts parses itself — no round trip needed.
  if (/^(#|rgba?\(|hsla?\()/i.test(value)) {
    return value;
  }

  const context = (probe ??= document.createElement('canvas').getContext('2d'));

  if (!context) {
    return fallback;
  }

  context.clearRect(0, 0, 1, 1);
  context.fillStyle = '#000000';
  // An unsupported colour leaves fillStyle untouched, so this paints the black
  // set above — which is why an empty token short-circuits to the fallback.
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);

  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;

  if (a === 0) {
    return fallback;
  }

  return a === 255 ? toHex(r, g, b) : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

function withAlpha(color: string, alpha: number): string {
  const hex = /^#([\da-f]{6})$/i.exec(color);

  if (!hex) {
    return color;
  }

  const value = parseInt(hex[1], 16);

  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}
