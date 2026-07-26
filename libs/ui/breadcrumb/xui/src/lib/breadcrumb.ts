import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * The landmark wrapping a breadcrumb trail: a `role="navigation"` with an accessible name.
 *
 * ```html
 * <nav xuiBreadcrumb>
 *   <ol xuiBreadcrumbList>…</ol>
 * </nav>
 * ```
 *
 * It contributes semantics only — no styling of its own — so the list inside it owns the layout.
 */
@Directive({
  selector: '[xuiBreadcrumb]',
  exportAs: 'xuiBreadcrumb',
  host: {
    role: 'navigation',
    '[class]': 'computedClass()',
    '[attr.aria-label]': 'ariaLabel()'
  }
})
export class XuiBreadcrumb {
  /** Extra classes, merged into the directive's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /**
   * The landmark's accessible name. Defaults to `breadcrumb`; override it when a page has more than
   * one trail, since a screen reader lists landmarks by name.
   */
  readonly ariaLabel = input<string>('breadcrumb', { alias: 'aria-label' });

  protected readonly computedClass = computed(() => xui(this.class()));
}
