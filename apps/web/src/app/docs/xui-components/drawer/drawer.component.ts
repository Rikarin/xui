import { Component } from '@angular/core';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { DrawerExample1Component } from '../../../../examples/drawer-example1/drawer-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, DrawerExample1Component],
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent {
  readonly example1 = {
    'drawer-example1': FileType.Component
  };
}
