import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { SpinnerColor } from './spinner.types';

@Component({
  selector: 'xui-spinner',
  exportAs: 'xuiSpinner',
  styleUrls: ['./spinner.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles"></div>`
})
export class XuiSpinnerComponent {
  @Input() color: SpinnerColor = 'primary';

  get styles() {
    const ret: { [klass: string]: boolean } = {
      spinner: true
    };

    ret[`spinner-color-${this.color}`] = true;
    return ret;
  }
}
