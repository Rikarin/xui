import { Component } from '@angular/core';
import { XuiButtonModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule],
  selector: 'app-button-example3',
  templateUrl: './button-example3.component.html',
  styleUrls: ['./button-example3.component.scss']
})
export class ButtonExample3Component {
  clickOnDisabled() {
    alert('foo bar');
  }
}
