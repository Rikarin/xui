import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiTabComponent } from './tab.component';
import { XuiTabGroupComponent } from './tab-group.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [XuiTabComponent, XuiTabGroupComponent],
  imports: [CommonModule, TranslateModule.forChild()],
  exports: [XuiTabComponent, XuiTabGroupComponent]
})
export class XuiTabModule {}
