import { Component, ViewChild } from '@angular/core';
import { MenuItem, XuiButtonModule, XuiSettings, XuiSettingsModule } from '@xui/components';
import { Method, Usage, Usages } from '../../components/usage';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, XuiSettingsModule, XuiButtonModule],
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class DocSettingsComponent {
  @ViewChild('settings') settings!: XuiSettings;

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
    // {
    //   param: 'type',
    //   description: 'Type of the decagram',
    //   type: "'decagram' | 'circle' | 'shield'",
    //   default: 'decagram'
    // },
    // {
    //   param: '[color]',
    //   description: 'Color of a decagram',
    //   type: "'primary' | 'primary-alt' | 'secondary' | 'success' | 'warning' | 'error' | 'info'",
    //   default: 'primary'
    // }
  ];

  methods: Method[] = [
    {
      property: 'open',
      description: 'Opens the settings dialog.',
      params: '(page: number = 1)'
    }
  ];

  open() {
    this.settings.open();
  }
}
