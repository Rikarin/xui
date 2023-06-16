import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelBarComponent } from './panelbar.component';
import { PanelBarItemComponent } from './panelbar-item.component';
import { PanelBarItemTemplateDirective } from './panelbar-item-template.directive';
import { PortalModule } from '@angular/cdk/portal';
import { PanelBarItemTitleDirective } from './panelbar-item-title.directive';
import { PanelBarItemContentDirective } from './panelbar-item-content.directive';
import { XuiIconComponent } from '../icon';

@NgModule({
  declarations: [
    PanelBarComponent,
    PanelBarItemComponent,
    PanelBarItemTemplateDirective,
    PanelBarItemTitleDirective,
    PanelBarItemContentDirective
  ],
  exports: [
    PanelBarComponent,
    PanelBarItemComponent,
    PanelBarItemTemplateDirective,
    PanelBarItemContentDirective,
    PanelBarItemTitleDirective
  ],
  imports: [CommonModule, PortalModule, XuiIconComponent]
})
export class XuiPanelBarModule {}
