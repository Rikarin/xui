import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { XuiRadioOptionComponent } from './radio-option.component';

@Injectable()
export class RadioListService {
  private _initialValue?: string | null;
  private _components = new BehaviorSubject<XuiRadioOptionComponent[]>([]);
  private _selected = new BehaviorSubject<XuiRadioOptionComponent | null | undefined>(undefined);

  get selected$() {
    return this._selected.asObservable();
  }

  select(value: string | null, focus = false) {
    const option = this._components.value.find(x => x.value === value);

    if (option) {
      this.clearAll();
      this.clearAllFocus();
      option.select(true);
      this._selected.next(option);

      if (focus) {
        option.focus(true);
      }
    } else {
      this._initialValue = value;
    }
  }

  addOption(option: XuiRadioOptionComponent) {
    this._components.next([...this._components.value, option]);

    if (this._initialValue) {
      this.select(this._initialValue);
    }
  }

  removeOption(option: XuiRadioOptionComponent) {
    this._components.next(this._components.value.filter(x => x !== option));
  }

  selectPrev() {
    let next = this._components.value.findIndex(x => x.value === this._selected.value?.value);

    do {
      next--;
      if (next < 0) {
        next = this._components.value.length - 1;
      }
    } while (this._components.value[next].disabled);

    const component = this._components.value[next].value;
    this.select(component, true);
  }

  selectNext() {
    let next = this._components.value.findIndex(x => x.value === this._selected.value?.value);

    do {
      next++;
      if (next >= this._components.value.length) {
        next = 0;
      }
    } while (this._components.value[next].disabled);

    const component = this._components.value[next].value;
    this.select(component, true);
  }

  focusCurrent() {
    const current = this._selected.value;
    if (current) {
      current.focus(true);
    } else {
      this.selectNext();
    }
  }

  clearAllFocus() {
    for (const option of this._components.value) {
      option.focus(false);
    }
  }

  private clearAll() {
    for (const option of this._components.value) {
      option.select(false);
    }
  }
}
