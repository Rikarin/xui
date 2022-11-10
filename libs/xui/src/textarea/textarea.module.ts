import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { XuiTextareaComponent } from './textarea.component';

@NgModule({
  imports: [CommonModule, FormsModule, TranslateModule.forChild()],
  declarations: [XuiTextareaComponent],
  exports: [XuiTextareaComponent]
})
export class XuiTextareaModule {}
