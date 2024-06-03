import { Component } from '@angular/core';
import { Usage, Usages } from '../../components/usage';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { DividerExample1Component } from '../../../../examples/divider-example1/divider-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, DividerExample1Component],
  selector: 'app-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss']
})
export class DividerComponent {
  readonly example1 = {
    'divider-example1': FileType.Component
  };

  readonly usage: Usage[] = [
    {
      param: '[marginTop]',
      description: 'Top margin',
      type: 'number | undefined'
    },
    {
      param: '[marginBottom]',
      description: 'Bottom margin',
      type: 'number | undefined'
    }
  ];
}
