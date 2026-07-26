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

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-[color, background-color, outline] duration-300 cursor-pointer border-1',
    // eslint-disable-next-line local/no-hand-z-index -- the focused control must paint its ring above adjacent siblings in a group, not an overlay
    'focus-visible:z-1',
    'disabled:pointer-events-none disabled:saturate-30',

    '[&_svg]:pointer-events-none [&_svg]:shrink-0'
  ],
  {
    variants: {
      variant: {
        default: 'shadow-elevation-1 hover:shadow-elevation-2',
        dash: 'shadow-elevation-1 text-foreground hover:shadow-elevation-2 border-dashed',
        outline: 'text-foreground shadow-elevation-1 hover:shadow-elevation-2',
        ghost: 'text-foreground hover:shadow-elevation-2 border-none', // TODO: this is shifted by border size compared to others
        link: 'text-link underline-offset-4 hover:underline'
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
          'bg-primary text-primary-foreground border-primary-lighter hover:bg-primary-darker hover:border-primary/50'
      },
      {
        variant: 'default',
        color: 'secondary',
        class:
          'bg-secondary text-secondary-foreground border-secondary-lighter hover:bg-secondary-darker hover:border-secondary/50'
      },
      {
        variant: 'default',
        color: 'success',
        class:
          'bg-success text-success-foreground border-success-lighter hover:bg-success-darker hover:border-success/50'
      },
      {
        variant: 'default',
        color: 'error',
        class: 'bg-error text-error-foreground border-error-lighter hover:bg-error-darker hover:border-error/50'
      },
      {
        variant: 'default',
        color: 'warning',
        class:
          'bg-warning text-warning-foreground border-warning-lighter hover:bg-warning-darker hover:border-warning/50'
      },
      {
        variant: 'default',
        color: 'info',
        class: 'bg-info text-info-foreground border-info-lighter hover:bg-info-darker hover:border-info/50'
      },

      // Dash, Outline, Ghost
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'primary',
        class: 'border-primary hover:bg-primary hover:text-primary-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'secondary',
        class: 'border-secondary hover:bg-secondary hover:text-secondary-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'success',
        class: 'border-success hover:bg-success hover:text-success-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'error',
        class: 'border-error hover:bg-error hover:text-error-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'warning',
        class: 'border-warning hover:bg-warning hover:text-warning-foreground'
      },
      {
        variant: ['dash', 'outline', 'ghost'],
        color: 'info',
        class: 'border-info hover:bg-info hover:text-info-foreground'
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

  readonly color = input<XuiButtonVariants['color']>(this.config.color);
  readonly size = input<XuiButtonVariants['size']>(this.config.size);
  readonly variant = input<XuiButtonVariants['variant']>(this.config.variant);
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
