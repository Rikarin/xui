import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { InputBoolean } from '../util/convert';

@Component({
  selector: 'button[xui-button]',
  exportAs: 'xuiButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  host: {
    '[class]': 'getStyle()',
    '[attr.disabled]': 'disabled || null',
  },
})
export class XuiButtonComponent implements OnInit {
  @Input() xType: 'normal' | 'dashed' | 'raised' | 'fab' | 'icon' = 'normal';
  @Input() xSize: 'sm' | 'md' | 'lg' = 'md';
  @Input() xColor:
    | 'primary'
    | 'primary-alt'
    | 'secondary'
    | 'destructive'
    | 'neutral'
    | 'minimal' = 'minimal';

  // Type > color & size

  @Input() @InputBoolean() disabled = false;

  private getStyle() {
    return `xui-button xui-button-${this.xSize} xui-button-${this.xType} xui-button-${this.xColor}`;
  }

  constructor() {}

  ngOnInit() {}
}
