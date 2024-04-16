import { Injectable } from '@angular/core';
import { XuiSnackbarModule } from './snackbar.module';
import { SnackbarConfig } from '../config';

@Injectable({ providedIn: XuiSnackbarModule })
export class XuiSnackBar {
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
  open(message: string, action?: string, config?: SnackbarConfig): any {
    // MatSnackBarRef<TextOnlySnackBar> {
    //   return super.open(message, action!, config as MatSnackBarConfig);
  }
}
