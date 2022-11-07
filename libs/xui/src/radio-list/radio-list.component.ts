import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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

@UntilDestroy()
@Component({
  selector: 'xui-radio-list',
  exportAs: 'xuiRadioList',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
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
    this.radioListService.selected$.pipe(untilDestroyed(this)).subscribe(value => (this.value = value));
  }

  // get invalid(): boolean {
  //   return !!this.control?.invalid;
  // }

  // get showError(): boolean {
  //   if (!this.control) {
  //     return false;
  //   }
  //
  //   const { dirty, touched } = this.control;
  //   return this.invalid ? dirty! || touched! : false;
  // }

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
}
