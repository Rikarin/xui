import { Component } from '@angular/core';
import { TabComponent } from './tab.component';

@Component({
  selector: 'xui-tab-group',
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
export class TabGroupComponent {
  tabs: TabComponent[] = [];

  // Not used
  // @Input() canNavigate?: (tab: XuiTabComponent) => boolean;

  addTab(tab: TabComponent) {
    if (!this.isSelected() && !tab.disabled) {
      tab.isActive = true;
    }

    this.tabs.push(tab);
  }

  selectTab(tab: TabComponent) {
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
