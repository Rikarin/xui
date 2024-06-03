import { ChangeDetectionStrategy, Component, HostBinding, Input, TemplateRef } from '@angular/core';
import { PANEL_BAR_ACCESSOR, PanelBarAccessor, PanelBarItem } from './panelbar.types';

@Component({
  selector: 'xui-panelbar',
  templateUrl: 'panelbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PANEL_BAR_ACCESSOR, useExisting: XuiPanelBar }]
})
export class XuiPanelBar implements PanelBarAccessor {
  itemTemplate?: TemplateRef<unknown>;

  @Input() items?: PanelBarItem[];

  @HostBinding('class.x-panelbar')
  get hostMainClass(): boolean {
    return true;
  }
}
