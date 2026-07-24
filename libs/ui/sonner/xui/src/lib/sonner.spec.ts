import { render } from '@xui/testing';
import { NgxSonnerToaster } from 'ngx-sonner';
import { XuiSonner } from './sonner';

const setup = (template: string) => render(template, { imports: [XuiSonner] });

const instance = (fixture: ReturnType<typeof setup>['fixture']) =>
  fixture.debugElement.children[0].componentInstance as XuiSonner;

// ngx-sonner takes `class` as an input (aliased from `_class`) and applies it to
// the toast list it renders lazily, so the classes never land on the host element.
const toasterClasses = (fixture: ReturnType<typeof setup>['fixture']) =>
  (fixture.debugElement.children[0].children[0].componentInstance as NgxSonnerToaster)._class().split(/\s+/);

describe('XuiSonner', () => {
  it('hands the toaster the group classes it styles through', () => {
    const { fixture } = setup('<xui-sonner />');

    expect(toasterClasses(fixture)).toEqual(expect.arrayContaining(['toaster', 'group']));
  });

  it('merges the class input into what the toaster receives', () => {
    const { fixture } = setup('<xui-sonner class="z-50" />');

    expect(toasterClasses(fixture)).toEqual(expect.arrayContaining(['z-50', 'toaster']));
  });

  it('defaults to bottom-right with rich colours', () => {
    const { fixture } = setup('<xui-sonner />');

    expect(instance(fixture).position()).toBe('bottom-right');
    expect(instance(fixture).richColors()).toBe(true);
  });

  it('coerces the numeric attributes', () => {
    const { fixture } = setup('<xui-sonner duration="1000" visibleToasts="5" />');

    expect(instance(fixture).duration()).toBe(1000);
    expect(instance(fixture).visibleToasts()).toBe(5);
  });

  it('coerces the boolean attributes', () => {
    const { fixture } = setup('<xui-sonner closeButton expand />');

    expect(instance(fixture).closeButton()).toBe(true);
    expect(instance(fixture).expand()).toBe(true);
  });

  it('styles the toast through theme tokens rather than a fixed palette', () => {
    const { fixture } = setup('<xui-sonner />');
    const classes = instance(fixture).toastOptions()?.classes;

    expect(classes?.toast).toContain('group-[.toaster]:bg-background');
    expect(classes?.description).toContain('group-[.toast]:text-muted-foreground');
  });
});
