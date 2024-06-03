import { Component } from '@angular/core';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { CardExample1Component } from '../../../../examples/card-example1/card-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, CardExample1Component],
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  readonly example1 = {
    'card-example1': FileType.Component
  };
}
