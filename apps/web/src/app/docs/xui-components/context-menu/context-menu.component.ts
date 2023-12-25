import { Component } from '@angular/core';
import { FileType } from '../../components/example/example.component';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
  readonly example1 = {
    'context-menu-example1': FileType.Component
  };
}
