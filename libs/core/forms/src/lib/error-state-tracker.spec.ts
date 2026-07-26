import { Directive, inject, Injector } from '@angular/core';
import { FormControl, FormGroupDirective, NgControl, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { render } from '@xui/testing';
import { XErrorStateMatcher, XShowOnDirtyErrorStateMatcher } from './error-options';
import { XErrorStateTracker } from './error-state-tracker';

@Directive({ selector: '[xTrackErrors]' })
class TrackErrorsDirective {
  private readonly injector = inject(Injector);

  readonly tracker = new XErrorStateTracker(
    inject(XErrorStateMatcher),
    this.injector.get(NgControl, null),
    inject(FormGroupDirective, { optional: true }),
    inject(NgForm, { optional: true })
  );
}

const setup = (control: FormControl) => {
  const result = render('<input xTrackErrors [formControl]="props().control" />', {
    imports: [TrackErrorsDirective, ReactiveFormsModule],
    props: { control }
  });
  const tracker = result.fixture.debugElement.children[0].injector.get(TrackErrorsDirective).tracker;

  return { ...result, tracker };
};

describe('XErrorStateTracker', () => {
  it('reports an error once an invalid control is touched — without a change-detection sweep', () => {
    const control = new FormControl('', Validators.required);
    const { tracker } = setup(control);

    expect(tracker.errorState()).toBe(false);

    // No detectChanges: the tracker listens to the control's own event stream.
    control.markAsTouched();

    expect(tracker.errorState()).toBe(true);
  });

  it('follows status changes reactively', () => {
    const control = new FormControl('value');
    const { tracker } = setup(control);
    control.markAsTouched();

    expect(tracker.errorState()).toBe(false);

    control.setErrors({ boom: true });
    expect(tracker.errorState()).toBe(true);

    control.setErrors(null);
    expect(tracker.errorState()).toBe(false);
  });

  it('clears the error state when the value becomes valid', () => {
    const control = new FormControl('', Validators.required);
    const { tracker } = setup(control);
    control.markAsTouched();

    expect(tracker.errorState()).toBe(true);

    control.setValue('filled');

    expect(tracker.errorState()).toBe(false);
  });

  it('a user-assigned matcher overrides the default', () => {
    const control = new FormControl('', Validators.required);
    const { tracker } = setup(control);
    tracker.matcher = new XShowOnDirtyErrorStateMatcher();

    control.markAsTouched();
    expect(tracker.errorState()).toBe(false);

    control.markAsDirty();
    expect(tracker.errorState()).toBe(true);
  });

  it('stays clean without a bound control', () => {
    const { fixture } = render('<input xTrackErrors />', { imports: [TrackErrorsDirective] });
    const tracker = fixture.debugElement.children[0].injector.get(TrackErrorsDirective).tracker;

    expect(tracker.errorState()).toBe(false);
  });
});
