import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Host,
  HostBinding,
  HostListener,
  Input,
  Optional,
  Output
} from '@angular/core';
import { BUTTON_MODULE, WithConfig, XuiConfigService } from '../config';
import { delay, InputBoolean, InputNumber } from '../utils';
import { ButtonColor, ButtonSize, ButtonType } from './button.types';
import { ButtonGroupComponent } from './button-group.component';

@Component({
  selector: 'xui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="x-button-content">
      <ng-content></ng-content>
    </div>
    <div class="x-button-state-image"></div>
    <div class="x-button-shine" *ngIf="shine && !disabled">
      <div class="x-button-shine-inner">
        <div class="x-button-shine-element"></div>
      </div>
    </div>`
})
export class ButtonComponent {
  static ngAcceptInputType_shine: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
  private readonly _moduleName = BUTTON_MODULE;

  state: 0 | 1 | 2 | 3 = 0;

  @Input() type?: ButtonType;
  @Input() size?: ButtonSize;
  @Input() color?: ButtonColor;
  @Input() @InputBoolean() shine = false;
  @Input() @InputBoolean() disabled = false;
  @Input() onClick?: () => Promise<boolean>;
  @Input() @InputNumber() @WithConfig() stateDelay = 5000;

  // Used to emit event when user interacts with button with spacebar or enter
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly click = new EventEmitter<unknown>();

  @HostBinding('class.x-button')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-button--non-idle')
  get hostNonIdleClass(): boolean {
    return this.state != 0;
  }

  @HostBinding('class.x-button--loading')
  get hostLoadingClass(): boolean {
    return this.state == 1;
  }

  @HostBinding('class.x-button--succeeded')
  get hostSucceededClass(): boolean {
    return this.state == 2;
  }

  @HostBinding('class.x-button--failed')
  get hostFailedClass(): boolean {
    return this.state == 3;
  }

  @HostBinding('class')
  get hostClass(): string {
    const config = this.configService.getConfigForComponent(BUTTON_MODULE);

    return (
      `x-button-${this.size ?? this.group?.size ?? config?.size ?? 'medium'} ` +
      `x-button-${this.type ?? this.group?.type ?? config?.type ?? 'normal'} ` +
      `x-button-${this.color ?? this.group?.color ?? config?.color ?? 'primary'}`
    );
  }

  @HostBinding('tabindex')
  get hostTabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  @HostBinding('attr.disabled')
  get hostAttributeDisabled(): boolean | null {
    return this.disabled || null;
  }

  constructor(
    // TODO: Anchor for popover; consider removing it and refactoring
    public elementRef: ElementRef,
    private configService: XuiConfigService,
    @Optional() @Host() private group: ButtonGroupComponent,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  async keyboardInteraction(event?: MouseEvent | KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    this.click.emit(event);
    await this._onAsync(event);
  }

  @HostListener('click', ['$event'])
  async _onAsync(event?: MouseEvent | KeyboardEvent | Event) {
    if (this.disabled) {
      return;
    }

    // Do not prevent events when button is disabled
    event?.preventDefault();
    event?.stopPropagation();

    if (!this.onClick) {
      return;
    }

    this.state = 1;
    this.cdr.markForCheck();

    try {
      this.state = (await this.onClick()) ? 2 : 3;
    } catch {
      this.state = 2;
    }

    this.cdr.markForCheck();
    await delay(5000);
    this.state = 0;
    this.cdr.markForCheck();
  }
}
