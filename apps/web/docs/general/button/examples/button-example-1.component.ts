import { Component } from '@angular/core';
import { delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example1',
  template: ` <div class="flex-container">
      <xui-button color="primary" type="normal" [onClick]="work">Normal</xui-button>
      <xui-button color="primary" type="raised" [onClick]="work">Raised</xui-button>
      <xui-button color="primary" type="dashed" [onClick]="work">Dashed</xui-button>
      <xui-button color="primary" type="stroked" [onClick]="work">Stroked</xui-button>
      <xui-button color="primary" type="fab" [onClick]="work">Fab</xui-button>
      <xui-button color="primary" type="icon"><xui-icon icon="menu"></xui-icon></xui-button>
      <xui-button color="success" type="raised" shine [onClick]="work">Raised Shine</xui-button>
      <xui-button color="success" type="raised" shine (click)="counter = counter + 1">
        <xui-icon icon="local_police"></xui-icon>
        Raised Shine
      </xui-button>
    </div>
    Counter <strong>{{ counter }}</strong>`,
  styles: [
    `
      .flex-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    `
  ]
})
export class ButtonExample1Component {
  counter = 0;

  work = async () => {
    await delay(2000);
    return Math.random() >= 0.5;
  };
}
