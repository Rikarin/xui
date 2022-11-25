import { Component } from '@angular/core';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent {
  counter = 0;

  increase = () => {
    console.log('increase');
    this.counter = this.counter + 1;
    return true;
  };
}
