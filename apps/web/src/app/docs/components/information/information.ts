import { Component, Input } from '@angular/core';
import { XuiCardModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiCardModule],
  selector: 'app-information',
  templateUrl: 'information.html',
  styleUrls: ['information.scss']
})
export class Information {
  @Input() title?: string;
}
