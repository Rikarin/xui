import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  Output
} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { CdkPortalOutletAttachedRef, ComponentPortal } from '@angular/cdk/portal';
import { SettingsPage } from './settings.types';
import { animate, AnimationEvent, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { bounce, fadeInBottom, fadeOutBottom } from '../utils/animations';
import { lastValueFrom, Subject } from 'rxjs';
import { delay } from '../utils';

@Component({
  selector: 'xui-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
  animations: [
    trigger('bounce', [transition('* => *', useAnimation(bounce))]),
    trigger('open', [
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'scale(1.05)'
        })
      ),
      state(
        'opened',
        style({
          opacity: 1,
          transform: 'scale(1)'
        })
      ),
      transition('* => *', animate(100))
    ])
  ]
})
export class SettingsComponent {
  mouseDown = false;
  menuFocused = false;
  focusedItem?: number;

  defaultPage = 1;
  opened = false;
  openedAnimation: 'opened' | 'closed' = 'closed';
  animationState = false;

  portal?: ComponentPortal<SettingsPage>;
  instance?: SettingsPage;

  private snackbarRef?: MatSnackBarRef<SaveResetSnackbarComponent>;
  private canExit = true;

  @Input() items?: MenuItem[];
  @Output() afterClosed = new EventEmitter<void>();

  @HostListener('document:keydown.escape') onKeydownHandler() {
    this.close();
  }

  constructor(private snackBar: MatSnackBar, private changeDetectorRef: ChangeDetectorRef) {}

  stateChanged = (canExit: boolean) => {
    this.canExit = canExit;

    if (!canExit) {
      if (!this.snackbarRef) {
        this.snackbarRef = this.snackBar.openFromComponent(SaveResetSnackbarComponent, {
          panelClass: 'x-settings-snackbar',
          duration: undefined!,
          data: {
            save: async () => {
              try {
                await this.instance?.save();
                await this.hideSnackbar();
                this.changeDetectorRef.markForCheck();
              } catch (e) {
                // TODO: show error snackbar
              }
            },
            reset: async () => {
              await this.instance?.reset();
              await this.hideSnackbar();
              this.changeDetectorRef.markForCheck();
            }
          }
        });
      }
    } else {
      this.hideSnackbar();
    }
  };

  open(page = 1) {
    this.defaultPage = page;
    this.opened = true;
    this.openedAnimation = 'opened';
    this.navigate(this.defaultPage);
    this.changeDetectorRef.markForCheck();
  }

  async close() {
    if (!this.canExit) {
      this.animationState = true;
      this.snackbarRef?.instance.alert();
      return;
    }

    this.openedAnimation = 'closed';
    await delay(100);
    this.opened = false;
    this.afterClosed.emit();
    this.changeDetectorRef.markForCheck();
  }

  attached(ref: CdkPortalOutletAttachedRef) {
    this.instance = (ref as ComponentRef<SettingsPage>).instance;
    this.instance.stateChanged = this.stateChanged;
  }

  navigate(idx: number) {
    if (this.instance) {
      if (!this.canExit) {
        return;
      }
    }

    const item = this.items?.[idx];
    if (item) {
      this.defaultPage = idx;
      this.focusedItem = idx;

      if (item.action) {
        item.action();
      } else if (item.component) {
        this.portal = new ComponentPortal(item.component);
      }
    }
  }

  focusPrev() {
    let cur = this.focusedItem ?? this.items?.length ?? 0;

    do {
      cur--;
      if (cur < 0) {
        cur = (this.items?.length ?? 1) - 1;
      }
    } while (this.items?.[cur].type !== 'item');
    this.focusedItem = cur;
  }

  focusNext() {
    let cur = this.focusedItem ?? this.items?.length ?? 0;

    do {
      cur++;
      if (cur >= (this.items?.length ?? 0)) {
        cur = 0;
      }
    } while (this.items?.[cur].type !== 'item');
    this.focusedItem = cur;
  }

  private async hideSnackbar() {
    await this.snackbarRef?.instance.close();
    this.snackbarRef?.dismiss();
    this.snackbarRef = undefined;
    this.canExit = true;
  }
}

export interface MenuItem {
  type: 'category' | 'item' | 'divider';
  name?: string;
  critical?: boolean;
  component?: any;
  action?: () => void;
}

@Component({
  selector: 'xui-settings-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    {{ 'xui.settings.save_changes_text' | translate }}
    <div>
      <xui-button size="small" color="minimal" [onClick]="reset">{{ 'xui.settings.reset' | translate }}</xui-button>
      <xui-button size="small" color="success" type="raised" [onClick]="save">
        {{ 'xui.settings.save' | translate }}
      </xui-button>
    </div>
  `,
  animations: [
    trigger('fade', [
      state(
        'close',
        style({
          display: 'none'
        })
      ),
      state(
        'alert',
        style({
          backgroundColor: 'var(--color-error-darker)',
          transform: 'scale(1.1)'
        })
      ),
      transition('open => alert', animate(200)),
      transition('alert => open', animate(200)),
      transition('open => close', useAnimation(fadeOutBottom)),
      transition('void => open', useAnimation(fadeInBottom))
    ])
  ]
})
export class SaveResetSnackbarComponent {
  _doneAnimating = new Subject();

  @HostBinding('@fade')
  animation = 'open';

  constructor(@Inject(MAT_SNACK_BAR_DATA) private data: any, private changeDetectorRef: ChangeDetectorRef) {}

  async close() {
    this.animation = 'close';
    return await lastValueFrom(this._doneAnimating.asObservable());
  }

  async alert() {
    this.animation = 'alert';
    await delay(1000);
    this.animation = 'open';
    this.changeDetectorRef.markForCheck();
  }

  save = () => {
    return this.data.save();
  };

  reset = () => {
    return this.data.reset();
  };

  @HostListener('@fade.done', ['$event'])
  _animationDone(event: AnimationEvent) {
    if (event.toState === 'close') {
      this._doneAnimating.next(undefined);
      this._doneAnimating.complete();
    }
  }
}
