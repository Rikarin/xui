import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { arrowDirection, inlineFraction, injectXDirection } from '@xui/core/a11y';
import type { ClassValue } from 'clsx';
import {
  hslToRgb,
  hsvToRgb,
  lchToRgb,
  normalizeHex,
  parseHex,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToLch,
  type HSV
} from './color-utils';

/** The channel model shown in the input row. */
export type ColorFormat = 'hex' | 'hsl' | 'lch';

/** Upper bound of the LCH chroma axis in the square. */
const LCH_MAX_C = 132;

/** Keyboard focus ring shared by every control in the panel. */
const FOCUS_RING = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

/** Clamp a 0–100 axis value. */
function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * A color picker: a swatch trigger opens a panel with a saturation/value square,
 * a hue slider, an optional alpha slider, a hex field and preset swatches.
 * `value` is a two-way bindable hex string (`#RRGGBB` / `#RRGGBBAA`).
 *
 * ```html
 * <xui-color-picker [(value)]="color" showAlpha [presets]="['#1677ff', '#f5222d']" />
 * ```
 */
@Component({
  selector: 'xui-color-picker',
  template: `
    <button type="button" [class]="triggerClass()" [disabled]="disabled()" (click)="toggle()" aria-haspopup="dialog" [attr.aria-expanded]="open()">
      <span class="border-border/60 h-5 w-5 rounded border" [style.background]="value()"></span>
      <span class="text-foreground text-sm tabular-nums">{{ value() }}</span>
    </button>

    @if (open()) {
      <div [class]="panelClass()" role="dialog" aria-label="Color picker">
        <!-- 2D area — its axes depend on the format: S×V (hex/RGB), S×L (HSL), C×L (LCH).
             A two-axis control has no single ARIA role, so it is a focusable group
             the arrow keys drive; the labelled channel inputs below expose and
             announce the exact numbers. -->
        <div
          role="group"
          tabindex="0"
          [attr.aria-label]="squareLabel()"
          [class]="squareClass()"
          [style.background]="squareBg()"
          (mousedown)="startSquare($event)"
          (keydown)="onSquareKeydown($event)"
        >
          <div [class]="handleClass()" [style.inset-inline-start.%]="squareHandle().x" [style.top.%]="squareHandle().y"></div>
        </div>

        <!-- Hue slider (perceptual LCH strip in LCH mode, sRGB rainbow otherwise) -->
        <div
          role="slider"
          tabindex="0"
          aria-label="Hue"
          aria-valuemin="0"
          aria-valuemax="360"
          [attr.aria-valuenow]="hueDegrees()"
          [attr.aria-orientation]="'horizontal'"
          [class]="stripClass()"
          [style.background]="hueGradient()"
          (mousedown)="startHue($event)"
          (keydown)="onHueKeydown($event)"
        >
          <div [class]="stripHandleClass()" [style.inset-inline-start.%]="huePos()"></div>
        </div>

        @if (showAlpha()) {
          <div
            #alpha
            role="slider"
            tabindex="0"
            aria-label="Alpha"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-valuenow]="alphaPercent()"
            [attr.aria-valuetext]="alphaPercent() + '%'"
            [attr.aria-orientation]="'horizontal'"
            [class]="alphaStripClass()"
            (mousedown)="startAlpha($event)"
            (keydown)="onAlphaKeydown($event)"
          >
            <div class="absolute inset-0 rounded-full" [style.background]="alphaGradient()"></div>
            <div [class]="stripHandleClass()" [style.inset-inline-start.%]="alphaValue() * 100"></div>
          </div>
        }

        <!-- Format selector + channel inputs -->
        <div class="flex min-w-0 items-center gap-1.5">
          <select
            [class]="formatSelectClass()"
            (change)="format.set($any($event.target).value)"
            aria-label="Color format"
          >
            <option value="hex" [selected]="format() === 'hex'">HEX</option>
            <option value="hsl" [selected]="format() === 'hsl'">HSL</option>
            <option value="lch" [selected]="format() === 'lch'">LCH</option>
          </select>

          @switch (format()) {
            @case ('hex') {
              <input
                [class]="hexInputClass()"
                [value]="value()"
                (change)="onHexInput($any($event.target).value)"
                aria-label="Hex color"
                spellcheck="false"
              />
            }
            @case ('hsl') {
              <div class="flex flex-1 gap-1">
                <input [class]="channelInputClass()" type="number" min="0" max="360" [value]="hslValue().h" (change)="setHsl('h', $any($event.target).value)" aria-label="Hue" />
                <input [class]="channelInputClass()" type="number" min="0" max="100" [value]="hslValue().s" (change)="setHsl('s', $any($event.target).value)" aria-label="Saturation" />
                <input [class]="channelInputClass()" type="number" min="0" max="100" [value]="hslValue().l" (change)="setHsl('l', $any($event.target).value)" aria-label="Lightness" />
              </div>
            }
            @case ('lch') {
              <div class="flex flex-1 gap-1">
                <input [class]="channelInputClass()" type="number" min="0" max="100" [value]="lchValue().l" (change)="setLch('l', $any($event.target).value)" aria-label="Lightness" />
                <input [class]="channelInputClass()" type="number" min="0" max="150" [value]="lchValue().c" (change)="setLch('c', $any($event.target).value)" aria-label="Chroma" />
                <input [class]="channelInputClass()" type="number" min="0" max="360" [value]="lchValue().h" (change)="setLch('h', $any($event.target).value)" aria-label="Hue" />
              </div>
            }
          }
        </div>

        @if (presets().length) {
          <div class="flex flex-wrap gap-1.5">
            @for (preset of presets(); track preset) {
              <button type="button" class="border-border/60 h-5 w-5 rounded border" [style.background]="preset" [attr.aria-label]="preset" (click)="applyPreset(preset)"></button>
            }
          </div>
        }
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiColorPicker {
  protected readonly HUE_STOPS = '#f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%';

  /**
   * The gradient axis for every strip and for the square's horizontal ramp. CSS
   * gradients take physical keywords, so 0% has to be pinned to the edge the
   * inline axis actually starts at.
   */
  private inlineGradient(): string {
    return this.direction() === 'rtl' ? 'to left' : 'to right';
  }

  private readonly el = inject(ElementRef).nativeElement as HTMLElement;
  private readonly document = this.el.ownerDocument;
  private readonly direction = injectXDirection();

  readonly class = input<ClassValue>('');
  readonly value = model<string>('#1677FF');
  readonly showAlpha = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly presets = input<string[]>([]);
  /** Which channel model the input row edits: `hex`, `hsl` or `lch`. Two-way bindable. */
  readonly format = model<ColorFormat>('hex');

  protected readonly open = signal(false);
  protected readonly hsv = signal<HSV>({ h: 215, s: 91, v: 100 });
  protected readonly alphaValue = signal(1);
  /** Persistent LCH hue — kept separately since it survives greyscale (chroma 0), unlike HSV hue. */
  private readonly lchHue = signal(215);

  private readonly currentRgb = computed(() => hsvToRgb(this.hsv()));
  protected readonly hslValue = computed(() => rgbToHsl(this.currentRgb()));
  protected readonly lchValue = computed(() => rgbToLch(this.currentRgb()));

  protected readonly hex = computed(() => rgbToHex(hsvToRgb(this.hsv()), this.showAlpha() ? this.alphaValue() : 1));

  /** The 2D square's background — a lightness overlay over a hue/chroma sweep for HSL/LCH, or the classic HSV square. */
  protected readonly squareBg = computed(() => {
    // A hard 50% split keeps the mid row clean (base colour), white above, black below.
    const lightness = 'linear-gradient(to bottom, #fff, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 50%, #000)';
    switch (this.format()) {
      case 'hsl': {
        const h = this.hsv().h;
        return `${lightness}, linear-gradient(${this.inlineGradient()}, hsl(${h} 0% 50%), hsl(${h} 100% 50%))`;
      }
      case 'lch': {
        const h = this.lchHue();
        const grey = rgbToHex(lchToRgb({ l: 50, c: 0, h }));
        const vivid = rgbToHex(lchToRgb({ l: 50, c: LCH_MAX_C, h }));
        return `${lightness}, linear-gradient(${this.inlineGradient()}, ${grey}, ${vivid})`;
      }
      default:
        return `linear-gradient(to top, #000, transparent), linear-gradient(${this.inlineGradient()}, #fff, hsl(${this.hsv().h} 100% 50%))`;
    }
  });

  /** The square handle position (percent), in the active model's axes. */
  protected readonly squareHandle = computed(() => {
    switch (this.format()) {
      case 'hsl': {
        const hsl = this.hslValue();
        return { x: hsl.s, y: 100 - hsl.l };
      }
      case 'lch': {
        const lch = this.lchValue();
        return { x: Math.min(100, (lch.c / LCH_MAX_C) * 100), y: 100 - lch.l };
      }
      default: {
        const hsv = this.hsv();
        return { x: hsv.s, y: 100 - hsv.v };
      }
    }
  });

  /** The hue slider gradient — a perceptual LCH strip in LCH mode, the sRGB rainbow otherwise. */
  protected readonly hueGradient = computed(() => {
    if (this.format() !== 'lch') {
      return `linear-gradient(${this.inlineGradient()}, ${this.HUE_STOPS})`;
    }
    const stops: string[] = [];
    for (let h = 0; h <= 360; h += 30) {
      stops.push(rgbToHex(lchToRgb({ l: 60, c: 90, h })));
    }
    return `linear-gradient(${this.inlineGradient()}, ${stops.join(', ')})`;
  });

  /** The hue slider handle position (percent). */
  protected readonly huePos = computed(() => (this.format() === 'lch' ? this.lchHue() : this.hsv().h) / 3.6);

  protected readonly alphaGradient = computed(() => {
    const rgb = hsvToRgb(this.hsv());
    return `linear-gradient(${this.inlineGradient()}, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgb(${rgb.r},${rgb.g},${rgb.b}))`;
  });

  constructor() {
    // Sync internal HSV/alpha when `value` is changed from outside.
    effect(() => {
      const value = this.value();
      untracked(() => {
        const normalized = normalizeHex(value);
        if (normalized && normalized !== this.hex()) {
          const rgba = parseHex(normalized)!;
          this.hsv.set(rgbToHsv(rgba));
          this.alphaValue.set(rgba.a);
          const lch = rgbToLch(rgba);
          if (lch.c > 1) {
            this.lchHue.set(lch.h);
          }
        }
      });
    });

    // Seed the persistent LCH hue from the current colour whenever LCH mode is entered.
    effect(() => {
      if (this.format() === 'lch') {
        untracked(() => {
          const lch = this.lchValue();
          if (lch.c > 1) {
            this.lchHue.set(lch.h);
          }
        });
      }
    });

    // Close on outside click.
    const onDocClick = (event: MouseEvent): void => {
      if (this.open() && !this.el.contains(event.target as Node)) {
        this.open.set(false);
      }
    };
    this.document.addEventListener('click', onDocClick, true);
    inject(DestroyRef).onDestroy(() => this.document.removeEventListener('click', onDocClick, true));
  }

  protected toggle(): void {
    if (!this.disabled()) {
      this.open.update(open => !open);
    }
  }

  private commit(): void {
    this.value.set(this.hex());
  }

  protected onHexInput(input: string): void {
    const normalized = normalizeHex(input);
    if (normalized) {
      this.value.set(normalized);
    }
  }

  protected applyPreset(color: string): void {
    const normalized = normalizeHex(color);
    if (normalized) {
      this.value.set(normalized);
    }
  }

  protected setHsl(channel: 'h' | 's' | 'l', raw: string): void {
    const n = Number(raw);
    if (raw.trim() === '' || Number.isNaN(n)) {
      return;
    }
    this.hsv.set(rgbToHsv(hslToRgb({ ...this.hslValue(), [channel]: n })));
    this.commit();
  }

  protected setLch(channel: 'l' | 'c' | 'h', raw: string): void {
    const n = Number(raw);
    if (raw.trim() === '' || Number.isNaN(n)) {
      return;
    }
    this.hsv.set(rgbToHsv(lchToRgb({ ...this.lchValue(), [channel]: n })));
    this.commit();
  }

  // --- value updates (shared by pointer and keyboard) ---

  /** Set the square's two axes from normalized [0,1] coordinates (`y` is top-down). */
  private applySquare(x: number, y: number): void {
    switch (this.format()) {
      case 'hsl': {
        // HSL hue == HSV hue; preserve it so dragging to grey/white/black doesn't lose the hue.
        const h = this.hsv().h;
        const conv = rgbToHsv(hslToRgb({ h, s: Math.round(x * 100), l: Math.round((1 - y) * 100) }));
        this.hsv.set({ h, s: conv.s, v: conv.v });
        break;
      }
      case 'lch': {
        const h = this.lchHue();
        this.hsv.set(rgbToHsv(lchToRgb({ h, c: Math.round(x * LCH_MAX_C), l: Math.round((1 - y) * 100) })));
        break;
      }
      default:
        this.hsv.update(hsv => ({ ...hsv, s: Math.round(x * 100), v: Math.round((1 - y) * 100) }));
    }
    this.commit();
  }

  private applyHue(deg: number): void {
    if (this.format() === 'lch') {
      this.lchHue.set(deg);
      const { l, c } = this.lchValue();
      this.hsv.set(rgbToHsv(lchToRgb({ l, c, h: deg })));
    } else {
      this.hsv.update(hsv => ({ ...hsv, h: deg }));
    }
    this.commit();
  }

  // --- drag interactions ---
  protected startSquare(event: MouseEvent): void {
    this.drag(event, (x, y) => this.applySquare(x, y));
  }
  protected startHue(event: MouseEvent): void {
    this.drag(event, x => this.applyHue(Math.round(x * 360)));
  }
  protected startAlpha(event: MouseEvent): void {
    this.drag(event, x => {
      this.alphaValue.set(Math.round(x * 100) / 100);
      this.commit();
    });
  }

  // --- keyboard interactions ---

  /** The hue in degrees, whichever model owns it. */
  protected readonly hueDegrees = computed(() => Math.round(this.format() === 'lch' ? this.lchHue() : this.hsv().h));

  protected readonly alphaPercent = computed(() => Math.round(this.alphaValue() * 100));

  protected readonly squareLabel = computed(() => {
    switch (this.format()) {
      case 'hsl':
        return 'Saturation and lightness';
      case 'lch':
        return 'Chroma and lightness';
      default:
        return 'Saturation and value';
    }
  });

  /**
   * Map an arrow key to a step along one axis. `null` means "not ours" so the
   * event keeps bubbling. Shift multiplies the step by 10, matching the slider.
   */
  private arrowStep(event: KeyboardEvent): { dx: number; dy: number } | null {
    const size = event.shiftKey ? 10 : 1;
    const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    // The inline axis mirrors in RTL, so ArrowRight lowers saturation there.
    const step = arrowDirection(event.key, this.direction());

    if (!step) {
      return null;
    }

    const delta = step === 'next' ? size : -size;

    // `dy` is a screen offset: ArrowDown ("next") moves down the square, which
    // is towards lower brightness because the y axis is inverted (top = max).
    return horizontal ? { dx: delta, dy: 0 } : { dx: 0, dy: delta };
  }

  protected onSquareKeydown(event: KeyboardEvent): void {
    const step = this.arrowStep(event);
    if (!step) {
      return;
    }
    event.preventDefault();

    const handle = this.squareHandle();
    // `squareHandle` is in percent with y inverted, the same space the drag
    // handler works in, so reuse it and hand the result back as [0,1].
    const x = clampPercent(handle.x + step.dx) / 100;
    const y = clampPercent(handle.y + step.dy) / 100;
    this.applySquare(x, y);
  }

  protected onHueKeydown(event: KeyboardEvent): void {
    const step = this.arrowStep(event);
    if (!step) {
      return;
    }
    event.preventDefault();
    // Both axes drive hue so the strip responds to all four arrows; up/right
    // increase it. Hue wraps rather than clamps.
    const delta = step.dx || -step.dy;
    this.applyHue((this.hueDegrees() + delta + 360) % 360);
  }

  protected onAlphaKeydown(event: KeyboardEvent): void {
    const step = this.arrowStep(event);
    if (!step) {
      return;
    }
    event.preventDefault();
    const delta = step.dx || -step.dy;
    this.alphaValue.set(clampPercent(this.alphaPercent() + delta) / 100);
    this.commit();
  }

  /** Track a pointer inside the event target, reporting normalized [0,1] x/y. */
  private drag(event: MouseEvent, update: (x: number, y: number) => void): void {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
    const apply = (moveEvent: MouseEvent): void => {
      // The strips and the square run along the inline axis, which starts at the
      // right edge in RTL.
      const x = clamp01(inlineFraction(moveEvent.clientX, rect, this.direction()));
      const y = rect.height ? clamp01((moveEvent.clientY - rect.top) / rect.height) : 0;
      update(x, y);
    };
    apply(event);
    const onUp = (): void => {
      this.document.removeEventListener('mousemove', apply);
      this.document.removeEventListener('mouseup', onUp);
    };
    this.document.addEventListener('mousemove', apply);
    this.document.addEventListener('mouseup', onUp);
  }

  protected readonly computedClass = computed(() => xui('relative inline-block', this.class()));
  protected readonly triggerClass = computed(() =>
    xui(
      'border-border bg-surface hover:bg-surface-inset flex items-center gap-2 rounded-md border px-2 py-1.5 disabled:opacity-50',
      FOCUS_RING,
      this.class()
    )
  );
  protected readonly panelClass = computed(() =>
    xui('border-border bg-surface-overlay absolute z-50 mt-2 flex w-60 flex-col gap-3 rounded-lg border p-3 shadow-lg')
  );
  protected readonly hexInputClass = computed(() =>
    xui('border-border bg-surface text-foreground h-8 w-full min-w-0 flex-1 rounded-md border px-2 text-sm uppercase', FOCUS_RING)
  );
  protected readonly channelInputClass = computed(() =>
    xui(
      'border-border bg-surface text-foreground h-8 w-full min-w-0 rounded-md border px-1.5 text-center text-sm tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
      FOCUS_RING
    )
  );
  protected readonly formatSelectClass = computed(() =>
    xui('border-border bg-surface text-foreground h-8 shrink-0 rounded-md border px-1.5 text-xs font-medium', FOCUS_RING)
  );
  protected readonly squareClass = computed(() => xui('relative h-36 w-full cursor-crosshair rounded-md', FOCUS_RING));

  /**
   * The draggable dots. They are positioned by their inline start, so the
   * centring shift is physical and flips with the direction.
   */
  private readonly handleShift = computed(() => (this.direction() === 'rtl' ? 'translate-x-1/2' : '-translate-x-1/2'));
  protected readonly handleClass = computed(() =>
    xui('pointer-events-none absolute h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow', this.handleShift())
  );
  protected readonly stripHandleClass = computed(() =>
    xui(
      'pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow',
      this.handleShift()
    )
  );
  protected readonly stripClass = computed(() => xui('relative h-3 w-full cursor-pointer rounded-full', FOCUS_RING));
  protected readonly alphaStripClass = computed(() =>
    xui(
      'relative h-3 w-full cursor-pointer rounded-full bg-[length:8px_8px] [background-image:linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)]',
      FOCUS_RING
    )
  );
}
