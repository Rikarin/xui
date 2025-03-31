import { computed, Directive, DoCheck, effect, inject, Injector, input, signal, untracked } from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { xui } from '@xui/core';
import { XCoreFormFieldControl } from '@xui/core/form-field';
import { ErrorStateMatcher, ErrorStateTracker } from '@xui/core/forms';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const inputVariants = cva(
  [
    'flex rounded-lg border font-normal border border-neutral-100/20 text-base transition-all',
    'file:border-0 file:text-foreground file:bg-transparent file:font-medium placeholder:text-foreground/60',
    // 'focus-visible:outline-5 focus-visible:outline-offset-2',
    'focus:border-focus focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ],
  {
    variants: {
      size: {
        // TODO: check file:
        default: 'h-11 py-3 px-2.5',
        sm: 'h-9 px-2 text-sm'
        // lg: 'h-12 px-8 file:md:py-3 file:max-md:py-2.5' // TODO: support just sm/default
      },
      color: {
        dark: 'bg-zinc-900 text-neutral-100',
        light: 'bg-zinc-700 text-neutral-100'
      },
      error: {
        auto: '[&.ng-invalid.ng-touched]:text-error [&.ng-invalid.ng-touched]:border-2 [&.ng-invalid.ng-touched]:border-error',
        true: 'text-error border-error border-2'
      }
    },
    defaultVariants: {
      size: 'default',
      color: 'dark',
      error: 'auto'
    }
  }
);
type InputVariants = VariantProps<typeof inputVariants>;

@Directive({
  selector: '[xuiInput]',
  host: {
    '[class]': 'computedClass()'
  },
  providers: [
    {
      provide: XCoreFormFieldControl,
      useExisting: XuiInputDirective
    }
  ]
})
export class XuiInputDirective implements XCoreFormFieldControl, DoCheck {
  private readonly injector = inject(Injector);
  private readonly errorStateTracker: ErrorStateTracker;
  private readonly defaultErrorStateMatcher = inject(ErrorStateMatcher);
  private readonly parentForm = inject(NgForm, { optional: true });
  private readonly parentFormGroup = inject(FormGroupDirective, { optional: true });

  /** The user defined classes */
  readonly class = input<ClassValue>('');
  readonly size = input<InputVariants['size']>('default');
  readonly color = input<InputVariants['color']>('dark');
  readonly error = input<InputVariants['error']>('auto');
  readonly ngControl: NgControl | null = this.injector.get(NgControl, null);
  readonly errorState = computed(() => this.errorStateTracker.errorState());

  /** The classes to apply to the component merged with the user defined classes */
  protected readonly computedClass = computed(() =>
    xui(inputVariants({ size: this.size(), color: this.color(), error: this.state().error() }), this.class())
  );

  protected readonly state = computed(() => ({
    error: signal(this.error())
  }));

  constructor() {
    this.errorStateTracker = new ErrorStateTracker(
      this.defaultErrorStateMatcher,
      this.ngControl,
      this.parentFormGroup,
      this.parentForm
    );

    effect(() => {
      const error = this.errorStateTracker.errorState();
      untracked(() => {
        if (this.ngControl) {
          this.setError(error);
        }
      });
    });
  }

  ngDoCheck() {
    this.errorStateTracker.updateErrorState();
  }

  setError(error: InputVariants['error']) {
    this.state().error.set(error);
  }
}
