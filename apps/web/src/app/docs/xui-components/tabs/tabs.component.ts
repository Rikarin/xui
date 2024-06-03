import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiTabModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, XuiTabModule],
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
  // encapsulation: ViewEncapsulation.Emulated
})
export class TabsComponent {}
