import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { PANEL_BAR_ACCESSOR, PanelBarAccessor, PanelBarItem } from './panelbar.types';

@Component({
  selector: 'xui-panelbar',
  templateUrl: './panelbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PANEL_BAR_ACCESSOR, useExisting: PanelBarComponent }]
})
export class PanelBarComponent implements PanelBarAccessor {
  itemTemplate?: TemplateRef<unknown>;

  @Input() items?: PanelBarItem[];
}
