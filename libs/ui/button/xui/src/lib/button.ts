import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, signal } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import { ClassValue } from 'clsx';
import { injectXuiButtonConfig } from './button.token';

/** How the button's contents are aligned along its main axis. */
export type XuiButtonAlign = 'left' | 'center' | 'right';

const alignClass: Record<XuiButtonAlign, string> = {
  left: 'justify-start text-start',
  center: 'justify-center text-center',
  right: 'justify-end text-end'
};

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-[color, background-color, outline] duration-300 cursor-pointer border-1',
    // eslint-disable-next-line local/no-hand-z-index -- the focused control must paint its ring above adjacent siblings in a group, not an overlay
    'focus-visible:z-1',
    // A disabled button keeps its pointer events so the cursor can say it is unavailable — an
    // element that receives none contributes no cursor either. The native `disabled` swallows the
    // click, so nothing depended on the inertness; every hover is scoped to `not-disabled:` (rather
    // than `enabled:`, which no `<a xuiButton>` would ever match) so a disabled button does not
    // light up on the way past.
    'disabled:cursor-not-allowed disabled:saturate-30',

    '[&_svg]:pointer-events-none [&_svg]:shrink-0'
  ],
  {
    variants: {
      variant: {
        default: 'shadow-elevation-1 not-disabled:hover:shadow-elevation-2',
        dash: 'shadow-elevation-1 text-foreground not-disabled:hover:shadow-elevation-2 border-dashed',
        outline: 'text-foreground shadow-elevation-1 not-disabled:hover:shadow-elevation-2',
        ghost: 'text-foreground not-disabled:hover:shadow-elevation-2 border-none', // TODO: this is shifted by border size compared to others
        link: 'text-link underline-offset-4 not-disabled:hover:underline'
      },
      // The shared control scale from `@xui/core/styles/theme.css`. The gap and icon size scale
      // with the box, so a 24px button does not carry a 16px icon.
      size: {
        sm: 'h-(--control-height-sm) gap-1 px-(--control-padding-sm) text-xs [&_svg]:size-3',
        md: 'h-(--control-height-md) gap-1.5 px-(--control-padding-md) text-sm [&_svg]:size-4',
        lg: 'h-(--control-height-lg) gap-2 px-(--control-padding-lg) text-base [&_svg]:size-5'
      },
      color: {
        primary: '',
        secondary: '',
        success: '',
        error: '',
        info: '',
        warning: ''
      }
    },
    compoundVariants: [
      // Default
      {
        variant: 'default',
        color: 'primary',
        class:
          'bg-primary text-primary-foreground border-primary-lighter not-disabled:hover:bg-primary-darker not-disabled:hover:border-primary/50'
      },
      {
        variant: 'default',
        color: 'secondary',
        class:
          'bg-secondary text-secondary-foreground border-secondary-lighter not-disabled:hover:bg-secondary-darker not-disabled:hover:border-secondary/50'
      },
      {
        variant: 'default',
        color: 'success',
        class:
          'bg-success text-success-foreground border-success-lighter not-disabled:hover:bg-success-darker not-disabled:hover:border-success/50'
      },
      {
        variant: 'default',
        color: 'error',
        class:
          'bg-error text-error-foreground border-error-lighter not-disabled:hover:bg-error-darker not-disabled:hover:border-error/50'
      },
      {
        variant: 'default',
        color: 'warning',
        class:
          'bg-warning text-warning-foreground border-warning-lighter not-disabled:hover:bg-warning-darker not-disabled:hover:border-warning/50'
      },
      {
        variant: 'default',
        color: 'info',
        class:
          'bg-info text-info-foreground border-info-lighter not-disabled:hover:bg-info-darker not-disabled:hover:border-info/50'
      },

      // Dash, Outline, Ghost
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'primary',
        class: 'border-primary not-disabled:hover:bg-primary not-disabled:hover:text-primary-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'secondary',
        class: 'border-secondary not-disabled:hover:bg-secondary not-disabled:hover:text-secondary-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'success',
        class: 'border-success not-disabled:hover:bg-success not-disabled:hover:text-success-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'error',
        class: 'border-error not-disabled:hover:bg-error not-disabled:hover:text-error-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'warning',
        class: 'border-warning not-disabled:hover:bg-warning not-disabled:hover:text-warning-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'info',
        class: 'border-info not-disabled:hover:bg-info not-disabled:hover:text-info-foreground'
      }
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      color: 'primary'
    }
  }
);

export type XuiButtonVariants = VariantProps<typeof buttonVariants>;

/**
 * Turns a native `<button>` or `<a>` into an xUI button.
 *
 * ```html
 * <button xuiButton color="primary">Save</button>
 * <a xuiButton variant="link" href="/docs">Read the docs</a>
 * ```
 *
 * A directive rather than a component, so the element keeps its own semantics — a `<button>` still
 * submits a form, an `<a>` still navigates, and `disabled` still swallows the click. That is also why
 * there is no `disabled` input: set the native attribute.
 */
@Directive({
  selector: '[xuiButton]',
  exportAs: 'xuiButton',
  host: {
    '[class]': 'computedClass()',
    '[attr.aria-pressed]': "active() ? 'true' : null",
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.data-loading]': "loading() ? '' : null"
  }
})
export class XuiButton {
  private readonly config = injectXuiButtonConfig();
  private readonly additionalClasses = signal<ClassValue>('');

  /** Intent colour. Pairs with `variant` to pick the concrete palette. */
  readonly color = input<XuiButtonVariants['color']>(this.config.color);
  /** Control height, from the shared control scale. The gap and icon size scale with it. */
  readonly size = input<XuiButtonVariants['size']>(this.config.size);
  /** How much the button asserts itself, from a filled `default` down to a bare `link`. */
  readonly variant = input<XuiButtonVariants['variant']>(this.config.variant);
  /** Extra classes, merged into the directive's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** Stretch to fill the available width instead of hugging its contents. */
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Alignment of the label/icons along the main axis. Defaults to centred. */
  readonly alignText = input<XuiButtonAlign>('center');

  /** Render a pressed/selected appearance (also sets `aria-pressed`). */
  readonly active = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /**
   * Swap the contents for a centred spinner while keeping the button's width, and
   * block interaction. The label stays laid out (hidden) so the button never jumps.
   */
  readonly loading = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(
      buttonVariants({ color: this.color(), variant: this.variant(), size: this.size() }),
      alignClass[this.alignText() ?? 'center'],
      this.fill() && 'w-full min-w-0',
      // Pressed reads as the lowest elevation step plus a slight darkening.
      this.active() && 'shadow-elevation-0 brightness-95',
      this.loading() && [
        'pointer-events-none relative text-transparent [&_svg]:invisible',
        // The label is hidden by `text-transparent`, which also zeroes currentColor,
        // so the spinner is coloured explicitly with `foreground` rather than `current`.
        'before:absolute before:top-1/2 before:left-1/2 before:size-4 before:-translate-x-1/2 before:-translate-y-1/2',
        'before:animate-spin before:rounded-full before:border-2 before:border-foreground before:border-t-transparent'
      ],
      this.class(),
      this.additionalClasses()
    )
  );

  setClass(classes: ClassValue): void {
    this.additionalClasses.set(classes);
  }
}
