import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiIcon } from '@xui/components';
import {Usage, Usages} from "../../components/usage";

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, XuiIcon],
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  usage: Usage[] = [
    {
      param: 'icon',
      description: 'Name of the icon.',
      type: 'string'
    }
  ];
}
