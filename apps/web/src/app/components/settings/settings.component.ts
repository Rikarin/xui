import { Component, ViewChild } from '@angular/core';
import { MenuItem, XuiSettingsComponent } from 'xui';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  @ViewChild('settings') settings!: XuiSettingsComponent;

  items: MenuItem[] = [
    {
      type: 'category',
      name: 'General'
    },
    {
      type: 'item',
      name: 'Profile'
      // component: ProfileComponent
    },
    {
      type: 'category',
      name: 'General'
    },
    {
      type: 'item',
      name: 'Profile'
      // component: ProfileComponent
    },
    {
      type: 'item',
      name: 'Log out',
      critical: true,
      action: () => alert('foo bar')
    }
  ];

  open() {
    this.settings.open();
  }
}
