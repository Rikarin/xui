import { Component, Input, ViewEncapsulation } from '@angular/core';
import { WithConfig } from '../config/config.service';
import { InputBoolean } from '../util/convert';
import { delay } from '../util/delay';

@Component({
  selector: 'xui-option-group',
  exportAs: 'xuiOptionGroup',
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>
    <div class="xui-button-state-image"></div>`,
  host: {
    '[class]': 'getStyle()',
    '[class.xui-button-state--loading]': 'state == 1',
    '[class.xui-button-state--failed]': 'state === 3',
    '[class.xui-button-state--succeeded]': 'state == 2',
    '[attr.disabled]': 'disabled || null',
    '(click)': '_onAsync()'
  }
})
export class XuiOptionGroupComponent {
  @Input() label: string | number;

  private getStyle() {
    return `xui-button xui-button-${this.xSize} xui-button-${this.xType} xui-button-${this.xColor}`;
  }

  async _onAsync() {
    if (!this.xClick) {
      return;
    }

    this.state = 1;

    try {
      this.state = (await this.xClick()) ? 2 : 3;
    } catch {
      this.state = 2;
    }

    await delay(5000);
    this.state = 0;
  }
}
