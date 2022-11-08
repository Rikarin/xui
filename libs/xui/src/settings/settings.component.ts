import {
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

@Component({
  selector: 'xui-settings',
  exportAs: 'xuiSettings',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './settings.component.html'
})
export class XuiSettingsComponent implements OnInit {
  @Input() defaultPage = 1;
  @Input() items?: MenuItem[];
  @Output() onClosed = new EventEmitter<void>();

  opened = false;

  portal?: ComponentPortal<SettingsPage>;
  instance?: SettingsPage;

  private snackbarRef?: MatSnackBarRef<any>;
  private canExit = true;

  @HostListener('document:keydown.escape') onKeydownHandler() {
    this.close();
  }

  constructor(private snackBar: MatSnackBar, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.navigate(this.defaultPage);
  }

  stateChanged = (canExit: boolean) => {
    this.canExit = canExit;

    if (!canExit) {
      if (!this.snackbarRef) {
        this.snackbarRef = this.snackBar.openFromComponent(SaveResetSnackbarComponent, {
          panelClass: 'xui-settings-save-reset-snackbar',
          data: {
            save: async () => {
              try {
                await this.instance?.save();
                this.hideSnackbar();
                this.changeDetectorRef.markForCheck();
              } catch (e) {
                // TODO: show error snackbar
              }
            },
            reset: async () => {
              await this.instance?.reset();
              this.hideSnackbar();
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
  }

  close() {
    if (!this.canExit) {
      return;
    }

    this.opened = false;
    this.onClosed.emit();
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

  private hideSnackbar() {
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
  template: `
    {{ 'xui.settings.save-changes-text' | translate }}
    <div>
      <button xui xSize="sm" xColor="minimal" (click)="reset()" translate>xui.settings.reset</button>
      <button xui xSize="sm" xColor="success" xType="raised" (click)="save()" translate>
        xui.settings.save-changes
      </button>
    </div>
  `
})
export class SaveResetSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) private data: any) {}

  save() {
    this.data.save();
  }

  reset() {
    this.data.reset();
  }
}
