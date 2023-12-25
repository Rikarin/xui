import { Component } from '@angular/core';
import { DrawerItem } from '@xui/components';

@Component({
  selector: 'app-drawer-example1',
  templateUrl: './drawer-example1.component.html',
  styleUrls: ['./drawer-example1.component.scss']
})
export class DrawerExample1Component {
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
