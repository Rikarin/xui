import { Injectable, Signal } from '@angular/core';
import { MenuType } from './menu.types';

@Injectable()
export class XuiMenuService {
  _mode!: Signal<MenuType>;
  _inlineIndent!: Signal<number>;
}
