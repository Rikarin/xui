import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiContextMenuComponent } from './context-menu.component';
import { CdkMenuModule } from '@angular/cdk/menu';

@NgModule({
  declarations: [XuiContextMenuComponent],
  imports: [CommonModule, CdkMenuModule],
  exports: [XuiContextMenuComponent]
})
export class XuiContextMenuModule {}
