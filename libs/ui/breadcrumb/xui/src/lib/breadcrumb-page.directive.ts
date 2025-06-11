import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[xuiBreadcrumbPage]',
  host: {
    role: 'link',
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbPageDirective {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => xui('font-normal text-foreground', this.class()));
}
