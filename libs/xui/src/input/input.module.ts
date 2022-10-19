import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiInputComponent } from './input.component';
import { XuiInputGroupComponent } from './input-group.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { XuiInputAddonComponent } from './input-addon';

@NgModule({
  imports: [CommonModule, FormsModule, TranslateModule.forChild()],
  declarations: [XuiInputComponent, XuiInputGroupComponent, XuiInputAddonComponent],
  exports: [XuiInputComponent, XuiInputGroupComponent, XuiInputAddonComponent]
})
export class XuiInputModule {}
