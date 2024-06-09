import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiContextMenu } from './context-menu';
import { CdkMenuModule } from '@angular/cdk/menu';
import { A11yModule } from '@angular/cdk/a11y';
import { XuiMenuTriggerFor } from './menu-trigger-for';
import { XuiContextMenuTriggerFor } from './context-menu-trigger-for';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  declarations: [XuiContextMenu, XuiMenuTriggerFor, XuiContextMenuTriggerFor],
  imports: [CommonModule, CdkMenuModule, A11yModule, XuiFocusModule],
  exports: [XuiContextMenu, CdkMenuModule, XuiMenuTriggerFor, XuiContextMenuTriggerFor]
})
export class XuiContextMenuModule {}
