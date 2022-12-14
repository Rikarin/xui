import { Directive, Input } from '@angular/core';
import { InputColor, InputSize } from '../input/input.types';
import { BUTTON_MODULE, INPUT_MODULE } from './config';
import { ButtonColor, ButtonSize, ButtonType } from '../button/button.types';
import { XuiConfigService } from './config.service';

@Directive({
  selector: '[xuiConfigure]',
  providers: [XuiConfigService]
})
export class ConfigureDirective {
  @Input('xuiInputColor') set inputColor(color: InputColor) {
    this.configService.set(INPUT_MODULE, { color });
  }

  @Input('xuiInputSize') set inputSize(size: InputSize) {
    this.configService.set(INPUT_MODULE, { size });
  }

  @Input('xuiButtonType') set buttonType(type: ButtonType) {
    this.configService.set(BUTTON_MODULE, { type });
  }

  @Input('xuiButtonColor') set buttonColor(color: ButtonColor) {
    this.configService.set(BUTTON_MODULE, { color });
  }

  @Input('xuiButtonSize') set buttonSize(size: ButtonSize) {
    this.configService.set(BUTTON_MODULE, { size });
  }

  constructor(private configService: XuiConfigService) {}
}
