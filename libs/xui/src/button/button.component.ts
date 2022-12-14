import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Host,
  HostListener,
  Input,
  Optional,
  Output
} from '@angular/core';
import { BUTTON_MODULE, WithConfig, XuiConfigService } from '../config';
import { delay, InputBoolean, InputNumber } from '../utils';
import { ButtonColor, ButtonSize, ButtonType } from './button.types';
import { XuiButtonGroupComponent } from './button-group.component';

@Component({
  selector: 'xui-button',
  exportAs: 'xuiButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="styles"
      [attr.disabled]="disabled || null"
      [tabindex]="disabled ? -1 : 0"
      (click)="_onAsync($event)"
    >
      <div class="x-button-content">
        <ng-content></ng-content>
      </div>
      <div class="x-button-state-image"></div>
      <div class="x-button-shine" *ngIf="shine && !disabled">
        <div class="x-button-shine-inner">
          <div class="x-button-shine-element"></div>
        </div>
      </div>
    </div>
  `
})
export class XuiButtonComponent {
  private readonly _moduleName = BUTTON_MODULE;
  static ngAcceptInputType_shine: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;

  state: 0 | 1 | 2 | 3 = 0;

  @Input() type?: ButtonType;
  @Input() size?: ButtonSize;
  @Input() color?: ButtonColor;
  @Input() @InputBoolean() shine = false;
  @Input() @InputBoolean() disabled = false;
  @Input() onClick?: () => Promise<boolean>;
  @Input() @InputNumber() @WithConfig() stateDelay = 5000;

  // Used to emit event when user interacts with button with spacebar or enter
  @Output() readonly click = new EventEmitter<any>();

  constructor(
    public elementRef: ElementRef,
    private configService: XuiConfigService,
    @Optional() @Host() private group: XuiButtonGroupComponent,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  get styles() {
    const config = this.configService.getConfigForComponent(BUTTON_MODULE);
    const ret: { [klass: string]: boolean } = {
      'x-button': true,
      'x-button--non-idle': this.state != 0,
      'x-button--loading': this.state == 1,
      'x-button--succeeded': this.state == 2,
      'x-button--failed': this.state === 3
    };

    ret[`x-button-${this.size ?? this.group?.size ?? config?.size ?? 'medium'}`] = true;
    ret[`x-button-${this.type ?? this.group?.type ?? config?.type ?? 'normal'}`] = true;
    ret[`x-button-${this.color ?? this.group?.color ?? config?.color ?? 'primary'}`] = true;

    return ret;
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  async _onAsync(event?: MouseEvent | KeyboardEvent) {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.click.emit();

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
