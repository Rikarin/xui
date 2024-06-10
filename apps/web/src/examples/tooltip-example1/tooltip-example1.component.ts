import { Component } from '@angular/core';
import { XuiButtonModule, XuiTooltipModule } from '@xui/components';

@Component({
  selector: 'app-tooltip-example1',
  standalone: true,
  imports: [XuiButtonModule, XuiTooltipModule],
  templateUrl: './tooltip-example1.component.html',
  styleUrl: './tooltip-example1.component.scss'
})
export class TooltipExample1Component {}
