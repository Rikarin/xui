import { Component } from '@angular/core';
import { delay } from '@xui/components';

@Component({
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
