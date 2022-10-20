import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { InputNumber } from '../utils';

@Component({
  selector: 'xui-progress',
  exportAs: 'xuiProgress',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './progress.component.html'
})
export class XuiProgressComponent implements OnInit {
  @Input() @InputNumber() progress: number;
  @Input() type: 'line' | 'circle' = 'line';
  @Input() color: 'primary' | 'primary-alt' | 'secondary' | 'destructive' | 'success' | 'warn' | string = 'primary';
  @Input() status: 'error' | null = null;

  get style() {
    return `xui-progress-indicator-status xui-progress-indicator-${this.getColor()}`;
  }

  constructor() {}

  ngOnInit(): void {}

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
      return 'destructive';
    }

    if (this.progress === 100) {
      return 'success';
    }

    return this.color;
  }
}
