import { Component } from '@angular/core';
import { XuiLayoutModule } from '@xui/components';

@Component({
  selector: 'app-layout-example1',
  standalone: true,
  imports: [XuiLayoutModule],
  templateUrl: './layout-example1.component.html',
  styleUrl: './layout-example1.component.scss'
})
export class LayoutExample1Component {}
