import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  QueryList,
  signal
} from '@angular/core';
import { XuiTab } from './tab';
import { TAB_GROUP_ACCESSOR, TabGroupAccessor } from './tab.types';

@Component({
  selector: 'xui-tab-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="x-tab-group-list">
      @for (tab of _tabs(); track tab) {
        <div
          class="x-tab-group-entry"
          [class.x-tab-group-active]="tab._isActive()"
          [attr.disabled]="tab.disabled() || null"
          (click)="selectTab(tab)"
        >
          {{ tab.title() | translate }}
        </div>
      }
    </div>
    <ng-content select="xui-tab"></ng-content>`,
  providers: [{ provide: TAB_GROUP_ACCESSOR, useExisting: XuiTabGroup }],
  host: {
    class: 'x-tab-group'
  }
})
export class XuiTabGroup implements AfterContentInit, TabGroupAccessor {
  _active = signal<XuiTab | null>(null);
  _tabs = signal<XuiTab[]>([]);

  @ContentChildren(XuiTab) private set tabRef(value: QueryList<XuiTab>) {
    this._tabs.set(value.toArray());
  }

  // Not used
  // @Input() canNavigate?: (tab: XuiTabComponent) => boolean;

  ngAfterContentInit() {
    for (const tab of this._tabs()) {
      if (!tab.disabled()) {
        this._active.set(tab);
        break;
      }
    }
  }

  selectTab(tab: XuiTab) {
    if (tab.disabled()) {
      return;
    }

    // if (this.canNavigate && !this.canNavigate(tab)) {
    //   return;
    // }

    this._active.set(tab);
  }
}
