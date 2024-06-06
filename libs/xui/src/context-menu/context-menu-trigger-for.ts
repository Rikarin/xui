import { Directive, ElementRef, input } from '@angular/core';
import { XuiContextMenu } from './context-menu';

@Directive({
  selector: '[xuiContextMenuTriggerFor]',
  exportAs: 'xuiContextMenuTriggerFor',
  host: {
    '(contextmenu)': '_click($event)'
  }
})
export class XuiContextMenuTriggerFor {
  menu = input.required<XuiContextMenu>({ alias: 'xuiContextMenuTriggerFor' });

  constructor(private elementRef: ElementRef) {}

  _click(event: MouseEvent) {
    this.menu().open(this.elementRef);
    event.preventDefault();
  }
}
