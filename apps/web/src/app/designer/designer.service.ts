import { Injectable } from '@angular/core';

@Injectable()
export class DesignerService {
  private readonly _styleElm: HTMLStyleElement;

  constructor() {
    this._styleElm = document.createElement('style');
    document.head.appendChild(this._styleElm);
  }

  set() {
    this._styleElm.innerHTML = `
      // .theme-preview {
      //   --color-primary-default: red;
      // }
      //
      // .x-button-content {
      //   width: 200px;
      // }
    `;
  }

  generateCss(theme: Theme) {
    let result = '';

    if (theme.button) {
      if (theme.button.borderRadius) {
        result += `.x-button-content { border-radius: ${theme.button.borderRadius} }`;
      }
    }

    return result;
  }
}

export interface Palette {
  default: string;
}

// TODO: better name
export interface ButtonStyles {
  borderRadius?: number;
  // TODO
}

export interface Theme {
  button?: ButtonStyles;
}
