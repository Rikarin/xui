import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from './select.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { OptionComponent } from './option.component';
import { XuiIconComponent } from '../icon';
import { XuiDecagramComponent } from '../decagram';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    XuiIconComponent,
    XuiDecagramComponent,
    TranslateModule.forChild()
  ],
  declarations: [SelectComponent, OptionComponent],
  exports: [SelectComponent, OptionComponent]
})
export class XuiSelectModule {}
