import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ContextMenuComponent } from './context-menu.component';

@Directive({
  selector: '[xuiContextMenuTriggerFor]',
  exportAs: 'xuiContextMenuTriggerFor'
})
export class ContextMenuTriggerForDirective {
  @Input('xuiContextMenuTriggerFor') menu!: ContextMenuComponent;

  constructor(private elementRef: ElementRef) {}

  @HostListener('contextmenu', ['$event'])
  private _click(event: MouseEvent) {
    this.menu.open(this.elementRef);
    event.preventDefault();
  }
}
