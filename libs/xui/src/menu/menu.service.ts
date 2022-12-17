import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { XuiMenuType } from './menu.types';

@Injectable()
export class MenuService {
  _inlineIndent$ = new BehaviorSubject<number>(24);
  _mode$ = new BehaviorSubject<XuiMenuType>('default');

  get inlineIndent$() {
    return this._inlineIndent$.asObservable();
  }

  get mode$() {
    return this._mode$.asObservable();
  }

  setMode(mode: XuiMenuType) {
    this._mode$.next(mode);
  }

  setInlineIndent(indent: number) {
    this._inlineIndent$.next(indent);
  }
}
