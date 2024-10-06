import { Component, input } from '@angular/core';
import { ButtonType, delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example7',
  template: `
    <div>
      <xui-button color="primary" type="icon"><xui-icon icon="check" /></xui-button>
      <xui-button color="primary-alt" type="icon"><xui-icon icon="check" /></xui-button>
      <xui-button color="secondary" type="icon"><xui-icon icon="check" /></xui-button>
      <xui-button color="success" type="icon"><xui-icon icon="check" /></xui-button>
      <xui-button color="warning" type="icon"><xui-icon icon="check" /></xui-button>
      <xui-button color="error" type="icon"><xui-icon icon="check" /></xui-button>
      <xui-button color="info" type="icon"><xui-icon icon="check" /></xui-button>
    </div>
    <div>
      <xui-button color="primary" type="fab"><xui-icon icon="check" /></xui-button>
      <xui-button color="primary-alt" type="fab"><xui-icon icon="check" /></xui-button>
      <xui-button color="secondary" type="fab"><xui-icon icon="check" /></xui-button>
      <xui-button color="success" type="fab"><xui-icon icon="check" /></xui-button>
      <xui-button color="warning" type="fab"><xui-icon icon="check" /></xui-button>
      <xui-button color="error" type="fab"><xui-icon icon="check" /></xui-button>
      <xui-button color="info" type="fab"><xui-icon icon="check" /></xui-button>
    </div>
    <div>
      <xui-button color="primary" type="raised"><xui-icon icon="check" /></xui-button>
      <xui-button color="primary-alt" type="raised"><xui-icon icon="check" /></xui-button>
      <xui-button color="secondary" type="raised"><xui-icon icon="check" /></xui-button>
      <xui-button color="success" type="raised"><xui-icon icon="check" /></xui-button>
      <xui-button color="warning" type="raised"><xui-icon icon="check" /></xui-button>
      <xui-button color="error" type="raised"><xui-icon icon="check" /></xui-button>
      <xui-button color="info" type="raised"><xui-icon icon="check" /></xui-button>
    </div>
    <div>
      <xui-button color="primary" type="dashed"><xui-icon icon="check" /></xui-button>
      <xui-button color="primary-alt" type="dashed"><xui-icon icon="check" /></xui-button>
      <xui-button color="secondary" type="dashed"><xui-icon icon="check" /></xui-button>
      <xui-button color="success" type="dashed"><xui-icon icon="check" /></xui-button>
      <xui-button color="warning" type="dashed"><xui-icon icon="check" /></xui-button>
      <xui-button color="error" type="dashed"><xui-icon icon="check" /></xui-button>
      <xui-button color="info" type="dashed"><xui-icon icon="check" /></xui-button>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        gap: 8px;

        div {
          display: flex;
          justify-content: space-around;
          gap: 8px;
          flex-wrap: wrap;
        }
      }
    `
  ]
})
export class ButtonExample7Component {}
