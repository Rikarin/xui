import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { SubMenuComponent } from './submenu/submenu.component';
import { MenuGroupComponent } from './menu-group.component';
import { MenuItemComponent } from './menu-item.component';
import { RouterModule } from '@angular/router';
import { XuiIconComponent } from '../icon';

@NgModule({
  imports: [CommonModule, RouterModule, XuiIconComponent],
  declarations: [MenuComponent, SubMenuComponent, MenuGroupComponent, MenuItemComponent],
  exports: [MenuComponent, SubMenuComponent, MenuGroupComponent, MenuItemComponent]
})
export class XuiMenuModule {}
