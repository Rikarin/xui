import { Component } from '@angular/core';
import { XuiIcon } from '@xui/components';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [XuiIcon, RouterModule],
  selector: 'app-components-overview',
  templateUrl: './components-overview.component.html',
  styleUrls: ['./components-overview.component.scss']
})
export class ComponentsOverviewComponent {}
