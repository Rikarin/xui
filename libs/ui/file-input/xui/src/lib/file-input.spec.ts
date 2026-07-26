import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { XFormFieldControl } from '@xui/core/form-field';
import { expectClasses, render } from '@xui/testing';
import { XuiFileInputImports } from '../index';
import { XuiFileInput } from './file-input';

const IMPORTS = [XuiFileInputImports, ReactiveFormsModule];

const input = () => document.querySelector('xui-file-input input[type="file"]') as HTMLInputElement;
const labelText = () => document.querySelector('xui-file-input label > span')?.textContent?.trim();

/** Build a FileList-shaped object, since jsdom has no DataTransfer to make one. */
const fileList = (...names: string[]): FileList => {
  const files = names.map(name => new File(['x'], name, { type: 'text/plain' }));

  return {
    length: files.length,
    item: (i: number) => files[i] ?? null,
    ...files,
    [Symbol.iterator]: files[Symbol.iterator].bind(files)
  } as unknown as FileList;
};

const choose = (files: FileList, detect: () => void) => {
  Object.defineProperty(input(), 'files', { value: files, configurable: true });
  input().dispatchEvent(new Event('change', { bubbles: true }));
  detect();
};

describe('XuiFileInput', () => {
  it('shows the placeholder and browse button before a choice', () => {
    const { detect, host } = render('<xui-file-input />', { imports: IMPORTS });
    detect();

    expect(labelText()).toBe('Choose a file…');
    expect(host.textContent).toContain('Browse');
  });

  it('wraps a real file input carrying accept and multiple', () => {
    const { detect } = render('<xui-file-input accept="image/*" multiple />', { imports: IMPORTS });
    detect();

    expect(input().getAttribute('type')).toBe('file');
    expect(input().getAttribute('accept')).toBe('image/*');
    expect(input().multiple).toBe(true);
  });

  it('shows the filename once one file is chosen', () => {
    const { detect } = render('<xui-file-input />', { imports: IMPORTS });
    detect();

    choose(fileList('report.pdf'), detect);

    expect(labelText()).toBe('report.pdf');
  });

  it('summarises a multi-file choice by count', () => {
    const { detect } = render('<xui-file-input multiple />', { imports: IMPORTS });
    detect();

    choose(fileList('a.png', 'b.png', 'c.png'), detect);

    expect(labelText()).toBe('3 files');
  });

  it('applies the fill and size variants', () => {
    const { detect } = render('<xui-file-input fill size="sm" />', { imports: IMPORTS });
    detect();

    expectClasses(document.querySelector('xui-file-input label') as HTMLElement, 'w-full', 'h-(--control-height-sm)');
  });

  describe('as a form control', () => {
    it('propagates the chosen FileList to the control', () => {
      const control = new FormControl<FileList | null>(null);
      const { detect } = render('<xui-file-input [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      choose(fileList('doc.txt'), detect);

      expect(control.value?.[0].name).toBe('doc.txt');
    });

    it('clears the selection when the control is reset', () => {
      const control = new FormControl<FileList | null>(null);
      const { detect } = render('<xui-file-input [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();

      choose(fileList('doc.txt'), detect);
      expect(labelText()).toBe('doc.txt');

      control.reset();
      detect();

      // A file input cannot be pre-filled, but a reset must clear it.
      expect(labelText()).toBe('Choose a file…');
      expect(input().value).toBe('');
    });

    it('honours the disabled state', () => {
      const control = new FormControl('');
      const { detect } = render('<xui-file-input [formControl]="props().control" />', {
        imports: IMPORTS,
        props: { control }
      });
      detect();
      control.disable();
      detect();

      expect(input().disabled).toBe(true);
    });
  });

  it('provides XFormFieldControl, so xui-form-field accepts it', () => {
    const { detect, fixture } = render('<xui-file-input />', { imports: IMPORTS });
    detect();

    const control = fixture.debugElement.query(By.css('xui-file-input')).injector.get(XFormFieldControl);

    expect(control).toBeInstanceOf(XuiFileInput);
    // The label points at the real (hidden) file input, not the wrapper.
    expect(control.controlId?.()).toBe(input().id);
  });
});
