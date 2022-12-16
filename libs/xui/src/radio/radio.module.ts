import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioComponent } from './radio.component';
import { RadioGroupComponent } from './radio-group.component';
import { XuiIconModule } from '../icon';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [RadioComponent, RadioGroupComponent],
  imports: [CommonModule, XuiIconModule, TranslateModule.forChild()],
  exports: [RadioComponent, RadioGroupComponent]
})
export class XuiRadioModule {}
