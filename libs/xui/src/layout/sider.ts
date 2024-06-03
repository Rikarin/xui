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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />'
})
export class XuiSider implements OnInit, OnChanges {
  @Input() width: string | number = 'inherit';

  @HostBinding('class.x-layout-sider')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('style.width')
  private _width: string | null = null;

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
