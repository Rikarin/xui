import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class RadioListService {
  private _selected = new BehaviorSubject<string | null>(null);

  get selected$() {
    return this._selected.asObservable();
  }

  select(id: string) {
    this._selected.next(id);
  }
}
