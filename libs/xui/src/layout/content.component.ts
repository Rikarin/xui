import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'xui-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />'
})
export class ContentComponent {
  @HostBinding('class.x-layout-content')
  get hostMainClass(): boolean {
    return true;
  }
}
