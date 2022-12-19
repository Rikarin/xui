import { BooleanInput } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { InputBoolean } from '../utils';
import { BannerType } from './banner.types';
import { BANNER_MODULE, WithConfig, XuiConfigService } from '../config';

@Component({
  selector: 'xui-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './banner.component.html'
})
export class BannerComponent {
  static ngAcceptInputType_dismissible: BooleanInput;
  private readonly _moduleName = BANNER_MODULE;

  @Input() @WithConfig() type: BannerType = 'info';
  @Input() stamp!: string;
  @Input() @InputBoolean() @WithConfig() dismissible = false;
  @Output() bannerClose = new EventEmitter();

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-banner': true,
      'x-banner-dismissible': this.dismissible
    };
    ret[`x-banner-${this.type}`] = true;

    return ret;
  }

  constructor(private configService: XuiConfigService) {}

  @HostListener('click')
  dismiss() {
    this.bannerClose.emit();
  }
}
