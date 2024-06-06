import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiTab } from './tab';
import { XuiTabGroup } from './tab-group';
import { TranslateModule } from '@ngx-translate/core';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  declarations: [XuiTab, XuiTabGroup],
  imports: [CommonModule, TranslateModule.forChild(), XuiFocusModule],
  exports: [XuiTab, XuiTabGroup]
})
export class XuiTabModule {}
