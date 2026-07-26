# Form rules

## Field layout

`<xui-form-field>` owns the label, helper text and error slot for one control. It takes the label
as an input rather than as projected content, and projects the control itself:

```html
<xui-form-field label="Email" subLabel="Work address" helperText="We only use this for receipts">
  <input xuiInput type="email" [formControl]="email" />
  <xui-error>Enter a valid email address.</xui-error>
  <xui-hint>Company domains only.</xui-hint>
</xui-form-field>
```

- `label`, `labelInfo`, `subLabel`, `helperText`, `color`, `inline` are the field's inputs.
- `<xui-error>` is for validation messages, `<xui-hint>` for persistent guidance.
- `color="error"` on the field and `error` on the control keep the two visually in sync.
- The projected control must provide `XFormFieldControl` (`@xui/core/form-field`) — the field
  throws otherwise. `xuiInput`, `xuiTextarea`, `xui-select`, `xui-numeric-input`, `xui-file-input`
  and `xui-html-select` all provide it; anything else (a radio group, a switch) belongs on the
  bare-control pattern below instead.

For a bare control outside a form field, label it with `[xuiLabel]` (or `aria-label` when the
visible text already names it):

```html
<label xuiLabel class="grid gap-1.5">
  Email
  <input xuiInput type="email" [formControl]="email" />
</label>
```

Never leave a control unlabelled: `placeholder` is not a label.

## Reactive forms

Every value-carrying component implements `ControlValueAccessor`, so `formControl`,
`formControlName` and `ngModel` work as usual - and so does `[(value)]` / `[(checked)]` when a
signal is simpler than a form:

```html
<input xuiInput [formControl]="name" />
<xui-select [items]="users" [itemText]="itemText" formControlName="owner" />
<xui-checkbox label="Send receipts" [formControl]="receipts" />
<xui-radio-group formControlName="plan"><xui-radio value="free" /></xui-radio-group>
```

Disabled state comes from the form (`control.disable()`), not from the `disabled` input, when a
control is bound to a form - mixing the two makes the DOM and the form disagree.

## Grouping

- `[xuiControlGroup]` joins adjacent controls into one visual unit (input + button, select +
  input). It is layout, not semantics.
- `<xui-input-group>` with `[xuiInputLeftElement]` / `[xuiInputRightElement]` puts icons or
  affordances inside the field.
- `xui-control-card` wraps a checkbox/radio/switch and its description into a selectable card.
- 2-7 mutually exclusive options: `xui-segmented-control` reads better than a select.

## Writing a form control (library code)

Inside the monorepo, a new control follows the existing ones:

- Implement `ControlValueAccessor` and reuse `ChangeFn` / `TouchFn` from `@xui/core/forms`.
- Implement `XFormFieldControl` from `@xui/core/form-field` so `<xui-form-field>` can wire the
  label, `aria-describedby` and error state to it.
- Expose the value as a `model()` so template-only usage works without a form.
- Mark touched on blur, not on every keystroke, or error messages flash while typing.
- Wire `id`, `aria-labelledby`, `aria-describedby`, `required` and `disabled` on the real focusable
  element - the host wrapper is not what assistive technology reads.
