import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example, FileType } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { TabsExample1Component } from '../../../../examples/tabs-example1/tabs-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, TabsExample1Component],
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent {
  readonly example1 = {
    'tabs-example1': FileType.Component
  };
}
