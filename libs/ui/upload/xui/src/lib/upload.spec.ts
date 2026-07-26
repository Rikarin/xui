import { render } from '@xui/testing';
import { XuiUpload, type XuiUploadFile } from './upload';
import { provideXuiUploadConfig } from './upload.token';

const setup = (attrs = '', props: Record<string, unknown> = {}, providers: unknown[] = []) => {
  const result = render(`<xui-upload ${attrs} [(files)]="props().files" (selected)="props().onSelected($event)" />`, {
    imports: [XuiUpload],
    props: { files: [] as XuiUploadFile[], onSelected: () => undefined, ...props },
    providers
  });
  const cmp = result.fixture.debugElement.query(n => n.name === 'xui-upload').componentInstance as XuiUpload;
  return { ...result, cmp };
};

const fakeFileList = (...files: File[]): FileList => {
  const list: Record<number, File> & { length: number; item: (i: number) => File | null } = {
    length: files.length,
    item: i => files[i] ?? null
  };
  files.forEach((file, i) => (list[i] = file));
  return list as unknown as FileList;
};
const file = (name: string, content = 'x') => new File([content], name, { type: 'text/plain' });
const pickerInput = () => document.querySelector('xui-upload input[type="file"]') as HTMLInputElement;
const fileRows = () => [...document.querySelectorAll('xui-upload li')] as HTMLElement[];

const pick = (input: HTMLInputElement, ...files: File[]) => {
  Object.defineProperty(input, 'files', { value: fakeFileList(...files), configurable: true });
  input.dispatchEvent(new Event('change'));
};

describe('XuiUpload', () => {
  it('adds a picked file to the list and emits the raw file', () => {
    const emitted: File[][] = [];
    const { detect, cmp } = setup('', { onSelected: (f: File[]) => emitted.push(f) });
    detect();

    pick(pickerInput(), file('report.txt'));
    detect();

    expect(cmp.files().map(f => f.name)).toEqual(['report.txt']);
    expect(emitted[0][0].name).toBe('report.txt');
    expect(fileRows()[0].textContent).toContain('report.txt');
  });

  it('appends multiple files when multiple is set', () => {
    const { detect, cmp } = setup('multiple');
    detect();

    pick(pickerInput(), file('a.txt'), file('b.txt'));
    detect();
    pick(pickerInput(), file('c.txt'));
    detect();

    expect(cmp.files().map(f => f.name)).toEqual(['a.txt', 'b.txt', 'c.txt']);
  });

  it('replaces the file in single mode', () => {
    const { detect, cmp } = setup();
    detect();

    pick(pickerInput(), file('first.txt'));
    detect();
    pick(pickerInput(), file('second.txt'), file('ignored.txt'));
    detect();

    expect(cmp.files().map(f => f.name)).toEqual(['second.txt']);
  });

  it('removes a file from the list', () => {
    const { detect, cmp } = setup('multiple');
    detect();
    pick(pickerInput(), file('a.txt'), file('b.txt'));
    detect();

    (fileRows()[0].querySelector('button') as HTMLElement).click();
    detect();

    expect(cmp.files().map(f => f.name)).toEqual(['b.txt']);
  });

  it('accepts dropped files in drag mode', () => {
    const { detect, cmp } = setup('type="drag" multiple');
    detect();

    const zone = document.querySelector('xui-upload [role="button"]') as HTMLElement;
    const event = new Event('drop', { bubbles: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files: fakeFileList(file('dropped.txt')) } });
    zone.dispatchEvent(event);
    detect();

    expect(cmp.files().map(f => f.name)).toEqual(['dropped.txt']);
  });

  it('takes its defaults from the injected config', () => {
    const { detect } = setup('', {}, [provideXuiUploadConfig({ type: 'drag' })]);
    detect();

    // The configured `drag` default renders the dropzone instead of the button.
    expect(document.querySelector('xui-upload [role="button"]')).toBeTruthy();
  });

  it('formats byte sizes', () => {
    const { cmp } = setup();
    expect(cmp['formatSize'](512)).toBe('512 B');
    expect(cmp['formatSize'](2048)).toBe('2.0 KB');
    expect(cmp['formatSize'](5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
