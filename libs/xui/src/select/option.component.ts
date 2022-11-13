import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectService } from './select.service';
import { InputBoolean } from '../utils';
import { XuiSelectComponent } from './select.component';

@Component({
  selector: 'xui-option',
  exportAs: 'xuiOption',
  styleUrls: ['option.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles">
    <span #content><ng-content></ng-content></span>
    <xui-decagram *ngIf="isSelected" type="circle">check</xui-decagram>
  </div>`
})
export class XuiOptionComponent implements OnInit, OnDestroy {
  isSelected = false;

  @Input() value!: string;
  @Input() @InputBoolean() disabled: boolean = false;

  @ViewChild('content') contentRef!: ElementRef;

  get styles() {
    const ret: any = {
      option: true,
      'option-selected': this.isSelected,
      'option-disabled': this.disabled
    };

    ret[`option-${this.selectComponent.color}`] = true;
    return ret;
  }

  get viewValue(): string {
    return (this.contentRef.nativeElement.textContent || '').trim();
  }

  constructor(
    private selectComponent: XuiSelectComponent,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private translation: TranslateService,
    private selectService: SelectService
  ) {}

  ngOnInit() {
    this.selectService.addOption(this);
  }

  ngOnDestroy() {
    this.selectService.removeOption(this);
  }

  @HostListener('click')
  click() {
    if (!this.disabled) {
      this.selectService.select(this.value);
    }
  }

  select(value: boolean) {
    this.isSelected = value;
    this.changeDetectorRef.markForCheck();
  }
}
