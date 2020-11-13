import { Injectable } from '@angular/core';

@Injectable()
export class XTitleService {
  _callbacks = [];

  constructor() {}

  register(callback: () => void) {
    this._callbacks.push(callback);
  }

  resetAll() {
    this._callbacks = [];
  }

  tick() {
    this._callbacks.forEach((x) => x());
  }
}
