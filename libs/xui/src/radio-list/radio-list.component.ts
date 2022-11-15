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
import { RadioListColor, RadioListSize } from './radio-list.types';
import { filter } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'xui-radio-list',
  exportAs: 'xuiRadioList',
  styleUrls: ['radio-list.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="radio-list" tabindex="0"><ng-content></ng-content></div>',
  providers: [RadioListService]
})
export class XuiRadioListComponent implements ControlValueAccessor, OnInit {
  private onChange?: (source?: string | null) => void;
  private onTouched?: () => void;

  _mouseDown = false;
  _value: string | null = null;
  touched = false;

  @Input() size: RadioListSize = 'md';
  @Input() color: RadioListColor = 'light';

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange?.(v);
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
    this.control?.statusChanges?.subscribe(() => this.changeDetectorRef.markForCheck());
    this.radioListService.selected$
      .pipe(
        distinctUntilChanged(),
        filter(x => x !== undefined),
        untilDestroyed(this)
      )
      .subscribe(option => (this.value = option?.value ?? null));
  }

  writeValue(source: string | null) {
    this.value = source;
  }

  registerOnChange(onChange: (source?: string | null) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched?.();
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

  @HostListener('mousedown')
  private mouseDown() {
    this._mouseDown = true;
  }

  @HostListener('mouseup')
  private mouseUp() {
    this._mouseDown = false;
  }

  @HostListener('focusin')
  private focus() {
    if (!this._mouseDown) {
      this.radioListService.focusCurrent();
    }
  }

  @HostListener('focusout')
  private focusout() {
    this.radioListService.clearAllFocus();
  }
}
