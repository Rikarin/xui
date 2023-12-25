import { Component } from '@angular/core';
import { FileType } from '../../components/example/example.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  readonly example1 = {
    'card-example1': FileType.Component
  };
}
