import type { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  model,
  output,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound, matContentCopyRound } from '@ng-icons/material-icons/round';
import { XuiButton } from '@xui/button';
import { xui } from '@xui/core';
import { injectXClipboard } from '@xui/core/interactions';
import { XuiIcon } from '@xui/icon';
import { XuiTab, XuiTabs } from '@xui/tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { XuiCodeBlockCopy } from './code-block-copy';
import { injectXuiCodeBlockConfig } from './code-block.token';
import type { XuiCodeLine, XuiCodeTab, XuiCodeToken, XuiCodeTokenKind } from './code-block.types';

/**
 * The palette, one class per {@link XuiCodeTokenKind}.
 *
 * Six semantic ramps have to cover seventeen kinds, so kinds that read as the
 * same thing share a colour on purpose — a regex is a string, a constant is a
 * number, a tag is a type. Exported so an application can re-map a kind it
 * cares about more than this default does.
 */
export const codeBlockTokenClasses: Record<XuiCodeTokenKind, string> = {
  plain: 'text-foreground',
  comment: 'text-foreground-subtle italic',
  string: 'text-success-emphasis',
  regex: 'text-success-emphasis',
  keyword: 'text-primary-emphasis',
  number: 'text-secondary-emphasis',
  constant: 'text-secondary-emphasis',
  type: 'text-info-emphasis',
  tag: 'text-info-emphasis',
  namespace: 'text-info',
  property: 'text-info',
  function: 'text-warning-emphasis',
  attribute: 'text-warning-emphasis',
  variable: 'text-foreground',
  operator: 'text-foreground-muted',
  punctuation: 'text-foreground-muted',
  invalid: 'text-error-emphasis underline decoration-wavy'
};

export const codeBlockVariants = cva(['group/code relative block min-w-0'], {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-[0.8125rem]',
      lg: 'text-sm'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export const codeBlockSurfaceVariants = cva(
  ['border-border bg-surface-inset text-foreground m-0 rounded-lg border font-mono leading-relaxed'],
  {
    variants: {
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-4'
      },
      wrap: {
        true: 'break-words whitespace-pre-wrap',
        false: 'overflow-x-auto'
      }
    },
    defaultVariants: {
      size: 'md',
      wrap: false
    }
  }
);

export type XuiCodeBlockVariants = VariantProps<typeof codeBlockVariants>;

/** One resolved sample: what the surface template actually renders. */
interface XuiResolvedSample {
  id: string;
  label: string;
  language: string | null;
  /** The text the copy button writes — the same lines that are on screen. */
  code: string;
  lines: readonly XuiCodeLine[];
}

const PLAIN: XuiCodeTokenKind = 'plain';

/**
 * A code sample: pre-tokenised, copyable, optionally numbered, wrapped and tabbed.
 *
 * ```html
 * <xui-code-block filename="app.ts" language="ts" [code]="sample" showLineNumbers />
 * ```
 *
 * The point of this component is what it does *not* do: it never tokenises.
 * Highlighting arrives already classified in `tokens` — from a build step that
 * ran the real compiler over the sample — and this renders one `<span>` per run,
 * as a text node, so no grammar ships to the browser and nothing passes through
 * `innerHTML`. Producers classify with {@link XuiCodeTokenKind}s and never pick a
 * colour, which is how a highlighted sample follows the active theme.
 *
 * Given only `code` it renders the text verbatim, one line per line, which is
 * the right output for a shell command or an unclassified snippet.
 */
@Component({
  selector: 'xui-code-block',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon, XuiButton, XuiTabs, XuiTab],
  providers: [provideIcons({ matContentCopyRound, matCheckRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- prettier-ignore -->
    <ng-template #surface let-sample>
      <pre [class]="surfaceClass()" [style.--xui-code-gutter]="gutter()" [attr.data-language]="sample.language"><code>@for (line of sample.lines; track $index) {<span [class]="lineClass($index + 1)">@if (showLineNumbers()) {<span aria-hidden="true" class="text-foreground-subtle sticky start-0 inline-block w-(--xui-code-gutter) shrink-0 pe-4 text-end select-none">{{ $index + 1 }}</span>}@for (token of line; track $index) {<span [class]="tokenClass(token)">{{ token.text }}</span>}</span>}</code></pre>
    </ng-template>

    @if (tabs().length) {
      <xui-tabs [(selectedTabId)]="activeTab" renderActiveTabPanelOnly>
        @for (sample of samples(); track sample.id) {
          <xui-tab [id]="sample.id" [title]="sample.label">
            <ng-container [ngTemplateOutlet]="surface" [ngTemplateOutletContext]="{ $implicit: sample }" />
          </xui-tab>
        }
      </xui-tabs>
    } @else {
      @if (filename() || language()) {
        <div
          class="border-border bg-surface-sunken text-foreground-muted flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2 font-mono text-xs"
        >
          @if (filename()) {
            <span class="truncate">{{ filename() }}</span>
          }
          @if (language()) {
            <span class="ms-auto uppercase">{{ language() }}</span>
          }
        </div>
      }
      <ng-container [ngTemplateOutlet]="surface" [ngTemplateOutletContext]="{ $implicit: samples()[0] }" />
    }

    @if (copyable()) {
      @if (copyTemplate(); as tpl) {
        <ng-container
          [ngTemplateOutlet]="tpl"
          [ngTemplateOutletContext]="{ $implicit: copy, copy: copy, copied: clipboard.copied(), code: activeCode() }"
        />
      } @else {
        <button
          xuiButton
          type="button"
          variant="ghost"
          size="sm"
          class="absolute end-2 top-2 opacity-0 transition-opacity group-hover/code:opacity-100 focus-visible:opacity-100"
          [attr.aria-label]="clipboard.copied() ? copiedLabel() : copyLabel()"
          (click)="copy()"
        >
          <ng-icon xui [name]="clipboard.copied() ? 'matCheckRound' : 'matContentCopyRound'" />
        </button>
      }
    }
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiCodeBlock {
  private readonly config = injectXuiCodeBlockConfig();
  protected readonly clipboard = injectXClipboard();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /**
   * The sample as text. Always what the copy button writes, and what is rendered
   * when `tokens` is absent. Leading and trailing blank lines are dropped, so a
   * template literal does not open with an empty row.
   */
  readonly code = input<string>('');

  /**
   * The sample already classified, one entry per line. Wins over `code` for
   * rendering; `code` still supplies the text that gets copied, so keep the two
   * in step.
   */
  readonly tokens = input<readonly XuiCodeLine[] | null>(null);

  /** Language label for the header, and `data-language` on the `<pre>`. Purely informational. */
  readonly language = input<string | null>(null);

  /** File name shown above the sample. Ignored when `tabs` is set — a tab's label is its file. */
  readonly filename = input<string | null>(null);

  /** Line numbers to call out, 1-based. */
  readonly highlightLines = input<readonly number[]>([]);

  /** Show the line-number gutter. */
  readonly showLineNumbers = input<boolean, BooleanInput>(this.config.showLineNumbers, {
    transform: booleanAttribute
  });

  /** Wrap long lines instead of scrolling them sideways. */
  readonly wrap = input<boolean, BooleanInput>(this.config.wrap, { transform: booleanAttribute });

  /** Type scale of the sample. */
  readonly size = input<XuiCodeBlockVariants['size']>(this.config.size);

  /**
   * Several files behind one tab strip. When set, `code`, `tokens` and `filename`
   * are ignored and the copy button follows the selected tab.
   */
  readonly tabs = input<readonly XuiCodeTab[]>([]);

  /** Render the copy control. Off for samples that are not meant to be taken away. */
  readonly copyable = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  /** Accessible name of the copy button before a copy. */
  readonly copyLabel = input<string>('Copy code');

  /** Accessible name of the copy button while the tick is showing. */
  readonly copiedLabel = input<string>('Copied');

  /** The selected tab's label. Two-way bindable with `[(activeTab)]`. */
  readonly activeTab = model<string | null>(null);

  /** Emits the text that was written to the clipboard. A failed write emits nothing. */
  readonly copied = output<string>();

  /** Replaces the default copy button. See {@link XuiCodeBlockCopy}. */
  readonly copyTemplate = contentChild(XuiCodeBlockCopy, { read: TemplateRef });

  /** Every sample this block can show: the tabs, or the single one built from `code`/`tokens`. */
  protected readonly samples = computed<XuiResolvedSample[]>(() => {
    const tabs = this.tabs();

    if (tabs.length) {
      return tabs.map(tab => resolve(tab.label, tab.code, tab.tokens, tab.language ?? this.language()));
    }

    return [resolve(this.filename() ?? 'code', this.code(), this.tokens(), this.language())];
  });

  /** The sample on screen — the selected tab, or the only one there is. */
  protected readonly activeSample = computed<XuiResolvedSample>(() => {
    const samples = this.samples();

    return samples.find(sample => sample.id === this.activeTab()) ?? samples[0];
  });

  protected readonly activeCode = computed(() => this.activeSample().code);

  /**
   * Width of the number gutter, in characters: the widest line number plus the
   * padding, so a 1 000-line sample does not shunt its own code sideways.
   */
  protected readonly gutter = computed(() => `${String(this.activeSample().lines.length).length + 2}ch`);

  private readonly highlighted = computed(() => new Set(this.highlightLines()));

  protected readonly computedClass = computed(() => xui(codeBlockVariants({ size: this.size() }), this.class()));

  protected readonly surfaceClass = computed(() =>
    xui(
      codeBlockSurfaceVariants({ size: this.size(), wrap: this.wrap() }),
      // With a header above it the surface loses its own top corners, so the two
      // read as one box.
      !this.tabs().length && (this.filename() || this.language()) && 'rounded-t-none'
    )
  );

  /**
   * A line is a block so the highlight can span it, and `min-w-full w-fit` so a
   * highlighted line still reaches the right edge of a sample that scrolls.
   */
  protected lineClass(lineNumber: number): string {
    return xui(
      'block min-h-[1lh] w-fit min-w-full',
      this.highlighted().has(lineNumber) &&
        'bg-primary/10 border-primary -mx-4 border-s-2 ps-[calc(--spacing(4)-2px)] pe-4'
    );
  }

  protected tokenClass(token: XuiCodeToken): string {
    return token.class ?? codeBlockTokenClasses[token.kind ?? PLAIN];
  }

  protected readonly copy = async (): Promise<void> => {
    const code = this.activeCode();

    if (await this.clipboard.write(code)) {
      this.copied.emit(code);
    }
  };
}

/**
 * Build the rendered form of one sample.
 *
 * The lines shown and the text copied come from the same trim, so what a reader
 * takes away is exactly what they were looking at. Only *blank* leading and
 * trailing lines go — indentation is left alone, because dedenting a fragment
 * whose first line is already flush would corrupt it.
 */
function resolve(
  label: string,
  code: string,
  tokens: readonly XuiCodeLine[] | null | undefined,
  language: string | null
): XuiResolvedSample {
  const text = trimBlankLines(code);

  return {
    id: label,
    label,
    language,
    code: text.join('\n'),
    lines: tokens ?? text.map(line => [{ text: line, kind: PLAIN }])
  };
}

function trimBlankLines(code: string): string[] {
  const lines = code.split('\n');

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  return lines;
}
