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
      type: 'divider'
    },
    {
      type: 'category',
      name: 'General'
    },
    {
      type: 'item',
      name: 'Too Long menu entry item to fit there'
      // component: ProfileComponent
    },
    {
      type: 'item',
      name: 'Show snackbar',
      critical: true,
      action: () => this.settings.stateChanged(false)
    }
  ];

  open() {
    this.settings.open();
  }
}
