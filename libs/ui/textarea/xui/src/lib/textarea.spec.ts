import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiTextareaImports } from '../index';

const IMPORTS = [XuiTextareaImports, ReactiveFormsModule];

const setup = (template: string, props: Record<string, unknown> = {}) => render(template, { imports: IMPORTS, props });

describe('XuiTextarea', () => {
  it('applies the base classes to the host textarea', () => {
    const { query } = setup('<textarea xuiTextarea></textarea>');

    expectClasses(query('textarea'), 'flex', 'w-full', 'rounded-lg', 'border', 'bg-surface-inset');
  });

  it('defaults to a resizable default size', () => {
    const { query } = setup('<textarea xuiTextarea></textarea>');

    expectClasses(query('textarea'), 'min-h-16', 'resize-y');
  });

  it('applies the small size', () => {
    const { query } = setup('<textarea xuiTextarea size="sm"></textarea>');

    expectClasses(query('textarea'), 'min-h-12', 'text-xs');
    expectNoClasses(query('textarea'), 'min-h-16');
  });

  it('turns manual resize off while auto-resizing (the two would fight)', () => {
    const { query } = setup('<textarea xuiTextarea autoResize></textarea>');

    expectClasses(query('textarea'), 'resize-none');
    expectNoClasses(query('textarea'), 'resize-y');
  });

  it('pins the height to the content on input when auto-resizing', () => {
    const { query, fixture } = setup('<textarea xuiTextarea autoResize></textarea>');
    const textarea = query<HTMLTextAreaElement>('textarea');

    // jsdom reports scrollHeight 0, so stub a content height to prove the wiring.
    Object.defineProperty(textarea, 'scrollHeight', { value: 84, configurable: true });
    textarea.value = 'several\nlines\nof\ntext';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(textarea.style.height).toBe('84px');
  });

  it('leaves the height alone when not auto-resizing', () => {
    const { query } = setup('<textarea xuiTextarea></textarea>');
    const textarea = query<HTMLTextAreaElement>('textarea');

    Object.defineProperty(textarea, 'scrollHeight', { value: 84, configurable: true });
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    expect(textarea.style.height).toBe('');
  });

  it('shows the error styling only once invalid and touched', () => {
    const { query } = setup('<textarea xuiTextarea></textarea>');

    // The token-driven variant defers to Angular's ng-invalid.ng-touched classes.
    expectClasses(query('textarea'), '[&.ng-invalid.ng-touched]:border-error');
  });

  it('binds through a reactive form control', () => {
    const control = new FormControl('hello');
    const { query } = setup('<textarea xuiTextarea [formControl]="props().control"></textarea>', { control });

    expect(query<HTMLTextAreaElement>('textarea').value).toBe('hello');
  });

  it('merges the class input', () => {
    const { query } = setup('<textarea xuiTextarea class="max-w-md"></textarea>');

    expectClasses(query('textarea'), 'max-w-md', 'rounded-lg');
  });
});
