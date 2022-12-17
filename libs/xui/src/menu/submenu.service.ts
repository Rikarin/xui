import { Injectable, Optional, SkipSelf } from '@angular/core';

@Injectable()
export class SubmenuService {
  level = 1;

  constructor(@SkipSelf() @Optional() submenuService: SubmenuService) {
    this.level = (submenuService?.level ?? 0) + 1;
  }
}
