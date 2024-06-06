import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SpinnerColor } from './spinner.types';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    class: 'x-spinner',
    '[class]': '"x-spinner-" + color()'
  }
})
export class XuiSpinner {
  color = input<SpinnerColor>('primary');
}
