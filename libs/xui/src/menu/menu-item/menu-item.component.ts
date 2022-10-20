import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnInit,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import { XuiSubmenuService } from '../submenu.service';
import { XuiMenuService } from '../menu.service';
import { combineLatest, filter, map } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NavigationEnd, Router } from '@angular/router';
import { InputBoolean } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'xui-menu-item',
  exportAs: 'xuiMemuItem',
  templateUrl: './menu-item.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.paddingLeft.px]': 'paddingLeft',
    '(click)': 'clickMenuItem($event)'
  }
})
export class XuiMenuItemComponent implements OnInit {
  @Input() icon: string;
  @Input() link: string;
  @Input() @InputBoolean() disabled = false;

  @HostBinding('class.xui-menu-item-selected') selected = false;

  get showLabel$() {
    return this.menuService.mode$.pipe(map(x => x === 'default'));
  }

  private level = (this.submenuService?.level ?? 0) + 1;
  paddingLeft: number = null;

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
