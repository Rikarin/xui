import { booleanAttribute, ChangeDetectionStrategy, Component, computed, Inject, input } from '@angular/core';
import { TAB_GROUP_ACCESSOR, TabGroupAccessor } from './tab.types';

@Component({
  selector: 'xui-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-container *ngIf="_isActive()"><ng-content /></ng-container>',
  host: {
    class: 'x-tab'
  }
})
export class XuiTab {
  title = input<string>();
  disabled = input(false, { transform: booleanAttribute });

  _isActive = computed(() => this.tabGroup._active() === this);

  constructor(@Inject(TAB_GROUP_ACCESSOR) private tabGroup: TabGroupAccessor) {}
}
