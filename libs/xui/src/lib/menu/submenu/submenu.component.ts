import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { XuiSubmenuService } from '../submenu.service';

@Component({
  selector: 'xui-submenu',
  exportAs: 'xuiSubMenu',
  providers: [XuiSubmenuService],
  templateUrl: './submenu.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // '[style.paddingLeft.px]': 'paddingLeft'
  }
})
export class XuiSubMenuComponent implements OnInit {
  @Input() title: string;
  @Input() icon: string;

  paddingLeft = this.submenuService.level * 24;

  constructor(private submenuService: XuiSubmenuService) {}

  ngOnInit() {
    console.log('padding left', this.paddingLeft);
  }
}
