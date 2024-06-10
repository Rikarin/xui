import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  input,
  OnInit,
  Optional
} from '@angular/core';
import { XuiSubmenuService } from './submenu.service';
import { XuiMenuService } from './menu.service';
import { filter, map } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NavigationEnd, Router } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'xui-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (icon()) {
      <xui-icon [icon]="icon()"></xui-icon>
    }

    @if (_showLabel()) {
      <ng-content />
    }
  `,
  host: {
    class: 'x-menu-item x-menu-hover',
    '[style.paddingLeft.px]': '_paddingLeft()',
    '(click)': 'clickMenuItem($event)'
  }
})
export class XuiMenuItem implements OnInit {
  private level = (this.submenuService?.level ?? 0) + 1;
  _paddingLeft = computed(() =>
    this.menuService._mode() === 'default' ? this.level * this.menuService._inlineIndent() : null
  );
  _showLabel = computed(() => this.menuService._mode() === 'default');

  icon = input<string>();
  link = input<string>();
  disabled = input(false, { transform: booleanAttribute });

  @HostBinding('class.x-menu-item-selected') selected = false;

  constructor(
    private router: Router,
    private menuService: XuiMenuService,
    @Optional() private submenuService: XuiSubmenuService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        untilDestroyed(this),
        filter(x => x instanceof NavigationEnd),
        map(x => (x as NavigationEnd).url === this.link())
      )
      .subscribe(selected => (this.selected = selected));
  }

  clickMenuItem(e: MouseEvent) {
    if (this.disabled()) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      // Do stuff
      if (this.link() != undefined) {
        this.router.navigateByUrl(this.link()!);
      }
    }
  }
}
