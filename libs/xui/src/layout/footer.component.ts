import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'xui-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />'
})
export class FooterComponent {
  @HostBinding('class.x-layout-footer')
  get hostMainClass(): boolean {
    return true;
  }
}
