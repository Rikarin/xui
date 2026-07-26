import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A live countdown to a target time. Ticks every second and emits `finished`
 * once it reaches zero. `format` tokens: `D` days, `H`/`HH` hours, `m`/`mm`
 * minutes, `s`/`ss` seconds, `SSS` milliseconds.
 *
 * ```html
 * <xui-countdown title="Launch" [target]="deadline" format="D 'day' HH:mm:ss" />
 * ```
 */
@Component({
  selector: 'xui-countdown',
  template: `
    @if (title()) {
      <div class="text-foreground-muted mb-1 text-sm">{{ title() }}</div>
    }
    <div class="text-foreground text-2xl font-semibold tabular-nums">{{ display() }}</div>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiCountdown {
  readonly class = input<ClassValue>('');

  readonly title = input<string>('');
  /** Target time as an epoch millisecond value or a `Date`. */
  readonly target = input.required<number | Date>();
  readonly format = input<string>('HH:mm:ss');

  /** Fires once when the countdown reaches zero. */
  readonly finished = output<void>();

  private readonly now = signal(Date.now());
  private hasFinished = false;

  private readonly targetMs = computed(() => {
    const target = this.target();
    return target instanceof Date ? target.getTime() : target;
  });
  protected readonly remaining = computed(() => Math.max(0, this.targetMs() - this.now()));
  protected readonly display = computed(() => formatDuration(this.remaining(), this.format()));

  constructor() {
    const id = setInterval(() => {
      this.now.set(Date.now());
      if (!this.hasFinished && this.remaining() <= 0) {
        this.hasFinished = true;
        // Stop ticking once done — an idle countdown must not keep driving
        // change detection every second.
        clearInterval(id);
        this.finished.emit();
      }
    }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }

  protected readonly computedClass = computed(() => xui('block', this.class()));
}

const pad = (value: number, length = 2): string => String(value).padStart(length, '0');

/** Format a millisecond duration against a token string. */
export function formatDuration(ms: number, format: string): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const millis = ms % 1000;

  return format
    .replace(/SSS/g, pad(millis, 3))
    .replace(/DD/g, pad(days))
    .replace(/D/g, String(days))
    .replace(/HH/g, pad(hours))
    .replace(/H/g, String(hours))
    .replace(/mm/g, pad(minutes))
    .replace(/m/g, String(minutes))
    .replace(/ss/g, pad(seconds))
    .replace(/s/g, String(seconds));
}
