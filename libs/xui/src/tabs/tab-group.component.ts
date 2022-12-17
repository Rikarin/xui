import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  QueryList
} from '@angular/core';
import { TabComponent } from './tab.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'xui-tab-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="x-tabs-list">
      <div
        class="x-tabs-entry"
        *ngFor="let tab of _tabs"
        [class.x-tabs-active]="tab.isActive"
        [attr.disabled]="tab.disabled || null"
        (click)="selectTab(tab)"
      >
        {{ tab.title | translate }}
      </div>
    </div>

    <ng-content select="xui-tab"></ng-content>
  `
})
export class TabGroupComponent implements AfterContentInit {
  _active?: TabComponent;
  _tabs: TabComponent[] = [];
  onChange$ = new Subject();

  @ContentChildren(TabComponent) set tabRef(value: QueryList<TabComponent>) {
    this._tabs = value.toArray();
    this.cdr.markForCheck();
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

  selectTab(tab: TabComponent) {
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
