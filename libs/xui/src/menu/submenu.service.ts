import { Injectable, Optional, SkipSelf } from '@angular/core';

@Injectable()
export class XuiSubmenuService {
  level = 1;

  constructor(@SkipSelf() @Optional() submenuService: XuiSubmenuService) {
    this.level = (submenuService?.level ?? 0) + 1;
  }
}
