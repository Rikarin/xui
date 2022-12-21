import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerComponent } from './drawer.component';
import { DrawerItemTemplateDirective } from './drawer-item-template.directive';
import { DrawerHeaderTemplateDirective } from './drawer-header-template.directive';
import { DrawerFooterTemplateDirective } from './drawer-footer-template.directive';
import {XuiIconModule} from "../icon";
import {PortalModule} from "@angular/cdk/portal";

@NgModule({
  declarations: [
    DrawerComponent,
    DrawerItemTemplateDirective,
    DrawerHeaderTemplateDirective,
    DrawerFooterTemplateDirective
  ],
  imports: [CommonModule, PortalModule, XuiIconModule],
  exports: [DrawerComponent, DrawerFooterTemplateDirective, DrawerHeaderTemplateDirective]
})
export class XuiDrawerModule {}
