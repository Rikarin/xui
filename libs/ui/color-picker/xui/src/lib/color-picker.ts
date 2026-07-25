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
        <!-- Saturation / value square -->
        <div #sv class="relative h-36 w-full cursor-crosshair rounded-md" [style.background]="svBackground()" (mousedown)="startSv($event)">
          <div class="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" [style.left.%]="hsv().s" [style.top.%]="100 - hsv().v"></div>
        </div>

        <!-- Hue slider -->
        <div #hue class="relative h-3 w-full cursor-pointer rounded-full" [style.background]="HUE_GRADIENT" (mousedown)="startHue($event)">
          <div class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" [style.left.%]="hsv().h / 3.6"></div>
        </div>

        @if (showAlpha()) {
          <div #alpha class="relative h-3 w-full cursor-pointer rounded-full bg-[length:8px_8px] [background-image:linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)]" (mousedown)="startAlpha($event)">
            <div class="absolute inset-0 rounded-full" [style.background]="alphaGradient()"></div>
            <div class="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" [style.left.%]="alphaValue() * 100"></div>
          </div>
        }

        <!-- Format selector + channel inputs -->
        <div class="flex items-center gap-1.5">
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
  protected readonly HUE_GRADIENT =
    'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)';

  private readonly el = inject(ElementRef).nativeElement as HTMLElement;
  private readonly document = this.el.ownerDocument;

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

  private readonly currentRgb = computed(() => hsvToRgb(this.hsv()));
  protected readonly hslValue = computed(() => rgbToHsl(this.currentRgb()));
  protected readonly lchValue = computed(() => rgbToLch(this.currentRgb()));

  protected readonly hex = computed(() => rgbToHex(hsvToRgb(this.hsv()), this.showAlpha() ? this.alphaValue() : 1));
  protected readonly svBackground = computed(
    () => `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${this.hsv().h} 100% 50%))`
  );
  protected readonly alphaGradient = computed(() => {
    const rgb = hsvToRgb(this.hsv());
    return `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgb(${rgb.r},${rgb.g},${rgb.b}))`;
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
        }
      });
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

  // --- drag interactions ---
  protected startSv(event: MouseEvent): void {
    this.drag(event, (x, y) => {
      this.hsv.update(hsv => ({ ...hsv, s: Math.round(x * 100), v: Math.round((1 - y) * 100) }));
      this.commit();
    });
  }
  protected startHue(event: MouseEvent): void {
    this.drag(event, x => {
      this.hsv.update(hsv => ({ ...hsv, h: Math.round(x * 360) }));
      this.commit();
    });
  }
  protected startAlpha(event: MouseEvent): void {
    this.drag(event, x => {
      this.alphaValue.set(Math.round(x * 100) / 100);
      this.commit();
    });
  }

  /** Track a pointer inside the event target, reporting normalized [0,1] x/y. */
  private drag(event: MouseEvent, update: (x: number, y: number) => void): void {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
    const apply = (moveEvent: MouseEvent): void => {
      const x = rect.width ? clamp01((moveEvent.clientX - rect.left) / rect.width) : 0;
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
      'border-border bg-surface hover:bg-surface-inset flex items-center gap-2 rounded-md border px-2 py-1.5 outline-none disabled:opacity-50',
      this.class()
    )
  );
  protected readonly panelClass = computed(() =>
    xui('border-border bg-surface-overlay absolute z-50 mt-2 flex w-60 flex-col gap-3 rounded-lg border p-3 shadow-lg')
  );
  protected readonly hexInputClass = computed(() =>
    xui('border-border bg-surface text-foreground h-8 flex-1 rounded-md border px-2 text-sm outline-none uppercase')
  );
  protected readonly channelInputClass = computed(() =>
    xui(
      'border-border bg-surface text-foreground h-8 w-full min-w-0 rounded-md border px-1.5 text-center text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none'
    )
  );
  protected readonly formatSelectClass = computed(() =>
    xui('border-border bg-surface text-foreground h-8 shrink-0 rounded-md border px-1.5 text-xs font-medium outline-none')
  );
}
