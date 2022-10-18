import { Component, Input, ViewEncapsulation } from '@angular/core';
import { WithConfig } from '../config/config.service';
import { InputBoolean } from '../util/convert';
import { delay } from '../util/delay';

@Component({
  selector: 'button[xui]',
  exportAs: 'xuiButton',
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
export class XuiButtonComponent {
  state: 0 | 1 | 2 | 3 = 0;

  @Input() xType: 'normal' | 'dashed' | 'stroked' | 'raised' | 'fab' | 'icon' | string = 'normal';
  @Input() xSize: 'sm' | 'md' | 'lg' | string = 'md';
  @Input() xColor: 'primary' | 'primary-alt' | 'secondary' | 'destructive' | 'neutral' | 'minimal' | string = 'minimal';

  @Input() @InputBoolean() disabled = false;
  @Input() xClick: () => Promise<boolean>;
  @Input() @WithConfig() xStateDelay = 5000;

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
