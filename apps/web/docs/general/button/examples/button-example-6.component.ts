import { Component, input } from '@angular/core';
import { ButtonType, delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example6',
  template: `
    <xui-button color="success" type="raised" shine>Submit</xui-button>
    <xui-button color="primary" type="raised" shine>Submit</xui-button>
    <xui-button color="error" type="raised" shine>Submit</xui-button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    `
  ]
})
export class ButtonExample6Component {}
