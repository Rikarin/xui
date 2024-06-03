import { Component } from '@angular/core';
import { XuiButtonModule, XuiCardModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiCardModule, XuiButtonModule],
  selector: 'app-card-example1',
  templateUrl: './card-example1.component.html',
  styleUrls: ['./card-example1.component.scss']
})
export class CardExample1Component {}
