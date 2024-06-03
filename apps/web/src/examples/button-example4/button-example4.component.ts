import { Component } from '@angular/core';
import { delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example4',
  templateUrl: './button-example4.component.html',
  styleUrls: ['./button-example4.component.scss']
})
export class ButtonExample4Component {
  work = async () => {
    await delay(2000);
    return Math.random() >= 0.5;
  };
}
