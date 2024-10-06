import { Component, input } from '@angular/core';
import { ButtonType, delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example2',
  template: `
    <xui-button color="primary" [type]="type()">Submit</xui-button>
    <xui-button color="primary-alt" [type]="type()">Submit</xui-button>
    <xui-button color="secondary" [type]="type()">Submit</xui-button>
    <xui-button color="success" [type]="type()">Submit</xui-button>
    <xui-button color="warning" [type]="type()">Submit</xui-button>
    <xui-button color="error" [type]="type()">Submit</xui-button>
    <xui-button color="info" [type]="type()">Submit</xui-button>
    <xui-button color="minimal" [type]="type()">Submit</xui-button>
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
export class ButtonExample2Component {
  type = input<ButtonType>('normal');
}
