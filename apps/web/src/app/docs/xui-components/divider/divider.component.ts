import { Component } from '@angular/core';
import { Usage } from '../../components/usage';
import { FileType } from '../../components/example/example.component';

@Component({
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
