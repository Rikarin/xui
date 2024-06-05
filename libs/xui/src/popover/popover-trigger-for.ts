import { Directive, ElementRef, input } from '@angular/core';
import { XuiPopover } from './popover';

@Directive({
  selector: '[xuiPopoverTriggerFor]',
  exportAs: 'xuiPopoverTriggerFor',
  host: {
    '(click)': '_click()'
  }
})
export class XuiPopoverTriggerFor {
  popover = input.required<XuiPopover>({ alias: 'xuiPopoverTriggerFor' });

  constructor(private elementRef: ElementRef) {}

  _click() {
    this.popover().open(this.elementRef);
  }
}
