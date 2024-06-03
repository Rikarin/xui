import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiButtonModule, XuiTooltipModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, XuiButtonModule, XuiTooltipModule],
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {}
