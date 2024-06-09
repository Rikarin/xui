import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example, FileType } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { StatusExample1Component } from '../../../../examples/status-example1/status-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, StatusExample1Component],
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent {
  readonly example1 = {
    'status-example1': FileType.Component
  };
}
