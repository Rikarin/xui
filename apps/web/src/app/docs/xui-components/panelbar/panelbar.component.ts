import { Component } from '@angular/core';
import { PanelBarItem, XuiButtonModule, XuiDecagram, XuiIcon, XuiPanelBarModule } from '@xui/components';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, XuiPanelBarModule, XuiDecagram, XuiButtonModule, XuiIcon],
  selector: 'app-panelbar',
  templateUrl: './panelbar.component.html',
  styleUrls: ['./panelbar.component.scss']
})
export class PanelbarComponent {
  items: PanelBarItem[] = [
    {
      title: 'first',
      children: [
        {
          title: 'child first'
        },
        {
          title: 'child second',
          children: [
            {
              title: 'child 2 child 3'
            },
            {
              title: 'child 2 child 4'
            }
          ]
        },
        {
          title: 'child three with content',
          content: 'content of child three'
        }
      ]
    },
    {
      title: 'second',
      content: 'second content'
    }
  ];
}
