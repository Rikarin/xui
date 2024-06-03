import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { XuiContextMenu } from './context-menu';

@Directive({
  selector: '[xuiMenuTriggerFor]',
  exportAs: 'xuiMenuTriggerFor'
})
export class XuiMenuTriggerFor {
  @Input('xuiMenuTriggerFor') menu!: XuiContextMenu;

  constructor(private elementRef: ElementRef) {}

  @HostListener('click')
  private _click() {
    this.menu.open(this.elementRef);
  }
}
