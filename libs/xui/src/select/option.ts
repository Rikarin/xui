import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';
import { XUI_SELECT_ACCESSOR, SelectAccessor, SelectValue } from './select.types';

@Component({
  selector: 'xui-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span #content><ng-content /></span> <xui-decagram *ngIf="isSelected" type="circle">check</xui-decagram>`
})
export class XuiOption implements OnInit, AfterViewInit {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() value: SelectValue = null;
  @Input() @InputBoolean() disabled = false;

  @ViewChild('content') contentRef!: ElementRef;

  @HostBinding('class.x-select-option')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-select-option-selected')
  get hostSelectedClass(): boolean {
    return this.isSelected;
  }

  @HostBinding('class.x-select-option-disabled')
  get hostDisabledClass(): boolean {
    return this.disabled;
  }

  @HostBinding('class')
  get hostClass(): string {
    return `x-select-option-${this.select.color}`;
  }

  get isSelected() {
    return this.select.value == this.value;
  }

  get viewValue(): string {
    return (this.contentRef.nativeElement.textContent || '').trim();
  }

  constructor(
    @Inject(XUI_SELECT_ACCESSOR) private select: SelectAccessor,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.select.onChange$.subscribe(() => this.cdr.markForCheck());
  }

  ngAfterViewInit() {
    if (this.isSelected) {
      this.select.viewValue = this.viewValue;
    }
  }

  @HostListener('click')
  click() {
    if (!this.disabled) {
      this.select.value = this.value;
      this.select.viewValue = this.viewValue;
      this.select.close();
    }
  }
}
