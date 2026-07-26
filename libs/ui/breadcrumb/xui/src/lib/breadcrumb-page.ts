import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * The last crumb — where the user already is.
 *
 * ```html
 * <li xuiBreadcrumbItem><span xuiBreadcrumbPage>Settings</span></li>
 * ```
 *
 * Rendered as a `role="link"` that is `aria-disabled` and `aria-current="page"`, so it reads as part
 * of the trail while announcing that following it goes nowhere. Use it instead of a
 * `xuiBreadcrumbLink` pointing at the current URL.
 */
@Directive({
  selector: '[xuiBreadcrumbPage]',
  exportAs: 'xuiBreadcrumbPage',
  host: {
    role: 'link',
    'aria-disabled': 'true',
    'aria-current': 'page',
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbPage {
  /** Extra classes, merged into the directive's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => xui('font-normal text-foreground', this.class()));
}
