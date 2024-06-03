import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { TooltipPosition } from './tooltip.types';

@Component({
  selector: 'xui-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div>{{ message }}</div>',
  host: {
    'aria-hidden': 'true'
  }
})
export class Tooltip {
  @Input() message!: string;
  @Input() position!: TooltipPosition;

  @HostBinding('class.x-tooltip')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class')
  get hostClass(): string {
    return `x-tooltip-${this.position}`;
  }
}
