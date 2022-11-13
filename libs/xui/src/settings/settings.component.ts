import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { CdkPortalOutletAttachedRef, ComponentPortal } from '@angular/cdk/portal';
import { SettingsPage } from './settings-page';
import { animate, AnimationEvent, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { bounce, fadeInBottom, fadeOutBottom } from '../utils/animations';
import { lastValueFrom, Subject } from 'rxjs';
import { delay, InputNumber } from '../utils';

@Component({
  selector: 'xui-settings',
  exportAs: 'xuiSettings',
  styleUrls: ['settings.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
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
export class XuiSettingsComponent implements OnInit {
  @Input() @InputNumber() defaultPage = 1;
  @Input() items?: MenuItem[];
  @Output() onClosed = new EventEmitter<void>();

  opened = false;
  openedAnimation: 'opened' | 'closed' = 'closed';
  animationState = false;

  portal?: ComponentPortal<SettingsPage>;
  instance?: SettingsPage;

  private snackbarRef?: MatSnackBarRef<SaveResetSnackbarComponent>;
  private canExit = true;

  @HostListener('document:keydown.escape') onKeydownHandler() {
    this.close();
  }

  constructor(private snackBar: MatSnackBar, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {}

  stateChanged = (canExit: boolean) => {
    this.canExit = canExit;

    if (!canExit) {
      if (!this.snackbarRef) {
        this.snackbarRef = this.snackBar.openFromComponent(SaveResetSnackbarComponent, {
          panelClass: 'xui-settings-save-reset-snackbar',
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

  open() {
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
    this.onClosed.emit();
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

      if (item.action) {
        item.action();
      } else if (item.component) {
        this.portal = new ComponentPortal(item.component);
      }
    }
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
  selector: 'xui-settings-save-reset-snackbar',
  styleUrls: ['settings-snackbar.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    {{ 'xui.settings.save_changes_text' | translate }}
    <div>
      <xui-button size="sm" color="minimal" [onClick]="reset">{{ 'xui.settings.reset' | translate }}</xui-button>
      <xui-button size="sm" color="success" type="raised" [onClick]="save">
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
          backgroundColor: 'var(--error-color-darker)',
          transform: 'scale(1.1)'
        })
      ),
      transition('open => alert', animate(200)),
      transition('alert => open', animate(200)),
      transition('open => close', useAnimation(fadeOutBottom)),
      transition('void => open', useAnimation(fadeInBottom))
    ])
  ],
  host: {
    '[@fade]': 'animation',
    '(@fade.done)': '_animationDone($event)'
  }
})
export class SaveResetSnackbarComponent {
  animation = 'open';
  _doneAnimating = new Subject();

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

  _animationDone(event: AnimationEvent) {
    if (event.toState === 'close') {
      this._doneAnimating.next(undefined);
      this._doneAnimating.complete();
    }
  }
}
