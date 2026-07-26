import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matMoreHorizRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';

/**
 * Stands in for crumbs that were dropped from the middle of a trail.
 *
 * ```html
 * <li xuiBreadcrumbItem><xui-breadcrumb-ellipsis /></li>
 * ```
 *
 * Renders a "more" glyph with a visually hidden label, so the gap is announced rather than silently
 * skipped. `xui-breadcrumbs` inserts one for you; place it by hand only when composing the parts.
 */
@Component({
  selector: 'xui-breadcrumb-ellipsis',
  imports: [NgIcon, XuiIcon],
  providers: [provideIcons({ matMoreHorizRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span role="presentation" aria-hidden="true" [class]="computedClass()">
      <ng-icon xui size="sm" name="matMoreHorizRound" />
      <span class="sr-only">More</span>
    </span>
  `
})
export class XuiBreadcrumbEllipsis {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  protected readonly computedClass = computed(() => xui('flex items-center justify-center', this.class()));
}
