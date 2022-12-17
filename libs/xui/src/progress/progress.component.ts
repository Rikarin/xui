import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InputNumber } from '../utils';
import { ProgressColor, ProgressStatus, ProgressType } from './progress.types';

@Component({
  selector: 'xui-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.component.html'
})
export class ProgressComponent {
  @Input() @InputNumber() progress!: number;
  @Input() type: ProgressType = 'line';
  @Input() color: ProgressColor = 'primary';
  @Input() status: ProgressStatus = null;

  get style() {
    const ret: { [klass: string]: boolean } = {
      'x-progress-indicator-status': true
    };

    ret[`x-progress-${this.getColor()}`] = true;
    return ret;
  }

  getIndicator() {
    if (this.status === 'error') {
      return -1;
    }

    if (this.progress === 100) {
      return 1;
    }

    return 0;
  }

  private getColor() {
    if (this.status === 'error') {
      return 'error';
    }

    if (this.progress === 100) {
      return 'success';
    }

    return this.color;
  }
}
