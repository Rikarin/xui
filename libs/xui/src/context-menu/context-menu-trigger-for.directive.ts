import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { XuiContextMenuComponent } from './context-menu.component';

@Directive({
  selector: '[xuiContextMenuTriggerFor]'
})
export class ContextMenuTriggerForDirective {
  @Input('xuiContextMenuTriggerFor') menu!: XuiContextMenuComponent;

  constructor(private elementRef: ElementRef) {}

  @HostListener('contextmenu', ['$event'])
  private _click(event: MouseEvent) {
    this.menu.open(this.elementRef);
    event.preventDefault();
  }
}
