import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A navigable crumb.
 *
 * ```html
 * <a xuiBreadcrumbLink href="/projects">Projects</a>
 * <a xuiBreadcrumbLink [routerLink]="['/projects']">Projects</a>
 * ```
 *
 * This is styling and disabled semantics only — it deliberately does not
 * compose `RouterLink`. Doing so made every breadcrumb fail to render without a
 * `Router` in the injector, routed or not, because host directives are
 * instantiated unconditionally. Applying `routerLink` alongside it costs the
 * consumer nothing and keeps `@angular/router` optional.
 */
@Directive({
  selector: '[xuiBreadcrumbLink]',
  exportAs: 'xuiBreadcrumbLink',
  host: {
    '[class]': 'computedClass()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.tabindex]': 'disabled() ? -1 : null'
  }
})
export class XuiBreadcrumbLink {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  /** Renders the crumb as unreachable without dropping it from the trail. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(
      'hover:text-foreground rounded-sm transition-colors',
      this.disabled() && 'text-foreground-muted pointer-events-none opacity-60 hover:text-inherit',
      this.class()
    )
  );
}
