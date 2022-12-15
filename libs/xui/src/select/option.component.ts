import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { InputBoolean } from '../utils';
import { XuiSelectComponent } from './select.component';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-option',
  exportAs: 'xuiOption',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles">
    <span #content><ng-content></ng-content></span>
    <xui-decagram *ngIf="isSelected" type="circle">check</xui-decagram>
  </div>`
})
export class XuiOptionComponent implements OnInit, AfterViewInit {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() value: string | number | null = null;
  @Input() @InputBoolean() disabled = false;

  @ViewChild('content') contentRef!: ElementRef;

  get isSelected() {
    return this.selectComponent.value == this.value;
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-select-option': true,
      'x-select-option-selected': this.isSelected,
      'x-select-option-disabled': this.disabled
    };

    ret[`x-select-option-${this.selectComponent.color}`] = true;
    return ret;
  }

  get viewValue(): string {
    return (this.contentRef.nativeElement.textContent || '').trim();
  }

  constructor(private selectComponent: XuiSelectComponent, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.selectComponent.onChange$.subscribe(() => this.changeDetectorRef.markForCheck());
  }

  ngAfterViewInit() {
    if (this.isSelected) {
      this.selectComponent.viewValue = this.viewValue;
    }
  }

  @HostListener('click')
  click() {
    if (!this.disabled) {
      this.selectComponent.value = this.value;
      this.selectComponent.viewValue = this.viewValue;
      this.selectComponent.close();
    }
  }
}
