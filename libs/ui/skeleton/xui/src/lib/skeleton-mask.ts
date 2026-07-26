import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';

/**
 * Turn an existing element into a loading placeholder in place.
 *
 * ```html
 * <h2 xuiHeading [xuiSkeleton]="loading()">{{ title() }}</h2>
 * <button xuiButton [xuiSkeleton]="loading()">Save</button>
 * ```
 *
 * Where `<xui-skeleton>` replaces content, this masks it: the element keeps its
 * own size, so the layout does not shift when the real content arrives.
 *
 * Masked content is also taken out of the accessibility tree and made
 * uninteractive — `aria-hidden` plus `inert`, which removes it from the tab
 * order and blocks pointer events. Announcing or focusing placeholder text would
 * be worse than saying nothing.
 */
@Directive({
  selector: '[xuiSkeleton]',
  exportAs: 'xuiSkeleton',
  host: {
    '[class]': 'computedClass()',
    '[attr.aria-hidden]': 'active() ? "true" : null',
    '[attr.inert]': 'active() ? "" : null',
    '[attr.tabindex]': 'active() ? "-1" : null'
  }
})
export class XuiSkeletonMask {
  /**
   * Whether the placeholder is showing. Bare `xuiSkeleton` means always on;
   * bind it to toggle.
   */
  readonly active = input<boolean, BooleanInput>(true, { alias: 'xuiSkeleton', transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    this.active()
      ? xui(
          'animate-pulse select-none',
          // Hide whatever the element would normally paint — its own text,
          // borders, background and radius — while keeping it occupying the
          // same box.
          //
          // Every one of these is `!`: the host's own directive writes to the
          // same `class` attribute, so without it the winner between
          // `bg-primary` and `bg-border-muted` is decided by Tailwind's
          // stylesheet order rather than by us, and a masked button stays blue.
          // `bg-border-muted` matches the old `bg-muted` step in both themes.
          'bg-border-muted! rounded-md! text-transparent! border-transparent! shadow-none! [&_*]:invisible'
        )
      : ''
  );
}
