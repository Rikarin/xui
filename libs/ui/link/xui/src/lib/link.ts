import { computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiLinkConfig } from './link.token';

export const linkVariants = cva(['cursor-pointer transition-colors', 'focus-visible:rounded-xs'], {
  variants: {
    underline: {
      always: 'underline underline-offset-4',
      hover: 'no-underline hover:underline hover:underline-offset-4',
      none: 'no-underline'
    },
    color: {
      /** Follows the surrounding text — for links inside a paragraph of body copy. */
      inherit: 'text-inherit',
      link: 'text-link hover:text-link-hover',
      primary: 'text-primary hover:text-primary-darker',
      secondary: 'text-secondary hover:text-secondary-darker',
      success: 'text-success hover:text-success-darker',
      error: 'text-error hover:text-error-darker',
      warning: 'text-warning hover:text-warning-darker',
      info: 'text-info hover:text-info-darker'
    }
  },
  defaultVariants: {
    underline: 'always',
    color: 'link'
  }
});

export type XuiLinkVariants = VariantProps<typeof linkVariants>;

/**
 * A styled anchor.
 *
 * ```html
 * <a xuiLink href="/docs">Documentation</a>
 * <a xuiLink color="inherit" underline="hover" routerLink="/settings">Settings</a>
 * ```
 *
 * Deliberately a directive on a real `<a>` rather than a wrapper component:
 * href/target/rel, `routerLink` and the browser's own affordances (middle-click,
 * open in new tab, copy address) then all keep working untouched.
 */
@Directive({
  selector: 'a[xuiLink]',
  exportAs: 'xuiLink',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiLink {
  private readonly config = injectXuiLinkConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  /**
   * Link colour. `current` follows the surrounding text — for links inside body copy that should not break the line's
   * colour.
   */
  readonly color = input<XuiLinkVariants['color']>(this.config.color);
  /**
   * When to underline: `always`, only on `hover`, or `none`. Prefer `always` for links inside prose, where the
   * underline is the only thing marking them.
   */
  readonly underline = input<XuiLinkVariants['underline']>(this.config.underline);

  protected readonly computedClass = computed(() =>
    xui(linkVariants({ color: this.color(), underline: this.underline() }), this.class())
  );
}
