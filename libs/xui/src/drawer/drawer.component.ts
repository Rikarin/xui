import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-drawer',
  templateUrl: './drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawerComponent {}
