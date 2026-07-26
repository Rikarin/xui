/**
 * The shape of the documentation data.
 *
 * Every field is extracted from the library sources by `apps/app/tools/generate-docs.ts` — the same
 * extraction the MCP server answers from — so a page can never describe an API the code does not
 * have. Declared here rather than imported from `@xui/mcp` so the app carries no build-time
 * dependency into the browser bundle.
 */

export interface DocsInput {
  name: string;
  type: string;
  default?: string;
  required: boolean;
  transform?: string;
  /** Two-way: declared with `model()` rather than `input()`. */
  model?: boolean;
  docs?: string;
}

export interface DocsOutput {
  name: string;
  type: string;
  docs?: string;
}

export interface DocsVariantAxis {
  name: string;
  options: string[];
  default?: string;
}

export interface DocsMethod {
  name: string;
  signature: string;
  docs?: string;
}

export interface DocsSymbol {
  kind: 'component' | 'directive';
  name: string;
  selector?: string;
  exportAs?: string;
  docs?: string;
  inputs: DocsInput[];
  outputs: DocsOutput[];
  variants: DocsVariantAxis[];
  methods: DocsMethod[];
}

export interface DocsExample {
  /** Story name, e.g. `Default`. */
  name: string;
  /** Sentence-case label for the tab. */
  title: string;
  /** The Angular template, as shown in the Code tab. */
  code: string;
  /**
   * The demo component's class name in the package's preview module, or absent when the example
   * could not be turned into one. A name rather than the class: the class lives in a chunk only the
   * browser loads, and this data is what the worker renders the page from.
   */
  previewName?: string;
}

export interface ComponentDoc {
  /** Package folder name, e.g. `button`. */
  name: string;
  /**
   * Route parameter. Equal to `name` for a styled package; a headless `@xui/core/<name>` entrypoint
   * is prefixed, because four of them share a folder name with a styled package.
   */
  slug: string;
  title: string;
  package: string;
  kind: 'ui' | 'core';
  group: string;
  description?: string;
  /** Barrel const of every declarable, e.g. `XuiButtonImports`. */
  importsConst?: string;
  exports: string[];
  peerDependencies: Record<string, string>;
  symbols: DocsSymbol[];
  examples: DocsExample[];
  /** Workspace-relative path, for the "view source" link. */
  sourcePath: string;
}

export interface ComponentSummary {
  name: string;
  slug: string;
  title: string;
  package: string;
  kind: 'ui' | 'core';
  group: string;
  description?: string;
  /** Whether the component has at least one rendered preview. */
  hasPreview: boolean;
}

export type TokenGroup =
  'surfaces' | 'text' | 'borders' | 'intents' | 'state' | 'elevation' | 'motion' | 'typography' | 'other';

export interface DocsToken {
  name: string;
  group: TokenGroup;
  light?: string;
  dark?: string;
  /** Value declared for every theme scope — the derived intent ramps. */
  derived?: string;
  utility?: string;
}
