import { Component, input } from '@angular/core';
import { ButtonType, delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example5',
  template: `
    <xui-button type="normal" disabled>Submit</xui-button>
    <xui-button type="raised" disabled>Submit</xui-button>
    <xui-button type="dashed" disabled>Submit</xui-button>
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
export class ButtonExample5Component {}
