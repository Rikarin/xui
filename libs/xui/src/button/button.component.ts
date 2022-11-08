import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { WithConfig } from '../config';
import { delay, InputBoolean } from '../utils';

@Component({
  selector: 'button[xui]',
  exportAs: 'xuiButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>
    <div class="xui-button-state-image"></div>
    <div class="xui-button-shine" *ngIf="xShine && !disabled">
      <div class="xui-button-shine-inner">
        <div class="xui-button-shine-element"></div>
      </div>
    </div> `,
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
  @Input() xColor: 'primary' | 'primary-alt' | 'secondary' | 'error' | 'success' | 'minimal' | string = 'primary';

  @Input() @InputBoolean() xShine = false;
  @Input() @InputBoolean() disabled = false;
  @Input() xClick?: () => Promise<boolean>;
  @Input() @WithConfig() xStateDelay = 5000;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  getStyle() {
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

    this.changeDetectorRef.markForCheck();
    await delay(5000);
    this.state = 0;
    this.changeDetectorRef.markForCheck();
  }
}
