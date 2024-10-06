import { Component, input } from '@angular/core';
import { ButtonType, delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example3',
  template: `
    <xui-button color="success" type="icon"><xui-icon icon="check" /></xui-button>
    <xui-button color="primary" type="normal"><xui-icon icon="check" /> Submit</xui-button>
    <xui-button color="secondary" type="dashed">Submit <xui-icon icon="check" /></xui-button>
    <xui-button color="success" type="raised"><xui-icon icon="check" /> Submit</xui-button>
    <xui-button color="warning" type="stroked"><xui-icon icon="check" /> Submit</xui-button>
    <xui-button color="error" type="fab"><xui-icon icon="check" /> Failed Successfully</xui-button>
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
export class ButtonExample3Component {}
