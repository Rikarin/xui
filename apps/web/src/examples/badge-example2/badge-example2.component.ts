import { Component } from '@angular/core';
import { XuiBadge, XuiConfigModule } from '@xui/components';
import { XuiBadgeConfigure } from '../../../../../libs/xui/src/badge/badge.configure';

@Component({
  standalone: true,
  imports: [XuiBadge, XuiBadgeConfigure],
  selector: 'app-badge-example2',
  templateUrl: './badge-example2.component.html',
  styleUrls: ['./badge-example2.component.scss']
})
export class BadgeExample2Component {}
