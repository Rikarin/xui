import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example, FileType } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { LayoutExample1Component } from '../../../../examples/layout-example1/layout-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, LayoutExample1Component],
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  readonly example1 = {
    'layout-example1': FileType.Component
  };
}
