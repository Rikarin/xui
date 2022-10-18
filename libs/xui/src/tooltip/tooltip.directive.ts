import { Component, Input } from '@angular/core';
import { XuiTooltipBaseComponent, XuiTooltipBaseDirective } from './base';

@Component({
  selector: '[xuiTooltip]',
  exportAs: 'xuiTooltip',
  template: '<ng-content></ng-content>',
  // templateUrl: './tooltip.component.html',
  // encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // '[style.position]': '"relative"',
    // '(mouseenter)': 'visible = true',
    // '(mouseleave)': 'visible = false'
    // 'class': 'xui-tooltip',
    //   '[class.xui-banner-dismissable]': 'dismissable',
    //   '(click)': 'dismiss()'
  }
})
export class XuiTooltipDirective extends XuiTooltipBaseDirective {
  @Input('xuiTooltip') title: string;

  componentType = XuiTooltipComponent;

  // visible = false;

  // constructor() {
  //   console.log('tooltip');
  // }
}

@Component({
  selector: 'xui-tooltip-component',
  template: '<ng-content></ng-content>',
  // exportAs: 'xuiTooltip',
  // templateUrl: './tooltip.component.html',
  // encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // '[style.position]': '"relative"',
    // '(mouseenter)': 'visible = true',
    // '(mouseleave)': 'visible = false'
    // 'class': 'xui-tooltip',
    //   '[class.xui-banner-dismissable]': 'dismissable',
    //   '(click)': 'dismiss()'
  }
})
export class XuiTooltipComponent extends XuiTooltipBaseComponent {}
