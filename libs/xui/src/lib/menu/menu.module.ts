import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiMenuComponent } from './menu.component';
import { XuiSubMenuComponent } from './sub-menu/sub-menu.component';
import { XuiMenuGroupComponent } from './menu-group/menu-group.component';
import { XuiMenuItemComponent } from './menu-item/menu-item.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    XuiMenuComponent,
    XuiSubMenuComponent,
    XuiMenuGroupComponent,
    XuiMenuItemComponent,
  ],
  exports: [
    XuiMenuComponent,
    XuiSubMenuComponent,
    XuiMenuGroupComponent,
    XuiMenuItemComponent,
  ],
})
export class XuiMenuModule {}
