import { ChangeDetectionStrategy, Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { InputNumber } from '../utils';

@Component({
  selector: 'xui-divider',
  exportAs: 'xuiDivider',
  styleUrls: ['./divider.scss'],
  encapsulation: ViewEncapsulation.Emulated,
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
