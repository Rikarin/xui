import { Component } from '@angular/core';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { ContextMenuExample1Component } from '../../../../examples/context-menu-example1/context-menu-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, ContextMenuExample1Component],
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
  readonly example1 = {
    'context-menu-example1': FileType.Component
  };
}
