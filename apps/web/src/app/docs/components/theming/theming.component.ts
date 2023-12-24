import { Component } from '@angular/core';

@Component({
  selector: 'app-theming',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.scss']
})
export class ThemingComponent {
  code = `@use 'xui';

$primary: xui.generate-palette(#0672a5);
$blue2: xui.generate-palette(#0a628c);
$blue3: xui.generate-palette(#0b4f71);
$primary-alt: xui.generate-palette(#0c3e57);
$error: xui.generate-palette(#a41e23);
$red-orange: xui.generate-palette(#cb3927);
$secondary: xui.generate-palette(#9C17A6);
$orange: xui.generate-palette(#f18f23);
$yellow-orange: xui.generate-palette(#f0b220);
$lime: xui.generate-palette(#a3b34b);
$success: xui.generate-palette(#108548);

$yellow: xui.generate-palette(#f2bc18);
$green: xui.generate-palette(#297a00);
$red: xui.generate-palette(#cf005a);

$theme: xui.define-dark-theme(
  (
    color: (
      primary: xui.define-palette($primary),
      primary-alt: xui.define-palette($primary-alt),
      secondary: xui.define-palette($secondary),
      information: xui.define-palette($blue2),
      success: xui.define-palette($success),
      warn: xui.define-palette($yellow-orange),
      destructive: xui.define-palette($error),
      yellow: xui.define-palette($yellow),
      red: xui.define-palette($red),
      green: xui.define-palette($green),
      blue: xui.define-palette($primary)
    )
  )
);

@include xui.all-root-variables($theme);
@include xui.theme();
`;
}
