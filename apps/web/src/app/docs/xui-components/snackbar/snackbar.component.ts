import { Component } from '@angular/core';
import { XuiButtonModule, XuiSnackBar, XuiSnackbarModule } from '@xui/components';
import { Information } from '../../components/information';
import { Example } from '../../components/example';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, XuiSnackbarModule, XuiButtonModule],
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
