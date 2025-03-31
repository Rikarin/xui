import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matChevronRightRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIconDirective } from '@xui/icon';
import type { ClassValue } from 'clsx';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[xuiBreadcrumbSeparator]',
  imports: [NgIcon, XuiIconDirective],
  providers: [provideIcons({ matChevronRightRound })],
  host: {
    role: 'presentation',
    '[class]': 'computedClass()',
    '[attr.aria-hidden]': 'true'
  },
  template: `
    <ng-content>
      <ng-icon size="sm" xui name="matChevronRightRound" />
    </ng-content>
  `
})
export class XuiBreadcrumbSeparatorComponent {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('flex items-center justify-center [&>ng-icon]:w-3.5 [&>ng-icon]:h-3.5 [&>ng-icon]:flex', this.class())
  );
}
