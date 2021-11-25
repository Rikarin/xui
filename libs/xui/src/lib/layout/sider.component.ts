import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { parseCss } from '../utils';

@Component({
  selector: 'xui-sider',
  exportAs: 'xuiSider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  styleUrls: ['./sider.component.scss'],
  host: {
    '[style.width]': '_width'
  }
})
export class XuiSiderComponent implements OnInit, OnChanges {
  private _width: string;

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
