import { Component } from '@angular/core';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [],
  templateUrl: './colors.component.html',
  styleUrl: './colors.component.scss'
})
export class ColorsComponent {
  colors = ['primary', 'primary-alt', 'secondary', 'success', 'error', 'info', 'warning', 'background'];
  tokens = [
    100, 130, 160, 200, 230, 260, 300, 330, 345, 360, 400, 430, 460, 500, 530, 560, 600, 630, 660, 700, 730, 760, 800,
    830, 860, 900
  ];

  getVariable(name: string, token: number) {
    return `background-color: var(--color-${name}-${token}); color: var(--color-${name}-${token}-contrast);`;
  }

  getColor(element: HTMLElement) {
    return getComputedStyle(element).getPropertyValue('background-color').replace('oklch(', '').replace(')', '');
  }
}
