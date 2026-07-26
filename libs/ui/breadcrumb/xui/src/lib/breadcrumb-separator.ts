import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matChevronRightRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * The divider between two crumbs. Defaults to a chevron; project any content to replace it.
 *
 * ```html
 * <span xuiBreadcrumbSeparator></span>
 * <span xuiBreadcrumbSeparator>/</span>
 * ```
 *
 * Hidden from assistive technology (`role="presentation"`, `aria-hidden`) — the list structure
 * already conveys the ordering, so announcing a chevron per crumb would only add noise.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[xuiBreadcrumbSeparator]',
  imports: [NgIcon],
  providers: [provideIcons({ matChevronRightRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'presentation',
    'aria-hidden': 'true',
    '[class]': 'computedClass()'
  },
  template: `
    <ng-content>
      <ng-icon name="matChevronRightRound" />
    </ng-content>
  `
})
export class XuiBreadcrumbSeparator {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('flex items-center justify-center [&>ng-icon]:text-[14px] [&>ng-icon]:flex!', this.class())
  );
}
