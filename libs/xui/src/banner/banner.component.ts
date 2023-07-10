import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output
} from '@angular/core';
import { InputBoolean } from '../utils';
import { BannerType } from './banner.types';
import { BANNER_MODULE, WithConfig, XuiConfigService } from '../config';
import { CommonModule } from '@angular/common';
import { XuiIconComponent } from '../icon';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIconComponent],
  selector: 'xui-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './banner.component.html'
})
export class XuiBannerComponent {
  static ngAcceptInputType_dismissible: BooleanInput;
  private readonly _moduleName = BANNER_MODULE;

  @Input() @WithConfig() type: BannerType = 'info';
  @Input() stamp!: string;
  @Input() @InputBoolean() @WithConfig() dismissible = false;
  @Output() bannerClose = new EventEmitter();

  @HostBinding('class.x-banner')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-banner-dismissible')
  get hostDismissibleClass(): boolean {
    return this.dismissible;
  }

  @HostBinding('class')
  get hostClass(): string {
    return `x-banner-${this.type}`;
  }

  constructor(private configService: XuiConfigService) {}

  @HostListener('click')
  dismiss() {
    this.bannerClose.emit();
  }
}
