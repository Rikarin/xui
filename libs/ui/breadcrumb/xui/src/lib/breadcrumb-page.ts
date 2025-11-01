import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[xuiBreadcrumbPage]',
  host: {
    role: 'link',
    'aria-disabled': 'true',
    'aria-current': 'page',
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbPage {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => xui('font-normal text-foreground', this.class()));
}
