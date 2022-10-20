import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'xui-context-menu',
  exportAs: 'xuiContextMenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './context-menu.component.html'
})
export class ContextMenuComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
