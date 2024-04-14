import { Inject, Injectable, InjectionToken, Injector, Optional, SkipSelf } from '@angular/core';
import {
  // _MatSnackBarBase,
  MatSnackBarConfig,
  MatSnackBarContainer,
  MatSnackBarRef,
  TextOnlySnackBar
} from '@angular/material/snack-bar';
import { Overlay } from '@angular/cdk/overlay';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { XuiSnackbarModule } from './snackbar.module';
import { XuiSnackBarConfig } from './snack-bar-config';
import { SimpleSnackBar } from './simple-snackbar.component';

@Injectable({ providedIn: XuiSnackbarModule })
export class XuiSnackBar /* extends _MatSnackBarBase */ {
  // protected override simpleSnackBarComponent = SimpleSnackBar;
  // protected override snackBarContainerComponent = MatSnackBarContainer;
  // protected override handsetCssClass = 'mat-mdc-snack-bar-handset';

  // constructor(
  //   overlay: Overlay,
  //   live: LiveAnnouncer,
  //   injector: Injector,
  //   breakpointObserver: BreakpointObserver,
  //   @Optional() @SkipSelf() parentSnackBar: XuiSnackBar,
  //   @Inject(XUI_SNACK_BAR_DEFAULT_OPTIONS) defaultConfig: XuiSnackBarConfig
  // ) {
  //   super(overlay, live, injector, breakpointObserver, parentSnackBar, defaultConfig as MatSnackBarConfig);
  // }
  //
  open(message: string, action?: string, config?: XuiSnackBarConfig): any {
    // MatSnackBarRef<TextOnlySnackBar> {
    //   return super.open(message, action!, config as MatSnackBarConfig);
  }
}

export function XUI_SNACK_BAR_DEFAULT_OPTIONS_FACTORY(): XuiSnackBarConfig {
  return new XuiSnackBarConfig();
}

export const XUI_SNACK_BAR_DEFAULT_OPTIONS = new InjectionToken<XuiSnackBarConfig>('xui-snack-bar-default-options', {
  providedIn: 'root',
  factory: XUI_SNACK_BAR_DEFAULT_OPTIONS_FACTORY
});
