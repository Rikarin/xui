import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ul[xui-menu]',
  exportAs: 'xuiMemu',
  templateUrl: './menu.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiMenuComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
