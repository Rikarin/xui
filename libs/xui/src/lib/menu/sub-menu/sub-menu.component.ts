import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'li[xui-sub-menu]',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.scss'],
})
export class XuiSubMenuComponent implements OnInit {
  @Input() xTitle: string;

  constructor() {}

  ngOnInit() {}
}
