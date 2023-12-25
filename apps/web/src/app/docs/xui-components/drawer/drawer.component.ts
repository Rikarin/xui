import { Component } from '@angular/core';
import { DrawerItem } from '@xui/components';
import { FileType } from '../../components/example/example.component';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent {
  readonly example1 = {
    'drawer-example1': FileType.Component
  };
}
