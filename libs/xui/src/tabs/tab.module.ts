import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiTab } from './tab';
import { XuiTabGroup } from './tab-group';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [XuiTab, XuiTabGroup],
  imports: [CommonModule, TranslateModule.forChild()],
  exports: [XuiTab, XuiTabGroup]
})
export class XuiTabModule {}
