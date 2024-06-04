import { Component } from '@angular/core';
import { DrawerItem, XuiButtonModule, XuiDrawerModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiDrawerModule, XuiButtonModule, XuiIcon],
  selector: 'app-drawer-example1',
  templateUrl: './drawer-example1.component.html',
  styleUrls: ['./drawer-example1.component.scss']
})
export class DrawerExample1Component {
  expanded = false;
  items: DrawerItem[] = [
    {
      label: 'Foo',
      icon: 'shopping_cart'
    },
    {
      label: 'Bar',
      icon: 'shield',
      children: [
        {
          label: 'child 1',
          icon: 'notifications'
        },
        {
          label: 'child 2',
          icon: 'new_releases'
        },
        {
          label: 'child 3',
          icon: 'timer_play'
        }
      ]
    }
  ];
}
