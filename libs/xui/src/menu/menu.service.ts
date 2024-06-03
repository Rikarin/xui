import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuType } from './menu.types';

@Injectable()
export class XuiMenuService {
  _inlineIndent$ = new BehaviorSubject<number>(24);
  _mode$ = new BehaviorSubject<MenuType>('default');

  get inlineIndent$() {
    return this._inlineIndent$.asObservable();
  }

  get mode$() {
    return this._mode$.asObservable();
  }

  setMode(mode: MenuType) {
    this._mode$.next(mode);
  }

  setInlineIndent(indent: number) {
    this._inlineIndent$.next(indent);
  }
}
