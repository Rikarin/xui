import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  input,
  model,
  numberAttribute,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { XuiCarouselItem } from './carousel-item';

/**
 * A slideshow of `<xui-carousel-item>` slides with arrows, dot indicators and
 * optional autoplay (paused on hover). `effect` slides (`scrollx`) or crossfades
 * (`fade`); `index` is two-way bindable.
 *
 * ```html
 * <xui-carousel autoplay dots>
 *   <xui-carousel-item>Slide 1</xui-carousel-item>
 *   <xui-carousel-item>Slide 2</xui-carousel-item>
 * </xui-carousel>
 * ```
 */
@Component({
  selector: 'xui-carousel',
  imports: [NgTemplateOutlet],
  template: `
    <div
      class="relative h-full w-full overflow-hidden"
      tabindex="0"
      (mouseenter)="paused.set(true)"
      (mouseleave)="paused.set(false)"
      (keydown)="onKeydown($event)"
    >
      @if (effect() === 'fade') {
        <div class="relative h-full w-full">
          @for (item of items(); track $index; let i = $index) {
            <div
              class="absolute inset-0 transition-opacity duration-500"
              [style.opacity]="i === index() ? 1 : 0"
              [style.pointer-events]="i === index() ? 'auto' : 'none'"
              [attr.aria-hidden]="i === index() ? null : true"
            >
              <ng-container [ngTemplateOutlet]="item.content()" />
            </div>
          }
        </div>
      } @else {
        <div
          class="flex h-full transition-transform duration-500 ease-out"
          [style.transform]="'translateX(' + -index() * 100 + '%)'"
        >
          @for (item of items(); track $index; let i = $index) {
            <div class="h-full w-full shrink-0 grow-0 basis-full" [attr.aria-hidden]="i === index() ? null : true">
              <ng-container [ngTemplateOutlet]="item.content()" />
            </div>
          }
        </div>
      }

      @if (arrows() && count() > 1) {
        <button type="button" [class]="arrowClass('left')" (click)="prev()" aria-label="Previous slide">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" [class]="arrowClass('right')" (click)="next()" aria-label="Next slide">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      }

      @if (dots() && count() > 1) {
        <div class="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          @for (item of items(); track $index; let i = $index) {
            <button
              type="button"
              [class]="dotClass(i === index())"
              [attr.aria-current]="i === index() ? 'true' : null"
              [attr.aria-label]="'Go to slide ' + (i + 1)"
              (click)="go(i)"
            ></button>
          }
        </div>
      }
    </div>
  `,
  host: {
    '[class]': 'computedClass()',
    role: 'region',
    'aria-roledescription': 'carousel'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiCarousel {
  readonly class = input<ClassValue>('');

  readonly index = model<number>(0);
  readonly autoplay = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly interval = input<number, NumberInput>(3000, { transform: numberAttribute });
  readonly dots = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  readonly arrows = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  readonly loop = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  readonly effect = input<'scrollx' | 'fade'>('scrollx');

  protected readonly items = contentChildren(XuiCarouselItem);
  protected readonly count = computed(() => this.items().length);
  protected readonly paused = signal(false);

  constructor() {
    // Autoplay: a self-cleaning interval that pauses on hover.
    effect(onCleanup => {
      if (!this.autoplay() || this.paused() || this.count() <= 1) {
        return;
      }
      const id = setInterval(() => this.next(), this.interval());
      onCleanup(() => clearInterval(id));
    });
  }

  protected go(target: number): void {
    const count = this.count();
    if (count === 0) {
      return;
    }
    this.index.set(((target % count) + count) % count);
  }

  next(): void {
    const count = this.count();
    if (this.loop()) {
      this.go(this.index() + 1);
    } else {
      this.index.set(Math.min(count - 1, this.index() + 1));
    }
  }

  prev(): void {
    if (this.loop()) {
      this.go(this.index() - 1);
    } else {
      this.index.set(Math.max(0, this.index() - 1));
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.next();
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
      event.preventDefault();
    }
  }

  protected readonly computedClass = computed(() => xui('bg-surface-inset relative block overflow-hidden rounded-lg', this.class()));

  protected arrowClass(side: 'left' | 'right'): string {
    return xui(
      'bg-surface-overlay/70 text-foreground hover:bg-surface-overlay absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition-colors',
      side === 'left' ? 'left-3' : 'right-3'
    );
  }

  protected dotClass(active: boolean): string {
    return xui('h-2 rounded-full transition-all', active ? 'bg-foreground w-5' : 'bg-foreground/40 w-2');
  }
}
