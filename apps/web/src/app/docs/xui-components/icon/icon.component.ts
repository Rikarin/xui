import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example, FileType } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { Usage, Usages } from '../../components/usage';
import { IconExample1Component } from '../../../../examples/icon-example1/icon-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, IconExample1Component],
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  readonly example1 = {
    'icon-example1': FileType.Component
  };

  usage: Usage[] = [
    {
      param: 'icon',
      description: 'Name of the icon.',
      type: 'string'
    }
  ];
}
