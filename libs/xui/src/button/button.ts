import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  Host,
  input,
  Input,
  Optional,
  Output,
  signal
} from '@angular/core';
import { BUTTON_MODULE, XuiConfigService } from '../config';
import { delay } from '../utils';
import { ButtonColor, ButtonSize, ButtonType } from './button.types';
import { XuiButtonGroup } from './button-group';

@Component({
  selector: 'xui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="x-button-content">
      <ng-content />
    </div>
    <div class="x-button-state-image"></div>

    @if (shine() && !disabled()) {
      <div class="x-button-shine">
        <div class="x-button-shine-inner">
          <div class="x-button-shine-element"></div>
        </div>
      </div>
    }`,
  host: {
    class: 'x-button',
    '[class]': '_class()',
    '[class.x-button--non-idle]': '_state() != 0',
    '[class.x-button--loading]': '_state() == 1',
    '[class.x-button--succeeded]': '_state() == 2',
    '[class.x-button--failed]': '_state() == 3',
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.disabled]': 'disabled() || null',
    '(click)': '_onAsync($event)',
    '(keydown.enter)': '_keyboardInteraction($event)',
    '(keydown.space)': '_keyboardInteraction($event)'
  }
})
export class XuiButton {
  private readonly _moduleName = BUTTON_MODULE;
  _state = signal<0 | 1 | 2 | 3>(0);

  type = input<ButtonType>();
  size = input<ButtonSize>();
  color = input<ButtonColor>();
  shine = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  stateDelay = input<number>(5000);
  @Input() onClick?: () => Promise<boolean>;

  // Used to emit event when user interacts with button with spacebar or enter
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly click = new EventEmitter<unknown>();

  _class = computed(() => {
    const config = this.configService.getConfigForComponent(BUTTON_MODULE);
    return (
      `x-button-${this.size() ?? this.group?.size() ?? config?.size ?? 'medium'} ` +
      `x-button-${this.type() ?? this.group?.type() ?? config?.type ?? 'normal'} ` +
      `x-button-${this.color() ?? this.group?.color() ?? config?.color ?? 'primary'}`
    );
  });

  constructor(
    // TODO: Anchor for popover; consider removing it and refactoring
    public elementRef: ElementRef,
    private configService: XuiConfigService,
    @Optional() @Host() private group?: XuiButtonGroup
  ) {}

  async _keyboardInteraction(event?: MouseEvent | KeyboardEvent) {
    if (this.disabled()) {
      return;
    }

    this.click.emit(event);
    await this._onAsync(event);
  }

  async _onAsync(event?: MouseEvent | KeyboardEvent | Event) {
    if (this.disabled()) {
      return;
    }

    // Do not prevent events when button is disabled
    event?.preventDefault();
    event?.stopPropagation();

    if (!this.onClick) {
      return;
    }

    this._state.set(1);

    try {
      this._state.set((await this.onClick()) ? 2 : 3);
    } catch {
      this._state.set(2);
    }

    await delay(5000);
    this._state.set(0);
  }
}
