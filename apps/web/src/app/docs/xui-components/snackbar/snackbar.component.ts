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
    const snackbar = this.snackbar.open('examples.hello_world', 'foobar');
    snackbar.onAction().subscribe(() => {
      console.log('Action clicked');
    });
  }
}
