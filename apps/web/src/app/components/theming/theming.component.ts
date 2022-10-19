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
  information: xui.define-palette(xui.$blue-palette),
  success: xui.define-palette(xui.$green-palette),
  warn: xui.define-palette(xui.$orange-palette),
  destructive: xui.define-palette(xui.$red-palette),

  background: xui.$background-palette,
  elevation: xui.$default-elevation
);

@include xui.core();
@include xui.all-component-themes($theme);`;
}
