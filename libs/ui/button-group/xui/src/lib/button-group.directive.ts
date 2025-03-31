import { computed, Directive, input, signal } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import { ClassValue } from 'clsx';

const buttonGroupVariants = cva([
  'inline-flex *:not-first:rounded-l-none *:not-last:rounded-r-none *:not-first:border-l-0'
]);

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>;

@Directive({
  selector: '[xuiButtonGroup]',
  exportAs: 'xuiButtonGroup',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiButtonGroupDirective {
  // TODO: we can provide configuration for buttons though DI/token

  // private readonly config = injectXuiButtonConfig();
  private readonly additionalClasses = signal<ClassValue>('');

  // readonly color = input<ButtonVariants['color']>(this.config.color);
  // readonly size = input<ButtonVariants['size']>(this.config.size);
  // readonly variant = input<ButtonVariants['variant']>(this.config.variant);
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => {
    return xui(buttonGroupVariants(), this.class(), this.additionalClasses());
  });

  setClass(classes: ClassValue): void {
    this.additionalClasses.set(classes);
  }
}
