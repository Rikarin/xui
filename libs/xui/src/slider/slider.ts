import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  Input,
  Optional,
  Self,
  signal,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { convertToBoolean, inNextTick } from '../utils';
import { SliderColor, SliderMark } from './slider.types';
import { CommonModule } from '@angular/common';
import { XuiTooltip, XuiTooltipModule } from '../tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, XuiTooltipModule, DragDropModule],
  selector: 'xui-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'slider.html',
  host: {
    class: 'x-slider',
    '[class.x-slider-disabled]': '_disabled()',
    '(click)': '_move($event.x)',
    '(focusout)': '_onTouched?.()',
    '(keydown.arrowLeft)': '_decreaseKey()',
    '(keydown.arrowRight)': '_increaseKey()'
  }
})
export class XuiSlider implements ControlValueAccessor {
  private onChange?: (source: number) => void;
  _onTouched?: () => void;
  _disabled = signal(false);

  @Input() tipFormatter?: (value: number) => string;
  color = input<SliderColor>('primary');
  secondColor = input<SliderColor>();
  min = input(0, { transform: (v: string | number) => Number(v) });
  max = input(100, { transform: (v: string | number) => Number(v) });
  step = input(1, { transform: (v: string | number) => Number(v) });
  marks = input<SliderMark[]>();
  value = input<number | undefined, string | number>(undefined, { transform: (v: string | number) => Number(v) });
  // range = input(false, { transform: (v: string | boolean) => convertToBoolean(v) });
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: (v: string | boolean) => convertToBoolean(v)
  });
  tooltipDisabled = input(false, { transform: (v: string | boolean) => convertToBoolean(v) });

  @ViewChild('track', { static: true }) private trackElm!: ElementRef;
  @ViewChild('tooltipRef') private tooltipRef!: XuiTooltip;

  _value = signal(this.min());
  _tooltip = computed(() => String(this.tipFormatter ? this.tipFormatter(this._value()) : this._value()));
  private percentage = computed(() => this._getPercentage(this._value()));
  _width = computed(() => 100 - this.percentage());
  _position = computed(() => ({ x: (this.percentage() / 100) * this.hostRect.width - 5, y: 0 }));

  _getColor(color: string) {
    return `x-slider-${color}`;
  }

  _getPercentage(absolute: number) {
    return ((absolute - this.min()) / (this.max() - this.min())) * 100;
  }

  constructor(@Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this.disabled() && this._disabled.set(this.disabled()!), { allowSignalWrites: true });
    effect(() => this.value() && this._value.set(this.value()!), { allowSignalWrites: true });
    effect(() => this.onChange?.(this._value()));
  }

  writeValue(source: number) {
    this._value.set(source);
  }

  registerOnChange(onChange: (source: number) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this._onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  _decreaseKey() {
    this._value.set(Math.min(Math.max(this._value() - this.step(), this.min()), this.max()));
  }

  _increaseKey() {
    this._value.set(Math.min(Math.max(this._value() + this.step(), this.min()), this.max()));
  }

  async _move(screenX: number) {
    if (this._disabled()) {
      return;
    }

    const cursorOffset = 5;
    const rect = this.hostRect;
    const width = rect.width - 10;

    const pos = Math.min(Math.max(screenX - rect.x - cursorOffset, 0), width);
    const value = (pos / width) * (this.max() - this.min()); // 0 <-> max - min
    const newValue = Math.round(value / this.step()) * this.step();
    this._value.set(newValue + this.min());

    await inNextTick();
    this.tooltipRef.show();
  }

  private get hostRect() {
    return this.trackElm.nativeElement.getBoundingClientRect() as DOMRect;
  }
}
