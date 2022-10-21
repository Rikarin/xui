import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'xui-checkbox',
  exportAs: 'xuiCheckbox',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './checkbox.component.html',
  host: {
    '(click)': '_click()'
  }
})
export class XuiCheckboxComponent implements OnInit {
  value = true;

  constructor() {}

  ngOnInit(): void {}

  _click() {
    this.value = !this.value;
  }
}
