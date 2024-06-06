import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProgressColor, ProgressStatus, ProgressType } from './progress.types';
import { CommonModule } from '@angular/common';
import { XuiDecagram } from '../decagram';
@Component({
  standalone: true,
  imports: [CommonModule, XuiDecagram],
  selector: 'xui-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'progress.html',
  host: {
    class: 'x-progress'
  }
})
export class XuiProgress {
  progress = input.required<number>();
  type = input<ProgressType>('line');
  color = input<ProgressColor>('primary');
  status = input<ProgressStatus>(null);

  private _color = computed(() => {
    if (this.status() === 'error') {
      return 'error';
    }

    console.log('progress', this.progress());

    if (this.progress() == 100) {
      return 'success';
    }

    return this.color();
  });

  _indicator = computed(() => {
    if (this.status() === 'error') {
      return -1;
    }

    if (this.progress() == 100) {
      return 1;
    }

    return 0;
  });

  _style = computed(() => {
    const ret: { [klass: string]: boolean } = {
      'x-progress-indicator': true
    };

    ret[`x-progress-${this._color()}`] = true;
    return ret;
  });
}
