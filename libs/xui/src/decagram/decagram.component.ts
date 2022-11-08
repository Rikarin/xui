import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'xui-decagram',
  exportAs: 'xuiDecagram',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <xui-icon>{{ this.type }}</xui-icon>
    <xui-icon class="xui-decagram-icon"><ng-content></ng-content></xui-icon>
  `,
  host: {
    '[class]': 'style'
  }
})
export class XuiDecagramComponent {
  @Input() type: 'decagram' | 'circle' = 'decagram';
  @Input() color: 'primary' | 'primary-alt' | 'secondary' | 'error' | 'success' | 'minimal' | string = 'primary';

  get style() {
    return `xui-decagram-color-${this.color}`;
  }
}
