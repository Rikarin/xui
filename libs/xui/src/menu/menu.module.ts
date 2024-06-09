import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiMenu } from './menu';
import { XuiSubmenu } from './submenu/submenu';
import { XuiMenuGroup } from './menu-group';
import { XuiMenuItem } from './menu-item';
import { RouterModule } from '@angular/router';
import { XuiIcon } from '../icon';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  imports: [CommonModule, RouterModule, XuiIcon, XuiFocusModule],
  declarations: [XuiMenu, XuiSubmenu, XuiMenuGroup, XuiMenuItem],
  exports: [XuiMenu, XuiSubmenu, XuiMenuGroup, XuiMenuItem]
})
export class XuiMenuModule {}
