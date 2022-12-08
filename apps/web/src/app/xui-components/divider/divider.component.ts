import { Component } from '@angular/core';
import { Usage } from '../../components/usage';

@Component({
  selector: 'app-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss']
})
export class DividerComponent {
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
