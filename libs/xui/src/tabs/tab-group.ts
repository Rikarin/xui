import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  HostBinding,
  QueryList
} from '@angular/core';
import { XuiTab } from './tab';
import { Subject } from 'rxjs';
import { TAB_GROUP_ACCESSOR, TabGroupAccessor } from './tab.types';

@Component({
  selector: 'xui-tab-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="x-tab-group-list">
      @for (tab of _tabs; track tab) {
        <div
          class="x-tab-group-entry"
          [class.x-tab-group-active]="tab.isActive"
          [attr.disabled]="tab.disabled || null"
          (click)="selectTab(tab)"
        >
          {{ tab.title | translate }}
        </div>
      }
    </div>

    <ng-content select="xui-tab"></ng-content>
  `,
  providers: [{ provide: TAB_GROUP_ACCESSOR, useExisting: XuiTabGroup }]
})
export class XuiTabGroup implements AfterContentInit, TabGroupAccessor {
  _active?: XuiTab;
  _tabs: XuiTab[] = [];
  onChange$ = new Subject();

  @ContentChildren(XuiTab) set tabRef(value: QueryList<XuiTab>) {
    this._tabs = value.toArray();
    this.cdr.markForCheck();
  }

  @HostBinding('class.x-tab-group')
  get hostMainClass(): boolean {
    return true;
  }

  // Not used
  // @Input() canNavigate?: (tab: XuiTabComponent) => boolean;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit() {
    for (const tab of this._tabs) {
      if (!tab.disabled) {
        this._active = tab;
        break;
      }
    }
  }

  selectTab(tab: XuiTab) {
    if (tab.disabled) {
      return;
    }

    // if (this.canNavigate && !this.canNavigate(tab)) {
    //   return;
    // }

    this._active = tab;
    this.onChange$.next(null);
  }
}
