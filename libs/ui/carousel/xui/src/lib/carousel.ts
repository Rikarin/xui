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
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matChevronLeftRound, matChevronRightRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { arrowDirectionOnAxis, injectXDirection } from '@xui/core/a11y';
import { XuiIcon } from '@xui/icon';
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
  imports: [NgTemplateOutlet, NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matChevronLeftRound, matChevronRightRound })],
  template: `
    <div
      class="relative h-full w-full overflow-hidden"
      tabindex="0"
      (mouseenter)="paused.set(true)"
      (mouseleave)="paused.set(false)"
      (keydown)="onKeydown($event)"
    >
      @if (effect() === 'fade') {
        <!-- A grid with every slide in the one cell, rather than a stack of absolutely positioned
             ones: they still overlap to crossfade, but they are in flow, so the carousel takes its
             height from them. Out of flow, nothing gave it a height and it collapsed to nothing. -->
        <div class="grid h-full w-full">
          @for (item of items(); track $index; let i = $index) {
            <div
              class="col-start-1 row-start-1 transition-opacity duration-500"
              [style.opacity]="i === index() ? 1 : 0"
              [style.pointer-events]="i === index() ? 'auto' : 'none'"
              [attr.aria-hidden]="i === index() ? null : true"
              [attr.inert]="i === index() ? null : ''"
            >
              <ng-container [ngTemplateOutlet]="item.content()" />
            </div>
          }
        </div>
      } @else {
        <div class="flex h-full transition-transform duration-500 ease-out" [style.transform]="trackTransform()">
          @for (item of items(); track $index; let i = $index) {
            <!-- inert as well as aria-hidden: an off-screen slide holding a
                 link or button would otherwise still be a tab stop. -->
            <div
              class="h-full w-full shrink-0 grow-0 basis-full"
              [attr.aria-hidden]="i === index() ? null : true"
              [attr.inert]="i === index() ? null : ''"
            >
              <ng-container [ngTemplateOutlet]="item.content()" />
            </div>
          }
        </div>
      }

      @if (arrows() && count() > 1) {
        <button type="button" [class]="arrowClass('previous')" (click)="prev()" aria-label="Previous slide">
          <ng-icon xui size="20px" name="matChevronLeftRound" />
        </button>
        <button type="button" [class]="arrowClass('next')" (click)="next()" aria-label="Next slide">
          <ng-icon xui size="20px" name="matChevronRightRound" />
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
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected readonly direction = injectXDirection();

  /** Zero-based index of the visible slide. Two-way bindable with `[(index)]`. */
  readonly index = model<number>(0);
  /** Advance on a timer. Pauses while the pointer is over the carousel, and does nothing with a single slide. */
  readonly autoplay = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  /** Milliseconds between automatic advances. Only used with `autoplay`. */
  readonly interval = input<number, NumberInput>(3000, { transform: numberAttribute });
  /** Show the per-slide indicators. Hidden anyway when there is only one slide. */
  readonly dots = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  /** Show the previous/next buttons. Hidden anyway when there is only one slide. */
  readonly arrows = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  /** Wrap around at either end. With this off, the arrows stop at the first and last slide. */
  readonly loop = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  /**
   * How slides change: sliding horizontally (`scrollx`, direction-aware in RTL) or cross-fading in place (`fade`).
   */
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
    // Arrows follow what the user sees: in RTL slides advance leftwards, so
    // ArrowLeft is "next".
    const arrow = arrowDirectionOnAxis(event.key, this.direction(), 'horizontal');
    if (!arrow) {
      return;
    }

    event.preventDefault();
    if (arrow === 'next') {
      this.next();
    } else {
      this.prev();
    }
  }

  protected readonly computedClass = computed(() =>
    xui('bg-surface-inset relative block overflow-hidden rounded-lg', this.class())
  );

  /** `previous` sits at the inline start, `next` at the inline end. */
  protected arrowClass(side: 'previous' | 'next'): string {
    return xui(
      // eslint-disable-next-line local/no-hand-z-index -- nav buttons stack above the slides inside the carousel’s own stacking context
      'bg-surface-overlay/70 text-foreground hover:bg-surface-overlay absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition-colors',
      side === 'previous' ? 'start-3' : 'end-3',
      // The chevrons are drawn pointing left/right; mirror them so "previous"
      // still points back towards the start of the line.
      this.direction() === 'rtl' && '-scale-x-100'
    );
  }

  /**
   * How far to slide the track. `translateX` is physical while the flex row
   * lays slides out inline, so RTL needs the opposite sign.
   */
  protected trackTransform(): string {
    const offset = this.index() * 100 * (this.direction() === 'rtl' ? 1 : -1);
    return `translateX(${offset}%)`;
  }

  protected dotClass(active: boolean): string {
    return xui('h-2 rounded-full transition-all', active ? 'bg-foreground w-5' : 'bg-foreground/40 w-2');
  }
}
