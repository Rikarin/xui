import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MenuService } from './menu.service';
import { XuiMenuType } from './menu.types';

@Component({
  selector: 'xui-menu',
  providers: [MenuService],
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnChanges {
  @Input() inlineIndent = 24;
  @Input() mode: XuiMenuType = 'default';

  constructor(private menuService: MenuService) {}

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
