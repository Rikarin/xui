import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { parseCss } from '../utils';

@Component({
  selector: 'xui-sider',
  exportAs: 'xuiSider',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class XuiSiderComponent implements OnInit, OnChanges {
  @HostBinding('style.width')
  private _width: string | null = null;

  @Input() width: string | number = 'inherit';

  ngOnInit() {
    this.updateStyles();
  }

  ngOnChanges() {
    this.updateStyles();
  }

  private updateStyles() {
    this._width = parseCss(this.width);
  }
}
