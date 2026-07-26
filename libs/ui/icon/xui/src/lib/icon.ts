import { computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { injectXuiIconConfig } from './icon.token';

/**
 * Named sizes, plus any CSS length for the cases the scale does not cover.
 *
 * The scale is built around the two sizes that carry most of the work — 16px
 * beside body text and 20px beside a heading — extended one step at each end.
 */
export type XuiIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none' | (Record<never, never> & string);

/**
 * The semantic colours an icon can take, as values rather than classes.
 *
 * `@ng-icons` colours its host from `--ng-icon__color` inside `@layer ng-icon`.
 * That layer is named after Tailwind's, so it sorts last and wins the cascade —
 * a `text-*` utility on an `<ng-icon>` is silently discarded. Feeding the
 * variable is the only way to colour an icon, so the scale maps to the token
 * references the utilities would have resolved to.
 *
 * `inherit` maps to nothing, leaving the variable unset so the package's own
 * `currentColor` fallback takes the surrounding text colour.
 */
export const iconColors = {
  inherit: null,
  muted: 'var(--color-foreground-muted)',
  subtle: 'var(--color-foreground-subtle)',
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)'
} as const satisfies Record<string, string | null>;

export type XuiIconColor = keyof typeof iconColors;

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
 * <ng-icon xui size="sm" color="error" name="matCloseRound" label="Remove" />
 * ```
 *
 * An icon is decorative by default and hidden from assistive technology. Give it
 * a `label` when it carries meaning on its own — an icon-only button, a status
 * glyph — and it becomes an `img` with that accessible name instead.
 */
@Directive({
  // The bare `xui` attribute is the intended public API here: `<ng-icon xui />`.
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ng-icon[xui]',
  exportAs: 'xuiIcon',
  host: {
    '[style.--ng-icon__size]': 'computedSize()',
    // A directive host binding outranks the component's own, so this is what `ng-icon` reads —
    // which matters, because the shared `color` input name means it is handed the variant name too.
    '[style.--ng-icon__color]': 'computedColor()',
    '[class]': 'computedClass()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label()',
    '[attr.aria-hidden]': 'label() ? null : "true"'
  }
})
export class XuiIcon {
  private readonly config = injectXuiIconConfig();

  /**
   * The user-defined classes.
   *
   * Note that a colour utility will not land here — `@ng-icons` outranks the utilities layer, so
   * reach for `color` instead. Everything else (layout, spacing, transitions) applies as usual.
   */
  readonly class = input<ClassValue>('');
  /**
   * Icon box size, from the shared scale. `none` leaves the size to the surrounding text or to your own classes; any
   * other string is passed through as a length.
   */
  readonly size = input<XuiIconSize>(this.config.size);
  /**
   * Semantic colour. Defaults to inheriting the surrounding text colour, so an icon in a button matches its label.
   */
  readonly color = input<XuiIconColor>(this.config.color);

  /**
   * An accessible name. Setting it marks the icon as meaningful content rather
   * than decoration.
   */
  readonly label = input<string | null>(null);

  protected readonly computedClass = computed(() => xui(this.class()));

  protected readonly computedColor = computed(() => iconColors[this.color()]);

  protected readonly computedSize = computed(() => {
    const size = this.size();

    return SIZES[size] ?? size;
  });
}
