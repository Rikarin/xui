import { computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiIconConfig } from './icon.token';

/**
 * Named sizes, plus any CSS length for the cases the scale does not cover.
 *
 * The four numbered steps line up with Blueprint's `IconSize` (16/20) extended
 * at both ends, so ported code keeps its visual weight.
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none' | (Record<never, never> & string);

export const iconVariants = cva('', {
  variants: {
    color: {
      inherit: '',
      muted: 'text-foreground-muted',
      subtle: 'text-foreground-subtle',
      primary: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-info'
    }
  },
  defaultVariants: {
    color: 'inherit'
  }
});

export type IconVariants = VariantProps<typeof iconVariants>;

const SIZES: Record<string, string> = {
  xs: '12px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px'
};

/**
 * Sizing and colour for an `@ng-icons` icon.
 *
 * ```html
 * <ng-icon xui name="matCheckRound" />
 * <ng-icon xui size="sm" color="error" name="matCloseRound" title="Remove" />
 * ```
 *
 * An icon is decorative by default and hidden from assistive technology. Give it
 * a `title` when it carries meaning on its own — an icon-only button, a status
 * glyph — and it becomes an `img` with that accessible name instead.
 */
@Directive({
  // The bare `xui` attribute is the intended public API here: `<ng-icon xui />`.
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ng-icon[xui]',
  exportAs: 'xuiIcon',
  host: {
    '[style.--ng-icon__size]': 'computedSize()',
    '[class]': 'computedClass()',
    '[attr.role]': 'title() ? "img" : null',
    '[attr.aria-label]': 'title()',
    '[attr.aria-hidden]': 'title() ? null : "true"'
  }
})
export class XuiIcon {
  private readonly config = injectXuiIconConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly size = input<IconSize>(this.config.size);
  readonly color = input<IconVariants['color']>(this.config.color);

  /**
   * An accessible name. Setting it marks the icon as meaningful content rather
   * than decoration.
   */
  readonly title = input<string | null>(null);

  protected readonly computedClass = computed(() => xui(iconVariants({ color: this.color() }), this.class()));

  protected readonly computedSize = computed(() => {
    const size = this.size();

    return SIZES[size] ?? size;
  });
}
