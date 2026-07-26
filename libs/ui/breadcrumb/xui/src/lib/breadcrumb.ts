import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[xuiBreadcrumb]',
  exportAs: 'xuiBreadcrumb',
  host: {
    role: 'navigation',
    '[class]': 'computedClass()',
    '[attr.aria-label]': 'ariaLabel()'
  }
})
export class XuiBreadcrumb {
  readonly class = input<ClassValue>('');
  readonly ariaLabel = input<string>('breadcrumb', { alias: 'aria-label' });

  protected readonly computedClass = computed(() => xui(this.class()));
}
