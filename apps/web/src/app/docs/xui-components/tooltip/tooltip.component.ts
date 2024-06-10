import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example, FileType } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { TooltipExample1Component } from '../../../../examples/tooltip-example1/tooltip-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, TooltipExample1Component],
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  readonly example1 = {
    'tooltip-example1': FileType.Component
  };
}
