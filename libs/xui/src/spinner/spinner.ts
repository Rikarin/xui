import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { SpinnerColor } from './spinner.types';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ''
})
export class XuiSpinner {
  @Input() color: SpinnerColor = 'primary';

  @HostBinding('class.x-spinner')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class')
  get hostClass(): string {
    return `x-spinner-${this.color}`;
  }
}
