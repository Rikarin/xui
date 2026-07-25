import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

export type UploadStatus = 'uploading' | 'done' | 'error';

export interface XuiUploadFile {
  uid: string;
  name: string;
  size?: number;
  status?: UploadStatus;
  /** Upload progress 0–100 (shown while `status` is `uploading`). */
  percent?: number;
}

/**
 * A file upload with a button or drag-and-drop zone and a file list showing
 * per-file progress, status and a remove control. `files` is a two-way bindable
 * list; `selected` emits the raw `File`s so the host can perform the upload and
 * update each file's `status`/`percent`.
 *
 * ```html
 * <xui-upload type="drag" multiple [(files)]="files" (selected)="upload($event)" />
 * ```
 */
@Component({
  selector: 'xui-upload',
  template: `
    <input
      #picker
      type="file"
      class="hidden"
      [multiple]="multiple()"
      [attr.accept]="accept() || null"
      (change)="onPick($event)"
    />

    @if (type() === 'drag') {
      <div
        [class]="dropzoneClass()"
        role="button"
        tabindex="0"
        (click)="openPicker()"
        (keydown.enter)="openPicker()"
        (keydown.space)="openPicker(); $event.preventDefault()"
        (dragover)="onDragOver($event)"
        (dragleave)="dragging.set(false)"
        (drop)="onDrop($event)"
      >
        <svg viewBox="0 0 24 24" class="text-foreground-muted mx-auto h-8 w-8" fill="none">
          <path
            d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="text-foreground mt-2 text-sm">Click or drag files here to upload</p>
        @if (accept()) {
          <p class="text-foreground-muted mt-1 text-xs">Accepted: {{ accept() }}</p>
        }
      </div>
    } @else {
      <button type="button" [class]="buttonClass()" [disabled]="disabled()" (click)="openPicker()">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
          <path
            d="M12 16V4m0 0-4 4m4-4 4 4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Upload
      </button>
    }

    @if (files().length) {
      <ul class="mt-2 flex flex-col gap-1">
        @for (file of files(); track file.uid) {
          <li [class]="fileRowClass(file)">
            <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none">
              <path
                d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2">
                <span class="truncate">{{ file.name }}</span>
                @if (file.size !== undefined) {
                  <span class="text-foreground-muted shrink-0 text-xs">{{ formatSize(file.size) }}</span>
                }
              </span>
              @if (file.status === 'uploading') {
                <span class="bg-surface-inset mt-1 block h-1 w-full overflow-hidden rounded-full">
                  <span class="bg-primary block h-full transition-all" [style.width.%]="file.percent ?? 0"></span>
                </span>
              }
            </span>
            <button
              type="button"
              class="text-foreground-muted hover:text-error shrink-0 cursor-pointer leading-none"
              (click)="remove(file)"
              [attr.aria-label]="'Remove ' + file.name"
            >
              ×
            </button>
          </li>
        }
      </ul>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiUpload {
  readonly class = input<ClassValue>('');

  readonly type = input<'select' | 'drag'>('select');
  readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly accept = input<string>('');
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  readonly files = model<XuiUploadFile[]>([]);
  /** The raw files just chosen (for the host to upload). */
  readonly selected = output<File[]>();

  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');
  protected readonly dragging = signal(false);
  private uidCounter = 0;

  protected openPicker(): void {
    if (!this.disabled()) {
      this.picker().nativeElement.click();
    }
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    this.dragging.set(false);
    this.addFiles(event.dataTransfer?.files ?? null);
  }

  private addFiles(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0) {
      return;
    }
    const raw = Array.from(fileList);
    const chosen = this.multiple() ? raw : raw.slice(0, 1);
    const entries: XuiUploadFile[] = chosen.map(file => ({
      uid: `f-${++this.uidCounter}`,
      name: file.name,
      size: file.size,
      status: 'done'
    }));
    this.files.set(this.multiple() ? [...this.files(), ...entries] : entries);
    this.selected.emit(chosen);
  }

  protected remove(file: XuiUploadFile): void {
    this.files.set(this.files().filter(f => f.uid !== file.uid));
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    const units = ['KB', 'MB', 'GB'];
    let size = bytes / 1024;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${size.toFixed(1)} ${units[unit]}`;
  }

  protected readonly computedClass = computed(() => xui('block', this.class()));
  protected readonly buttonClass = computed(() =>
    xui(
      'border-border text-foreground hover:bg-surface-inset inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm disabled:opacity-50',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
    )
  );
  protected readonly dropzoneClass = computed(() =>
    xui(
      'cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      this.dragging() ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60',
      this.disabled() && 'pointer-events-none opacity-50'
    )
  );

  protected fileRowClass(file: XuiUploadFile): string {
    return xui(
      'bg-surface flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
      file.status === 'error' ? 'text-error' : 'text-foreground'
    );
  }
}
