import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnInit,
  Optional
} from '@angular/core';
import { XuiSubmenuService } from './submenu.service';
import { XuiMenuService } from './menu.service';
import { combineLatest, filter, map } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NavigationEnd, Router } from '@angular/router';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';

@UntilDestroy()
@Component({
  selector: 'xui-menu-item',
  exportAs: 'xuiMemuItem',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="icon">
      <xui-icon>{{ icon }}</xui-icon>
    </ng-container>
    <ng-content *ngIf="showLabel$ | async"></ng-content>
  `,
  host: {
    class: 'x-menu-item x-menu-hover',
    '[style.paddingLeft.px]': 'paddingLeft',
    '(click)': 'clickMenuItem($event)'
  }
})
export class XuiMenuItemComponent implements OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() icon!: string;
  @Input() link!: string;
  @Input() @InputBoolean() disabled = false;

  @HostBinding('class.x-menu-item-selected') selected = false;

  get showLabel$() {
    return this.menuService.mode$.pipe(map(x => x === 'default'));
  }

  private level = (this.submenuService?.level ?? 0) + 1;
  paddingLeft: number | null = null;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private menuService: XuiMenuService,
    @Optional() private submenuService: XuiSubmenuService
  ) {}

  ngOnInit() {
    combineLatest([this.menuService.mode$, this.menuService.inlineIndent$])
      .pipe(untilDestroyed(this))
      .subscribe(([mode, inlineIndent]) => {
        this.paddingLeft = mode === 'default' ? this.level * inlineIndent : null;
        this.cdr.markForCheck();
      });

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter(x => x instanceof NavigationEnd),
        map(x => (x as NavigationEnd).url === this.link)
      )
      .subscribe(selected => (this.selected = selected));
  }

  clickMenuItem(e: MouseEvent) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      // Do stuff
      this.router.navigateByUrl(this.link);
    }
  }
}
