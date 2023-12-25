import { Component } from '@angular/core';

@Component({
  selector: 'app-context-menu-example1',
  templateUrl: './context-menu-example1.component.html',
  styleUrls: ['./context-menu-example1.component.scss']
})
export class ContextMenuExample1Component {
  counter = 0;

  increase = () => {
    console.log('increase');
    this.counter = this.counter + 1;
    return true;
  };
}
