import { Component } from '@angular/core';
import { Example, FileType } from '../../components/example';
import { Usage, Usages } from '../../components/usage';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { DecagramExample1Component } from '../../../../examples/decagram-example1/decagram-example1.component';
import { DecagramExample2Component } from '../../../../examples/decagram-example2/decagram-example2.component';

@Component({
  standalone: true,
  imports: [Information, Example, Usages, HighlightModule, DecagramExample1Component, DecagramExample2Component],
  selector: 'app-decagram',
  templateUrl: './decagram.component.html',
  styleUrls: ['./decagram.component.scss']
})
export class DecagramComponent {
  readonly example1 = {
    'decagram-example1': FileType.Component
  };

  readonly example2 = {
    'decagram-example2': FileType.Component
  };

  readonly usage: Usage[] = [
    {
      param: 'iconSize',
      description: 'Size of the inner icon.',
      type: 'number',
      default: '65'
    },
    {
      param: 'type',
      description: 'Type of the decagram.',
      type: '"decagram" | "circle" | "shield"',
      default: '"decagram"'
    },
    {
      param: 'color',
      description: 'Color of the decagram.',
      type: '"primary" | "primary-alt" | "secondary" | "success" | "warning" | "error" | "info"',
      default: '"primary"'
    }
  ];
}
