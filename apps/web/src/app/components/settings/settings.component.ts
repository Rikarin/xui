import { Component, ViewChild } from '@angular/core';
import { MenuItem, XuiSettingsComponent } from 'xui';
import { Method, Usage } from '../usage';

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

  readonly usage: Usage[] = [
    {
      param: '[type]',
      description: 'Type of a decagram',
      type: "'decagram' | 'circle' | 'shield'",
      default: 'decagram'
    },
    {
      param: '[color]',
      description: 'Color of a decagram',
      type: "'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info'",
      default: 'primary'
    }
  ];

  methods: Method[] = [
    {
      property: 'open',
      description: 'Opens a settings dialog',
      params: '(page: number = 1)'
    }
  ];

  open() {
    this.settings.open();
  }
}
