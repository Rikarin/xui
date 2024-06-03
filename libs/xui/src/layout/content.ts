import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'xui-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />'
})
export class XuiContent {
  @HostBinding('class.x-layout-content')
  get hostMainClass(): boolean {
    return true;
  }
}
