import { Component } from '@angular/core';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { BadgeExample1Component } from '../../../../examples/badge-example1/badge-example1.component';
import { BadgeExample2Component } from '../../../../examples/badge-example2/badge-example2.component';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, BadgeExample1Component, BadgeExample2Component],
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  readonly example1 = {
    'badge-example1': FileType.Component
  };

  readonly example2 = {
    'badge-example2': FileType.Component
  };
}
