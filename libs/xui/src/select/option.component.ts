import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span #content><ng-content></ng-content></span>
    <xui-decagram *ngIf="isSelected" type="circle">check</xui-decagram> `,
  host: {
    '[class]': 'styles',
    '(click)': 'click()'
  }
})
export class XuiOptionComponent implements OnInit, OnDestroy {
  isSelected = false;

  @Input() value!: string;
  @Input() @InputBoolean() disabled: boolean = false;

  @ViewChild('content') contentRef!: ElementRef;

  get styles() {
    return `${this.isSelected ? 'xui-option-selected' : ''} ${this.disabled ? 'xui-option-disabled' : ''}
      xui-option-${this.selectComponent.color}`;
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
