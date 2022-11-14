import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { XuiMenuService } from './menu.service';
import { XuiMenuType } from './menu.types';

@Component({
  selector: 'xui-menu',
  exportAs: 'xuiMemu',
  providers: [XuiMenuService],
  templateUrl: './menu.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiMenuComponent implements OnChanges {
  @Input() inlineIndent = 24;
  @Input() mode: XuiMenuType = 'default';

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
