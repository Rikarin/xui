import { Component } from '@angular/core';
import { XuiSnackBar } from '@xui/components';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {
  constructor(private snackbar: XuiSnackBar) {}

  openSnackbar() {
    this.snackbar.open('examples.hello_world', 'foobar');
  }
}
