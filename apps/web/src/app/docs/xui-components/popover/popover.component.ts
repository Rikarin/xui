import { Component } from '@angular/core';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';
import { XuiButtonModule, XuiDivider, XuiInputModule, XuiPopoverModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, XuiPopoverModule, XuiButtonModule, XuiInputModule, XuiDivider],
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss']
})
export class PopoverComponent {}
