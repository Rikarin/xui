import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ContextMenuComponent } from './context-menu.component';

@Directive({
  selector: '[xuiMenuTriggerFor]',
  exportAs: 'xuiMenuTriggerFor'
})
export class MenuTriggerForDirective {
  @Input('xuiMenuTriggerFor') menu!: ContextMenuComponent;

  constructor(private elementRef: ElementRef) {}

  @HostListener('click')
  private _click() {
    this.menu.open(this.elementRef);
  }
}
