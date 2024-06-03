import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { XuiPopover } from './popover';

@Directive({
  selector: '[xuiPopoverTriggerFor]',
  exportAs: 'xuiPopoverTriggerFor'
})
export class XuiPopoverTriggerFor {
  @Input('xuiPopoverTriggerFor') popover!: XuiPopover;

  constructor(private elementRef: ElementRef) {}

  @HostListener('click')
  private _click() {
    this.popover.open(this.elementRef);
  }
}
