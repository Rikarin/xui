import { Component } from '@angular/core';
import { FileType } from '../../components/example/example.component';
import { Usage } from '../../components/usage';

@Component({
  selector: 'app-decagram',
  templateUrl: './decagram.component.html',
  styleUrls: ['./decagram.component.scss']
})
export class DecagramComponent {
  readonly example1 = {
    'decagram-example1': FileType.Component
  };

  readonly usage: Usage[] = [
    {
      param: '[iconSize]',
      description: 'Size of a inner icon',
      type: 'number',
      default: '65'
    },
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
}
