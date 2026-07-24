import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * Animates its content open and closed.
 *
 * ```html
 * <xui-collapse [isOpen]="expanded()">
 *   <p>Details</p>
 * </xui-collapse>
 * ```
 *
 * Height is animated with the Web Animations API rather than
 * `@angular/animations`, keeping the package free of that dependency and safe
 * under zoneless change detection.
 *
 * Content is removed from the DOM while closed so it cannot be focused or
 * announced. Set `keepChildrenMounted` to keep it — worth it when the content
 * is expensive to build and the collapse toggles often.
 */
@Component({
  selector: 'xui-collapse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #content [class]="computedContentClass()">
      @if (isOpen() || keepChildrenMounted()) {
        <ng-content />
      }
    </div>
  `,
  host: {
    '[class]': 'computedClass()',
    '[style.height]': 'height()',
    '[attr.aria-hidden]': 'isOpen() ? null : "true"',
    '[attr.inert]': 'isOpen() ? null : ""'
  }
})
export class XuiCollapse {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly contentRef = viewChild.required<ElementRef<HTMLElement>>('content');

  /** Set once the first open/close has been applied, so the initial render does not animate. */
  private animated = false;

  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  readonly isOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Keep the content in the DOM while closed. */
  readonly keepChildrenMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Transition length in milliseconds. */
  readonly duration = input<number, NumberInput>(200, { transform: numberAttribute });

  /** Emits once the open or close transition has finished. */
  readonly transitionEnd = output<boolean>();

  /**
   * The inline height driving the animation. `null` once an open transition has
   * settled, so the content is free to grow afterwards without being clipped at
   * a stale pixel height.
   */
  protected readonly height = signal<string | null>('0px');

  protected readonly computedClass = computed(() => xui('block overflow-hidden', this.class()));
  protected readonly computedContentClass = computed(() => 'block');

  constructor() {
    effect(() => {
      const open = this.isOpen();

      if (!this.isBrowser) {
        // On the server there is nothing to measure; render the final state.
        this.height.set(open ? null : '0px');

        return;
      }

      if (!this.animated) {
        this.animated = true;
        this.height.set(open ? null : '0px');

        return;
      }

      this.animate(open);
    });
  }

  private animate(open: boolean): void {
    const contentHeight = this.contentRef().nativeElement.scrollHeight;
    const from = open ? '0px' : `${contentHeight}px`;
    const to = open ? `${contentHeight}px` : '0px';

    // Pin the starting height before animating: going from `auto` produces no
    // transition at all, since `auto` is not an animatable value.
    this.height.set(from);

    const animation = this.host.animate([{ height: from }, { height: to }], {
      duration: this.duration(),
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });

    this.height.set(to);

    animation.finished
      .then(() => {
        // Release the fixed height so opened content can reflow freely.
        if (open) {
          this.height.set(null);
        }

        this.transitionEnd.emit(open);
      })
      .catch(() => {
        // A superseded animation rejects; the newer one owns the final height.
      });
  }
}
