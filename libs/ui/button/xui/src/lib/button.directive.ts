import { computed, Directive, input, signal } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import { ClassValue } from 'clsx';
import { injectXuiButtonConfig } from './button.token';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap min-w-18 rounded-lg font-medium transition-[color, background-color, outline] duration-300 cursor-pointer border-1',
    'focus-visible:outline-5 focus-visible:outline-offset-2 focus-visible:z-1',
    'disabled:pointer-events-none disabled:saturate-30',

    // TODO: I'm not sure about this
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
  ],
  {
    variants: {
      variant: {
        default: 'shadow hover:shadow-md',
        dash: 'shadow text-foreground hover:shadow-md border-dashed',
        outline: 'text-foreground shadow hover:shadow-md',
        ghost: 'text-foreground hover:shadow-md border-none', // TODO: this is shifted by border size compared to others
        link: 'text-link underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 text-sm',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-11 px-8 text-md'
        // icon: 'h-9 w-9',
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
      size: 'default',
      color: 'primary'
    }
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Directive({
  selector: '[xuiButton]',
  exportAs: 'xuiButton',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiButtonDirective {
  // TODO: shine, icon

  // private readonly renderer = inject(Renderer2);
  // private readonly elementRef = inject(ElementRef);

  private readonly config = injectXuiButtonConfig();
  private readonly additionalClasses = signal<ClassValue>('');

  readonly color = input<ButtonVariants['color']>(this.config.color);
  readonly size = input<ButtonVariants['size']>(this.config.size);
  readonly variant = input<ButtonVariants['variant']>(this.config.variant);
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => {
    return xui(
      buttonVariants({ color: this.color(), variant: this.variant(), size: this.size() }),
      this.class(),
      this.additionalClasses()
    );
  });

  setClass(classes: ClassValue): void {
    this.additionalClasses.set(classes);
  }

  // ngAfterViewInit() {
  //   const shine = this.renderer.createElement('div');
  //   this.renderer.addClass(shine, 'bg-green-500'); //, 'w-10', 'h-10');
  //   this.renderer.appendChild(this.elementRef.nativeElement, shine);
  // }
}
