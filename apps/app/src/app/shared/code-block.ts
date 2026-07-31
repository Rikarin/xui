import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { XuiCodeBlockImports } from '@xui/code-block';
import { highlight, type Language } from './highlight';

/**
 * A code sample on this site: the tokeniser wired to `@xui/code-block`.
 *
 * The package renders and copies but deliberately never tokenises — highlighting
 * is meant to arrive already classified, from whatever knows the language. Here
 * that is {@link highlight}, a small lexer for the five languages the site shows;
 * for the engine's own documentation it would be the compiler. Either way the
 * colours are the package's, so a sample follows the active theme.
 */
@Component({
  selector: 'docs-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiCodeBlockImports],
  host: { class: 'block' },
  template: `<xui-code-block [code]="source()" [tokens]="tokens()" />`
})
export class CodeBlock {
  readonly code = input.required<string>();
  readonly lang = input<Language>('html');

  /** Trimmed once, so the lines that are classified are the lines that are copied. */
  protected readonly source = computed(() => this.code().trim());
  protected readonly tokens = computed(() => highlight(this.source(), this.lang()));
}
