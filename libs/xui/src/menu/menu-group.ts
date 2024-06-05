import { ChangeDetectionStrategy, Component, computed, input, Optional } from '@angular/core';
import { XuiMenuService } from './menu.service';
import { XuiSubmenuService } from './submenu.service';

@Component({
  selector: 'xui-menu-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="x-menu-group-title" [style.paddingLeft.px]="_paddingLeft()">
      {{ title() }}
    </div>
    <ng-content />`
})
export class XuiMenuGroup {
  private level = (this.submenuService?.level ?? 0) + 0.5;
  _paddingLeft = computed(() =>
    this.menuService._mode() === 'default' ? this.level * this.menuService._inlineIndent() : null
  );

  title = input.required<string>();

  constructor(
    private menuService: XuiMenuService,
    @Optional() private submenuService: XuiSubmenuService
  ) {}
}
