import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiContextMenuComponent } from './context-menu.component';
import { CdkMenuModule } from '@angular/cdk/menu';
import { A11yModule } from '@angular/cdk/a11y';
import { MenuTriggerForDirective } from './menu-trigger-for.directive';
import { ContextMenuTriggerForDirective } from './context-menu-trigger-for.directive';

@NgModule({
  declarations: [XuiContextMenuComponent, MenuTriggerForDirective, ContextMenuTriggerForDirective],
  imports: [CommonModule, CdkMenuModule, A11yModule],
  exports: [XuiContextMenuComponent, CdkMenuModule, MenuTriggerForDirective, ContextMenuTriggerForDirective]
})
export class XuiContextMenuModule {}
