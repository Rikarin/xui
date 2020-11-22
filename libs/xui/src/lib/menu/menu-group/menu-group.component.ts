import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'li[xui-menu-group]',
  templateUrl: './menu-group.component.html',
  styleUrls: ['./menu-group.component.scss'],
})
export class XuiMenuGroupComponent implements OnInit {
  @Input() xTitle: string;

  constructor() {}

  ngOnInit() {}
}
