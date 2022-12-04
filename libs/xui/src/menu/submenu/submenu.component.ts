import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { XuiSubmenuService } from '../submenu.service';
import { InputBoolean } from '../../utils';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-submenu',
  exportAs: 'xuiSubMenu',
  providers: [XuiSubmenuService],
  templateUrl: './submenu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
  // host: {
  // '[style.paddingLeft.px]': 'paddingLeft'
  // }
})
export class XuiSubMenuComponent {
  static ngAcceptInputType_open: BooleanInput;

  @Input() title!: string;
  @Input() icon!: string;
  @Input() @InputBoolean() open = false;
  @Output() readonly openChange: EventEmitter<boolean> = new EventEmitter();

  paddingLeft = this.submenuService.level * 24;

  constructor(private submenuService: XuiSubmenuService) {}

  toggleSubmenu() {
    this.open = !this.open;
    this.openChange.emit();
  }
}
