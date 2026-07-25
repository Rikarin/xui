import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  model,
  signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matCodeRound,
  matFormatBoldRound,
  matFormatItalicRound,
  matFormatListBulletedRound,
  matFormatListNumberedRound,
  matFormatQuoteRound,
  matFormatStrikethroughRound,
  matFormatUnderlinedRound,
  matHorizontalRuleRound,
  matLinkRound,
  matTerminalRound
} from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import type { ChangeFn, TouchFn } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import { injectXuiRichTextEditorConfig, injectXuiRichTextSyntaxes } from './rich-text-editor.token';
import type { XuiRichTextFeature } from './rich-text-syntax';

interface Tool {
  readonly feature: XuiRichTextFeature;
  readonly label: string;
  readonly icon?: string;
  readonly text?: string;
  /** `document.execCommand` name, and its argument where one is needed. */
  readonly command: string;
  readonly argument?: string;
  /** How the button's pressed state is read back from the document. */
  readonly state: 'command' | 'block' | 'none';
  readonly key?: string;
}

/**
 * The full toolbar, in order. Each editor shows the entries its format can
 * express — the same button set can therefore never produce markup the format
 * cannot round-trip.
 */
const TOOLS: readonly Tool[] = [
  { feature: 'bold', label: 'Bold', icon: 'matFormatBoldRound', command: 'bold', state: 'command', key: 'b' },
  { feature: 'italic', label: 'Italic', icon: 'matFormatItalicRound', command: 'italic', state: 'command', key: 'i' },
  {
    feature: 'underline',
    label: 'Underline',
    icon: 'matFormatUnderlinedRound',
    command: 'underline',
    state: 'command',
    key: 'u'
  },
  {
    feature: 'strike',
    label: 'Strikethrough',
    icon: 'matFormatStrikethroughRound',
    command: 'strikeThrough',
    state: 'command'
  },
  { feature: 'code', label: 'Inline code', icon: 'matCodeRound', command: 'xuiCode', state: 'none' },
  { feature: 'link', label: 'Link', icon: 'matLinkRound', command: 'xuiLink', state: 'none', key: 'k' },
  { feature: 'heading1', label: 'Heading 1', text: 'H1', command: 'formatBlock', argument: 'h1', state: 'block' },
  { feature: 'heading2', label: 'Heading 2', text: 'H2', command: 'formatBlock', argument: 'h2', state: 'block' },
  { feature: 'heading3', label: 'Heading 3', text: 'H3', command: 'formatBlock', argument: 'h3', state: 'block' },
  {
    feature: 'bulletList',
    label: 'Bulleted list',
    icon: 'matFormatListBulletedRound',
    command: 'insertUnorderedList',
    state: 'command'
  },
  {
    feature: 'orderedList',
    label: 'Numbered list',
    icon: 'matFormatListNumberedRound',
    command: 'insertOrderedList',
    state: 'command'
  },
  {
    feature: 'quote',
    label: 'Quote',
    icon: 'matFormatQuoteRound',
    command: 'formatBlock',
    argument: 'blockquote',
    state: 'block'
  },
  {
    feature: 'codeBlock',
    label: 'Code block',
    icon: 'matTerminalRound',
    command: 'formatBlock',
    argument: 'pre',
    state: 'block'
  },
  {
    feature: 'rule',
    label: 'Divider',
    icon: 'matHorizontalRuleRound',
    command: 'insertHorizontalRule',
    state: 'none'
  }
];

export const XUI_RICH_TEXT_EDITOR_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XuiRichTextEditor),
  multi: true
};

/**
 * A WYSIWYG editor whose value is source text.
 *
 * The user works on formatted content; the binding is the Markdown or BBCode
 * you store — so nothing downstream has to know an editor was involved, and
 * nothing has to be sanitised on the way out.
 *
 * ```html
 * <xui-rich-text-editor [(value)]="comment" format="markdown" placeholder="Say something…" />
 * ```
 *
 * ```html
 * <xui-rich-text-editor formControlName="post" format="bbcode" />
 * ```
 *
 * The toolbar is the format's capabilities: Markdown offers headings and a
 * divider but no underline, BBCode the reverse. Teach it a new format with
 * {@link provideXuiRichTextSyntax} and the toolbar follows.
 *
 * The source view (`</>`) shows the text itself, editable, and the two stay in
 * step. Pasting always lands as plain text — foreign HTML never enters the
 * document, so the value cannot carry markup the format does not define.
 */
@Component({
  selector: 'xui-rich-text-editor',
  imports: [NgIcon, XuiIcon],
  template: `
    <div
      role="toolbar"
      aria-label="Formatting"
      class="border-border bg-surface-sunken flex flex-wrap items-center gap-0.5 rounded-t-lg border-b p-1"
    >
      @for (tool of tools(); track tool.feature) {
        <button
          type="button"
          [class]="toolClass()"
          [attr.aria-label]="tool.label"
          [attr.aria-pressed]="tool.state === 'none' ? null : active().includes(tool.feature)"
          [attr.data-active]="active().includes(tool.feature) ? '' : null"
          [disabled]="isDisabled() || source()"
          [title]="tool.label"
          (mousedown)="$event.preventDefault()"
          (click)="run(tool)"
        >
          @if (tool.icon) {
            <ng-icon xui size="sm" [name]="tool.icon" />
          } @else {
            <span class="px-0.5 text-xs font-semibold">{{ tool.text }}</span>
          }
        </button>
      }

      @if (sourceView()) {
        <button
          type="button"
          [class]="toolClass()"
          class="ms-auto"
          aria-label="Source"
          [attr.aria-pressed]="source()"
          [attr.data-active]="source() ? '' : null"
          [disabled]="isDisabled()"
          title="Source"
          (click)="toggleSource()"
        >
          <span class="px-0.5 text-xs font-semibold">&lt;/&gt;</span>
        </button>
      }
    </div>

    @if (linkDraft() !== null) {
      <div class="border-border bg-surface-sunken flex items-center gap-1 border-b p-1">
        <input
          #linkField
          type="url"
          class="text-foreground placeholder:text-foreground-subtle min-w-0 flex-1 bg-transparent px-2 py-1 text-sm outline-none"
          placeholder="https://example.com"
          aria-label="Link URL"
          [value]="linkDraft()"
          (input)="linkDraft.set($any($event.target).value)"
          (keydown.enter)="applyLink(); $event.preventDefault()"
          (keydown.escape)="linkDraft.set(null)"
        />
        <button type="button" [class]="toolClass()" class="text-xs" (click)="applyLink()">Apply</button>
        <button type="button" [class]="toolClass()" class="text-xs" (click)="linkDraft.set(null)">Cancel</button>
      </div>
    }

    @if (source()) {
      <textarea
        class="text-foreground placeholder:text-foreground-subtle block w-full resize-y bg-transparent p-3 font-mono text-sm outline-none"
        [style.min-height.px]="minHeight()"
        [attr.aria-label]="'Source (' + format() + ')'"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="onSourceInput($event)"
        (blur)="onTouched?.()"
      ></textarea>
    } @else {
      <div class="relative">
        @if (!value().trim() && placeholder()) {
          <p class="text-foreground-subtle pointer-events-none absolute p-3 select-none">{{ placeholder() }}</p>
        }

        <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
        <div
          #surface
          role="textbox"
          aria-multiline="true"
          [class]="surfaceClass()"
          [style.min-height.px]="minHeight()"
          [attr.contenteditable]="isDisabled() ? null : true"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-disabled]="isDisabled() ? true : null"
          (input)="pull()"
          (blur)="onTouched?.()"
          (paste)="onPaste($event)"
          (keydown)="onKeydown($event)"
          (keyup)="refreshActive()"
          (mouseup)="refreshActive()"
        ></div>
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null'
  },
  providers: [XUI_RICH_TEXT_EDITOR_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [
    provideIcons({
      matCodeRound,
      matFormatBoldRound,
      matFormatItalicRound,
      matFormatListBulletedRound,
      matFormatListNumberedRound,
      matFormatQuoteRound,
      matFormatStrikethroughRound,
      matFormatUnderlinedRound,
      matHorizontalRuleRound,
      matLinkRound,
      matTerminalRound
    })
  ]
})
export class XuiRichTextEditor implements ControlValueAccessor {
  private readonly config = injectXuiRichTextEditorConfig();
  private readonly syntaxes = injectXuiRichTextSyntaxes();
  private readonly surface = viewChild<ElementRef<HTMLElement>>('surface');
  private readonly linkField = viewChild<ElementRef<HTMLInputElement>>('linkField');

  readonly class = input<ClassValue>('');

  /** The source text, in the active `format`. Two-way bindable, and the form value. */
  readonly value = model<string>('');

  /** `'markdown'`, `'bbcode'`, or any format registered with `provideXuiRichTextSyntax`. */
  readonly format = input<string>(this.config.format);

  readonly placeholder = input<string>(this.config.placeholder);

  /** Offer the source-text toggle. */
  readonly sourceView = input<boolean, BooleanInput>(this.config.sourceView, { transform: booleanAttribute });

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Height of the writing area before it grows with the content. */
  readonly minHeight = input<number>(180);

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** Whether the source view is showing. Two-way bindable. */
  readonly source = model(false);

  protected readonly linkDraft = signal<string | null>(null);
  protected readonly active = signal<XuiRichTextFeature[]>([]);

  private onChange?: ChangeFn<string>;
  protected onTouched?: TouchFn;
  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  /**
   * The value the surface already shows, tagged with the format it was rendered
   * in. Re-rendering the user's own keystrokes would reset the caret on every
   * one, so the effect below writes only when this no longer matches.
   */
  private synced: string | null = null;
  /** The element that value went into — the source toggle builds a new one. */
  private syncedSurface: HTMLElement | null = null;

  private readonly syntax = computed(() => {
    const syntax = this.syntaxes.get(this.format());

    if (!syntax) {
      throw new Error(
        `@xui/rich-text-editor: unknown format "${this.format()}". ` +
          `Known formats: ${[...this.syntaxes.keys()].join(', ')}. Register others with provideXuiRichTextSyntax().`
      );
    }

    return syntax;
  });

  protected readonly tools = computed(() => {
    const features = this.syntax().features;

    return TOOLS.filter(tool => features.includes(tool.feature));
  });

  protected readonly computedClass = computed(() =>
    xui(
      'border-border bg-surface-inset text-foreground block overflow-hidden rounded-lg border',
      'focus-within:border-focus transition-colors',
      'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      '[&.ng-invalid.ng-touched]:border-error',
      this.class()
    )
  );

  protected readonly toolClass = computed(() =>
    xui(
      'text-foreground-muted hover:bg-surface-raised hover:text-foreground flex items-center rounded px-1.5 py-1',
      'data-active:bg-surface-raised data-active:text-foreground disabled:pointer-events-none disabled:opacity-50',
      'focus-visible:outline-focus focus-visible:outline-2'
    )
  );

  /** Tailwind resets block elements, so the writing area re-states how prose looks. */
  protected readonly surfaceClass = computed(() =>
    xui(
      'block p-3 outline-none [&>*+*]:mt-2',
      '[&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold',
      '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-6 [&_ol]:ps-6',
      '[&_blockquote]:border-border-strong [&_blockquote]:text-foreground-muted [&_blockquote]:border-s-2 [&_blockquote]:ps-3',
      '[&_pre]:bg-surface-sunken [&_pre]:rounded [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-sm',
      '[&_code]:bg-surface-sunken [&_code]:rounded [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm',
      '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
      '[&_a]:text-link [&_a]:underline',
      '[&_hr]:border-border [&_hr]:my-3'
    )
  );

  constructor() {
    // Enter should start a paragraph, and marks should be tags rather than
    // inline styles — otherwise there is nothing for a syntax to recognise.
    safely(() => document.execCommand?.('defaultParagraphSeparator', false, 'p'));
    safely(() => document.execCommand?.('styleWithCSS', false, 'false'));

    // Renders whenever the value arrives from outside — a binding, a form, the
    // source toggle — and skips the echo of the user's own typing, which would
    // otherwise reset the caret on every keystroke.
    effect(() => {
      const surface = this.surface()?.nativeElement;
      const value = this.value();
      const key = this.syncKey(value);

      if (!surface || (key === this.synced && surface === this.syncedSurface)) {
        return;
      }

      this.syncedSurface = surface;

      // A format switch keeps the content and changes only how it is written
      // down: the document is the same either way, so it is re-read in the new
      // format rather than re-rendered from text the new format cannot parse.
      if (this.synced && !this.synced.startsWith(`${this.format()}:`) && surface.innerHTML) {
        const translated = this.syntax().fromHtml(surface);

        this.synced = this.syncKey(translated);
        this.value.set(translated);
        this.onChange?.(translated);

        return;
      }

      surface.innerHTML = this.syntax().toHtml(value);
      this.synced = key;
    });

    effect(() => {
      if (this.linkDraft() !== null) {
        this.linkField()?.nativeElement.focus();
      }
    });
  }

  /** The editing surface, for consumers who need to focus it. */
  focus(): void {
    this.surface()?.nativeElement.focus();
  }

  /** Show the formatted view (`false`) or the source text (`true`). */
  protected toggleSource(): void {
    this.source.update(source => !source);
  }

  protected onSourceInput(event: Event): void {
    this.commit((event.target as HTMLTextAreaElement).value);
  }

  /** Reads the surface back out as source text. */
  protected pull(): void {
    const surface = this.surface()?.nativeElement;

    if (!surface) {
      return;
    }

    this.commit(this.syntax().fromHtml(surface));
    this.refreshActive();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!(event.metaKey || event.ctrlKey)) {
      return;
    }

    const tool = this.tools().find(candidate => candidate.key === event.key.toLowerCase());

    if (tool) {
      event.preventDefault();
      this.run(tool);
    }
  }

  /**
   * Paste as plain text.
   *
   * Whatever is on the clipboard — a Word document, half a web page — would
   * otherwise arrive as HTML the format cannot express and the editor would
   * have to guess at. The text is inserted as typed instead.
   */
  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const text = event.clipboardData?.getData('text/plain') ?? '';

    this.exec('insertText', text);
    this.pull();
  }

  protected run(tool: Tool): void {
    if (this.isDisabled() || this.source()) {
      return;
    }

    this.focus();

    if (tool.command === 'xuiLink') {
      // The field appears with the draft; an effect focuses it once it exists.
      this.linkDraft.set('');

      return;
    }

    if (tool.command === 'xuiCode') {
      this.wrapSelection('code');
    } else if (tool.command === 'formatBlock') {
      // A second press on the same block returns it to a paragraph.
      const target = this.active().includes(tool.feature) ? 'p' : tool.argument!;

      this.exec('formatBlock', target);
    } else {
      this.exec(tool.command, tool.argument);
    }

    this.pull();
  }

  protected applyLink(): void {
    const href = this.linkDraft()?.trim();

    this.linkDraft.set(null);
    this.focus();

    if (href) {
      this.exec('createLink', href);
      this.pull();
    }
  }

  /** Reflects the caret's formatting on the toolbar. */
  protected refreshActive(): void {
    if (typeof document === 'undefined' || !document.queryCommandState) {
      return;
    }

    const block = document.queryCommandValue?.('formatBlock')?.toLowerCase();

    this.active.set(
      this.tools()
        .filter(tool => {
          if (tool.state === 'command') {
            return safely(() => document.queryCommandState(tool.command));
          }

          return tool.state === 'block' && block === tool.argument;
        })
        .map(tool => tool.feature)
    );
  }

  /** Wraps the selection in a tag, or unwraps it when it is already wrapped. */
  private wrapSelection(tag: string): void {
    const selection = getSelection();

    if (!selection?.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    const existing = closest(range.commonAncestorContainer, tag);

    if (existing) {
      existing.replaceWith(...Array.from(existing.childNodes));

      return;
    }

    if (!range.collapsed) {
      this.exec('insertHTML', `<${tag}>${escapeText(range.toString())}</${tag}>`);
    }
  }

  private exec(command: string, argument?: string): void {
    // `execCommand` is the only editing API every browser implements for
    // contenteditable; absent under a test DOM, where nothing is being edited.
    safely(() => document.execCommand?.(command, false, argument));
  }

  private commit(next: string): void {
    if (next === this.value()) {
      return;
    }

    // The surface already shows this — recorded before the write so the render
    // effect sees it and leaves the caret where the user put it.
    this.synced = this.syncKey(next);
    this.value.set(next);
    this.onChange?.(next);
  }

  private syncKey(value: string): string {
    return `${this.format()}:${value}`;
  }

  // --- ControlValueAccessor ---
  writeValue(value: string): void {
    this.value.set(value ?? '');
    // Force the next render: the value came from outside, so whatever is in the
    // surface is stale even if the string matches what we last serialised.
    this.synced = null;
  }

  registerOnChange(fn: ChangeFn<string>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}

/** The nearest ancestor with `tag`, starting at `node` itself. */
function closest(node: Node, tag: string): Element | null {
  const element = node instanceof Element ? node : node.parentElement;

  return element?.closest(tag) ?? null;
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Runs `fn`, treating a DOM that does not implement it as "no". */
function safely(fn: () => boolean | void): boolean {
  try {
    return fn() === true;
  } catch {
    return false;
  }
}
