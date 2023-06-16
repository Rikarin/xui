import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InputNumber } from '../utils';
import { ProgressColor, ProgressStatus, ProgressType } from './progress.types';
import { CommonModule } from '@angular/common';
import { XuiDecagramComponent } from '../decagram';

@Component({
  standalone: true,
  imports: [CommonModule, XuiDecagramComponent],
  selector: 'xui-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.component.html'
})
export class XuiProgressComponent {
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
