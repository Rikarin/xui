import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioComponent } from './radio.component';
import { RadioGroupComponent } from './radio-group.component';
import { TranslateModule } from '@ngx-translate/core';
import { XuiIconComponent } from '../icon';

@NgModule({
  declarations: [RadioComponent, RadioGroupComponent],
  imports: [CommonModule, XuiIconComponent, TranslateModule.forChild()],
  exports: [RadioComponent, RadioGroupComponent]
})
export class XuiRadioModule {}
