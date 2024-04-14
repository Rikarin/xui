import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { BadgeColor } from './badge.types';
import { BADGE_MODULE, WithConfig, XuiConfigService } from '../config';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`
})
export class XuiBadgeComponent {
  private readonly _moduleName = BADGE_MODULE;

  @Input() @WithConfig() color: BadgeColor = 'primary';

  @HostBinding('class.x-badge')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class')
  get hostClass(): string {
    return `x-badge-${this.color}`;
  }

  constructor(private configService: XuiConfigService) {}
}
