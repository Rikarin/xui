import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'xui-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />'
})
export class HeaderComponent {
  @HostBinding('class.x-layout-header')
  get hostMainClass(): boolean {
    return true;
  }
}
