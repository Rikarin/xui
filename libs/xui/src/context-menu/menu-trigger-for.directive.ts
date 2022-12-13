import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { XuiContextMenuComponent } from './context-menu.component';

@Directive({
  selector: '[xuiMenuTriggerFor]'
})
export class MenuTriggerForDirective {
  @Input('xuiMenuTriggerFor') menu!: XuiContextMenuComponent;

  constructor(private elementRef: ElementRef) {}

  @HostListener('click')
  private _click() {
    this.menu.open(this.elementRef);
  }
}
