import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * One crumb of the trail: the `<li>` holding a link (or the current page) and its separator.
 *
 * ```html
 * <li xuiBreadcrumbItem>
 *   <a xuiBreadcrumbLink href="/projects">Projects</a>
 *   <span xuiBreadcrumbSeparator></span>
 * </li>
 * ```
 */
@Directive({
  selector: '[xuiBreadcrumbItem]',
  exportAs: 'xuiBreadcrumbItem',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbItem {
  /** Extra classes, merged into the directive's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /**
   * Emphasise this crumb's contents. Appearance only — mark the current page with
   * `xuiBreadcrumbPage`, which carries the `aria-current` a screen reader needs.
   */
  readonly active = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui('inline-flex items-center gap-1.5', this.active() && '[&>*]:font-semibold', this.class())
  );
}
