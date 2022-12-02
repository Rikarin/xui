import { ChangeDetectionStrategy, Component } from '@angular/core';

//  TODO: probably it's directive
@Component({
  selector: 'xui-popover',
  exportAs: 'xuiPopover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popover.component.html'
})
export class XuiPopoverComponent {}
