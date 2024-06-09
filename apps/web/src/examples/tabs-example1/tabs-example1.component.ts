import { Component } from '@angular/core';
import { XuiTabModule } from '@xui/components';

@Component({
  selector: 'app-tabs-example1',
  standalone: true,
  imports: [XuiTabModule],
  templateUrl: './tabs-example1.component.html',
  styleUrl: './tabs-example1.component.scss'
})
export class TabsExample1Component {}
