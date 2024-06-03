import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ThemingService } from '@xui/theme-core';
import { startWith } from 'rxjs';
import { XuiIcon, XuiLayoutModule, XuiMenuModule, XuiSwitch } from '@xui/components';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, XuiIcon, XuiSwitch, XuiLayoutModule, XuiMenuModule],
  selector: 'app-docs',
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
