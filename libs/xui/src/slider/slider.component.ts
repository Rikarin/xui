import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Self,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { XuiTooltipComponent } from '../tooltip/tooltip.component';
import { inNextTick, InputBoolean, InputNumber } from '../utils';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Point } from '@angular/cdk/drag-drop';

@Component({
  selector: 'xui-slider',
  exportAs: 'xuiSlider',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'slider.component.html',
  host: {
    '(click)': 'move($event.x)'
  }
})
export class XuiSliderComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnChanges {
  _posX = new BehaviorSubject<number>(0);
  _value?: number;
  touched = false;
  onChange = (source?: number) => {};
  onTouched = () => {};

  position$ = this._posX.pipe(map(x => ({ x, y: 0 })));

  @ViewChild('track', { static: true }) trackElm!: ElementRef;
  @ViewChild('tooltipRef') tooltipRef!: XuiTooltipComponent;

  // TODO: default and focus
  // @Input() @InputBoolean() disabled: boolean = false;
  @Input() @InputBoolean() tooltipDisabled: boolean = false;
  @Input() color: 'primary' | 'primary-alt' | 'secondary' | 'error' | 'warning' | 'success' | string = 'primary';
  @Input() secondColor?: 'primary' | 'primary-alt' | 'secondary' | 'error' | 'success' | string;
  // @Input() size: 'normal' | 'small' = 'normal';

  @Input() @InputNumber() min: number = 0;
  @Input() @InputNumber() max: number = 100;
  @Input() @InputNumber() step: number = 1;
  @Input() tipFormatter?: (value: number) => string;
  @Input() marks?: SliderMark[];
  @Input() @InputBoolean() range: boolean = false;

  @Input()
  get value() {
    return this._value ?? this.min;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;

      this.onChange(v);
      this.changeDetectorRef.markForCheck();
    }
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
    return `xui-slider-color-${color}`;
  }

  getPercentage(absolute: number) {
    return ((absolute - this.min) / (this.max - this.min)) * 100;
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, @Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges!.subscribe(() => {
      this.setPositionByPercentage(this.percentage);
      this.changeDetectorRef.markForCheck();
    });
  }

  async ngAfterViewInit() {
    await inNextTick();
    this.setPositionByPercentage(this.percentage);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('cha', changes);
    if (changes['value']) {
      this.setPositionByPercentage(this.percentage);
    }
  }

  writeValue(source: number) {
    this.value = source;
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  async move(screenX: number) {
    const cursorOffset = 5;
    const rect = this.hostRect;
    const width = rect.width - 10;

    const pos = Math.min(Math.max(screenX - rect.x - cursorOffset, 0), width);
    const value = (pos / width) * (this.max - this.min); // 0 <-> max - min
    const newValue = Math.round(value / this.step) * this.step;

    this.value = newValue + this.min;
    this.setPositionByPercentage(this.percentage);
    await inNextTick();

    this.tooltipRef.show(0);
  }

  private get hostRect() {
    return this.trackElm.nativeElement.getBoundingClientRect() as DOMRect;
  }

  private setPositionByPercentage(value: number) {
    this._posX.next((value / 100) * this.hostRect.width - 5);
    this.changeDetectorRef.markForCheck();
  }
}

export interface SliderMark {
  label: string;
  value: number;
  color?: string; // TODO
}