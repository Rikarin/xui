import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent } from './tab.component';
import { TabGroupComponent } from './tab-group.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [TabComponent, TabGroupComponent],
  imports: [CommonModule, TranslateModule.forChild()],
  exports: [TabComponent, TabGroupComponent]
})
export class XuiTabModule {}
