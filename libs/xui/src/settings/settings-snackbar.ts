import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
import { animate, AnimationEvent, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { fadeInBottom, fadeOutBottom } from '../utils/animations';
import { lastValueFrom, Subject } from 'rxjs';
import { delay } from '../utils';
import { XUI_SNACK_BAR_DATA } from '../snack-bar';

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
  ],
  host: {
    class: 'x-settings-snackbar',
    '[@fade]': '_animation()',
    '(@fade.done)': '_animationDone($event)'
  }
})
export class SaveResetSnackbar {
  _doneAnimating = new Subject();
  _animation = signal('open');

  constructor(@Inject(XUI_SNACK_BAR_DATA) private data: any) {}

  async close() {
    this._animation.set('close');
    return await lastValueFrom(this._doneAnimating.asObservable());
  }

  async alert() {
    this._animation.set('alert');
    await delay(1000);
    this._animation.set('open');
  }

  save = () => this.data.save();
  reset = () => this.data.reset();

  _animationDone(event: AnimationEvent) {
    if (event.toState === 'close') {
      this._doneAnimating.next(undefined);
      this._doneAnimating.complete();
    }
  }
}
