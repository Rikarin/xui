import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * The ordered list of crumbs — the layout of the trail.
 *
 * ```html
 * <ol xuiBreadcrumbList>
 *   <li xuiBreadcrumbItem>…</li>
 * </ol>
 * ```
 *
 * Crumbs wrap rather than overflow, so a long trail in a narrow column grows taller instead of
 * clipping. Use `xui-breadcrumbs` when it should collapse to an ellipsis instead.
 */
@Directive({
  selector: '[xuiBreadcrumbList]',
  exportAs: 'xuiBreadcrumbList',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbList {
  /** Extra classes, merged into the directive's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('flex flex-wrap items-center gap-1.5 break-words text-sm text-foreground-subtle sm:gap-2.5', this.class())
  );
}
