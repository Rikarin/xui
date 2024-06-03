import { Component, ElementRef, HostBinding, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [CommonModule, MatIconModule],
  selector: 'xui-icon',
  // changeDetection: ChangeDetectionStrategy.OnPush, not working with checkbox
  template: `<mat-icon [svgIcon]="icon"></mat-icon> <span style="display: none" #iconName><ng-content /></span>`
})
export class XuiIcon {
  @ViewChild('iconName', { static: true }) input!: ElementRef;

  @HostBinding('class.x-icon')
  get hostMainClass(): boolean {
    return true;
  }

  get icon() {
    return this.input.nativeElement.innerHTML;
  }
}
