import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';
import { SELECT_ACCESSOR, SelectAccessor, SelectValue } from './select.types';

@Component({
  selector: 'xui-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles">
    <span #content><ng-content></ng-content></span>
    <xui-decagram *ngIf="isSelected" type="circle">check</xui-decagram>
  </div>`
})
export class OptionComponent implements OnInit, AfterViewInit {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() value: SelectValue = null;
  @Input() @InputBoolean() disabled = false;

  @ViewChild('content') contentRef!: ElementRef;

  get isSelected() {
    return this.select.value == this.value;
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-select-option': true,
      'x-select-option-selected': this.isSelected,
      'x-select-option-disabled': this.disabled
    };

    ret[`x-select-option-${this.select.color}`] = true;
    return ret;
  }

  get viewValue(): string {
    return (this.contentRef.nativeElement.textContent || '').trim();
  }

  constructor(@Inject(SELECT_ACCESSOR) private select: SelectAccessor, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.select.onChange$.subscribe(() => this.changeDetectorRef.markForCheck());
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
