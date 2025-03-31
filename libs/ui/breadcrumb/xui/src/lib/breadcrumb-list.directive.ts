import { Directive, computed, input } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[xuiBreadcrumbList]',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbListDirective {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5', this.class())
  );
}
