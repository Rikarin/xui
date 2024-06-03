import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { XuiContextMenu } from './context-menu';

@Directive({
  selector: '[xuiContextMenuTriggerFor]',
  exportAs: 'xuiContextMenuTriggerFor'
})
export class XuiContextMenuTriggerFor {
  @Input('xuiContextMenuTriggerFor') menu!: XuiContextMenu;

  constructor(private elementRef: ElementRef) {}

  @HostListener('contextmenu', ['$event'])
  private _click(event: MouseEvent) {
    this.menu.open(this.elementRef);
    event.preventDefault();
  }
}
