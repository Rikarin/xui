import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[xuiBreadcrumbItem]',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbItem {
  readonly class = input<ClassValue>('');
  readonly active = input(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui('inline-flex items-center gap-1.5', this.active() && '[&>*]:font-semibold', this.class())
  );
}
