import { Component, Input, ViewEncapsulation } from '@angular/core';
import { InputBoolean } from '../util/convert';
import { delay } from '../util/delay';

@Component({
  selector: 'button[xui-button]',
  exportAs: 'xuiButton',
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div *ngIf="state === 1">Loading...</div>
    <div *ngIf="state === 2">Succeeded</div>
    <div *ngIf="state === 3">Failed</div>
    <ng-content *ngIf="state === 0"></ng-content> `,
  host: {
    '[class]': 'getStyle()',
    '[class.xui-button-state--loading]': 'state == 1',
    '[class.xui-button-state--failed]': 'state === 3',
    '[class.xui-button-state--succeeded]': 'state == 2',
    '[attr.disabled]': 'disabled || null',
    '(click)': '_onAsync()',
  },
})
export class XuiButtonComponent {
  state: 0 | 1 | 2 | 3 = 0;

  @Input() xType: 'normal' | 'dashed' | 'stroked' | 'raised' | 'fab' | 'icon' =
    'normal';
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
  @Input() async: () => Promise<boolean>;

  // TODO: input config for how long show success/failed state; default 5 sec

  private getStyle() {
    return `xui-button xui-button-${this.xSize} xui-button-${this.xType} xui-button-${this.xColor}`;
  }

  async _onAsync() {
    if (!this.async) {
      return;
    }

    this.state = 1;

    try {
      this.state = (await this.async()) ? 2 : 3;
    } catch {
      this.state = 2;
    }

    await delay(5000);
    this.state = 0;
  }
}
