import { isPlatformBrowser } from '@angular/common';
import { computed, DOCUMENT, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { buildThemeCss, countOverrides, emptyOverrides, type ThemeDefaults, type ThemeOverrides } from './theme-css';
import type { ThemePreset, ThemeScope } from './theme-tokens';

const STORAGE_KEY = 'xui-docs-theme-builder';
const CSS_KEY = 'xui-docs-theme-css';
const STYLE_ID = 'xui-docs-theme-overrides';

interface StoredTheme {
  version: 1;
  overrides: ThemeOverrides;
  defaults: ThemeDefaults;
}

/**
 * Holds the theme being built, and applies it to the whole site as you go.
 *
 * The overrides are written into one `<style>` appended to `<head>`, which is the same CSS the
 * builder page offers to copy — so the site you are looking at *is* the preview, header and sidebar
 * included, and there is no separate preview renderer that could disagree with the export.
 *
 * Two DOM tricks make the rest work. Resolving a token means asking the browser rather than
 * re-implementing `oklch()` and `color-mix()`: an off-screen probe in each scope gets
 * `color: var(--token)`, and its computed colour goes through a 1×1 canvas to come back as hex.
 * Reading a token's *stock* value means doing that with the override stylesheet switched off for
 * the duration, which is why `disabled` is toggled around the read — otherwise the theme being
 * built would answer questions about the theme it replaced.
 */
@Injectable({ providedIn: 'root' })
export class ThemeBuilder {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly overrides = signal<ThemeOverrides>(emptyOverrides());
  private readonly defaults = signal<ThemeDefaults>({ light: {}, dark: {} });

  private styleElement: HTMLStyleElement | null = null;
  private probes: Record<ThemeScope, HTMLElement> | null = null;
  private canvas: CanvasRenderingContext2D | null = null;

  /** The stylesheet the builder is producing. Empty until something is changed. */
  readonly css = computed(() => buildThemeCss(this.overrides(), this.defaults()));
  readonly changeCount = computed(() => countOverrides(this.overrides()));
  readonly isCustomised = computed(() => this.changeCount() > 0);

  constructor() {
    if (this.isBrowser) {
      this.restore();
    }

    effect(() => {
      const css = this.css();

      if (!this.isBrowser) {
        return;
      }

      this.style().textContent = css;
      this.persist();
    });
  }

  /** The value the builder has set for a token, if it has set one. */
  colourOf(scope: ThemeScope, name: string): string | undefined {
    return this.overrides()[scope][name];
  }

  densityOf(name: string): string | undefined {
    return this.overrides().root[name];
  }

  setColour(scope: ThemeScope, name: string, value: string): void {
    this.captureDefaults([name]);
    this.overrides.update(current => ({ ...current, [scope]: { ...current[scope], [name]: value } }));
  }

  setDensity(name: string, value: string): void {
    this.overrides.update(current => ({ ...current, root: { ...current.root, [name]: value } }));
  }

  clearColour(scope: ThemeScope, name: string): void {
    this.overrides.update(current => {
      const next = { ...current[scope] };

      delete next[name];

      return { ...current, [scope]: next };
    });
  }

  clearDensity(name: string): void {
    this.overrides.update(current => {
      const next = { ...current.root };

      delete next[name];

      return { ...current, root: next };
    });
  }

  applyPreset(preset: ThemePreset): void {
    this.captureDefaults([...Object.keys(preset.light), ...Object.keys(preset.dark)]);
    this.overrides.update(current => ({
      root: current.root,
      light: { ...current.light, ...preset.light },
      dark: { ...current.dark, ...preset.dark }
    }));
  }

  reset(): void {
    this.overrides.set(emptyOverrides());
  }

  /**
   * A token's colour as it renders right now, as hex — overrides and derived steps included.
   *
   * Empty on the server, where there is no layout engine to ask.
   */
  resolve(scope: ThemeScope, name: string): string {
    return this.isBrowser ? this.readProbe(scope, name) : '';
  }

  /**
   * A length token's stock value in pixels — density, which is declared once for the document
   * rather than per theme, so either probe answers.
   *
   * Read with the overrides switched off: a caller wants the number to fall back to, and a slider
   * that measured the value it had just set would only ever agree with itself.
   */
  stockLength(name: string): number {
    if (!this.isBrowser) {
      return 0;
    }

    const style = this.style();
    const wasDisabled = style.disabled;

    style.disabled = true;

    const probe = this.probe('light');

    probe.style.width = `var(--${name})`;

    const pixels = Number.parseFloat(getComputedStyle(probe).width) || 0;

    style.disabled = wasDisabled;

    return pixels;
  }

  /**
   * Records what a token looked like before the builder touched it, so the emitter can tell whether
   * the two scopes genuinely differ. Reading has to happen with the overrides switched off, and
   * only once per token — after that the recorded value is the answer.
   */
  private captureDefaults(names: string[]): void {
    if (!this.isBrowser) {
      return;
    }

    const missing = names.filter(name => this.defaults().light[name] === undefined);

    if (missing.length === 0) {
      return;
    }

    const style = this.style();
    const wasDisabled = style.disabled;

    style.disabled = true;

    const light: Record<string, string> = {};
    const dark: Record<string, string> = {};

    for (const name of missing) {
      light[name] = this.readProbe('light', name);
      dark[name] = this.readProbe('dark', name);
    }

    style.disabled = wasDisabled;

    this.defaults.update(current => ({
      light: { ...current.light, ...light },
      dark: { ...current.dark, ...dark }
    }));
  }

  private readProbe(scope: ThemeScope, name: string): string {
    const probe = this.probe(scope);

    probe.style.color = `var(--${name})`;

    return this.toHex(getComputedStyle(probe).color);
  }

  /**
   * Any CSS colour to `#rrggbb`, by painting one pixel and reading it back.
   *
   * The alternative is parsing `oklch()` and `color-mix()` by hand, which is the browser's job and
   * would drift from it the first time the theme uses a colour space this app has not heard of.
   */
  private toHex(colour: string): string {
    const context = this.paint();

    context.fillStyle = '#000000';
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = colour;
    context.fillRect(0, 0, 1, 1);

    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;

    return `#${[r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  private paint(): CanvasRenderingContext2D {
    if (!this.canvas) {
      const element = this.document.createElement('canvas');

      element.width = 1;
      element.height = 1;
      this.canvas = element.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    return this.canvas;
  }

  private probe(scope: ThemeScope): HTMLElement {
    if (!this.probes) {
      const host = this.document.createElement('div');

      host.setAttribute('aria-hidden', 'true');
      host.style.cssText = 'position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden;pointer-events:none';
      host.innerHTML = '<div class="light"></div><div class="dark"></div>';
      this.document.body.appendChild(host);

      const [light, dark] = [...host.children] as HTMLElement[];

      this.probes = { light, dark };
    }

    return this.probes[scope];
  }

  private style(): HTMLStyleElement {
    if (!this.styleElement) {
      // The pre-paint script in `index.html` may already have made one. Adopt it rather than
      // stacking a second stylesheet on top of it.
      const existing = this.document.getElementById(STYLE_ID) as HTMLStyleElement | null;

      this.styleElement = existing ?? this.document.createElement('style');
      this.styleElement.id = STYLE_ID;

      // Always append, even when adopting: these declarations tie with `theme.css`'s on
      // specificity, so coming last is the whole of why they win. Appending a node that is already
      // in the head moves it to the end.
      this.document.head.appendChild(this.styleElement);
    }

    return this.styleElement;
  }

  private persist(): void {
    const stored: StoredTheme = { version: 1, overrides: this.overrides(), defaults: this.defaults() };
    const css = this.css();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      // Kept separately, and as finished CSS, so the pre-paint script in `index.html` can apply a
      // theme without carrying the emitter with it.
      if (css) {
        localStorage.setItem(CSS_KEY, css);
      } else {
        localStorage.removeItem(CSS_KEY);
      }
    } catch {
      // A full or blocked store is not worth interrupting anyone over.
    }
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return;
      }

      const stored = JSON.parse(raw) as StoredTheme;

      if (stored.version !== 1) {
        return;
      }

      this.overrides.set({
        root: stored.overrides?.root ?? {},
        light: stored.overrides?.light ?? {},
        dark: stored.overrides?.dark ?? {}
      });
      this.defaults.set({ light: stored.defaults?.light ?? {}, dark: stored.defaults?.dark ?? {} });
    } catch {
      // Corrupt or hand-edited: start from the stock theme rather than half of someone else's.
    }
  }
}
