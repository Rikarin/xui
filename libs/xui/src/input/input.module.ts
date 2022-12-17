import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input.component';
import { InputGroupComponent } from './input-group.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { InputAddonComponent } from './input-addon';

@NgModule({
  imports: [CommonModule, FormsModule, TranslateModule.forChild()],
  declarations: [InputComponent, InputGroupComponent, InputAddonComponent],
  exports: [InputComponent, InputGroupComponent, InputAddonComponent]
})
export class XuiInputModule {}
