import { InjectionToken, inject, type Provider, type ValueProvider } from '@angular/core';
import { bbcodeSyntax } from './bbcode-syntax';
import { markdownSyntax } from './markdown-syntax';
import type { XuiRichTextSyntax } from './rich-text-syntax';

export interface XuiRichTextEditorConfig {
  /** Which format new editors start in. */
  format: string;
  /** Text shown while the editor is empty. */
  placeholder: string;
  /** Offer the source-text view alongside the formatted one. */
  sourceView: boolean;
}

const defaultConfig: XuiRichTextEditorConfig = {
  format: 'markdown',
  placeholder: '',
  sourceView: true
};

const XuiRichTextEditorConfigToken = new InjectionToken<XuiRichTextEditorConfig>('XuiRichTextEditorConfig');

/** Application-wide defaults for every editor. Individual inputs still win. */
export function provideXuiRichTextEditorConfig(config: Partial<XuiRichTextEditorConfig>): ValueProvider {
  return { provide: XuiRichTextEditorConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectXuiRichTextEditorConfig(): XuiRichTextEditorConfig {
  return inject(XuiRichTextEditorConfigToken, { optional: true }) ?? defaultConfig;
}

const XuiRichTextSyntaxToken = new InjectionToken<readonly XuiRichTextSyntax[]>('XuiRichTextSyntax');

/**
 * Teaches the editor a format.
 *
 * Markdown and BBCode are built in; this adds to them, or replaces one by
 * registering a syntax under the same name — the last one provided wins, so an
 * app can swap in its own flavour of Markdown without forking the editor.
 *
 * ```ts
 * provideXuiRichTextSyntax({
 *   name: 'plain',
 *   features: ['bold'],
 *   toHtml: text => `<p>${text}</p>`,
 *   fromHtml: root => root.textContent ?? ''
 * });
 * ```
 */
export function provideXuiRichTextSyntax(...syntaxes: XuiRichTextSyntax[]): Provider {
  return { provide: XuiRichTextSyntaxToken, useValue: syntaxes, multi: true };
}

/**
 * Every known syntax, by name. Built-ins first, so anything provided by the app
 * that reuses a name replaces it.
 */
export function injectXuiRichTextSyntaxes(): Map<string, XuiRichTextSyntax> {
  const provided = inject(XuiRichTextSyntaxToken, { optional: true }) as XuiRichTextSyntax[][] | null;

  return new Map(
    [markdownSyntax, bbcodeSyntax, ...(provided ?? []).flat()].map(syntax => [syntax.name, syntax])
  );
}
