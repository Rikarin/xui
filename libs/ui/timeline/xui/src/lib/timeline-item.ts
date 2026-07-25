import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import { XuiTimeline } from './timeline';

export type TimelineColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'muted';

/**
 * One entry on a {@link XuiTimeline}: a colored dot on the axis and projected
 * content beside it, with an optional `label`.
 */
@Component({
  selector: 'xui-timeline-item',
  template: `
    <span class="relative flex flex-col items-center">
      <span [class]="dotClass()"></span>
      <span class="xui-tl-line bg-border w-px flex-1"></span>
    </span>
    <div class="-mt-0.5 min-w-0 flex-1 pb-6">
      @if (label()) {
        <div class="text-foreground-muted mb-0.5 text-xs">{{ label() }}</div>
      }
      <div class="text-foreground"><ng-content /></div>
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTimelineItem {
  private readonly timeline = inject(XuiTimeline);

  readonly color = input<TimelineColor>('primary');
  readonly label = input<string>('');

  protected readonly computedClass = computed(() =>
    xui('flex gap-3', this.timeline.mode() === 'right' ? 'flex-row-reverse text-end' : '')
  );

  protected readonly dotClass = computed(() => xui('mt-1 h-3 w-3 shrink-0 rounded-full', DOT[this.color()]));
}

const DOT: Record<TimelineColor, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-info',
  muted: 'bg-foreground-subtle'
};
