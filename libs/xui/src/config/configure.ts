import { Directive, Input } from '@angular/core';
import { InputColor, InputSize } from '../input/input.types';
import {
  BADGE_MODULE,
  BANNER_MODULE,
  BUTTON_MODULE,
  CHECKBOX_MODULE,
  DATE_PICKER_MODULE,
  INPUT_MODULE
} from './config';
import { ButtonColor, ButtonSize, ButtonType } from '../button/button.types';
import { XuiConfigService } from './config.service';
import { BadgeColor } from '../badge';
import { BannerType } from '../banner';
import { CheckboxColor } from '../checkbox/checkbox.types';
import { DatePickerColor, DatePickerSize } from '../date-picker';

@Directive({
  selector: '[xuiConfigure]',
  providers: [XuiConfigService]
})
export class XuiConfigure {
  // Badge
  @Input() set xuiBadgeColor(color: BadgeColor) {
    this.configService.set(BADGE_MODULE, { color });
  }

  // Banner
  @Input() set xuiBannerType(type: BannerType) {
    this.configService.set(BANNER_MODULE, { type });
  }

  @Input() set xuiBannerDismissible(dismissible: boolean) {
    this.configService.set(BANNER_MODULE, { dismissible });
  }

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
