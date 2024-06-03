import { Component } from '@angular/core';
import { XuiBanner } from '@xui/components';

@Component({
  standalone: true,
  imports: [XuiBanner],
  selector: 'app-banner-example1',
  templateUrl: './banner-example1.component.html',
  styleUrls: ['./banner-example1.component.scss']
})
export class BannerExample1Component {}
