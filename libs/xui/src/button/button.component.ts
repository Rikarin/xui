import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { WithConfig } from '../config';
import { delay, InputBoolean, InputNumber } from '../utils';
import { ButtonColor, ButtonSize, ButtonType } from './button.types';

@Component({
  selector: 'xui-button',
  exportAs: 'xuiButton',
  styleUrls: ['button.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="styles" [attr.disabled]="disabled || null" part="button" tabindex="0" (click)="_onAsync()">
      <div class="content" part="content">
        <ng-content></ng-content>
      </div>
      <div class="state-image"></div>
      <div class="shine" *ngIf="shine && !disabled">
        <div class="inner">
          <div class="element"></div>
        </div>
      </div>
    </div>
  `
})
export class XuiButtonComponent {
  state: 0 | 1 | 2 | 3 = 0;

  @Input() type: ButtonType = 'normal';
  @Input() size: ButtonSize = 'md';
  @Input() color: ButtonColor = 'primary';
  @Input() @InputBoolean() shine = false;
  @Input() @InputBoolean() disabled = false;
  @Input() onClick?: () => Promise<boolean>;
  @Input() @InputNumber() @WithConfig() stateDelay = 5000;

  // @Output() readonly click = new EventEmitter<any>();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  get styles() {
    const ret: { [klass: string]: boolean } = {
      button: true,
      'state--loading': this.state == 1,
      'state--succeeded': this.state == 2,
      'state--failed': this.state === 3
    };

    ret[`size-${this.size}`] = true;
    ret[`type-${this.type}`] = true;
    ret[`color-${this.color}`] = true;

    return ret;
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  private _keyPress(event: KeyboardEvent) {
    event?.preventDefault();
    // this.click.emit();

    return this._onAsync();
  }

  async _onAsync() {
    if (!this.onClick) {
      return;
    }

    this.state = 1;

    try {
      this.state = (await this.onClick()) ? 2 : 3;
    } catch {
      this.state = 2;
    }

    this.changeDetectorRef.markForCheck();
    await delay(5000);
    this.state = 0;
    this.changeDetectorRef.markForCheck();
  }
}
