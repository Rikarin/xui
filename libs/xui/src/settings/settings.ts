import { ChangeDetectionStrategy, Component, ComponentRef, EventEmitter, input, Output, signal } from '@angular/core';
import { CdkPortalOutletAttachedRef, ComponentPortal } from '@angular/cdk/portal';
import { MenuItem, SettingsPage } from './settings.types';
import { animate, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { bounce } from '../utils/animations';
import { delay } from '../utils';
import { SnackBarRef, XuiSnackBar } from '../snack-bar';
import { SaveResetSnackbar } from './settings-snackbar';

@Component({
  selector: 'xui-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'settings.html',
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
  ],
  host: {
    '(document:keydown.escape)': 'close()'
  }
})
export class XuiSettings {
  private instance?: SettingsPage;
  private snackbarRef?: SnackBarRef<SaveResetSnackbar>;
  private canExit = true;

  _portal?: ComponentPortal<SettingsPage>;
  _animationState = false;
  _mouseDown = false;
  _menuFocused = false;

  _focusedItem = signal<number | null>(null);
  _defaultPage = signal(1);
  _isOpened = signal(false);
  _openedAnimation = signal<'opened' | 'closed'>('closed');

  items = input<MenuItem[]>();
  @Output() afterClosed = new EventEmitter<void>();

  constructor(private snackBar: XuiSnackBar) {}

  stateChanged = (canExit: boolean) => {
    this.canExit = canExit;

    if (!canExit) {
      if (!this.snackbarRef) {
        this.snackbarRef = this.snackBar.openFromComponent(SaveResetSnackbar, {
          panelClass: 'x-settings-snackbar-panel',
          duration: undefined!,
          data: {
            save: async () => {
              try {
                await this.instance?.save();
                await this.hideSnackbar();
              } catch (e) {
                // TODO: show error snackbar
              }
            },
            reset: async () => {
              await this.instance?.reset();
              await this.hideSnackbar();
            }
          }
        });
      }
    } else {
      this.hideSnackbar();
    }
  };

  open(page = 1) {
    this._defaultPage.set(page);
    this._isOpened.set(true);
    this._openedAnimation.set('opened');
    this._navigate(this._defaultPage());
  }

  async close() {
    if (!this.canExit) {
      this._animationState = true;
      this.snackbarRef?.instance.alert();
      return;
    }

    this._openedAnimation.set('closed');
    await delay(100);
    this._isOpened.set(false);
    this.afterClosed.emit();
  }

  attached(ref: CdkPortalOutletAttachedRef) {
    this.instance = (ref as ComponentRef<SettingsPage>).instance;
    this.instance.stateChanged = this.stateChanged;
  }

  _navigate(idx: number) {
    if (this.instance) {
      if (!this.canExit) {
        return;
      }
    }

    const item = this.items()?.[idx];
    if (item) {
      this._defaultPage.set(idx);
      this._focusedItem.set(idx);

      if (item.action) {
        item.action();
      } else if (item.component) {
        this._portal = new ComponentPortal(item.component);
      }
    }
  }

  _focusPrev() {
    let cur = this._focusedItem() ?? this.items()?.length ?? 0;

    do {
      cur--;
      if (cur < 0) {
        cur = (this.items()?.length ?? 1) - 1;
      }
    } while (this.items()?.[cur].type !== 'item');
    this._focusedItem.set(cur);
  }

  _focusNext() {
    let cur = this._focusedItem() ?? this.items()?.length ?? 0;

    do {
      cur++;
      if (cur >= (this.items()?.length ?? 0)) {
        cur = 0;
      }
    } while (this.items()?.[cur].type !== 'item');
    this._focusedItem.set(cur);
  }

  private async hideSnackbar() {
    await this.snackbarRef?.instance.close();
    this.snackbarRef?.dismiss();
    this.snackbarRef = undefined;
    this.canExit = true;
  }
}
