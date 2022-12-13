import { Component } from '@angular/core';

@Component({
  selector: 'app-theming',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.scss']
})
export class ThemingComponent {
  code = `@use 'xui';

$theme: (
  primary: xui.define-palette(xui.$blue-palette),
  primary-alt: xui.define-palette(xui.$blue-palette, 800),
  secondary: xui.define-palette(xui.$blue-palette, 200),
  infor: xui.define-palette(xui.$blue-palette),
  success: xui.define-palette(xui.$green-palette),
  warning: xui.define-palette(xui.$orange-palette),
  error: xui.define-palette(xui.$red-palette),

  bg: xui.$background-palette,
  elevation: xui.$default-elevation
);

@include xui.core();
@include xui.all-component-themes($theme);`;
}
