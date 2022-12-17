import { BooleanInput } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { InputBoolean } from '../utils';
import { BannerType } from './banner.types';

@Component({
  selector: 'xui-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './banner.component.html'
})
export class BannerComponent {
  static ngAcceptInputType_dismissible: BooleanInput;

  @Input() type: BannerType = 'info';
  @Input() stamp!: string;
  @Input() @InputBoolean() dismissible = false;
  @Output() bannerClose = new EventEmitter();

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-banner': true,
      'x-banner-dismissible': this.dismissible
    };
    ret[`x-banner-${this.type}`] = true;

    return ret;
  }

  @HostListener('click')
  dismiss() {
    this.bannerClose.emit();
  }
}
