import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TooltipPosition } from './tooltip.types';

@Component({
  selector: 'xui-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div>{{ message() }}</div>',
  host: {
    class: 'x-tooltip',
    '[class]': '"x-tooltip-" + position()',
    'aria-hidden': 'true'
  }
})
export class Tooltip {
  message = input.required<string>();
  position = input<TooltipPosition>();
}
