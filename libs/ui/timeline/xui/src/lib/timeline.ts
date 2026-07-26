import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

export type XuiTimelineMode = 'left' | 'right';

/**
 * A vertical timeline. Wrap `<xui-timeline-item>` entries; each renders a colored
 * dot on a connecting axis with its projected content beside it. `mode` places
 * the axis on the left (default) or right.
 *
 * ```html
 * <xui-timeline>
 *   <xui-timeline-item color="success" label="09:00">Created</xui-timeline-item>
 *   <xui-timeline-item color="error">Failed</xui-timeline-item>
 * </xui-timeline>
 * ```
 */
@Component({
  selector: 'xui-timeline',
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTimeline {
  readonly class = input<ClassValue>('');
  readonly mode = input<XuiTimelineMode>('left');

  protected readonly computedClass = computed(() =>
    // Hide the connecting line on the last item so the axis stops at the final dot.
    xui('block [&>xui-timeline-item:last-child_.xui-tl-line]:hidden', this.class())
  );
}
