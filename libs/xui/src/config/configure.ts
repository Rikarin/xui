import { Directive, Input } from '@angular/core';
import { InputColor, InputSize } from '../input';
import { BUTTON_MODULE, CHECKBOX_MODULE, DATE_PICKER_MODULE, INPUT_MODULE } from './config';
import { ButtonColor, ButtonSize, ButtonType } from '../button';
import { XuiConfigService } from './config.service';
import { CheckboxColor } from '../checkbox';
import { DatePickerColor, DatePickerSize } from '../date-picker';

@Directive({
  selector: '[xuiConfigure]',
  providers: [XuiConfigService]
})
export class XuiConfigure {
  // Banner
  // @Input() set xuiBannerType(type: BannerType) {
  //   this.configService.set(BANNER_MODULE, { type });
  // }
  //
  // @Input() set xuiBannerDismissible(dismissible: boolean) {
  //   this.configService.set(BANNER_MODULE, { dismissible });
  // }

  // Button
  @Input() set xuiButtonType(type: ButtonType) {
    this.configService.set(BUTTON_MODULE, { type });
  }

  @Input() set xuiButtonColor(color: ButtonColor) {
    this.configService.set(BUTTON_MODULE, { color });
  }

  @Input() set xuiButtonSize(size: ButtonSize) {
    this.configService.set(BUTTON_MODULE, { size });
  }

  // Checkbox
  @Input() set xuiCheckboxColor(color: CheckboxColor) {
    this.configService.set(CHECKBOX_MODULE, { color });
  }

  @Input() set xuiCheckboxDisabled(disabled: boolean) {
    this.configService.set(CHECKBOX_MODULE, { disabled });
  }

  // Date Picker
  @Input() set xuiDatePickerColor(color: DatePickerColor) {
    this.configService.set(DATE_PICKER_MODULE, { color });
  }

  @Input() set xuiDatePickerSize(size: DatePickerSize) {
    this.configService.set(DATE_PICKER_MODULE, { size });
  }

  // TODO: implement these

  // Input
  @Input() set xuiInputColor(color: InputColor) {
    this.configService.set(INPUT_MODULE, { color });
  }

  @Input() set xuiInputSize(size: InputSize) {
    this.configService.set(INPUT_MODULE, { size });
  }

  constructor(private configService: XuiConfigService) {}
}
