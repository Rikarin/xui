import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { InputBoolean } from '../util/convert';

@Component({
  selector: 'xui-banner',
  exportAs: 'xuiBanner',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './banner.component.html',
  host: {
    '[class]': 'getStyle()',
    '[class.xui-banner-dismissable]': 'dismissable',
    '(click)': 'dismiss()'
  }
})
export class XuiBannerComponent {
  @Input() type: 'info' | 'success' | 'warning' | 'alert' = 'info';
  @Input() stamp: string;
  @Input() @InputBoolean() dismissable: boolean;

  @Output() bannerClose = new EventEmitter();

  private getStyle() {
    return `xui-banner-${this.type}`;
  }

  dismiss() {
    this.bannerClose.emit();
  }
}
