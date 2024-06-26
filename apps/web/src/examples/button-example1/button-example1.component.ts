import { Component } from '@angular/core';
import { delay, XuiButtonModule, XuiIcon } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule, XuiIcon],
  selector: 'app-button-example1',
  templateUrl: './button-example1.component.html',
  styleUrls: ['./button-example1.component.scss']
})
export class ButtonExample1Component {
  counter = 0;

  work = async () => {
    await delay(2000);
    return Math.random() >= 0.5;
  };
}
