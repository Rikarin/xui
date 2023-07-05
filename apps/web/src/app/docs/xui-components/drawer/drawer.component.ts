import { Component } from '@angular/core';
import { DrawerItem } from '@xui/components';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent {
  expanded = false;
  items: DrawerItem[] = [
    {
      label: 'Foo',
      icon: 'car'
    },
    {
      label: 'Bar',
      icon: 'decagram',
      children: [
        {
          label: 'child 1',
          icon: 'bell'
        },
        {
          label: 'child 2',
          icon: 'bell'
        },
        {
          label: 'child 3',
          icon: 'bell'
        }
      ]
    }
  ];
}
