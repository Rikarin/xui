import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuComponent } from './context-menu.component';
import { CdkMenuModule } from '@angular/cdk/menu';
import { A11yModule } from '@angular/cdk/a11y';
import { MenuTriggerForDirective } from './menu-trigger-for.directive';
import { ContextMenuTriggerForDirective } from './context-menu-trigger-for.directive';

@NgModule({
  declarations: [ContextMenuComponent, MenuTriggerForDirective, ContextMenuTriggerForDirective],
  imports: [CommonModule, CdkMenuModule, A11yModule],
  exports: [ContextMenuComponent, CdkMenuModule, MenuTriggerForDirective, ContextMenuTriggerForDirective]
})
export class XuiContextMenuModule {}
