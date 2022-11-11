import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { XuiOptionComponent } from './option.component';

@Injectable()
export class SelectService {
  private _components = new BehaviorSubject<XuiOptionComponent[]>([]);
  private _selected = new BehaviorSubject<XuiOptionComponent | null>(null);

  get selected$() {
    return this._selected.asObservable();
  }

  select(option: XuiOptionComponent) {
    this.clearAll();
    option.select(true);
    this._selected.next(option);
  }

  addOption(option: XuiOptionComponent) {
    this._components.next([...this._components.value, option]);
  }

  removeOption(option: XuiOptionComponent) {
    this._components.next(this._components.value.filter(x => x !== option));
  }

  private clearAll() {
    for (const option of this._components.value) {
      option.select(false);
    }
  }
}
