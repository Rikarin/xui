import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

//  TODO: probably it's directive
@Component({
  selector: 'xui-popover',
  exportAs: 'xuiPopover',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./popover.scss'],
  templateUrl: './popover.component.html'
})
export class XuiPopoverComponent {}
