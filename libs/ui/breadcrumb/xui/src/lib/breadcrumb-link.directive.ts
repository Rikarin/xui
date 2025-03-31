import { Directive, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

@Directive({
  selector: '[xuiBreadcrumbLink]',
  hostDirectives: [
    {
      directive: RouterLink,
      inputs: [
        'target',
        'queryParams',
        'fragment',
        'queryParamsHandling',
        'state',
        'info',
        'relativeTo',
        'preserveFragment',
        'skipLocationChange',
        'replaceUrl',
        'routerLink: link'
      ]
    }
  ],
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiBreadcrumbLinkDirective {
  readonly class = input<ClassValue>('');
  readonly link = input<RouterLink['routerLink']>();

  protected readonly computedClass = computed(() => xui('transition-colors hover:text-foreground', this.class()));
}
