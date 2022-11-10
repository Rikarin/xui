import { Component } from '@angular/core';
import { XuiSnackBar } from 'xui';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  constructor(private snackbar: XuiSnackBar) {}

  openSnackbar() {
    this.snackbar.open('examples.hello_world', 'foobar');
  }
}
