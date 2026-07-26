import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { injectXuiScrollAreaConfig } from './scroll-area.token';

export type XuiScrollOrientation = 'vertical' | 'horizontal' | 'both';

/**
 * A scroll container with slim, theme-aware scrollbars (WebKit and Firefox),
 * so overflowing content scrolls without the OS's default chrome. Give the host
 * a bound — a height for vertical scrolling, a width for horizontal.
 *
 * ```html
 * <xui-scroll-area class="h-72">
 *   <p>…long content…</p>
 * </xui-scroll-area>
 * ```
 */
@Component({
  selector: 'xui-scroll-area',
  template: `
    <div [class]="viewportClass()">
      <ng-content />
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiScrollArea {
  private readonly config = injectXuiScrollAreaConfig();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /** Which axis may scroll. The other one is clipped. */
  readonly orientation = input<XuiScrollOrientation>(this.config.orientation);

  protected readonly computedClass = computed(() => xui('relative block', this.class()));

  protected readonly viewportClass = computed(() => {
    const orientation = this.orientation();
    return xui(
      'h-full w-full',
      orientation === 'vertical' && 'overflow-x-hidden overflow-y-auto',
      orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
      orientation === 'both' && 'overflow-auto',
      // Slim, themed scrollbars. Firefox uses `scrollbar-*`; WebKit uses the pseudo-elements.
      '[scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent]',
      '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2',
      '[&::-webkit-scrollbar-track]:bg-transparent',
      '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
      'hover:[&::-webkit-scrollbar-thumb]:bg-foreground-subtle'
    );
  });
}
