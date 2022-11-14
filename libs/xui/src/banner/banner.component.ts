import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { InputBoolean } from '../utils';
import { BannerType } from './banner.types';

@Component({
  selector: 'xui-banner',
  exportAs: 'xuiBanner',
  styleUrls: ['banner.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './banner.component.html'
})
export class XuiBannerComponent {
  @Input() type: BannerType = 'info';
  @Input() stamp!: string;
  @Input() @InputBoolean() dismissible = false;
  @Output() bannerClose = new EventEmitter();

  get styles() {
    const ret: { [klass: string]: boolean } = {
      banner: true,
      dismissible: this.dismissible
    };
    ret[`type-${this.type}`] = true;

    return ret;
  }

  @HostListener('click')
  dismiss() {
    this.bannerClose.emit();
  }
}
