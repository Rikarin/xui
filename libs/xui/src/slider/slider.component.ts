import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Self,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { inNextTick, InputBoolean, InputNumber } from '../utils';
import { BehaviorSubject, map } from 'rxjs';
import { SliderColor, SliderMark } from './slider.types';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';
import { TooltipDirective, XuiTooltipModule } from '../tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, XuiTooltipModule, DragDropModule],
  selector: 'xui-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'slider.component.html'
})
export class XuiSliderComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnChanges {
  static ngAcceptInputType_value: NumberInput;
  static ngAcceptInputType_range: BooleanInput;
  static ngAcceptInputType_tooltipDisabled: BooleanInput;

  private onChange?: (source: number) => void;
  private onTouched?: () => void;

  private _posX = new BehaviorSubject<number>(0);
  private _value: number | null = null;

  position$ = this._posX.pipe(map(x => ({ x, y: 0 })));

  @ViewChild('track', { static: true }) trackElm!: ElementRef;
  @ViewChild('tooltipRef') tooltipRef!: TooltipDirective;

  @Input() @InputBoolean() disabled = false;
  @Input() @InputBoolean() tooltipDisabled = false;
  @Input() color: SliderColor = 'primary';
  @Input() secondColor?: SliderColor;

  @Input() @InputNumber() min = 0;
  @Input() @InputNumber() max = 100;
  @Input() @InputNumber() step = 1;
  @Input() tipFormatter?: (value: number) => string;
  @Input() marks?: SliderMark[];
  @Input() @InputBoolean() range = false;

  @Input()
  @InputNumber()
  get value() {
    return this._value ?? this.min;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;

      this.onChange?.(v);
    }
  }

  @HostBinding('class.x-slider')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-slider-disabled')
  get hostDisabledClass(): boolean {
    return this.disabled;
  }

  private get percentage() {
    return this.getPercentage(this.value);
  }

  get width() {
    return 100 - this.percentage;
  }

  get tooltip() {
    return String(this.tipFormatter ? this.tipFormatter(this.value) : this.value);
  }

  getColor(color: string) {
    return `x-slider-${color}`;
  }

  getPercentage(absolute: number) {
    return ((absolute - this.min) / (this.max - this.min)) * 100;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => {
      this.setPositionByPercentage(this.percentage);
      this.cdr.markForCheck();
    });
  }

  async ngAfterViewInit() {
    await inNextTick();
    this.setPositionByPercentage(this.percentage);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.setPositionByPercentage(this.percentage);
    }
  }

  writeValue(source: number) {
    this.value = source;
  }

  registerOnChange(onChange: (source: number) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @HostListener('focusout')
  private _focusOut() {
    this.onTouched?.();
  }

  @HostListener('keydown.arrowLeft')
  private _decreaseKey() {
    this.value = Math.min(Math.max(this.value - this.step, this.min), this.max);
    this.setPositionByPercentage(this.percentage);
  }

  @HostListener('keydown.arrowRight')
  private _increaseKey() {
    this.value = Math.min(Math.max(this.value + this.step, this.min), this.max);
    this.setPositionByPercentage(this.percentage);
  }

  @HostListener('click', ['$event.x'])
  async move(screenX: number) {
    if (this.disabled) {
      return;
    }

    const cursorOffset = 5;
    const rect = this.hostRect;
    const width = rect.width - 10;

    const pos = Math.min(Math.max(screenX - rect.x - cursorOffset, 0), width);
    const value = (pos / width) * (this.max - this.min); // 0 <-> max - min
    const newValue = Math.round(value / this.step) * this.step;

    this.value = newValue + this.min;
    this.setPositionByPercentage(this.percentage);
    await inNextTick();

    this.tooltipRef.show();
  }

  private get hostRect() {
    return this.trackElm.nativeElement.getBoundingClientRect() as DOMRect;
  }

  private setPositionByPercentage(value: number) {
    this._posX.next((value / 100) * this.hostRect.width - 5);
    this.cdr.markForCheck();
  }
}
