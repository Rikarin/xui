import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { InputNumber } from '../utils';

@Component({
  selector: 'xui-progress',
  exportAs: 'xuiProgress',
  styleUrls: ['progress.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.component.html'
})
export class XuiProgressComponent {
  @Input() @InputNumber() progress!: number;
  @Input() type: 'line' | 'circle' = 'line';
  @Input() color: 'primary' | 'primary-alt' | 'secondary' | 'error' | 'success' | 'warning' | string = 'primary';
  @Input() status: 'error' | null = null;

  get style() {
    const ret: any = {
      'indicator-status': true
    };

    ret[`progress-color-${this.getColor()}`] = true;
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
