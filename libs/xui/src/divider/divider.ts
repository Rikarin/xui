import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    class: 'x-divider',
    '[style.margin-top.px]': 'marginTop()',
    '[style.margin-bottom.px]': 'marginBottom()'
  }
})
export class XuiDivider {
  marginTop = input<number>(0);
  marginBottom = input<number>(0);
}
