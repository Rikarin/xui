import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { XuiTabComponent } from './tab.component';

@Component({
  selector: 'xui-tab-group',
  exportAs: 'xuiTabGroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="xui-tab-group-list">
      <div
        class="xui-tab-group-entry"
        *ngFor="let tab of tabs"
        [class.active]="tab.isActive"
        [class.disabled]="tab.disabled"
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
