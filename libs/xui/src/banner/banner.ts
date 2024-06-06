import { ChangeDetectionStrategy, Component, EventEmitter, Inject, input, Optional, Output } from '@angular/core';
import { BannerType, XUI_BANNER_DEFAULT_OPTIONS, XuiBannerOptions } from './banner.types';
import { CommonModule } from '@angular/common';
import { XuiIcon } from '../icon';
import { convertToBoolean } from '../utils';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIcon],
  selector: 'xui-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'banner.html',
  host: {
    class: 'x-banner',
    '[class]': '"x-banner-" + type()',
    '[class.x-banner-dismissible]': 'dismissible()',
    '(click)': 'bannerClose.emit()'
  }
})
export class XuiBanner {
  type = input<BannerType>(this.options?.type ?? 'info');
  stamp = input<string>();
  dismissible = input(this.options?.dismissible ?? false, { transform: (v: string | boolean) => convertToBoolean(v) });

  @Output() bannerClose = new EventEmitter();

  constructor(@Optional() @Inject(XUI_BANNER_DEFAULT_OPTIONS) private options?: XuiBannerOptions) {}
}
