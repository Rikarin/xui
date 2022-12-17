import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SubmenuService } from '../submenu.service';
import { InputBoolean } from '../../utils';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-submenu',
  providers: [SubmenuService],
  templateUrl: './submenu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
  // host: {
  // '[style.paddingLeft.px]': 'paddingLeft'
  // }
})
export class SubMenuComponent {
  static ngAcceptInputType_open: BooleanInput;

  @Input() title!: string;
  @Input() icon!: string;
  @Input() @InputBoolean() open = false;
  @Output() readonly openChange: EventEmitter<boolean> = new EventEmitter();

  paddingLeft = this.submenuService.level * 24;

  constructor(private submenuService: SubmenuService) {}

  toggleSubmenu() {
    this.open = !this.open;
    this.openChange.emit();
  }
}
