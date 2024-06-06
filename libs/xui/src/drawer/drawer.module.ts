import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiDrawer } from './drawer';
import { XuiDrawerItemTemplate } from './drawer-item-template';
import { XuiDrawerHeaderTemplate } from './drawer-header-template';
import { XuiDrawerFooterTemplate } from './drawer-footer-template';
import { PortalModule } from '@angular/cdk/portal';
import { XuiIcon } from '../icon';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  declarations: [XuiDrawer, XuiDrawerItemTemplate, XuiDrawerHeaderTemplate, XuiDrawerFooterTemplate],
  imports: [CommonModule, PortalModule, XuiIcon, XuiFocusModule],
  exports: [XuiDrawer, XuiDrawerItemTemplate, XuiDrawerHeaderTemplate, XuiDrawerFooterTemplate]
})
export class XuiDrawerModule {}
