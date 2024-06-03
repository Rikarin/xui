import { transition, trigger, AnimationTriggerMetadata, useAnimation } from '@angular/animations';
import { fadeInBottom, fadeOutBottom } from '../utils/animations';

/**
 * Animations used by the snack bar.
 * @docs-private
 */
export const xuiSnackBarAnimations: {
  readonly snackBarState: AnimationTriggerMetadata;
} = {
  /** Animation that shows and hides a snack bar. */
  snackBarState: trigger('state', [
    transition('* => visible', useAnimation(fadeInBottom)),
    transition('* => void, * => hidden', useAnimation(fadeOutBottom))
  ])
};
