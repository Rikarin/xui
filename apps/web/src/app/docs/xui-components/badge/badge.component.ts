import { Component } from '@angular/core';
import { FileType } from '../../components/example/example.component';

@Component({
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
