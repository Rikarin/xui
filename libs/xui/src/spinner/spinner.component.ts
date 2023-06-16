import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpinnerColor } from './spinner.types';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles"></div>`
})
export class XuiSpinnerComponent {
  @Input() color: SpinnerColor = 'primary';

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-spinner': true
    };

    ret[`x-spinner-${this.color}`] = true;
    return ret;
  }
}
