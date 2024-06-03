import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiInput } from './input';
import { XuiInputGroup } from './input-group';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { XuiInputAddon } from './input-addon';

@NgModule({
  imports: [CommonModule, FormsModule, TranslateModule.forChild()],
  declarations: [XuiInput, XuiInputGroup, XuiInputAddon],
  exports: [XuiInput, XuiInputGroup, XuiInputAddon]
})
export class XuiInputModule {}
