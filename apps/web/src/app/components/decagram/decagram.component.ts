import { Component } from '@angular/core';
import { FileType } from '../example/example.component';

@Component({
  selector: 'app-decagram',
  templateUrl: './decagram.component.html',
  styleUrls: ['./decagram.component.scss']
})
export class DecagramComponent {
  readonly example1 = {
    'decagram-example1': FileType.Component
  };
}
