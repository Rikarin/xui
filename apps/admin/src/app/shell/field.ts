import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { XuiTextImports } from '@xui/text';

/**
 * A label and helper text around a control, for the controls `xui-form-field` cannot take.
 *
 * `xui-form-field` requires an `XFormFieldControl` among its children and throws during change
 * detection when it does not find one — and of the whole library only `xuiInput` provides that
 * token. A select, a textarea or a radio group inside one takes down the view it is in. This
 * component is the stand-in until `@xui/textarea` and `@xui/select` provide the token too, at which
 * point every use of it here should go back to being an `xui-form-field`.
 *
 * The markup deliberately mirrors `xui-form-field`'s, so the two are indistinguishable on screen.
 *
 * `labelFor` is optional because a radio group is labelled by its own `aria-label` rather than by a
 * `<label for>` — pointing a label at a group of radios names the wrong thing.
 */
@Component({
  selector: 'app-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiTextImports],
  host: { class: 'block space-y-2' },
  template: `
    @if (labelFor()) {
      <label class="text-foreground block text-sm font-medium" [attr.for]="labelFor()">{{ label() }}</label>
    } @else {
      <span class="text-foreground block text-sm font-medium">{{ label() }}</span>
    }

    <div class="space-y-1.5">
      <ng-content />

      @if (helperText()) {
        <span xuiText size="sm" color="subtle" class="block">{{ helperText() }}</span>
      }
    </div>
  `
})
export class Field {
  readonly label = input.required<string>();
  readonly helperText = input('');
  /** The id of the control this labels, when there is a single element to point at. */
  readonly labelFor = input('');
}
