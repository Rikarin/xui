import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matMoreHorizRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'xui-breadcrumb-ellipsis',
  imports: [NgIcon, XuiIcon],
  providers: [provideIcons({ matMoreHorizRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span role="presentation" aria-hidden="true" [class]="computedClass()">
      <ng-icon xui size="sm" name="matMoreHorizRound" />
      <span class="sr-only">More</span>
    </span>
  `
})
export class XuiBreadcrumbEllipsis {
  readonly class = input<ClassValue>('');
  protected readonly computedClass = computed(() => xui('flex items-center justify-center', this.class()));
}
