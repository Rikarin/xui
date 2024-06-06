import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { XuiMenuService } from './menu.service';
import { MenuType } from './menu.types';

@Component({
  selector: 'xui-menu',
  providers: [XuiMenuService],
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiMenu {
  inlineIndent = input<number>(24);
  mode = input<MenuType>('default');

  constructor(private menuService: XuiMenuService) {
    this.menuService._mode = this.mode;
    this.menuService._inlineIndent = this.inlineIndent;
  }
}
