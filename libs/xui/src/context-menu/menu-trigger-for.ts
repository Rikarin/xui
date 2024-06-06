import { Directive, ElementRef, input } from '@angular/core';
import { XuiContextMenu } from './context-menu';

@Directive({
  selector: '[xuiMenuTriggerFor]',
  exportAs: 'xuiMenuTriggerFor',
  host: {
    '(click)': '_click($event)'
  }
})
export class XuiMenuTriggerFor {
  menu = input.required<XuiContextMenu>({ alias: 'xuiMenuTriggerFor' });

  constructor(private elementRef: ElementRef) {}

  _click() {
    this.menu().open(this.elementRef);
  }
}
