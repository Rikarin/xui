import { Component } from '@angular/core';
import { XuiCardModule, XuiTooltipModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiCardModule, XuiTooltipModule],
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {}
