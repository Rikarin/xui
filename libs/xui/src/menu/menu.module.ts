import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiMenuComponent } from './menu.component';
import { XuiSubMenuComponent } from './submenu/submenu.component';
import { XuiMenuGroupComponent } from './menu-group.component';
import { XuiMenuItemComponent } from './menu-item.component';
import { RouterModule } from '@angular/router';
import { XuiIconModule } from '../icon';

@NgModule({
  imports: [CommonModule, RouterModule, XuiIconModule],
  declarations: [XuiMenuComponent, XuiSubMenuComponent, XuiMenuGroupComponent, XuiMenuItemComponent],
  exports: [XuiMenuComponent, XuiSubMenuComponent, XuiMenuGroupComponent, XuiMenuItemComponent]
})
export class XuiMenuModule {}
