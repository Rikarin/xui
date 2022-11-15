import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemingService } from 'xui';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
  // encapsulation: ViewEncapsulation.Emulated
})
export class AppComponent {
  themePicker = new FormControl();

  constructor(private themeService: ThemingService) {
    this.themePicker.valueChanges.pipe(startWith(false)).subscribe(isLight => {
      console.log('theme', isLight);
      themeService.setStyle('theme', `xui-${isLight ? 'light' : 'dark'}.theme.css`);
    });
  }
}
