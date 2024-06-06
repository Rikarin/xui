import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { XuiSelect } from './select';
import { OverlayModule } from '@angular/cdk/overlay';
import { XuiOption } from './option';
import { XuiIcon } from '../icon';
import { XuiDecagram } from '../decagram';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  imports: [CommonModule, FormsModule, A11yModule, OverlayModule, XuiIcon, XuiDecagram, TranslateModule.forChild()],
  declarations: [XuiSelect, XuiOption],
  exports: [XuiSelect, XuiOption]
})
export class XuiSelectModule {}
