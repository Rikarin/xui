import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'xui-button-group',
  exportAs: 'xuiButtonGroup',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  host: {
    // '[class]': 'getStyle()',
    // '[attr.disabled]': 'disabled || null',
  },
})
export class XuiButtonGroupComponent {
  @Input() xSize: 'sm' | 'md' | 'lg' = 'md';

  // private getStyle() {
  //   return `xui-button xui-button-${this.xSize} xui-button-${this.xType} xui-button-${this.xColor}`;
  // }
}
