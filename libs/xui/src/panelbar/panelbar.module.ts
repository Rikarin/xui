import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiPanelBar } from './panelbar';
import { XuiPanelBarItem } from './panelbar-item';
import { XuiPanelBarItemTemplate } from './panelbar-item-template';
import { PortalModule } from '@angular/cdk/portal';
import { XuiPanelBarItemTitle } from './panelbar-item-title';
import { XuiPanelBarItemContent } from './panelbar-item-content';
import { XuiIcon } from '../icon';

@NgModule({
  declarations: [XuiPanelBar, XuiPanelBarItem, XuiPanelBarItemTemplate, XuiPanelBarItemTitle, XuiPanelBarItemContent],
  exports: [XuiPanelBar, XuiPanelBarItem, XuiPanelBarItemTemplate, XuiPanelBarItemTitle, XuiPanelBarItemContent],
  imports: [CommonModule, PortalModule, XuiIcon]
})
export class XuiPanelBarModule {}
