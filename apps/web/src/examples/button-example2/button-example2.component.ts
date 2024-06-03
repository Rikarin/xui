import { Component } from '@angular/core';
import { XuiButtonModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiButtonModule],
  selector: 'app-button-example2',
  templateUrl: './button-example2.component.html',
  styleUrls: ['./button-example2.component.scss']
})
export class ButtonExample2Component {}
