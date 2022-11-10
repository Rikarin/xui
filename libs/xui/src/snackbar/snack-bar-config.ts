import { AriaLivePoliteness } from '@angular/cdk/a11y';
import { ViewContainerRef } from '@angular/core';
import { Direction } from '@angular/cdk/bidi';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

export const XUI_SNACK_BAR_DATA = MAT_SNACK_BAR_DATA;

export class XuiSnackBarConfig<D = any> {
  /** The politeness level for the MatAriaLiveAnnouncer announcement. */
  politeness?: AriaLivePoliteness = 'assertive';

  /**
   * Message to be announced by the LiveAnnouncer. When opening a snackbar without a custom
   * component or template, the announcement message will default to the specified message.
   */
  announcementMessage?: string = '';

  /**
   * The view container that serves as the parent for the snackbar for the purposes of dependency
   * injection. Note: this does not affect where the snackbar is inserted in the DOM.
   */
  viewContainerRef?: ViewContainerRef;

  /** The length of time in milliseconds to wait before automatically dismissing the snack bar. */
  duration?: number = 3000;

  /** Extra CSS classes to be added to the snack bar container. */
  panelClass?: string | string[] = 'xui-snackbar';

  /** Text layout direction for the snack bar. */
  direction?: Direction;

  /** Data being injected into the child component. */
  data?: D | null = null;

  /** The horizontal position to place the snack bar. */
  horizontalPosition?: MatSnackBarHorizontalPosition = 'center';

  /** The vertical position to place the snack bar. */
  verticalPosition?: MatSnackBarVerticalPosition = 'bottom';
}
