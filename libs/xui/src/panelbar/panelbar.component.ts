import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { PanelBarItem } from './panelbar.types';

@Component({
  selector: 'xui-panelbar',
  exportAs: 'xuiPanelBar',
  templateUrl: './panelbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelBarComponent {
  itemTemplate?: TemplateRef<unknown>;

  @Input() items?: PanelBarItem[];
}
