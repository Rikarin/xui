import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';
import { PANEL_BAR_ACCESSOR, PanelBarAccessor, PanelBarItem } from './panelbar.types';

@Component({
  selector: 'xui-panelbar',
  templateUrl: 'panelbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PANEL_BAR_ACCESSOR, useExisting: XuiPanelBar }],
  host: {
    class: 'x-panelbar'
  }
})
export class XuiPanelBar implements PanelBarAccessor {
  _itemTemplate?: TemplateRef<unknown>;

  items = input<PanelBarItem[]>();
}
