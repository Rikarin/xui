import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'xui-icon',
  exportAs: 'xuiIcon',
  styleUrls: ['icon.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  // changeDetection: ChangeDetectionStrategy.OnPush, not working with checkbox
  template: `<mat-icon [svgIcon]="icon"></mat-icon>
    <span style="display: none" #iconName><ng-content></ng-content></span>`
})
export class XuiIconComponent {
  @ViewChild('iconName', { static: true }) input!: ElementRef;

  get icon() {
    return this.input.nativeElement.innerHTML;
  }
}
