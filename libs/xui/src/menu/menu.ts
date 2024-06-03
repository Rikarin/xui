import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { XuiMenuService } from './menu.service';
import { MenuType } from './menu.types';

@Component({
  selector: 'xui-menu',
  providers: [XuiMenuService],
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiMenu implements OnChanges {
  @Input() inlineIndent = 24;
  @Input() mode: MenuType = 'default';

  constructor(private menuService: XuiMenuService) {}

  ngOnChanges(changes: SimpleChanges) {
    const { inlineIndent, mode } = changes;

    if (inlineIndent) {
      this.menuService.setInlineIndent(this.inlineIndent);
    }

    if (mode) {
      this.menuService.setMode(this.mode);
    }
  }
}
