import { Component } from '@angular/core';
import { MenuItem } from 'xui';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  themePicker = new FormControl();

  // getStyles() {
  //   return this.themePicker.value ? 'light-theme' : 'dark-theme';
  // }
}
