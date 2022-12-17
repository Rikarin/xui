import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { PopoverComponent } from './popover.component';

@Directive({
  selector: '[xuiPopoverTriggerFor]',
  exportAs: 'xuiPopoverTriggerFor'
})
export class PopoverTriggerForDirective {
  @Input('xuiPopoverTriggerFor') popover!: PopoverComponent;

  constructor(private elementRef: ElementRef) {}

  @HostListener('click')
  private _click() {
    this.popover.open(this.elementRef);
  }
}
