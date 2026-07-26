import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[xuiBreadcrumbItem]',
  exportAs: 'xuiBreadcrumbItem',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbItem {
  readonly class = input<ClassValue>('');
  readonly active = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui('inline-flex items-center gap-1.5', this.active() && '[&>*]:font-semibold', this.class())
  );
}
