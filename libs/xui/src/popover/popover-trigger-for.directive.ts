import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { XuiPopoverComponent } from './popover.component';

@Directive({
  selector: '[xuiPopoverTriggerFor]'
})
export class PopoverTriggerForDirective {
  @Input('xuiPopoverTriggerFor') popover!: XuiPopoverComponent;

  constructor(private elementRef: ElementRef) {}

  @HostListener('click')
  private _click() {
    this.popover.open(this.elementRef);
  }
}
