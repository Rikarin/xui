import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { MenuService } from './menu.service';
import { SubmenuService } from './submenu.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'xui-menu-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="x-menu-group-title" [style.paddingLeft.px]="paddingLeft">
      {{ title }}
    </div>
    <ng-content />`
})
export class MenuGroupComponent implements OnInit {
  @Input() title!: string;
  paddingLeft: number | null = null;
  private level = (this.submenuService?.level ?? 0) + 0.5;

  constructor(
    private cdr: ChangeDetectorRef,
    private menuService: MenuService,
    @Optional() private submenuService: SubmenuService
  ) {}

  ngOnInit() {
    combineLatest([this.menuService.mode$, this.menuService.inlineIndent$])
      .pipe(untilDestroyed(this))
      .subscribe(([mode, inlineIndent]) => {
        this.paddingLeft = mode === 'default' ? this.level * inlineIndent : null;
        this.cdr.markForCheck();
      });
  }
}
