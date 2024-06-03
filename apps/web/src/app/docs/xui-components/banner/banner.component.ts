import { Component } from '@angular/core';
import { Example, FileType } from '../../components/example';
import { Information } from '../../components/information';
import { HighlightModule } from 'ngx-highlightjs';
import { BannerExample1Component } from '../../../../examples/banner-example1/banner-example1.component';

@Component({
  standalone: true,
  imports: [Information, Example, HighlightModule, BannerExample1Component],
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {
  readonly example1 = {
    'banner-example1': FileType.Component
  };
}
