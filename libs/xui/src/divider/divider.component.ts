import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { InputNumber } from '../utils';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ''
})
export class XuiDividerComponent {
  @Input()
  @InputNumber()
  get marginTop() {
    return this._marginTop;
  }

  set marginTop(value: number | undefined) {
    this._marginTop = value;
  }

  @Input()
  @InputNumber()
  get marginBottom() {
    return this._marginBottom;
  }

  set marginBottom(value: number | undefined) {
    this._marginBottom = value;
  }

  @HostBinding('style.margin-top.px')
  private _marginTop?: number;

  @HostBinding('style.margin-bottom.px')
  private _marginBottom?: number;
}
