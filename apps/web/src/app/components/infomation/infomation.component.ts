import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-infomation',
  templateUrl: './infomation.component.html',
  styleUrls: ['./infomation.component.scss']
})
export class InfomationComponent {
  @Input() title?: string;
}
