import { ChangeDetectionStrategy, Component, effect, EventEmitter, input, Output, signal } from '@angular/core';
import { XuiSubmenuService } from '../submenu.service';
import { convertToBoolean } from '../../utils';

@Component({
  selector: 'xui-submenu',
  providers: [XuiSubmenuService],
  templateUrl: 'submenu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiSubmenu {
  paddingLeft = this.submenuService.level * 24;
  _isOpened = signal(false);

  title = input<string>();
  icon = input<string>();
  open = input(false, { transform: (v: string | boolean) => convertToBoolean(v) });
  @Output() readonly openChange: EventEmitter<boolean> = new EventEmitter();

  constructor(private submenuService: XuiSubmenuService) {
    effect(() => this._isOpened.set(this.open()), { allowSignalWrites: true });
  }

  toggleSubmenu() {
    this._isOpened.set(!this._isOpened());
    this.openChange.emit();
  }
}
