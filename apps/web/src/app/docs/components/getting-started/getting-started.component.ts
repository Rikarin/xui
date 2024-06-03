import { Component } from '@angular/core';
import { XuiCardModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiCardModule],
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent {}
