import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiMenuComponent } from './menu.component';
import { XuiSubMenuComponent } from './submenu/submenu.component';
import { XuiMenuGroupComponent } from './menu-group/menu-group.component';
import { XuiMenuItemComponent } from './menu-item/menu-item.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule, MatIconModule],
  declarations: [XuiMenuComponent, XuiSubMenuComponent, XuiMenuGroupComponent, XuiMenuItemComponent],
  exports: [XuiMenuComponent, XuiSubMenuComponent, XuiMenuGroupComponent, XuiMenuItemComponent]
})
export class XuiMenuModule {}
