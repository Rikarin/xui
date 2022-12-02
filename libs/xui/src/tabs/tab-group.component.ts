import { Component } from '@angular/core';
import { XuiTabComponent } from './tab.component';

@Component({
  selector: 'xui-tab-group',
  exportAs: 'xuiTabGroup',
  // changeDetection: ChangeDetectionStrategy.OnPush, // dynamically loading tabs in example doesn't work
  template: `
    <div class="x-tabs-list">
      <div
        class="x-tabs-entry"
        *ngFor="let tab of tabs"
        [class.x-tabs-active]="tab.isActive"
        [attr.disabled]="tab.disabled || null"
        (click)="selectTab(tab)"
      >
        {{ tab.title | translate }}
      </div>
    </div>

    <ng-content></ng-content>
  `
})
export class XuiTabGroupComponent {
  tabs: XuiTabComponent[] = [];

  // Not used
  // @Input() canNavigate?: (tab: XuiTabComponent) => boolean;

  addTab(tab: XuiTabComponent) {
    if (!this.isSelected() && !tab.disabled) {
      tab.isActive = true;
    }

    this.tabs.push(tab);
  }

  selectTab(tab: XuiTabComponent) {
    if (tab.disabled) {
      return;
    }

    // if (this.canNavigate && !this.canNavigate(tab)) {
    //   return;
    // }

    for (const x of this.tabs) {
      x.isActive = false;
    }

    tab.isActive = true;
  }

  private isSelected() {
    for (const x of this.tabs) {
      if (x.isActive) {
        return true;
      }
    }

    return false;
  }
}
