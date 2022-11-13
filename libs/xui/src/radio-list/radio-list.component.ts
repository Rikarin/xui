import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  Optional,
  Self,
  ViewEncapsulation
} from '@angular/core';
import { RadioListService } from './radio-list.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InputGroupService } from '../input/input-group.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'xui-radio-list',
  exportAs: 'xuiRadioList',
  styleUrls: ['radio-list.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="radio-list" tabindex="0"><ng-content></ng-content></div>',
  providers: [RadioListService]
})
export class XuiRadioListComponent implements ControlValueAccessor, OnInit {
  _value: string | null = null;
  touched = false;
  onChange = (source?: string | null) => {};
  onTouched = () => {};

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange(v);
      this.radioListService.select(v!);
      this.changeDetectorRef.markForCheck();
    }
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translation: TranslateService,
    private radioListService: RadioListService,
    @Optional() private groupService: InputGroupService,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges!.subscribe(() => this.changeDetectorRef.markForCheck());
    this.radioListService.selected$
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe(option => (this.value = option?.value ?? null));
  }

  writeValue(source: string | null) {
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

  @HostListener('keydown.arrowup')
  private prev() {
    this.radioListService.selectPrev();
  }

  @HostListener('keydown.arrowdown')
  private next() {
    this.radioListService.selectNext();
  }

  @HostListener('focus')
  private focus() {
    this.radioListService.focusCurrent();
  }

  @HostListener('focusout')
  private focusout() {
    this.radioListService.clearAllFocus();
  }
}
