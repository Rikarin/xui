import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PanelBarItem } from './panelbar.types';
import { PanelBarService } from './panelbar.service';

@Component({
  selector: 'xui-panelbar',
  exportAs: 'xuiPanelBar',
  templateUrl: './panelbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PanelBarService]
})
export class PanelBarComponent {
  @Input() items?: PanelBarItem[];
}
