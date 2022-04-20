import { Component } from '@angular/core';

@Component({
  selector: 'app-theming',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.scss']
})
export class ThemingComponent {
  code =
`:root {
  --primary-color: #1c6e8c;
  --primary-alt-color: #274156;
  --secondary-color: #605856;

  --blue-color: #00aeff;
  --green-color: #00a859;
  --purple-color: #6e53a3;
  --red-color: #f13c45;
  --orange-color: #f8961d;
  --offblack-color: #333333;

  --header-primary: #ffffff;
  --header-secondary: #b3babf;
  --text-normal: #d7dee4;
  --text-muted: #72787d;

  --processing-color: var(--blue-color);
  --success-color: var(--green-color);
  --fail-color: var(--red-color);
  --destructive-color: #b00020;
  --neutral-color: #d0ccd0;

  --background-primary: #32383c;
  --background-secondary: #2c3136;
  --background-secondary-alt: #262b2f;
  --background-tertiary: #1f2429;
  --background-accent: #4e5358;
  --background-floating: #13181c;

  /*TODO some sort of hover whitening for colors */

  --elevation-stroke: 0 0 0 1px rgba(4, 4, 5, 0.15);
  --elevation-low: 0 1px 0 rgba(4, 4, 5, 0.2), 0 1.5px 0 rgba(6, 6, 7, 0.05), 0 2px 0 rgba(4, 4, 5, 0.05);
  --elevation-medium: 0 4px 4px rgba(0, 0, 0, 0.16);
  --elevation-high: 0 8px 16px rgba(0, 0, 0, 0.24);

  --font-primary: 'Rubik';
  --font-headline: 'Bungee';
}
  `;
}
