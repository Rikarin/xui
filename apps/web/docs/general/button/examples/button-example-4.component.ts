import { Component, input } from '@angular/core';
import { ButtonType, delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example4',
  template: `
    <xui-button type="raised" size="small"><xui-icon icon="check" /> Small</xui-button>
    <xui-button type="raised" size="medium"><xui-icon icon="check" /> Medium</xui-button>
    <xui-button type="raised" size="large"><xui-icon icon="check" /> Large</xui-button>
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
export class ButtonExample4Component {}
