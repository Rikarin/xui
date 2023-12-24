import { Component } from '@angular/core';
import { STYLE_SCSS } from '../../../../templates/angular';

@Component({
  selector: 'app-theming',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.scss']
})
export class ThemingComponent {
  code = STYLE_SCSS;
}
