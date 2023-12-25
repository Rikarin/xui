import { Component } from '@angular/core';
import { FileType } from '../../components/example/example.component';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {
  readonly example1 = {
    'banner-example1': FileType.Component
  };
}
